import express from 'express';
import { verificarToken } from '../middleware/authMiddleware.js';
import { actualizar, crear, desactivar, listar, obtener } from '../controllers/rubricaController.js';

const router = express.Router();
router.use(verificarToken);
router.post('/', crear);
router.get('/', listar);
router.get('/:id', obtener);
router.put('/:id', actualizar);
router.delete('/:id', desactivar);

export default router;
