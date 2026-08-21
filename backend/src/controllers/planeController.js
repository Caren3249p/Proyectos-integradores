import { PrismaClient } from '@prisma/client';
import { crearProyectoPlane, obtenerEstadosPlane } from '../services/planeService.js';

const prisma = new PrismaClient();

const crearIdentificador = (titulo) => {
  const base = titulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '').toUpperCase().slice(0, 8);
  return (base || 'PROYECTO').slice(0, 5) + Math.floor(Math.random() * 900 + 100);
};

export const crearProyecto = async (req, res, next) => {
  try {
    if (!req.body.titulo?.trim()) return res.status(400).json({ error: 'El título es obligatorio' });
    const planeProject = await crearProyectoPlane(req.body.titulo.trim(), req.body.descripcion || '', crearIdentificador(req.body.titulo));
    const proyecto = await prisma.proyecto.create({
      data: { titulo: req.body.titulo.trim(), descripcion: req.body.descripcion || null, id_plane_proyecto: planeProject.id }
    });
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