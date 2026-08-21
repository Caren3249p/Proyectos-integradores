import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import backlogRoutes from './routes/backlogRoutes.js';
import planeRoutes from './routes/planeRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/backlog', backlogRoutes);
app.use('/api/plane', planeRoutes);

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
