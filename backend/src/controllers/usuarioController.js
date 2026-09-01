import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { crearUsuarioAdminSchema } from '../utils/validators.js';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

export const listarUsuarios = async (req, res, next) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id_usuario: true,
        nombre: true,
        correo: true,
        rol: true,
        fecha_registro: true
      },
      orderBy: { fecha_registro: 'desc' }
    });
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
};

export const crearUsuarioAdmin = async (req, res, next) => {
  try {
    const { nombre, correo, contrasena, rol } = crearUsuarioAdminSchema.parse(req.body);

    const existe = await prisma.usuario.findUnique({ where: { correo } });
    if (existe) {
      return res.status(400).json({ error: 'Este correo ya se encuentra registrado' });
    }

    const hash = await bcrypt.hash(contrasena, BCRYPT_ROUNDS);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        correo,
        contrasena_hash: hash,
        rol
      },
      select: {
        id_usuario: true,
        nombre: true,
        correo: true,
        rol: true
      }
    });

    res.status(201).json({ message: 'Usuario creado exitosamente', usuario: nuevoUsuario });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    next(error);
  }
};