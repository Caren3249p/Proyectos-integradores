import { PrismaClient } from '@prisma/client';
import { errorConEstado, exigirProyecto, esIntegrante } from './proyectoService.js';

const prisma = new PrismaClient();

const exigirDocente = (usuario) => {
  if (usuario?.rol !== 'docente') {
    throw errorConEstado('Solo los docentes pueden gestionar evaluaciones', 403);
  }
};

export const crearEvaluacion = async (idProyecto, data, usuario) => {
  exigirDocente(usuario);
  const proyecto = await exigirProyecto(idProyecto);
  
  const rubrica = await prisma.rubrica.findUnique({
    where: { id_rubrica: data.id_rubrica },
    include: { criterios: true }
  });

  if (!rubrica) throw errorConEstado('La rúbrica especificada no existe', 404);
  if (!rubrica.activa) throw errorConEstado('La rúbrica especificada no está activa', 400);
  if (!rubrica.criterios.length) throw errorConEstado('La rúbrica no contiene criterios de evaluación', 400);

  const mapCriterios = new Map(rubrica.criterios.map((c) => [c.id_criterio, Number(c.peso)]));
  for (const item of data.calificaciones) {
    if (!mapCriterios.has(item.id_criterio)) {
      throw errorConEstado(`El criterio ID ${item.id_criterio} no pertenece a esta rúbrica`, 400);
    }
  }

  if (data.calificaciones.length !== rubrica.criterios.length) {
    throw errorConEstado('Debe calificar todos los criterios de la rúbrica', 400);
  }

  let notaFinalPonderada = 0;
  for (const item of data.calificaciones) {
    const peso = mapCriterios.get(item.id_criterio);
    notaFinalPonderada += Number(item.nota) * (peso / 100);
  }

  const notaFinalRedondeada = Math.round(notaFinalPonderada * 100) / 100;

  return prisma.evaluacion.create({
    data: {
      id_proyecto: idProyecto,
      id_rubrica: data.id_rubrica,
      id_docente: usuario.id_usuario,
      nota_final: notaFinalRedondeada,
      retroalimentacion: data.retroalimentacion,
      estado: 'borrador',
      calificaciones: {
        create: data.calificaciones.map((item) => ({
          id_criterio: item.id_criterio,
          nota: item.nota
        }))
      }
    },
    include: {
      rubrica: true,
      docente: { select: { id_usuario: true, nombre: true, correo: true } },
      calificaciones: { include: { criterio: true } }
    }
  });
};

export const obtenerEvaluacion = async (idEvaluacion, usuario) => {
  const evaluacion = await prisma.evaluacion.findUnique({
    where: { id_evaluacion: idEvaluacion },
    include: {
      proyecto: { include: { integrantes: true } },
      rubrica: true,
      docente: { select: { id_usuario: true, nombre: true, correo: true } },
      calificaciones: { include: { criterio: true } }
    }
  });

  if (!evaluacion) throw errorConEstado('Evaluación no encontrada', 404);
  if (usuario.rol !== 'docente' && !esIntegrante(evaluacion.proyecto, usuario)) {
    throw errorConEstado('No tiene permisos para consultar esta evaluación', 403);
  }

  return evaluacion;
};

export const cerrarEvaluacion = async (idEvaluacion, usuario) => {
  exigirDocente(usuario);

  const evaluacion = await prisma.evaluacion.findUnique({
    where: { id_evaluacion: idEvaluacion }
  });

  if (!evaluacion) throw errorConEstado('Evaluación no encontrada', 404);
  if (evaluacion.id_docente !== usuario.id_usuario) {
    throw errorConEstado('No tiene permisos para modificar esta evaluación', 403);
  }
  if (evaluacion.estado === 'cerrada') {
    throw errorConEstado('La evaluación ya se encuentra cerrada y no se puede editar', 400);
  }

  return prisma.evaluacion.update({
    where: { id_evaluacion: idEvaluacion },
    data: { estado: 'cerrada' },
    include: {
      rubrica: true,
      docente: { select: { id_usuario: true, nombre: true, correo: true } },
      calificaciones: { include: { criterio: true } }
    }
  });
};

export const reabrirEvaluacion = async (idEvaluacion, usuario) => {
  exigirDocente(usuario);

  const evaluacion = await prisma.evaluacion.findUnique({
    where: { id_evaluacion: idEvaluacion }
  });

  if (!evaluacion) throw errorConEstado('Evaluación no encontrada', 404);
  if (evaluacion.id_docente !== usuario.id_usuario) {
    throw errorConEstado('No tiene permisos para reabrir evaluaciones de otros docentes', 403);
  }
  if (evaluacion.estado !== 'cerrada') {
    throw errorConEstado('La evaluación no está cerrada', 400);
  }

  return prisma.evaluacion.update({
    where: { id_evaluacion: idEvaluacion },
    data: { estado: 'borrador' },
    include: {
      rubrica: true,
      docente: { select: { id_usuario: true, nombre: true, correo: true } },
      calificaciones: { include: { criterio: true } }
    }
  });
};

export const actualizarEvaluacion = async (idEvaluacion, data, usuario) => {
  exigirDocente(usuario);

  const evaluacion = await prisma.evaluacion.findUnique({
    where: { id_evaluacion: idEvaluacion },
    include: { rubrica: { include: { criterios: true } } }
  });

  if (!evaluacion) throw errorConEstado('Evaluación no encontrada', 404);
  if (evaluacion.id_docente !== usuario.id_usuario) {
    throw errorConEstado('No tiene permisos para cambiar notas de evaluaciones de otros docentes', 403);
  }
  if (evaluacion.estado === 'cerrada') {
    throw errorConEstado('No se puede modificar una evaluación cerrada. Debe reabrirla primero.', 400);
  }

  const rubrica = evaluacion.rubrica;
  const mapCriterios = new Map(rubrica.criterios.map((c) => [c.id_criterio, Number(c.peso)]));
  for (const item of data.calificaciones) {
    if (!mapCriterios.has(item.id_criterio)) {
      throw errorConEstado(`El criterio ID ${item.id_criterio} no pertenece a esta rúbrica`, 400);
    }
  }

  if (data.calificaciones.length !== rubrica.criterios.length) {
    throw errorConEstado('Debe calificar todos los criterios de la rúbrica', 400);
  }

  let notaFinalPonderada = 0;
  for (const item of data.calificaciones) {
    const peso = mapCriterios.get(item.id_criterio);
    notaFinalPonderada += Number(item.nota) * (peso / 100);
  }

  const notaFinalRedondeada = Math.round(notaFinalPonderada * 100) / 100;

  return prisma.$transaction(async (tx) => {
    await tx.calificacionCriterio.deleteMany({
      where: { id_evaluacion: idEvaluacion }
    });

    return tx.evaluacion.update({
      where: { id_evaluacion: idEvaluacion },
      data: {
        nota_final: notaFinalRedondeada,
        retroalimentacion: data.retroalimentacion,
        calificaciones: {
          create: data.calificaciones.map((item) => ({
            id_criterio: item.id_criterio,
            nota: item.nota
          }))
        }
      },
      include: {
        rubrica: true,
        docente: { select: { id_usuario: true, nombre: true, correo: true } },
        calificaciones: { include: { criterio: true } }
      }
    });
  });
};

export const listarEvaluacionesProyecto = async (idProyecto, usuario) => {
  const proyecto = await exigirProyecto(idProyecto);
  if (usuario.rol !== 'docente' && !esIntegrante(proyecto, usuario)) {
    throw errorConEstado('No tiene permisos para consultar las evaluaciones de este proyecto', 403);
  }

  return prisma.evaluacion.findMany({
    where: { id_proyecto: idProyecto },
    include: {
      rubrica: { select: { id_rubrica: true, nombre: true } },
      docente: { select: { id_usuario: true, nombre: true, correo: true } },
      calificaciones: { include: { criterio: true } }
    },
    orderBy: { fecha: 'desc' }
  });
};
