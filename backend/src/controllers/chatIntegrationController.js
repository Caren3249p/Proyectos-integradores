import { obtenerJwkPublicaSso } from '../config/ssoConfig.js';
import { crearLanzamientoChat } from '../services/chatIntegrationService.js';

export const obtenerJwks = async (_req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=600');
    res.json({ keys: [await obtenerJwkPublicaSso()] });
  } catch (error) {
    res.status(error.status || 503).json({ error: error.message });
  }
};

export const crearLanzamiento = async (req, res) => {
  try {
    const resultado = await crearLanzamientoChat(req.usuario, req.body?.destino);
    res.json(resultado);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message,
      codigo: error.code
    });
  }
};