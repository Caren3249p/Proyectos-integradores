import express from 'express';
import { register, login, getPerfil, githubUrl, githubCallback, githubStatus, disconnectGithub } from '../controllers/authController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verificarToken, getPerfil);
router.get('/github/url', verificarToken, githubUrl);
router.get('/github/callback', githubCallback);
router.get('/github/status', verificarToken, githubStatus);
router.delete('/github', verificarToken, disconnectGithub);

export default router;
