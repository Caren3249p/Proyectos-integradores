import express from 'express';
import { verificarToken } from '../middleware/authMiddleware.js';
import { actualizar, cerrar, crear, listar, obtener, reabrir } from '../controllers/evaluacionController.js';

const router = express.Router();
router.use(verificarToken);

router.post('/proyectos/:id/evaluaciones', crear);
router.get('/evaluaciones/:id', obtener);
router.put('/evaluaciones/:id', actualizar);
router.patch('/evaluaciones/:id/cerrar', cerrar);
router.patch('/evaluaciones/:id/reabrir', reabrir);
router.get('/proyectos/:id/evaluaciones', listar);

export default router;
