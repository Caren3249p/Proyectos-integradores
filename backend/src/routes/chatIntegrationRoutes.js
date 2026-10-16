import express from 'express';
import { verificarToken } from '../middleware/authMiddleware.js';
import { crearLanzamiento } from '../controllers/chatIntegrationController.js';

const router = express.Router();

router.post('/chat/lanzamiento', verificarToken, crearLanzamiento);

export default router;