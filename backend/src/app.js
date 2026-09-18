import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
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
import githubProjectRoutes from './routes/githubProjectRoutes.js';
import entregableRoutes from './routes/entregableRoutes.js';
import coevaluacionRoutes from './routes/coevaluacionRoutes.js';
import actividadEntregableRoutes from './routes/actividadEntregableRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

const ensureDefaultAdmin = async () => {
  const adminEmail = 'admin@upb.edu.co';
  const adminExists = await prisma.usuario.findUnique({
    where: { correo: adminEmail }
  });

  if (!adminExists) {
    const hash = await bcrypt.hash('AdminUPB2026', 10);
    await prisma.usuario.create({
      data: {
        nombre: 'Coordinador UPB',
        correo: adminEmail,
        contrasena_hash: hash,
        rol: 'admin'
      }
    });
    console.log('✅ Admin por defecto restaurado: admin@upb.edu.co');
  }
};

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
app.use('/api/projects', githubProjectRoutes);
app.use('/api', entregableRoutes);
app.use('/api', coevaluacionRoutes);
app.use('/api', actividadEntregableRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API de Plataforma de Proyectos Integradores' });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Error interno del servidor' });
});

app.listen(PORT, async () => {
  try {
    await ensureDefaultAdmin();
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  } catch (error) {
    console.error('Error al garantizar el usuario admin por defecto:', error.message);
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  }
});