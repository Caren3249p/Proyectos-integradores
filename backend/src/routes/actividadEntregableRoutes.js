import express from 'express';
import { verificarToken } from '../middleware/authMiddleware.js';
import { asignar, crear, listar, obtener, publicar } from '../controllers/actividadEntregableController.js';

const router = express.Router();
router.use(verificarToken);
router.post('/actividades-entregables', crear);
router.get('/actividades-entregables', listar);
router.get('/actividades-entregables/:id', obtener);
router.patch('/actividades-entregables/:id/publicar', publicar);
router.post('/actividades-entregables/:id/proyectos', asignar);

export default router;
