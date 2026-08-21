import express from 'express';
import { verificarToken } from '../middleware/authMiddleware.js';
import { obtenerBacklog, crearTarea, actualizarEstadoTarea, eliminarTarea } from '../controllers/backlogController.js';

const router = express.Router();
router.use(verificarToken);
router.get('/proyecto/:id_proyecto/backlog', obtenerBacklog);
router.post('/proyecto/:id_proyecto/tareas', crearTarea);
router.patch('/proyecto/:id_proyecto/tareas/:id_tarea/estado', actualizarEstadoTarea);
router.delete('/proyecto/:id_proyecto/tareas/:id_tarea', eliminarTarea);

export default router;