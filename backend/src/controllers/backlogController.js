import { PrismaClient } from '@prisma/client';
import { calcularPorcentajeAvance, crearTareaPlane, eliminarTareaPlane, obtenerTareasPlane, actualizarEstadoTareaPlane } from '../services/planeService.js';
import { normalizarEstado } from '../utils/planeHelpers.js';
import { actualizarEstadoTareaSchema, tareaBacklogSchema } from '../utils/validators.js';

const prisma = new PrismaClient();
const idProyecto = (req) => Number.parseInt(req.params.id_proyecto, 10);

const buscarProyecto = async (id) => prisma.proyecto.findUnique({ where: { id_proyecto: id } });

const exigirAccesoDocenteAsignado = (proyecto, usuario) => {
  if (usuario.rol === 'docente' && proyecto.id_docente !== usuario.id_usuario) {
    const error = new Error('Solo el docente asignado puede consultar este proyecto');
    error.status = 403;
    throw error;
  }
};

export const obtenerBacklog = async (req, res, next) => {
  try {
    const proyecto = await buscarProyecto(idProyecto(req));
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    exigirAccesoDocenteAsignado(proyecto, req.usuario);
    if (!proyecto.id_plane_proyecto) return res.status(400).json({ error: 'El proyecto aún no está sincronizado con Plane' });
    const tareas = await obtenerTareasPlane(proyecto.id_plane_proyecto);
    const porcentaje = await calcularPorcentajeAvance(proyecto.id_plane_proyecto);
    await prisma.proyecto.update({ where: { id_proyecto: proyecto.id_proyecto }, data: { porcentaje_avance: porcentaje } });
    res.json({ proyecto: { ...proyecto, porcentaje_avance: porcentaje }, tareas });
  } catch (error) { next(error); }
};

export const crearTarea = async (req, res, next) => {
  try {
    const id = idProyecto(req);
    const proyecto = await buscarProyecto(id);
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    exigirAccesoDocenteAsignado(proyecto, req.usuario);
    if (!proyecto.id_plane_proyecto) return res.status(400).json({ error: 'El proyecto no está sincronizado con Plane' });
    const data = tareaBacklogSchema.parse(req.body);
    const estado = normalizarEstado(data.estado);
    const tarea = await crearTareaPlane(proyecto.id_plane_proyecto, {
      name: data.titulo,
      description: data.descripcion,
      state: estado,
      priority: data.prioridad,
      assignee: data.asignado_a,
      dueDate: data.fecha_limite,
      estimatePoints: data.puntos_estimacion
    });
    await prisma.tareaBacklog.create({ data: { id_proyecto: id, id_plane_issue: tarea.id, titulo: tarea.name, estado, fecha_ultimo_sync: new Date() } });
    res.status(201).json({ message: 'Tarea creada exitosamente', tarea });
  } catch (error) { next(error); }
};

export const actualizarEstadoTarea = async (req, res, next) => {
  try {
    const id = idProyecto(req);
    const proyecto = await buscarProyecto(id);
    if (!proyecto?.id_plane_proyecto) return res.status(404).json({ error: 'Proyecto no válido' });
    exigirAccesoDocenteAsignado(proyecto, req.usuario);
    const { estado: estadoRecibido } = actualizarEstadoTareaSchema.parse(req.body);
    const estado = normalizarEstado(estadoRecibido);
    const tarea = await actualizarEstadoTareaPlane(proyecto.id_plane_proyecto, req.params.id_tarea, estado);
    await prisma.tareaBacklog.updateMany({ where: { id_proyecto: id, id_plane_issue: req.params.id_tarea }, data: { estado, fecha_ultimo_sync: new Date() } });
    const porcentaje = await calcularPorcentajeAvance(proyecto.id_plane_proyecto);
    await prisma.proyecto.update({ where: { id_proyecto: id }, data: { porcentaje_avance: porcentaje } });
    res.json({ message: 'Estado actualizado exitosamente', tarea, porcentaje_avance: porcentaje });
  } catch (error) { next(error); }
};

export const eliminarTarea = async (req, res, next) => {
  try {
    const id = idProyecto(req);
    const proyecto = await buscarProyecto(id);
    if (!proyecto?.id_plane_proyecto) return res.status(404).json({ error: 'Proyecto no válido' });
    exigirAccesoDocenteAsignado(proyecto, req.usuario);
    await eliminarTareaPlane(proyecto.id_plane_proyecto, req.params.id_tarea);
    await prisma.tareaBacklog.deleteMany({ where: { id_proyecto: id, id_plane_issue: req.params.id_tarea } });
    res.json({ message: 'Tarea eliminada exitosamente' });
  } catch (error) { next(error); }
};