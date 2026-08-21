import express from 'express';
import { verificarToken } from '../middleware/authMiddleware.js';
import { crearProyecto, obtenerEstados } from '../controllers/planeController.js';

const router = express.Router();
router.use(verificarToken);
router.post('/proyectos', crearProyecto);
router.get('/proyectos/:id_proyecto/estados', obtenerEstados);

export default router;