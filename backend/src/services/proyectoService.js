import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const errorConEstado = (mensaje, estado = 400) => {
  const error = new Error(mensaje);
  error.status = estado;
  return error;
};

const idUsuario = (usuario) => usuario?.id_usuario;

const obtenerProyecto = (id) => prisma.proyecto.findUnique({
  where: { id_proyecto: id },
  include: {
    creador: { select: { id_usuario: true, nombre: true, correo: true, rol: true } },
    integrantes: { include: { usuario: { select: { id_usuario: true, nombre: true, correo: true, rol: true } } } },
    versiones: { include: { archivos: true }, orderBy: { fecha_creacion: 'asc' } },
    campos_tecnicos: true,
    repositorio: true
  }
});

const exigirProyecto = async (id) => {
  const proyecto = await obtenerProyecto(id);
  if (!proyecto) throw errorConEstado('Proyecto no encontrado', 404);
  return proyecto;
};

const esIntegrante = (proyecto, usuario) => proyecto.integrantes.some((integrante) => integrante.id_usuario === idUsuario(usuario));

const exigirPuedeModificar = (proyecto, usuario) => {
  if (usuario?.rol === 'docente' || (!esIntegrante(proyecto, usuario) && proyecto.id_creador !== idUsuario(usuario))) {
    throw errorConEstado('No tiene permisos para modificar este proyecto', 403);
  }
};

export const crearProyecto = async (data, usuario) => {
  const integrantes = [...new Set([idUsuario(usuario), ...(data.integrantes || [])])];
  if (!integrantes.length) throw errorConEstado('El proyecto debe tener al menos un integrante');

  return prisma.$transaction(async (tx) => {
    const usuarios = await tx.usuario.findMany({ where: { id_usuario: { in: integrantes } }, select: { id_usuario: true } });
    if (usuarios.length !== integrantes.length) throw errorConEstado('Uno o más integrantes no existen', 404);
    return tx.proyecto.create({
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        id_creador: idUsuario(usuario),
        integrantes: { create: integrantes.map((id) => ({ id_usuario: id })) },
        versiones: { create: { numero: 'v1.0' } }
      },
      include: { integrantes: true, versiones: true }
    });
  });
};

export const obtenerDetalleProyecto = (id) => exigirProyecto(id);

export const actualizarProyecto = async (id, data, usuario) => {
  const proyecto = await exigirProyecto(id);
  exigirPuedeModificar(proyecto, usuario);
  if (proyecto.estado === 'publicado') throw errorConEstado('No se puede editar un proyecto publicado');
  return prisma.proyecto.update({ where: { id_proyecto: id }, data, include: { integrantes: true, versiones: true, campos_tecnicos: true, repositorio: true } });
};

export const eliminarProyecto = async (id, usuario) => {
  const proyecto = await exigirProyecto(id);
  exigirPuedeModificar(proyecto, usuario);
  if (proyecto.estado !== 'borrador') throw errorConEstado('Solo se pueden eliminar proyectos en estado borrador');
  await prisma.proyecto.delete({ where: { id_proyecto: id } });
};

export const agregarIntegrante = async (id, nuevoId, usuario) => {
  const proyecto = await exigirProyecto(id);
  exigirPuedeModificar(proyecto, usuario);
  if (proyecto.estado === 'publicado') throw errorConEstado('No se puede modificar un proyecto publicado');
  const integrante = await prisma.usuario.findUnique({ where: { id_usuario: nuevoId }, select: { id_usuario: true, nombre: true, correo: true, rol: true } });
  if (!integrante) throw errorConEstado('El usuario no existe', 404);
  const duplicado = proyecto.integrantes.some((item) => item.id_usuario === nuevoId);
  if (duplicado) throw errorConEstado('El usuario ya es integrante del proyecto');
  return prisma.integranteProyecto.create({ data: { id_proyecto: id, id_usuario: nuevoId }, include: { usuario: true } });
};

export const quitarIntegrante = async (id, usuarioId, usuario) => {
  const proyecto = await exigirProyecto(id);
  exigirPuedeModificar(proyecto, usuario);
  if (proyecto.integrantes.length <= 1) throw errorConEstado('El proyecto debe conservar al menos un integrante');
  await prisma.integranteProyecto.delete({ where: { id_proyecto_id_usuario: { id_proyecto: id, id_usuario: usuarioId } } });
};

export const guardarCamposTecnicos = async (id, data, usuario) => {
  const proyecto = await exigirProyecto(id);
  exigirPuedeModificar(proyecto, usuario);
  if (proyecto.estado === 'publicado') throw errorConEstado('No se puede editar un proyecto publicado');
  return prisma.campoTecnico.upsert({ where: { id_proyecto: id }, create: { id_proyecto: id, ...data }, update: data });
};

export const enlazarRepositorio = async (id, data, usuario) => {
  const proyecto = await exigirProyecto(id);
  exigirPuedeModificar(proyecto, usuario);
  if (proyecto.estado === 'publicado') throw errorConEstado('No se puede editar un proyecto publicado');
  const repositorio = await prisma.repositorio.upsert({ where: { id_proyecto: id }, create: { id_proyecto: id, ...data }, update: data });
  return { repositorio, advertencia: data.es_privado ? 'El repositorio es privado y puede no estar disponible para todos los evaluadores' : null };
};

export const desenlazarRepositorio = async (id, usuario) => {
  const proyecto = await exigirProyecto(id);
  exigirPuedeModificar(proyecto, usuario);
  await prisma.repositorio.deleteMany({ where: { id_proyecto: id } });
};

export { errorConEstado, exigirProyecto, exigirPuedeModificar, esIntegrante };
