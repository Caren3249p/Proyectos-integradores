import { PrismaClient } from '@prisma/client';
import {
  crearProyectoPlane,
  obtenerEstadosPlane,
  obtenerTareasPlane,
  actualizarEstadoTareaPlane,
  calcularPorcentajeAvance
} from '../services/planeService.js';
import { actualizarEstadoTareaSchema, crearProyectoPlaneSchema } from '../utils/validators.js';
import { normalizarEstado } from '../utils/planeHelpers.js';

const prisma = new PrismaClient();

const crearIdentificador = (titulo) => {
  const base = titulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '').toUpperCase().slice(0, 8);
  return (base || 'PROYECTO').slice(0, 5) + Math.floor(Math.random() * 900 + 100);
};

export const crearProyecto = async (req, res, next) => {
  try {
    if (req.usuario.rol !== 'docente') return res.status(403).json({ error: 'Solo los docentes pueden crear proyectos' });
    const data = crearProyectoPlaneSchema.parse(req.body);
    const proyecto = await prisma.proyecto.create({
      data: { titulo: data.titulo, descripcion: data.descripcion || null, id_docente: req.usuario.id_usuario }
    });
    let planeProject = null;
    try {
      planeProject = await crearProyectoPlane(data.titulo, data.descripcion, crearIdentificador(data.titulo));
      if (planeProject?.id) {
        await prisma.proyecto.update({ where: { id_proyecto: proyecto.id_proyecto }, data: { id_plane_proyecto: planeProject.id } });
        proyecto.id_plane_proyecto = planeProject.id;
      }
    } catch (planeError) {
      console.warn('[Plane] No se pudo sincronizar el proyecto:', planeError.message);
    }
    res.status(201).json({ proyecto, plane: planeProject });
  } catch (error) { next(error); }
};

export const obtenerEstados = async (req, res, next) => {
  try {
    const proyecto = await prisma.proyecto.findUnique({ where: { id_proyecto: Number.parseInt(req.params.id_proyecto, 10) } });
    if (!proyecto?.id_plane_proyecto) return res.status(404).json({ error: 'Proyecto no válido' });
    res.json({ estados: await obtenerEstadosPlane(proyecto.id_plane_proyecto) });
  } catch (error) { next(error); }
};

const obtenerProyectoPlane = async (idProyecto) => prisma.proyecto.findUnique({
  where: { id_proyecto: Number.parseInt(idProyecto, 10) }
});

const exigirAccesoProyecto = (proyecto, usuario) => {
  if (usuario.rol === 'docente' && proyecto.id_docente !== usuario.id_usuario) {
    const error = new Error('Solo el docente asignado puede consultar este proyecto');
    error.status = 403;
    throw error;
  }
};

export const obtenerTablero = async (req, res, next) => {
  try {
    const proyecto = await obtenerProyectoPlane(req.params.idProyecto);
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    exigirAccesoProyecto(proyecto, req.usuario);
    if (!proyecto.id_plane_proyecto) return res.status(400).json({ error: 'El proyecto aún no está sincronizado con Plane' });

    const [estados, tareas] = await Promise.all([
      obtenerEstadosPlane(proyecto.id_plane_proyecto),
      obtenerTareasPlane(proyecto.id_plane_proyecto)
    ]);
    const porcentaje_avance = await calcularPorcentajeAvance(proyecto.id_plane_proyecto);
    await prisma.proyecto.update({ where: { id_proyecto: proyecto.id_proyecto }, data: { porcentaje_avance } });

    res.json({ proyecto: { ...proyecto, porcentaje_avance }, estados, tareas });
  } catch (error) {
    next(error);
  }
};

export const actualizarEstado = async (req, res, next) => {
  try {
    const proyecto = await obtenerProyectoPlane(req.params.idProyecto);
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    exigirAccesoProyecto(proyecto, req.usuario);
    if (!proyecto.id_plane_proyecto) return res.status(400).json({ error: 'El proyecto aún no está sincronizado con Plane' });

    const { estado } = actualizarEstadoTareaSchema.parse(req.body);
    const tarea = await actualizarEstadoTareaPlane(
      proyecto.id_plane_proyecto,
      req.params.idIssue,
      normalizarEstado(estado)
    );
    const porcentaje_avance = await calcularPorcentajeAvance(proyecto.id_plane_proyecto);
    await prisma.proyecto.update({ where: { id_proyecto: proyecto.id_proyecto }, data: { porcentaje_avance } });

    res.json({ message: 'Estado actualizado exitosamente', tarea, porcentaje_avance });
  } catch (error) {
    next(error);
  }
};