import express from 'express';
import { verificarToken } from '../middleware/authMiddleware.js';
import { manejarErrorSubida, subirArchivosEntrega } from '../middleware/uploadMiddleware.js';
import { crear, entregar, listar, obtener, publicar, subirArchivos } from '../controllers/entregableController.js';

const router = express.Router();
router.use(verificarToken);

router.post('/proyectos/:idProyecto/entregables', crear);
router.get('/proyectos/:idProyecto/entregables', listar);
router.get('/entregables/:id', obtener);
router.patch('/entregables/:id/publicar', publicar);
router.post('/entregables/:id/entrega', entregar);
router.post('/entregas/:idEntrega/archivos', subirArchivosEntrega, manejarErrorSubida, subirArchivos);

export default router;
