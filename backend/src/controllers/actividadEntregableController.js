import { actividadEntregableSchema } from '../utils/validators.js';
import { asignarProyectos, crearActividad, listarActividades, obtenerActividad, publicarActividad } from '../services/actividadEntregableService.js';

const responderError = (res, error) => {
  if (error.name === 'ZodError') return res.status(400).json({ error: 'Datos inválidos', detalles: error.errors });
  return res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
};
const id = (req) => Number.parseInt(req.params.id, 10);

export const crear = async (req, res) => {
  try { res.status(201).json({ message: 'Actividad publicada exitosamente', actividad: await crearActividad(actividadEntregableSchema.parse(req.body), req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const listar = async (req, res) => {
  try { res.json({ actividades: await listarActividades(req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const obtener = async (req, res) => {
  try { res.json({ actividad: await obtenerActividad(id(req), req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const publicar = async (req, res) => {
  try { res.json({ message: 'Actividad publicada exitosamente', actividad: await publicarActividad(id(req), req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const asignar = async (req, res) => {
  try {
    const proyectos = req.body?.proyectos;
    if (!Array.isArray(proyectos) || !proyectos.length) return res.status(400).json({ error: 'Debe enviar proyectos' });
    res.json({ actividad: await asignarProyectos(id(req), proyectos.map(Number), req.usuario) });
  } catch (error) { responderError(res, error); }
};
