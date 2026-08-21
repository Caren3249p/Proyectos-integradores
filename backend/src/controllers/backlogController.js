import { PrismaClient } from '@prisma/client';
import { calcularPorcentajeAvance, crearTareaPlane, eliminarTareaPlane, obtenerTareasPlane, actualizarEstadoTareaPlane } from '../services/planeService.js';
import { normalizarEstado } from '../utils/planeHelpers.js';

const prisma = new PrismaClient();
const idProyecto = (req) => Number.parseInt(req.params.id_proyecto, 10);

const buscarProyecto = async (id) => prisma.proyecto.findUnique({ where: { id_proyecto: id } });

export const obtenerBacklog = async (req, res, next) => {
  try {
    const proyecto = await buscarProyecto(idProyecto(req));
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
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
    if (!proyecto.id_plane_proyecto) return res.status(400).json({ error: 'El proyecto no está sincronizado con Plane' });
    const estado = normalizarEstado(req.body.estado || 'por_hacer');
    if (!req.body.titulo?.trim()) return res.status(400).json({ error: 'El título es obligatorio' });
    const tarea = await crearTareaPlane(proyecto.id_plane_proyecto, { name: req.body.titulo.trim(), description: req.body.descripcion, state: estado, assignee: req.body.asignado_a });
    await prisma.tareaBacklog.create({ data: { id_proyecto: id, id_plane_issue: tarea.id, titulo: tarea.name, estado, fecha_ultimo_sync: new Date() } });
    res.status(201).json({ message: 'Tarea creada exitosamente', tarea });
  } catch (error) { next(error); }
};

export const actualizarEstadoTarea = async (req, res, next) => {
  try {
    const id = idProyecto(req);
    const proyecto = await buscarProyecto(id);
    if (!proyecto?.id_plane_proyecto) return res.status(404).json({ error: 'Proyecto no válido' });
    const estado = normalizarEstado(req.body.estado);
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
    await eliminarTareaPlane(proyecto.id_plane_proyecto, req.params.id_tarea);
    await prisma.tareaBacklog.deleteMany({ where: { id_proyecto: id, id_plane_issue: req.params.id_tarea } });
    res.json({ message: 'Tarea eliminada exitosamente' });
  } catch (error) { next(error); }
};