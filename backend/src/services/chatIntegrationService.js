import { randomUUID } from 'node:crypto';
import { SignJWT } from 'jose';
import { PrismaClient } from '@prisma/client';
import { importarClavePrivadaSso, obtenerConfiguracionSso } from '../config/ssoConfig.js';

const prisma = new PrismaClient();

const errorConEstado = (mensaje, status, code) => {
  const error = new Error(mensaje);
  error.status = status;
  error.code = code;
  return error;
};

const obtenerDestino = async (destino, usuario) => {
  if (destino === undefined || destino === null) return undefined;
  if (typeof destino !== 'object' || destino.tipo !== 'proyecto') {
    throw errorConEstado('El destino del chat no es válido', 400, 'DESTINO_INVALIDO');
  }

  const idProyecto = Number.parseInt(String(destino.id), 10);
  if (!Number.isInteger(idProyecto) || idProyecto <= 0) {
    throw errorConEstado('El proyecto de destino no es válido', 400, 'DESTINO_INVALIDO');
  }

  const proyecto = await prisma.proyecto.findUnique({
    where: { id_proyecto: idProyecto },
    select: {
      id_proyecto: true,
      id_creador: true,
      id_docente: true,
      integrantes: { select: { id_usuario: true } }
    }
  });

  if (!proyecto) throw errorConEstado('Proyecto de destino no encontrado', 404, 'DESTINO_NO_ENCONTRADO');

  const esAdmin = usuario.rol === 'admin';
  const esDocenteAsignado = usuario.rol === 'docente' && proyecto.id_docente === usuario.id_usuario;
  const esParticipante = proyecto.id_creador === usuario.id_usuario
    || proyecto.integrantes.some((integrante) => integrante.id_usuario === usuario.id_usuario);

  if (!esAdmin && !esDocenteAsignado && !esParticipante) {
    throw errorConEstado('No tienes acceso al proyecto de destino', 403, 'DESTINO_NO_AUTORIZADO');
  }

  return { tipo: 'proyecto', id: String(idProyecto) };
};

export const crearLanzamientoChat = async (usuarioSesion, destino) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: usuarioSesion.id_usuario },
    select: { id_usuario: true, nombre: true, correo: true, rol: true }
  });

  if (!usuario) throw errorConEstado('Usuario no encontrado', 401, 'USUARIO_NO_ENCONTRADO');

  const config = obtenerConfiguracionSso();
  const destinoSeguro = await obtenerDestino(destino, usuario);
  const ahora = Math.floor(Date.now() / 1000);
  const launchToken = await new SignJWT({
    sub: String(usuario.id_usuario),
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
    ...(destinoSeguro ? { destino: destinoSeguro } : {}),
    volverA: config.returnUrl
  })
    .setProtectedHeader({ alg: 'RS256', kid: config.keyId, typ: 'JWT' })
    .setIssuer(config.issuer)
    .setAudience(config.audience)
    .setJti(randomUUID())
    .setIssuedAt(ahora)
    .setExpirationTime(ahora + 60)
    .sign(await importarClavePrivadaSso());

  return {
    url: `${config.chatServiceUrl.replace(/\/$/, '')}/sso#lt=${encodeURIComponent(launchToken)}`
  };
};