import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import backlogRoutes from './routes/backlogRoutes.js';
import planeRoutes from './routes/planeRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js';
import versionRoutes from './routes/versionRoutes.js';
import archivoRoutes from './routes/archivoRoutes.js';
import rubricaRoutes from './routes/rubricaRoutes.js';
import evaluacionRoutes from './routes/evaluacionRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir la carpeta uploads estaticamente
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/backlog', backlogRoutes);
app.use('/api/plane', planeRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api', versionRoutes);
app.use('/api', archivoRoutes);
app.use('/api/rubricas', rubricaRoutes);
app.use('/api', evaluacionRoutes);
app.use('/api/usuarios', usuarioRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API de Plataforma de Proyectos Integradores' });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});