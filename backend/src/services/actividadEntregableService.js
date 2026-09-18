import { PrismaClient } from '@prisma/client';
import { errorConEstado } from './proyectoService.js';

const prisma = new PrismaClient();

const exigirDocente = (usuario) => {
  if (usuario?.rol !== 'docente') throw errorConEstado('Solo los docentes pueden gestionar actividades', 403);
};

const incluirActividad = {
  docente: { select: { id_usuario: true, nombre: true } },
  rubrica_docente: { select: { id_rubrica: true, nombre: true, tipo: true } },
  rubrica_coevaluacion: { select: { id_rubrica: true, nombre: true, tipo: true, criterios: { where: { es_hoja: true }, orderBy: { orden: 'asc' } } } },
  proyectos: {
    include: {
      proyecto: { select: { id_proyecto: true, titulo: true, id_docente: true, integrantes: { select: { id_usuario: true } } } },
      entrega: { include: { participantes: true, archivos: true, evaluacion: true, coevaluaciones: { include: { evaluado: { select: { id_usuario: true, nombre: true } } } }, resultados_coevaluacion: { include: { usuario: { select: { id_usuario: true, nombre: true } } } } } }
    }
  }
};

const hojasDescendientes = (criterios, seleccionados) => {
  const porPadre = new Map();
  criterios.forEach((criterio) => {
    const padre = criterio.id_padre || null;
    if (!porPadre.has(padre)) porPadre.set(padre, []);
    porPadre.get(padre).push(criterio);
  });
  const resultado = new Map();
  const visitar = (id) => {
    const criterio = criterios.find((item) => item.id_criterio === id);
    if (!criterio) return;
    const hijos = porPadre.get(id) || [];
    if (criterio.es_hoja || !hijos.length) {
      resultado.set(criterio.id_criterio, criterio);
      return;
    }
    hijos.forEach((hijo) => visitar(hijo.id_criterio));
  };
  seleccionados.forEach((id) => visitar(Number(id)));
  return [...resultado.values()];
};

const construirSnapshot = (criterios, seleccionados) => {
  const hojas = new Set(hojasDescendientes(criterios, seleccionados).map(({ id_criterio }) => id_criterio));
  return criterios.map((criterio) => ({
    id_criterio: criterio.id_criterio,
    nombre: criterio.nombre,
    descripcion: criterio.descripcion,
    peso: Number(criterio.peso),
    id_padre: criterio.id_padre,
    es_hoja: criterio.es_hoja,
    seleccionado: hojas.has(criterio.id_criterio),
    niveles: criterio.niveles.map((nivel) => ({ nivel: nivel.nivel, puntos: Number(nivel.puntos), descripcion: nivel.descripcion }))
  }));
};

const validarProyectosDocente = async (ids, usuario) => {
  const proyectos = await prisma.proyecto.findMany({ where: { id_proyecto: { in: ids }, id_docente: usuario.id_usuario }, include: { integrantes: true } });
  if (proyectos.length !== new Set(ids).size) throw errorConEstado('Solo puedes asignar actividades a proyectos que tienes asignados', 403);
  if (proyectos.some((proyecto) => proyecto.integrantes.length === 0)) throw errorConEstado('Todos los proyectos deben tener integrantes', 400);
  return proyectos;
};

const generarEntrega = async (tx, actividad, asignacion, proyecto) => {
  const entrega = await tx.entrega.create({
    data: {
      id_actividad_proyecto: asignacion.id_actividad_proyecto,
      id_proyecto: proyecto.id_proyecto,
      identificador: `actividad:${actividad.id_actividad}:proyecto:${proyecto.id_proyecto}`,
      participantes: { create: proyecto.integrantes.map(({ id_usuario }) => ({ id_usuario })) }
    }
  });
  if (actividad.coevaluacion_activa && actividad.tipo === 'GRUPAL') {
    const pares = proyecto.integrantes.flatMap(({ id_usuario: evaluador }) => proyecto.integrantes
      .filter(({ id_usuario: evaluado }) => evaluador !== evaluado)
      .map(({ id_usuario: evaluado }) => ({ id_entrega: entrega.id_entrega, id_evaluador: evaluador, id_evaluado: evaluado })));
    if (pares.length) await tx.coevaluacion.createMany({ data: pares });
  }
};

export const crearActividad = async (data, usuario) => {
  exigirDocente(usuario);
  const proyectos = await validarProyectosDocente(data.proyectos, usuario);
  const rubrica = await prisma.rubrica.findUnique({ where: { id_rubrica: data.id_rubrica_docente }, include: { criterios: { include: { niveles: true } } } });
  if (!rubrica || rubrica.id_docente !== usuario.id_usuario || rubrica.tipo !== 'DOCENTE' || !rubrica.activa) throw errorConEstado('La rúbrica docente no es válida', 400);
  const snapshot = construirSnapshot(rubrica.criterios, data.criterios);
  if (!snapshot.some((criterio) => criterio.seleccionado)) throw errorConEstado('La selección debe contener hojas evaluables', 400);
  if (data.coevaluacion_activa) {
    const coevaluacion = await prisma.rubrica.findUnique({ where: { id_rubrica: data.id_rubrica_coevaluacion } });
    if (!coevaluacion || coevaluacion.id_docente !== usuario.id_usuario || coevaluacion.tipo !== 'COEVALUACION' || !coevaluacion.activa) throw errorConEstado('La rúbrica de coevaluación no es válida', 400);
  }
  return prisma.$transaction(async (tx) => {
    const actividad = await tx.actividadEntregable.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        fecha_limite: data.fecha_limite,
        tipo: data.tipo,
        id_docente: usuario.id_usuario,
        id_rubrica_docente: data.id_rubrica_docente,
        id_rubrica_coevaluacion: data.coevaluacion_activa ? data.id_rubrica_coevaluacion : null,
        coevaluacion_activa: data.coevaluacion_activa,
        criterios_snapshot: snapshot,
        estado: 'BORRADOR',
        proyectos: { create: proyectos.map((proyecto) => ({ id_proyecto: proyecto.id_proyecto })) }
      },
      include: { proyectos: true }
    });

    return tx.actividadEntregable.findUnique({ where: { id_actividad: actividad.id_actividad }, include: incluirActividad });
  });
};

export const publicarActividad = async (idActividad, usuario) => {
  exigirDocente(usuario);
  const actividad = await prisma.actividadEntregable.findUnique({
    where: { id_actividad: idActividad },
    include: { proyectos: { include: { proyecto: { include: { integrantes: true } } } } }
  });
  if (!actividad || actividad.id_docente !== usuario.id_usuario) throw errorConEstado('Actividad no encontrada', 404);
  if (actividad.estado !== 'BORRADOR') throw errorConEstado('La actividad ya fue publicada', 400);
  if (!actividad.proyectos.length) throw errorConEstado('La actividad debe tener al menos un proyecto asignado', 400);

  return prisma.$transaction(async (tx) => {
    const publicada = await tx.actividadEntregable.update({ where: { id_actividad: idActividad }, data: { estado: 'PUBLICADO' } });
    for (const asignacion of actividad.proyectos) {
      await generarEntrega(tx, publicada, asignacion, asignacion.proyecto);
    }
    return tx.actividadEntregable.findUnique({ where: { id_actividad: idActividad }, include: incluirActividad });
  });
};

export const listarActividades = async (usuario) => {
  const where = usuario.rol === 'docente' ? { id_docente: usuario.id_usuario } : { proyectos: { some: { proyecto: { integrantes: { some: { id_usuario: usuario.id_usuario } } } } } };
  return prisma.actividadEntregable.findMany({ where, include: incluirActividad, orderBy: { fecha_limite: 'asc' } });
};

export const obtenerActividad = async (idActividad, usuario) => {
  const actividad = await prisma.actividadEntregable.findUnique({ where: { id_actividad: idActividad }, include: incluirActividad });
  if (!actividad) throw errorConEstado('Actividad no encontrada', 404);
  if (usuario.rol === 'docente' && actividad.id_docente === usuario.id_usuario) return actividad;
  if (actividad.proyectos.some(({ proyecto }) => proyecto.id_docente === usuario.id_usuario)) return actividad;
  const asignada = actividad.proyectos.some(({ proyecto }) => proyecto.integrantes?.some(({ id_usuario }) => id_usuario === usuario.id_usuario));
  if (!asignada) throw errorConEstado('No tiene permisos para consultar esta actividad', 403);
  return actividad;
};

export const asignarProyectos = async (idActividad, idsProyecto, usuario) => {
  exigirDocente(usuario);
  const actividad = await prisma.actividadEntregable.findUnique({ where: { id_actividad: idActividad } });
  if (!actividad || actividad.id_docente !== usuario.id_usuario) throw errorConEstado('Actividad no encontrada', 404);
  if (actividad.estado !== 'BORRADOR') throw errorConEstado('La actividad publicada no puede recibir nuevas asignaciones', 400);
  const proyectos = await validarProyectosDocente(idsProyecto, usuario);
  return prisma.$transaction(async (tx) => {
    for (const proyecto of proyectos) {
      const asignacion = await tx.actividadProyecto.create({ data: { id_actividad: idActividad, id_proyecto: proyecto.id_proyecto } });
      await generarEntrega(tx, actividad, asignacion, proyecto);
    }
    return tx.actividadEntregable.findUnique({ where: { id_actividad: idActividad }, include: incluirActividad });
  });
};
