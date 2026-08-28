import {
  actualizarEvaluacion,
  cerrarEvaluacion,
  crearEvaluacion,
  listarEvaluacionesProyecto,
  obtenerEvaluacion,
  reabrirEvaluacion
} from '../services/evaluacionService.js';
import { evaluacionSchema } from '../utils/validators.js';

const responderError = (res, error) => {
  if (error.name === 'ZodError') {
    return res.status(400).json({ error: 'Datos inválidos', detalles: error.errors });
  }
  return res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
};

const idProyecto = (req) => Number.parseInt(req.params.id, 10);
const idEvaluacion = (req) => Number.parseInt(req.params.id, 10);

export const crear = async (req, res) => {
  try {
    const validData = evaluacionSchema.parse(req.body);
    const evaluacion = await crearEvaluacion(idProyecto(req), validData, req.usuario);
    res.status(201).json({
      message: 'Evaluación creada exitosamente',
      evaluacion
    });
  } catch (error) {
    responderError(res, error);
  }
};

export const obtener = async (req, res) => {
  try {
    const evaluacion = await obtenerEvaluacion(idEvaluacion(req), req.usuario);
    res.json({ evaluacion });
  } catch (error) {
    responderError(res, error);
  }
};

export const actualizar = async (req, res) => {
  try {
    const validData = evaluacionSchema.omit({ id_rubrica: true }).parse(req.body);
    const evaluacion = await actualizarEvaluacion(idEvaluacion(req), validData, req.usuario);
    res.json({
      message: 'Evaluación y notas actualizadas exitosamente',
      evaluacion
    });
  } catch (error) {
    responderError(res, error);
  }
};

export const cerrar = async (req, res) => {
  try {
    const evaluacion = await cerrarEvaluacion(idEvaluacion(req), req.usuario);
    res.json({
      message: 'Evaluación cerrada exitosamente',
      evaluacion
    });
  } catch (error) {
    responderError(res, error);
  }
};

export const reabrir = async (req, res) => {
  try {
    const evaluacion = await reabrirEvaluacion(idEvaluacion(req), req.usuario);
    res.json({
      message: 'Evaluación reabierta exitosamente para correcciones',
      evaluacion
    });
  } catch (error) {
    responderError(res, error);
  }
};

export const listar = async (req, res) => {
  try {
    const evaluaciones = await listarEvaluacionesProyecto(idProyecto(req), req.usuario);
    res.json({ evaluaciones });
  } catch (error) {
    responderError(res, error);
  }
};
