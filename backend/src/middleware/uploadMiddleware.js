import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';

const uploadDirectory = path.resolve('uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const extensionesPermitidas = new Set(['.pdf', '.docx', '.pptx', '.zip']);
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`);
  }
});

const fileFilter = (_req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();
  if (!extensionesPermitidas.has(extension)) return callback(new Error('Formato no permitido. Solo se aceptan PDF, DOCX, PPTX y ZIP'));
  callback(null, true);
};

export const subirArchivo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }
});

export const manejarErrorSubida = (error, _req, res, next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'El archivo supera el tamaño máximo de 100 MB' });
  }
  if (error) return res.status(400).json({ error: error.message });
  next();
};
