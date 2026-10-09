import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { archivoPermitido } from '../utils/filePolicy.js';

const uploadDirectory = path.resolve('uploads', 'entregas');
fs.mkdirSync(uploadDirectory, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  }
});

const fileFilter = (_req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();
  if (!archivoPermitido(extension, file.mimetype)) return callback(new Error('Formato no permitido. Solo se aceptan PDF, DOCX, PPTX y ZIP'));
  callback(null, true);
};

export const subirArchivo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }
});

export const subirArchivosEntrega = subirArchivo.array('archivos', 10);

export const manejarErrorSubida = (error, _req, res, next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'El archivo supera el tamaño máximo de 25 MB' });
  }
  if (error) return res.status(400).json({ error: error.message });
  next();
};
