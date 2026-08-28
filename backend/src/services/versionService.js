import { PrismaClient } from '@prisma/client';
import { errorConEstado, exigirProyecto, exigirPuedeModificar, esIntegrante } from './proyectoService.js';

const prisma = new PrismaClient();

export const crearVersion = async (idProyecto, usuario) => {
  const proyecto = await exigirProyecto(idProyecto);
  exigirPuedeModificar(proyecto, usuario);
  if (proyecto.estado === 'publicado') throw errorConEstado('No se puede crear una versión de un proyecto publicado');
  const ultima = proyecto.versiones.reduce((max, version) => Math.max(max, Number.parseInt(version.numero.replace('v', ''), 10) || 0), 0);
  return prisma.versionProyecto.create({ data: { id_proyecto: idProyecto, numero: `v${ultima + 1}.0` } });
};

export const marcarFinal = async (idVersion, usuario) => {
  const version = await prisma.versionProyecto.findUnique({ where: { id_version: idVersion }, include: { proyecto: { include: { integrantes: true } } } });
  if (!version) throw errorConEstado('Versión no encontrada', 404);
  exigirPuedeModificar(version.proyecto, usuario);
  if (version.es_final) throw errorConEstado('La versión ya está marcada como final');
  return prisma.versionProyecto.update({ where: { id_version: idVersion }, data: { es_final: true }, include: { archivos: true } });
};

export const obtenerVersionConAcceso = async (idVersion, usuario) => {
  const version = await prisma.versionProyecto.findUnique({ where: { id_version: idVersion }, include: { proyecto: { include: { integrantes: true } }, archivos: true } });
  if (!version) throw errorConEstado('Versión no encontrada', 404);
  if (usuario.rol !== 'docente' && !esIntegrante(version.proyecto, usuario)) {
    throw errorConEstado('No tiene permisos para acceder a esta versión', 403);
  }
  return version;
};
