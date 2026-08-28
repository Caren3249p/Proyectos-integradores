import { crearVersion, marcarFinal, obtenerVersionConAcceso } from '../services/versionService.js';

const responderError = (res, error) => res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
const idProyecto = (req) => Number.parseInt(req.params.id, 10);
const idVersion = (req) => Number.parseInt(req.params.id, 10);

export const crear = async (req, res) => {
  try { res.status(201).json({ message: 'Versión creada exitosamente', version: await crearVersion(idProyecto(req), req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const final = async (req, res) => {
  try { res.json({ message: 'Versión marcada como final', version: await marcarFinal(idVersion(req), req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const obtener = async (req, res) => {
  try { res.json({ version: await obtenerVersionConAcceso(idVersion(req), req.usuario) }); }
  catch (error) { responderError(res, error); }
};
