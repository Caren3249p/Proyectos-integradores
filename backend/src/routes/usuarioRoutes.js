import express from 'express';
import { verificarToken, autorizarRoles } from '../middleware/authMiddleware.js';
import { listarUsuarios, crearUsuarioAdmin } from '../controllers/usuarioController.js';

const router = express.Router();

// Todas las rutas de usuarios requieren estar autenticado
router.use(verificarToken);

// Solo el ADMIN puede listar usuarios y crear docentes/admins
router.get('/', autorizarRoles('admin'), listarUsuarios);
router.post('/', autorizarRoles('admin'), crearUsuarioAdmin);

export default router;