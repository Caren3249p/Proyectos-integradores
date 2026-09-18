import { PrismaClient } from '@prisma/client';
import { errorConEstado, esIntegrante } from './proyectoService.js';

const prisma = new PrismaClient();

const exigirDocente = (usuario) => {
  if (usuario?.rol !== 'docente') throw errorConEstado('Solo los docentes pueden gestionar entregables', 403);
};

const incluirEntregable = {
  proyecto: { select: { id_proyecto: true, titulo: true, id_docente: true, integrantes: { select: { id_usuario: true } } } },
  rubrica_docente: { select: { id_rubrica: true, nombre: true, tipo: true } },
  rubrica_coevaluacion: { select: { id_rubrica: true, nombre: true, tipo: true } },
  entregas: { include: { participantes: true, archivos: true }, orderBy: { id_entrega: 'asc' } }
};

const obtenerProyecto = async (idProyecto) => {
  const proyecto = await prisma.proyecto.findUnique({
    where: { id_proyecto: idProyecto },
    include: { integrantes: true }
  });
  if (!proyecto) throw errorConEstado('Proyecto no encontrado', 404);
  return proyecto;
};

const exigirAcceso = (entregable, usuario) => {
  if (usuario.rol === 'docente' && entregable.id_docente === usuario.id_usuario) return;
  if (usuario.rol !== 'docente' && esIntegrante(entregable.proyecto, usuario)) return;
  throw errorConEstado('No tiene permisos para consultar este entregable', 403);
};

const validarRubricas = async (data, usuario) => {
  const ids = [data.id_rubrica_docente, data.id_rubrica_coevaluacion].filter(Boolean);
  const rubricas = await prisma.rubrica.findMany({ where: { id_rubrica: { in: ids } } });
  if (rubricas.length !== ids.length) throw errorConEstado('Una de las rúbricas especificadas no existe', 404);
  const docente = rubricas.find((rubrica) => rubrica.id_rubrica === data.id_rubrica_docente);
  if (docente.id_docente !== usuario.id_usuario || docente.tipo !== 'DOCENTE' || !docente.activa) {
    throw errorConEstado('La rúbrica docente no es válida para este usuario', 403);
  }
  if (data.coevaluacion_activa) {
    const coevaluacion = rubricas.find((rubrica) => rubrica.id_rubrica === data.id_rubrica_coevaluacion);
    if (coevaluacion.id_docente !== usuario.id_usuario || coevaluacion.tipo !== 'COEVALUACION' || !coevaluacion.activa) {
      throw errorConEstado('La rúbrica de coevaluación no es válida para este usuario', 403);
    }
  }
};

const crearEntregasIniciales = async (tx, entregable, integrantes) => {
  if (entregable.tipo === 'GRUPAL') {
    const entrega = await tx.entrega.create({
      data: {
        id_entregable: entregable.id_entregable,
        id_proyecto: entregable.id_proyecto,
        identificador: `${entregable.id_entregable}:grupo`,
        participantes: { create: integrantes.map(({ id_usuario }) => ({ id_usuario })) }
      }
    });
    if (entregable.coevaluacion_activa) {
      const pares = integrantes.flatMap(({ id_usuario: evaluador }) => integrantes
        .filter(({ id_usuario: evaluado }) => evaluador !== evaluado)
        .map(({ id_usuario: evaluado }) => ({ id_entrega: entrega.id_entrega, id_evaluador: evaluador, id_evaluado: evaluado })));
      await tx.coevaluacion.createMany({ data: pares });
    }
    return;
  }

  await tx.entrega.createMany({
    data: integrantes.map(({ id_usuario }) => ({
      id_entregable: entregable.id_entregable,
      id_proyecto: entregable.id_proyecto,
      id_usuario,
      identificador: `${entregable.id_entregable}:usuario:${id_usuario}`
    }))
  });
};

export const crearEntregable = async (idProyecto, data, usuario) => {
  exigirDocente(usuario);
  const proyecto = await obtenerProyecto(idProyecto);
  if (proyecto.id_docente !== usuario.id_usuario) throw errorConEstado('Solo el docente asignado puede crear entregables', 403);
  await validarRubricas(data, usuario);

  return prisma.entregable.create({
    data: {
      ...data,
      id_proyecto: idProyecto,
      id_docente: usuario.id_usuario,
      id_rubrica_coevaluacion: data.coevaluacion_activa ? data.id_rubrica_coevaluacion : null
    },
    include: incluirEntregable
  });
};

export const publicarEntregable = async (idEntregable, usuario) => {
  exigirDocente(usuario);
  const entregable = await prisma.entregable.findUnique({ where: { id_entregable: idEntregable }, include: { proyecto: { include: { integrantes: true } } } });
  if (!entregable) throw errorConEstado('Entregable no encontrado', 404);
  if (entregable.id_docente !== usuario.id_usuario) throw errorConEstado('No tiene permisos para publicar este entregable', 403);
  if (entregable.estado !== 'BORRADOR') throw errorConEstado('Solo se pueden publicar entregables en borrador', 400);

  return prisma.$transaction(async (tx) => {
    const publicado = await tx.entregable.update({ where: { id_entregable: idEntregable }, data: { estado: 'PUBLICADO' } });
    await crearEntregasIniciales(tx, publicado, entregable.proyecto.integrantes);
    return tx.entregable.findUnique({ where: { id_entregable: idEntregable }, include: incluirEntregable });
  });
};

export const listarEntregablesProyecto = async (idProyecto, usuario) => {
  const proyecto = await obtenerProyecto(idProyecto);
  if (usuario.rol !== 'docente' && !esIntegrante(proyecto, usuario)) throw errorConEstado('No tiene permisos para consultar estos entregables', 403);
  return prisma.entregable.findMany({ where: { id_proyecto: idProyecto }, include: incluirEntregable, orderBy: { fecha_limite: 'asc' } });
};

export const obtenerEntregable = async (idEntregable, usuario) => {
  const entregable = await prisma.entregable.findUnique({ where: { id_entregable: idEntregable }, include: incluirEntregable });
  if (!entregable) throw errorConEstado('Entregable no encontrado', 404);
  exigirAcceso(entregable, usuario);
  return entregable;
};

export const registrarEntrega = async (idEntregable, usuario) => {
  const entregable = await prisma.entregable.findUnique({ where: { id_entregable: idEntregable }, include: { proyecto: { include: { integrantes: true } }, entregas: true } });
  if (!entregable) throw errorConEstado('Entregable no encontrado', 404);
  if (usuario.rol === 'docente' || !esIntegrante(entregable.proyecto, usuario)) throw errorConEstado('Solo un integrante puede registrar la entrega', 403);
  if (entregable.estado !== 'PUBLICADO') throw errorConEstado('El entregable no está disponible para recibir entregas', 400);

  const entrega = entregable.tipo === 'GRUPAL'
    ? entregable.entregas.find((item) => item.id_usuario === null)
    : entregable.entregas.find((item) => item.id_usuario === usuario.id_usuario);
  if (!entrega) throw errorConEstado('No existe una entrega habilitada para este usuario', 404);

  const fechaEntrega = new Date();
  return prisma.entrega.update({
    where: { id_entrega: entrega.id_entrega },
    data: { fecha_entrega: fechaEntrega, entregada_a_tiempo: fechaEntrega <= entregable.fecha_limite, estado: 'ENTREGADA' },
    include: { participantes: true, archivos: true }
  });
};

export const registrarEntregaPorId = async (idEntrega, usuario) => {
  const entrega = await prisma.entrega.findUnique({
    where: { id_entrega: idEntrega },
    include: { actividad_proyecto: { include: { actividad: true } }, proyecto: { include: { integrantes: true } } }
  });
  if (!entrega) throw errorConEstado('Entrega no encontrada', 404);
  if (usuario.rol === 'docente' || !entrega.proyecto.integrantes.some(({ id_usuario }) => id_usuario === usuario.id_usuario)) {
    throw errorConEstado('Solo un integrante puede registrar la entrega', 403);
  }
  const fechaEntrega = new Date();
  return prisma.entrega.update({
    where: { id_entrega: idEntrega },
    data: {
      fecha_entrega: fechaEntrega,
      entregada_a_tiempo: fechaEntrega <= entrega.actividad_proyecto.actividad.fecha_limite,
      estado: 'ENTREGADA'
    },
    include: { participantes: true, archivos: true }
  });
};

export const guardarArchivosEntrega = async (idEntrega, archivos, usuario) => {
  const entrega = await prisma.entrega.findUnique({ where: { id_entrega: idEntrega }, include: { entregable: true, proyecto: { include: { integrantes: true } }, participantes: true } });
  if (!entrega) throw errorConEstado('Entrega no encontrada', 404);
  if (usuario.rol !== 'docente' && !esIntegrante(entrega.proyecto, usuario)) throw errorConEstado('No tiene permisos para adjuntar archivos', 403);
  if (!archivos?.length) throw errorConEstado('Debe enviar al menos un archivo');
  return prisma.archivoEntrega.createMany({ data: archivos.map((archivo) => ({ id_entrega: idEntrega, nombre: archivo.originalname, nombre_fisico: archivo.filename, ruta: archivo.path, extension: archivo.originalname.includes('.') ? archivo.originalname.slice(archivo.originalname.lastIndexOf('.')).toLowerCase() : '', tamano: archivo.size })) });
};
