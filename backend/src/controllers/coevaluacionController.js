import { coevaluacionSchema } from '../utils/validators.js';
import { enviarCoevaluacion, obtenerEstadoCoevaluacion, obtenerMisCoevaluaciones, obtenerResultadosCoevaluacion } from '../services/coevaluacionService.js';

const responderError = (res, error) => {
  if (error.name === 'ZodError') return res.status(400).json({ error: 'Datos inválidos', detalles: error.errors });
  return res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
};
const id = (req, nombre) => Number.parseInt(req.params[nombre], 10);

export const listarMias = async (req, res) => {
  try { res.json({ coevaluacion: await obtenerMisCoevaluaciones(id(req, 'idEntrega'), req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const enviar = async (req, res) => {
  try { res.json({ message: 'Coevaluación enviada exitosamente', resultado: await enviarCoevaluacion(id(req, 'idEntrega'), id(req, 'idEvaluado'), coevaluacionSchema.parse(req.body), req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const estado = async (req, res) => {
  try { res.json({ estado: await obtenerEstadoCoevaluacion(id(req, 'idEntrega'), req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const resultados = async (req, res) => {
  try { res.json({ resultados: await obtenerResultadosCoevaluacion(id(req, 'idEntrega'), req.usuario) }); }
  catch (error) { responderError(res, error); }
};
