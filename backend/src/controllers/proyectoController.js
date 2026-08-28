import {
  agregarIntegrante,
  actualizarProyecto,
  crearProyecto,
  desenlazarRepositorio,
  eliminarProyecto,
  enlazarRepositorio,
  guardarCamposTecnicos,
  obtenerDetalleProyecto,
  quitarIntegrante
} from '../services/proyectoService.js';
import { camposTecnicosSchema, crearProyectoSchema, actualizarProyectoSchema, integranteSchema, repositorioSchema } from '../utils/validators.js';

const responderError = (res, error) => {
  if (error.name === 'ZodError') return res.status(400).json({ error: 'Datos inválidos', detalles: error.errors });
  return res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
};

const id = (req) => Number.parseInt(req.params.id, 10);

export const crear = async (req, res) => {
  try { res.status(201).json({ message: 'Proyecto creado exitosamente', proyecto: await crearProyecto(crearProyectoSchema.parse(req.body), req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const obtener = async (req, res) => {
  try { res.json({ proyecto: await obtenerDetalleProyecto(id(req)) }); }
  catch (error) { responderError(res, error); }
};

export const actualizar = async (req, res) => {
  try { res.json({ message: 'Proyecto actualizado exitosamente', proyecto: await actualizarProyecto(id(req), actualizarProyectoSchema.parse(req.body), req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const eliminar = async (req, res) => {
  try { await eliminarProyecto(id(req), req.usuario); res.json({ message: 'Proyecto eliminado exitosamente' }); }
  catch (error) { responderError(res, error); }
};

export const agregar = async (req, res) => {
  try { res.status(201).json({ message: 'Integrante agregado exitosamente', integrante: await agregarIntegrante(id(req), integranteSchema.parse(req.body).id_usuario, req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const quitar = async (req, res) => {
  try { await quitarIntegrante(id(req), Number.parseInt(req.params.usuarioId, 10), req.usuario); res.json({ message: 'Integrante eliminado exitosamente' }); }
  catch (error) { responderError(res, error); }
};

export const actualizarCampos = async (req, res) => {
  try { res.json({ message: 'Campos técnicos guardados exitosamente', campos_tecnicos: await guardarCamposTecnicos(id(req), camposTecnicosSchema.parse(req.body), req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const enlazar = async (req, res) => {
  try { res.status(201).json({ message: 'Repositorio enlazado exitosamente', ...await enlazarRepositorio(id(req), repositorioSchema.parse(req.body), req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const desenlazar = async (req, res) => {
  try { await desenlazarRepositorio(id(req), req.usuario); res.json({ message: 'Repositorio desenlazado exitosamente' }); }
  catch (error) { responderError(res, error); }
};
