import express from 'express';
import { verificarToken } from '../middleware/authMiddleware.js';
import { enviar, estado, listarMias, resultados } from '../controllers/coevaluacionController.js';

const router = express.Router();
router.use(verificarToken);
router.get('/entregas/:idEntrega/mis-coevaluaciones', listarMias);
router.post('/entregas/:idEntrega/coevaluaciones/:idEvaluado', enviar);
router.get('/entregas/:idEntrega/coevaluacion/estado', estado);
router.get('/entregas/:idEntrega/resultados-coevaluacion', resultados);

export default router;
