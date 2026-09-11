import express from 'express';
import { verificarToken } from '../middleware/authMiddleware.js';
import { crearGithub } from '../controllers/proyectoController.js';

const router = express.Router();
router.use(verificarToken);
router.post('/:id/create-repo', crearGithub);

export default router;