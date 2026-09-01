import express from 'express';
import { verificarToken } from '../middleware/authMiddleware.js';
import {
  agregar,
  actualizar,
  actualizarCampos,
  asignarDoc,
  crear,
  desenlazar,
  desasignarDoc,
  eliminar,
  enlazar,
  obtener,
  listar,
  quitar,
  sinDocente
} from '../controllers/proyectoController.js';

const router = express.Router();
router.use(verificarToken);
router.post('/', crear);
router.get('/', listar);
router.get('/sin-docente', sinDocente);           // Proyectos sin asesor asignado
router.get('/:id', obtener);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);
router.post('/:id/integrantes', agregar);
router.delete('/:id/integrantes/:usuarioId', quitar);
router.patch('/:id/campos-tecnicos', actualizarCampos);
router.post('/:id/repositorio', enlazar);
router.delete('/:id/repositorio', desenlazar);
router.patch('/:id/asignar-docente', asignarDoc);    // Docente toma el proyecto
router.delete('/:id/asignar-docente', desasignarDoc); // Docente se desasigna

export default router;
