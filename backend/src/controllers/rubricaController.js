import { actualizarRubrica, crearRubrica, desactivarRubrica, listarRubricas, obtenerRubrica } from '../services/rubricaService.js';
import { rubricaSchema } from '../utils/validators.js';

const responderError = (res, error) => {
  if (error.name === 'ZodError') return res.status(400).json({ error: 'Datos inválidos', detalles: error.errors });
  return res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
};
const id = (req) => Number.parseInt(req.params.id, 10);

export const crear = async (req, res) => {
  try { res.status(201).json({ message: 'Rúbrica creada exitosamente', rubrica: await crearRubrica(rubricaSchema.parse(req.body), req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const obtener = async (req, res) => {
  try { res.json({ rubrica: await obtenerRubrica(id(req)) }); }
  catch (error) { responderError(res, error); }
};

export const listar = async (req, res) => {
  try { res.json({ rubricas: await listarRubricas(req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const actualizar = async (req, res) => {
  try { res.json({ message: 'Rúbrica actualizada exitosamente', rubrica: await actualizarRubrica(id(req), rubricaSchema.parse(req.body), req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const desactivar = async (req, res) => {
  try { await desactivarRubrica(id(req), req.usuario); res.json({ message: 'Rúbrica desactivada exitosamente' }); }
  catch (error) { responderError(res, error); }
};
