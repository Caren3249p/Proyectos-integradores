import {
  crearEntregable,
  listarEntregablesProyecto,
  obtenerEntregable,
  publicarEntregable,
  registrarEntrega,
  registrarEntregaPorId,
  guardarArchivosEntrega
} from '../services/entregableService.js';
import { entregableSchema } from '../utils/validators.js';

const responderError = (res, error) => {
  if (error.name === 'ZodError') return res.status(400).json({ error: 'Datos inválidos', detalles: error.errors });
  return res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
};
const id = (req, nombre = 'id') => Number.parseInt(req.params[nombre], 10);

export const crear = async (req, res) => {
  try {
    const entregable = await crearEntregable(id(req, 'idProyecto'), entregableSchema.parse(req.body), req.usuario);
    res.status(201).json({ message: 'Entregable creado exitosamente', entregable });
  } catch (error) { responderError(res, error); }
};

export const listar = async (req, res) => {
  try { res.json({ entregables: await listarEntregablesProyecto(id(req, 'idProyecto'), req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const obtener = async (req, res) => {
  try { res.json({ entregable: await obtenerEntregable(id(req), req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const publicar = async (req, res) => {
  try { res.json({ message: 'Entregable publicado exitosamente', entregable: await publicarEntregable(id(req), req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const entregar = async (req, res) => {
  try { res.json({ message: 'Entrega registrada exitosamente', entrega: await registrarEntrega(id(req), req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const subirArchivos = async (req, res) => {
  try {
    await guardarArchivosEntrega(id(req, 'idEntrega'), req.files, req.usuario);
    const entrega = await registrarEntregaPorId(id(req, 'idEntrega'), req.usuario);
    res.status(201).json({ message: 'Archivos adjuntados exitosamente', entrega });
  } catch (error) { responderError(res, error); }
};
