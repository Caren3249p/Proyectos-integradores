import express from 'express';
import { verificarToken } from '../middleware/authMiddleware.js';
import { crear, final, obtener } from '../controllers/versionController.js';

const router = express.Router();
router.use(verificarToken);
router.post('/proyectos/:id/versiones', crear);
router.patch('/versiones/:id/final', final);
router.get('/versiones/:id', obtener);

export default router;
