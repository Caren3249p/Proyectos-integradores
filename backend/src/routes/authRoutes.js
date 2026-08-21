import express from 'express';
import { register, login, getPerfil } from '../controllers/authController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verificarToken, getPerfil);

export default router;
