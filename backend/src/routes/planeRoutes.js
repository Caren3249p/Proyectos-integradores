import express from 'express';
import { verificarToken } from '../middleware/authMiddleware.js';
import { crearProyecto, obtenerEstados, obtenerTablero, actualizarEstado } from '../controllers/planeController.js';

const router = express.Router();
router.use(verificarToken);
router.post('/proyectos', crearProyecto);
router.get('/proyectos/:id_proyecto/estados', obtenerEstados);
router.get('/proyectos/:idProyecto/tablero', obtenerTablero);
router.patch('/proyectos/:idProyecto/tareas/:idIssue/estado', actualizarEstado);

export default router;