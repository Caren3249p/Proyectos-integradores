import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

export const registrarUsuario = async (data) => {
  // data.rol siempre es 'estudiante' — lo fuerza el schema (transform)
  const { nombre, correo, contrasena, rol } = data;

  const existe = await prisma.usuario.findUnique({ where: { correo } });
  if (existe) {
    const err = new Error('Este correo ya se encuentra registrado');
    err.code = 'EMAIL_EXISTS';
    throw err;
  }

  const hash = await bcrypt.hash(contrasena, BCRYPT_ROUNDS);

  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      correo,
      contrasena_hash: hash,
      rol // siempre 'estudiante' por el transform del schema
    }
  });

  return usuario;
};

export const iniciarSesion = async (correo, contraseña) => {
  const usuario = await prisma.usuario.findUnique({ where: { correo } });
  if (!usuario) {
    throw new Error('Credenciales inválidas');
  }

  const valido = await bcrypt.compare(contraseña, usuario.contrasena_hash);
  if (!valido) {
    throw new Error('Credenciales inválidas');
  }

  const token = jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
      rol: usuario.rol
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30m' }
  );

  return {
    token,
    usuario: {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol
    }
  };
};
