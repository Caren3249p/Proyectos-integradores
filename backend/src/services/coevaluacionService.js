import { PrismaClient } from '@prisma/client';
import { errorConEstado } from './proyectoService.js';
import { calcularTotalCoevaluacion, validarCalificacionesCoevaluacion } from './coevaluacionCalculator.js';

const prisma = new PrismaClient();

const obtenerEntrega = async (idEntrega) => {
  const entrega = await prisma.entrega.findUnique({
    where: { id_entrega: idEntrega },
    include: {
      entregable: { include: { rubrica_coevaluacion: { include: { criterios: { where: { es_hoja: true }, orderBy: { orden: 'asc' } } } } } },
      actividad_proyecto: { include: { actividad: { include: { rubrica_coevaluacion: { include: { criterios: { where: { es_hoja: true }, orderBy: { orden: 'asc' } } } } } } } },
      proyecto: { include: { integrantes: { include: { usuario: { select: { id_usuario: true, nombre: true, correo: true } } } } } },
      participantes: { include: { usuario: { select: { id_usuario: true, nombre: true, correo: true } } } }
    }
  });
  if (!entrega) throw errorConEstado('Entrega no encontrada', 404);
  const actividad = entrega.actividad_proyecto?.actividad;
  const entregable = entrega.entregable;
  if ((actividad?.tipo || entregable?.tipo) !== 'GRUPAL' || !(actividad?.coevaluacion_activa || entregable?.coevaluacion_activa)) {
    throw errorConEstado('La coevaluación no está activa para esta entrega', 400);
  }
  return entrega;
};

const obtenerRubricaCoevaluacion = (entrega) => entrega.actividad_proyecto?.actividad?.rubrica_coevaluacion || entrega.entregable?.rubrica_coevaluacion;

const exigirParticipante = (entrega, usuario) => {
  if (!entrega.participantes.some(({ id_usuario }) => id_usuario === usuario.id_usuario)) {
    throw errorConEstado('El usuario no pertenece a esta entrega', 403);
  }
};

const recalcularResultados = async (tx, idEntrega) => {
  const entrega = await tx.entrega.findUnique({ where: { id_entrega: idEntrega }, include: { participantes: true } });
  const pares = await tx.coevaluacion.findMany({ where: { id_entrega: idEntrega }, include: { criterios: true } });
  const completos = pares.length > 0 && pares.every(({ estado }) => estado === 'ENVIADA');
  if (!completos) return false;

  const datosEntrega = await tx.entrega.findUnique({ where: { id_entrega: idEntrega }, select: { entregable: { select: { id_rubrica_coevaluacion: true } }, actividad_proyecto: { select: { actividad: { select: { id_rubrica_coevaluacion: true } } } } } });
  const idRubrica = datosEntrega.actividad_proyecto?.actividad?.id_rubrica_coevaluacion || datosEntrega.entregable?.id_rubrica_coevaluacion;
  const criterios = await tx.criterioRubrica.findMany({
    where: { id_rubrica: idRubrica, es_hoja: true },
    orderBy: { orden: 'asc' }
  });

  for (const participante of entrega.participantes) {
    const recibidas = pares.filter(({ id_evaluado }) => id_evaluado === participante.id_usuario);
    const promedios = criterios.map((criterio) => {
      const valores = recibidas.flatMap(({ criterios: items }) => items.filter((item) => item.id_criterio === criterio.id_criterio).map((item) => item.calificacion_base));
      return { id_criterio: criterio.id_criterio, calificacion_base: valores.reduce((sum, value) => sum + Number(value), 0) / (valores.length || 1) };
    });
    const total = calcularTotalCoevaluacion(promedios, criterios);
    await tx.resultadoCoevaluacion.upsert({
      where: { id_entrega_id_usuario: { id_entrega: idEntrega, id_usuario: participante.id_usuario } },
      create: { id_entrega: idEntrega, id_usuario: participante.id_usuario, total_coevaluacion: total, nota_base: entrega.nota_base, nota_final: entrega.nota_base === null ? null : Number(entrega.nota_base) * (total / 100) },
      update: { total_coevaluacion: total, nota_base: entrega.nota_base, nota_final: entrega.nota_base === null ? null : Number(entrega.nota_base) * (total / 100) }
    });
  }
  return true;
};

export const obtenerMisCoevaluaciones = async (idEntrega, usuario) => {
  const entrega = await obtenerEntrega(idEntrega);
  exigirParticipante(entrega, usuario);
  const asignaciones = await prisma.coevaluacion.findMany({
    where: { id_entrega: idEntrega, id_evaluador: usuario.id_usuario },
    include: { evaluado: { select: { id_usuario: true, nombre: true } } },
    orderBy: { id_coevaluacion: 'asc' }
  });
  return { completadas: asignaciones.filter(({ estado }) => estado === 'ENVIADA').length, total: asignaciones.length, asignaciones: asignaciones.map(({ id_coevaluacion, id_evaluado, estado, evaluado }) => ({ id_coevaluacion, id_evaluado, estado, evaluado })) };
};

export const enviarCoevaluacion = async (idEntrega, idEvaluado, data, usuario) => {
  const entrega = await obtenerEntrega(idEntrega);
  exigirParticipante(entrega, usuario);
  if (idEvaluado === usuario.id_usuario) throw errorConEstado('No puede autoevaluarse', 400);
  const criterios = obtenerRubricaCoevaluacion(entrega)?.criterios || [];
  if (criterios.length !== 5) throw errorConEstado('La rúbrica de coevaluación debe tener cinco criterios hoja', 400);
  validarCalificacionesCoevaluacion(data.calificaciones, criterios, errorConEstado);

  const asignacion = await prisma.coevaluacion.findUnique({ where: { id_entrega_id_evaluador_id_evaluado: { id_entrega: idEntrega, id_evaluador: usuario.id_usuario, id_evaluado: idEvaluado } } });
  if (!asignacion) throw errorConEstado('No existe una asignación de coevaluación para ese compañero', 404);
  if (asignacion.estado === 'ENVIADA') throw errorConEstado('La coevaluación ya fue enviada y no puede modificarse', 400);

  return prisma.$transaction(async (tx) => {
    await tx.coevaluacion.update({ where: { id_coevaluacion: asignacion.id_coevaluacion }, data: { estado: 'ENVIADA', fecha_envio: new Date(), observacion: data.observacion, criterios: { create: data.calificaciones.map(({ id_criterio, calificacion_base }) => ({ id_criterio, calificacion_base })) } } });
    const todosCompletos = await recalcularResultados(tx, idEntrega);
    return { enviada: true, resultados_disponibles: todosCompletos };
  });
};

export const obtenerEstadoCoevaluacion = async (idEntrega, usuario) => {
  const entrega = await obtenerEntrega(idEntrega);
  if (usuario.rol !== 'docente') exigirParticipante(entrega, usuario);
  const pares = await prisma.coevaluacion.findMany({ where: { id_entrega: idEntrega }, include: { evaluador: { select: { id_usuario: true, nombre: true } }, evaluado: { select: { id_usuario: true, nombre: true } } } });
  const completos = pares.length > 0 && pares.every(({ estado }) => estado === 'ENVIADA');
  if (usuario.rol !== 'docente') {
    return { total: pares.filter(({ id_evaluador }) => id_evaluador === usuario.id_usuario).length, completadas: pares.filter(({ id_evaluador, estado }) => id_evaluador === usuario.id_usuario && estado === 'ENVIADA').length, completa: completos };
  }
  return { total: pares.length, completadas: pares.filter(({ estado }) => estado === 'ENVIADA').length, completa: completos, pendientes: pares.filter(({ estado }) => estado !== 'ENVIADA').map(({ evaluador, evaluado }) => ({ evaluador, evaluado })) };
};

export const obtenerResultadosCoevaluacion = async (idEntrega, usuario) => {
  const entrega = await obtenerEntrega(idEntrega);
  const esDocente = usuario.rol === 'docente' && (entrega.actividad_proyecto?.actividad?.id_docente || entrega.entregable?.id_docente) === usuario.id_usuario;
  if (!esDocente) exigirParticipante(entrega, usuario);
  const estado = await obtenerEstadoCoevaluacion(idEntrega, usuario);
  if (!estado.completa && !esDocente) throw errorConEstado('Los resultados estarán disponibles cuando todos hayan completado la coevaluación', 409);
  return prisma.resultadoCoevaluacion.findMany({ where: { id_entrega: idEntrega }, include: { usuario: { select: { id_usuario: true, nombre: true } } }, orderBy: { id_usuario: 'asc' } });
};
