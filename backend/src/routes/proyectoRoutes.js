import express from 'express';
import { verificarToken } from '../middleware/authMiddleware.js';
import {
  agregar,
  actualizar,
  actualizarCampos,
  crear,
  desenlazar,
  eliminar,
  enlazar,
  obtener,
  quitar
} from '../controllers/proyectoController.js';

const router = express.Router();
router.use(verificarToken);
router.post('/', crear);
router.get('/:id', obtener);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);
router.post('/:id/integrantes', agregar);
router.delete('/:id/integrantes/:usuarioId', quitar);
router.patch('/:id/campos-tecnicos', actualizarCampos);
router.post('/:id/repositorio', enlazar);
router.delete('/:id/repositorio', desenlazar);

export default router;
