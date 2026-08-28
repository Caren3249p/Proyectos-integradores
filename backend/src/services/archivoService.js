import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { errorConEstado, esIntegrante } from './proyectoService.js';

const prisma = new PrismaClient();

const obtenerVersionConAcceso = async (idVersion, usuario) => {
  const version = await prisma.versionProyecto.findUnique({ where: { id_version: idVersion }, include: { proyecto: { include: { integrantes: true } } } });
  if (!version) throw errorConEstado('Versión no encontrada', 404);
  if (usuario.rol !== 'docente' && !esIntegrante(version.proyecto, usuario)) throw errorConEstado('No tiene permisos para acceder a esta versión', 403);
  return version;
};

export const guardarArchivo = async (idVersion, archivo, tipo, usuario) => {
  if (!archivo) throw errorConEstado('Debe enviar un archivo en el campo archivo');
  const version = await obtenerVersionConAcceso(idVersion, usuario);
  if (version.es_final) {
    await fs.unlink(archivo.path).catch(() => {});
    throw errorConEstado('No se pueden subir archivos a una versión final');
  }
  return prisma.archivo.create({ data: { id_version: idVersion, nombre: archivo.originalname, nombre_fisico: archivo.filename, ruta: archivo.path, extension: path.extname(archivo.originalname).toLowerCase(), tamano: archivo.size, tipo } });
};

export const obtenerArchivo = async (idArchivo, usuario) => {
  const archivo = await prisma.archivo.findUnique({ where: { id_archivo: idArchivo }, include: { version: { include: { proyecto: { include: { integrantes: true } } } } } });
  if (!archivo) throw errorConEstado('Archivo no encontrado', 404);
  if (usuario.rol !== 'docente' && !esIntegrante(archivo.version.proyecto, usuario)) throw errorConEstado('No tiene permisos para descargar este archivo', 403);
  return archivo;
};

export const eliminarArchivo = async (idArchivo, usuario) => {
  const archivo = await obtenerArchivo(idArchivo, usuario);
  if (archivo.version.es_final) throw errorConEstado('No se puede eliminar un archivo de una versión final');
  await prisma.archivo.delete({ where: { id_archivo: idArchivo } });
  await fs.unlink(archivo.ruta).catch(() => {});
};
