import { PrismaClient } from '@prisma/client';
import { errorConEstado, exigirProyecto, esIntegrante } from './proyectoService.js';
import { transformarPlanoAArbol } from './rubricaService.js';
import { obtenerHojasEvaluables } from '../utils/validators.js';

const prisma = new PrismaClient();

const exigirDocente = (usuario) => {
  if (usuario?.rol !== 'docente') {
    throw errorConEstado('Solo los docentes pueden gestionar evaluaciones', 403);
  }
};

const incluirEvaluacion = {
  rubrica: true,
  docente: { select: { id_usuario: true, nombre: true, correo: true } },
  calificaciones: { include: { criterio: true } }
};

const incluirCriteriosRubrica = {
  criterios: {
    include: { niveles: { orderBy: { nivel: 'asc' } } },
    orderBy: { orden: 'asc' }
  }
};

const construirArbolRubrica = (criterios = []) => {
  const tieneHijosAnidados = criterios.some((criterio) => Array.isArray(criterio.hijos) && criterio.hijos.length);
  if (tieneHijosAnidados) {
    const raices = criterios.filter((criterio) => !criterio.parentId && !criterio.id_padre);
    return raices.length ? raices : criterios;
  }
  return transformarPlanoAArbol(criterios);
};

export const calcularNotaNodo = (nodo, evaluacionesMap = new Map()) => {
  if (!nodo) return 0;

  const hijos = Array.isArray(nodo.hijos) ? nodo.hijos : [];
  const esHoja = nodo.esHoja === true || nodo.es_hoja === true || hijos.length === 0;

  if (esHoja || hijos.length === 0) {
    const id = nodo.id_criterio ?? nodo.id;
    const nota = evaluacionesMap.get(id) ?? evaluacionesMap.get(String(id)) ?? 0;
    return Number(nota ?? 0);
  }

  return hijos.reduce((total, hijo) => {
    const notaHijo = calcularNotaNodo(hijo, evaluacionesMap);
    const pesoHijo = Number(hijo.peso ?? hijo.ponderacion ?? 0);
    return total + (notaHijo * (pesoHijo / 100));
  }, 0);
};

export const calcularNotaFinal = (rubrica, evaluacionesMap = new Map()) => {
  if (!rubrica) return 0;
  const criterios = Array.isArray(rubrica.nodos)
    ? rubrica.nodos
    : Array.isArray(rubrica.criterios) ? rubrica.criterios : [];
  const arbol = construirArbolRubrica(criterios);
  if (!arbol.length) return 0;

  const total = arbol.reduce((suma, nodo) => {
    const notaNodo = calcularNotaNodo(nodo, evaluacionesMap);
    const pesoNodo = Number(nodo.peso ?? nodo.ponderacion ?? 0);
    return suma + (notaNodo * (pesoNodo / 100));
  }, 0);

  return Math.round(total * 100) / 100;
};

const resolverNotaHoja = (item, hoja) => {
  if (item.nota !== undefined && item.nota !== null && item.nota !== '') {
    return Number(item.nota);
  }
  if (item.nivel !== undefined && Array.isArray(hoja?.niveles)) {
    const nivel = hoja.niveles.find((n) => Number(n.nivel) === Number(item.nivel));
    if (nivel) return Number(nivel.puntos);
    return Number(item.nivel);
  }
  return 0;
};

const construirMapaNotas = (calificaciones, hojas) => {
  const porId = new Map(hojas.map((hoja) => [Number(hoja.id), hoja]));
  const evaluacionesMap = new Map();
  for (const item of calificaciones) {
    const nota = resolverNotaHoja(item, porId.get(item.id_criterio));
    evaluacionesMap.set(item.id_criterio, nota);
    evaluacionesMap.set(String(item.id_criterio), nota);
  }
  return evaluacionesMap;
};

const validarCalificacionesHojas = (arbol, calificaciones) => {
  const hojas = obtenerHojasEvaluables(arbol);
  const idsHojas = new Set(hojas.map((hoja) => Number(hoja.id)));

  for (const item of calificaciones) {
    if (!idsHojas.has(item.id_criterio)) {
      throw errorConEstado(`El criterio ID ${item.id_criterio} no es una hoja evaluable de esta rúbrica`, 400);
    }
  }

  const calificados = new Set(calificaciones.map((item) => item.id_criterio));
  const faltantes = hojas.filter((hoja) => !calificados.has(Number(hoja.id)));
  if (faltantes.length) {
    throw errorConEstado('Debe calificar todos los criterios hoja de la rúbrica', 400);
  }

  return { hojas, evaluacionesMap: construirMapaNotas(calificaciones, hojas) };
};

const calcularNotaSnapshot = (snapshot, calificaciones) => {
  const nodos = snapshot.map((nodo) => ({ ...nodo, hijos: [] }));
  const mapa = new Map(nodos.map((nodo) => [nodo.id_criterio, nodo]));
  const raices = [];
  nodos.forEach((nodo) => {
    const padre = nodo.id_padre ? mapa.get(nodo.id_padre) : null;
    if (padre) padre.hijos.push(nodo);
    else raices.push(nodo);
  });
  const notas = new Map(calificaciones.map((item) => [item.id_criterio, Number(item.nota ?? 0)]));
  const visitar = (nodo) => {
    if (nodo.es_hoja || !nodo.hijos.length) return nodo.seleccionado ? { nota: notas.get(nodo.id_criterio) ?? 0, peso: Number(nodo.peso) } : null;
    const hijos = nodo.hijos.map(visitar).filter(Boolean);
    if (!hijos.length) return null;
    const pesoTotal = hijos.reduce((total, hijo) => total + hijo.peso, 0);
    return { nota: hijos.reduce((total, hijo) => total + hijo.nota * (hijo.peso / (pesoTotal || 1)), 0), peso: Number(nodo.peso) };
  };
  const resultados = raices.map(visitar).filter(Boolean);
  const pesoTotal = resultados.reduce((total, resultado) => total + resultado.peso, 0);
  return resultados.reduce((total, resultado) => total + resultado.nota * (resultado.peso / (pesoTotal || 1)), 0);
};

const validarCalificacionesSnapshot = (snapshot, calificaciones) => {
  const hojas = snapshot.filter((nodo) => nodo.seleccionado);
  const ids = new Set(hojas.map((nodo) => nodo.id_criterio));
  const recibidos = new Set(calificaciones.map((item) => item.id_criterio));
  if (calificaciones.some((item) => !ids.has(item.id_criterio))) throw errorConEstado('La calificación contiene un criterio no seleccionado para este entregable', 400);
  if (hojas.some((hoja) => !recibidos.has(hoja.id_criterio))) throw errorConEstado('Debe calificar todas las hojas seleccionadas para este entregable', 400);
};

export const crearEvaluacion = async (idProyecto, data, usuario) => {
  exigirDocente(usuario);
  await exigirProyecto(idProyecto);

  let snapshot = null;
  if (data.id_entrega) {
    const entrega = await prisma.entrega.findUnique({ where: { id_entrega: data.id_entrega }, include: { actividad_proyecto: { include: { actividad: true } } } });
    if (!entrega || entrega.id_proyecto !== idProyecto) throw errorConEstado('La entrega no pertenece a este proyecto', 400);
    snapshot = entrega.actividad_proyecto?.actividad?.criterios_snapshot;
  }

  const rubrica = await prisma.rubrica.findUnique({
    where: { id_rubrica: data.id_rubrica },
    include: incluirCriteriosRubrica
  });

  if (!rubrica) throw errorConEstado('La rúbrica especificada no existe', 404);
  if (rubrica.id_docente !== usuario.id_usuario) throw errorConEstado('Solo puedes evaluar con rúbricas creadas por ti', 403);
  if (!rubrica.activa) throw errorConEstado('La rúbrica especificada no está activa', 400);
  if (!rubrica.criterios.length) throw errorConEstado('La rúbrica no contiene criterios de evaluación', 400);

  const arbol = construirArbolRubrica(rubrica.criterios);
  let notaFinalRedondeada;
  let evaluacionesMap;
  if (snapshot) {
    validarCalificacionesSnapshot(snapshot, data.calificaciones);
    notaFinalRedondeada = Math.round(calcularNotaSnapshot(snapshot, data.calificaciones) * 100) / 100;
    evaluacionesMap = construirMapaNotas(data.calificaciones, obtenerHojasEvaluables(arbol));
  } else {
    ({ evaluacionesMap } = validarCalificacionesHojas(arbol, data.calificaciones));
    notaFinalRedondeada = calcularNotaFinal({ criterios: arbol }, evaluacionesMap);
  }

  const evaluacion = await prisma.$transaction(async (tx) => {
    const creada = await tx.evaluacion.create({
      data: {
        id_proyecto: idProyecto,
        id_entrega: data.id_entrega,
        id_rubrica: data.id_rubrica,
        id_docente: usuario.id_usuario,
        nota_final: notaFinalRedondeada,
        retroalimentacion: data.retroalimentacion,
        estado: 'borrador',
        calificaciones: {
          create: data.calificaciones.map((item) => ({
            id_criterio: item.id_criterio,
            nota: evaluacionesMap.get(item.id_criterio)
          }))
        }
      },
      include: incluirEvaluacion
    });
    if (data.id_entrega) await tx.entrega.update({ where: { id_entrega: data.id_entrega }, data: { nota_base: notaFinalRedondeada } });
    return creada;
  });
  return evaluacion;
};

export const obtenerEvaluacion = async (idEvaluacion, usuario) => {
  const evaluacion = await prisma.evaluacion.findUnique({
    where: { id_evaluacion: idEvaluacion },
    include: {
      proyecto: { include: { integrantes: true } },
      ...incluirEvaluacion
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
    include: incluirEvaluacion
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
    include: incluirEvaluacion
  });
};

export const actualizarEvaluacion = async (idEvaluacion, data, usuario) => {
  exigirDocente(usuario);

  const evaluacion = await prisma.evaluacion.findUnique({
    where: { id_evaluacion: idEvaluacion },
    include: { rubrica: { include: incluirCriteriosRubrica } }
  });

  if (!evaluacion) throw errorConEstado('Evaluación no encontrada', 404);
  if (evaluacion.id_docente !== usuario.id_usuario) {
    throw errorConEstado('No tiene permisos para cambiar notas de evaluaciones de otros docentes', 403);
  }
  if (evaluacion.estado === 'cerrada') {
    throw errorConEstado('No se puede modificar una evaluación cerrada. Debe reabrirla primero.', 400);
  }

  const arbol = construirArbolRubrica(evaluacion.rubrica.criterios);
  const { evaluacionesMap } = validarCalificacionesHojas(arbol, data.calificaciones);
  const notaFinalRedondeada = calcularNotaFinal({ criterios: arbol }, evaluacionesMap);

  const evaluacionActualizada = await prisma.$transaction(async (tx) => {
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
            nota: evaluacionesMap.get(item.id_criterio)
          }))
        }
      },
      include: incluirEvaluacion
    });
  });

    if (evaluacionActualizada.id_entrega) {
      await prisma.entrega.update({ where: { id_entrega: evaluacionActualizada.id_entrega }, data: { nota_base: notaFinalRedondeada } });
    }
  return evaluacionActualizada;
};

export const listarEvaluacionesProyecto = async (idProyecto, usuario) => {
  const proyecto = await exigirProyecto(idProyecto);
  if (usuario.rol !== 'docente' && !esIntegrante(proyecto, usuario)) {
    throw errorConEstado('No tiene permisos para consultar las evaluaciones de este proyecto', 403);
  }

  return prisma.evaluacion.findMany({
    where: { id_proyecto: idProyecto },
    include: incluirEvaluacion,
    orderBy: { fecha: 'desc' }
  });
};
