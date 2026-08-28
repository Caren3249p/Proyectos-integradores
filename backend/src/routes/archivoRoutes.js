import express from 'express';
import { verificarToken } from '../middleware/authMiddleware.js';
import { manejarErrorSubida, subirArchivo } from '../middleware/uploadMiddleware.js';
import { descargar, eliminar, subir } from '../controllers/archivoController.js';

const router = express.Router();
router.use(verificarToken);
router.post('/versiones/:id/archivos', subirArchivo.single('archivo'), manejarErrorSubida, subir);
router.get('/archivos/:id', descargar);
router.delete('/archivos/:id', eliminar);

export default router;
