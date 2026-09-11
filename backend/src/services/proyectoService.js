import { PrismaClient } from '@prisma/client';
import { crearProyectoPlane } from './planeService.js';
import { decryptSecret } from '../utils/encryption.js';
import { createRepository, getOrganizations, getRepositories, getRepository, mapGithubError } from './githubService.js';

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
    docente: { select: { id_usuario: true, nombre: true, correo: true } },
    integrantes: { include: { usuario: { select: { id_usuario: true, nombre: true, correo: true, rol: true } } } },
    versiones: { include: { archivos: true }, orderBy: { fecha_creacion: 'asc' } },
    evaluaciones: {
      orderBy: { fecha: 'desc' },
      take: 1,
      include: { docente: { select: { id_usuario: true, nombre: true, correo: true } }, calificaciones: { include: { criterio: true } } }
    },
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

const exigirPuedeAdministrarIntegrantes = (proyecto, usuario) => {
  if (usuario?.rol !== 'admin' && proyecto.id_creador !== idUsuario(usuario)) {
    throw errorConEstado('Solo el dueño del proyecto puede administrar sus integrantes', 403);
  }
};

// Genera un identificador de Plane válido: máx 5 chars, solo mayúsculas y números
const generarIdentifier = (titulo) => {
  const clean = titulo.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  const rand = Math.floor(10 + Math.random() * 90);
  return (clean || 'PRY') + rand;
};

export const crearProyecto = async (data, usuario) => {
  const correosIntegrantes = [...new Set((data.integrantes || []).map((correo) => correo.trim().toLowerCase()))];
  const integrantesCorreo = correosIntegrantes.filter((correo) => correo !== usuario.correo.toLowerCase());

  // 1. Crear en base de datos
  const usuariosDb = await prisma.usuario.findMany({
    where: { correo: { in: integrantesCorreo } },
    select: { id_usuario: true, correo: true }
  });
  if (usuariosDb.length !== integrantesCorreo.length) {
    const encontrados = new Set(usuariosDb.map((item) => item.correo.toLowerCase()));
    const noEncontrados = integrantesCorreo.filter((correo) => !encontrados.has(correo));
    throw errorConEstado(`No existen usuarios registrados con estos correos: ${noEncontrados.join(', ')}`, 404);
  }
  const integrantes = [idUsuario(usuario), ...usuariosDb.map((item) => item.id_usuario)];

  const proyecto = await prisma.proyecto.create({
    data: {
      titulo: data.titulo,
      descripcion: data.descripcion,
      id_creador: idUsuario(usuario),
      integrantes: { create: integrantes.map((id) => ({ id_usuario: id })) },
      versiones: { create: { numero: 'v1.0' } }
    },
    include: {
      integrantes: {
        include: { usuario: { select: { id_usuario: true, nombre: true, correo: true, rol: true } } }
      },
      versiones: true
    }
  });

  // 2. Sincronizar con Plane (no bloquea si falla)
  try {
    const identifier = generarIdentifier(data.titulo);
    const planeProy = await crearProyectoPlane(data.titulo, data.descripcion || '', identifier);
    if (planeProy?.id) {
      await prisma.proyecto.update({
        where: { id_proyecto: proyecto.id_proyecto },
        data: { id_plane_proyecto: planeProy.id }
      });
      proyecto.id_plane_proyecto = planeProy.id;
    }
  } catch (planeErr) {
    // Plane falla silenciosamente — el proyecto existe en DB aunque no tenga Plane aún
    console.warn('[Plane] No se pudo crear el proyecto en Plane:', planeErr.message);
  }

  return proyecto;
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

export const agregarIntegrante = async (id, correo, usuario) => {
  const proyecto = await exigirProyecto(id);
  exigirPuedeAdministrarIntegrantes(proyecto, usuario);
  if (proyecto.estado === 'publicado') throw errorConEstado('No se puede modificar un proyecto publicado');
  const integrante = await prisma.usuario.findUnique({ where: { correo: correo.trim().toLowerCase() }, select: { id_usuario: true, nombre: true, correo: true, rol: true } });
  if (!integrante) throw errorConEstado('El usuario no existe', 404);
  const duplicado = proyecto.integrantes.some((item) => item.id_usuario === integrante.id_usuario);
  if (duplicado) throw errorConEstado('El usuario ya es integrante del proyecto');
  return prisma.integranteProyecto.create({
    data: { id_proyecto: id, id_usuario: integrante.id_usuario },
    include: { usuario: { select: { id_usuario: true, nombre: true, correo: true, rol: true } } }
  });
};

export const quitarIntegrante = async (id, usuarioId, usuario) => {
  const proyecto = await exigirProyecto(id);
  exigirPuedeAdministrarIntegrantes(proyecto, usuario);
  if (usuarioId === proyecto.id_creador) throw errorConEstado('No se puede eliminar al dueño del proyecto');
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

const exigirTokenGithub = async (usuario) => {
  const cuenta = await prisma.usuario.findUnique({ where: { id_usuario: idUsuario(usuario) }, select: { github_access_token_encrypted: true } });
  if (!cuenta?.github_access_token_encrypted) throw errorConEstado('Conecta tu cuenta de GitHub antes de continuar', 412);
  try { return decryptSecret(cuenta.github_access_token_encrypted); } catch { throw errorConEstado('La conexión con GitHub no está disponible. Vuelve a conectarla', 401); }
};

const datosRepositorioGithub = (repository, origen) => ({
  url: repository.html_url,
  es_privado: Boolean(repository.private),
  github_repo_id: String(repository.id),
  github_owner: repository.owner?.login || null,
  github_name: repository.name,
  origen
});

export const listarRepositoriosGithub = async (usuario) => {
  try { return await getRepositories(await exigirTokenGithub(usuario)); } catch (error) { throw mapGithubError(error); }
};

export const listarOrganizacionesGithub = async (usuario) => {
  try { return await getOrganizations(await exigirTokenGithub(usuario)); } catch (error) { throw mapGithubError(error); }
};

export const enlazarRepositorioGithub = async (id, data, usuario) => {
  const proyecto = await exigirProyecto(id);
  exigirPuedeModificar(proyecto, usuario);
  if (proyecto.repositorio) throw errorConEstado('Este proyecto ya tiene un repositorio enlazado', 409);
  const token = await exigirTokenGithub(usuario);
  try {
    const repository = await getRepository(token, data.owner, data.repo);
    const existente = await prisma.repositorio.findFirst({ where: { github_repo_id: String(repository.id) } });
    if (existente) throw errorConEstado('Este repositorio ya está enlazado a otro proyecto', 409);
    return prisma.repositorio.create({ data: { id_proyecto: id, ...datosRepositorioGithub(repository, 'github_existente') } });
  } catch (error) { throw error.status ? error : mapGithubError(error); }
};

export const crearRepositorioGithub = async (id, data, usuario) => {
  const proyecto = await exigirProyecto(id);
  exigirPuedeModificar(proyecto, usuario);
  if (proyecto.repositorio) throw errorConEstado('Este proyecto ya tiene un repositorio enlazado', 409);
  try {
    const repository = await createRepository(await exigirTokenGithub(usuario), { ...data, description: data.description || proyecto.descripcion || '' });
    return prisma.repositorio.create({ data: { id_proyecto: id, ...datosRepositorioGithub(repository, 'github_creado') } });
  } catch (error) { throw mapGithubError(error); }
};

// --- Funciones de asignación de docente asesor ---

// Lista todos los proyectos que aún no tienen docente asignado
export const listarProyectosSinDocente = async () => {
  return prisma.proyecto.findMany({
    where: { id_docente: null },
    include: {
      creador: { select: { id_usuario: true, nombre: true, correo: true } },
      integrantes: { include: { usuario: { select: { id_usuario: true, nombre: true, correo: true } } } },
      campos_tecnicos: true
    },
    orderBy: { id_proyecto: 'desc' }
  });
};

// Docente se asigna como asesor de un proyecto sin asesor
export const asignarDocente = async (id_proyecto, usuario) => {
  if (usuario.rol !== 'docente') {
    throw errorConEstado('Solo los docentes pueden asignarse como asesores', 403);
  }
  const proyecto = await exigirProyecto(id_proyecto);
  if (proyecto.id_docente) {
    throw errorConEstado('Este proyecto ya tiene un docente asesor asignado');
  }
  return prisma.proyecto.update({
    where: { id_proyecto },
    data: {
      id_docente: usuario.id_usuario,
      estado: proyecto.estado === 'borrador' ? 'activo' : proyecto.estado
    },
    include: {
      creador: { select: { id_usuario: true, nombre: true, correo: true } },
      docente: { select: { id_usuario: true, nombre: true, correo: true } }
    }
  });
};

// Docente se desasigna del proyecto (solo puede hacerlo el propio docente)
export const desasignarDocente = async (id_proyecto, usuario) => {
  if (usuario.rol !== 'docente') {
    throw errorConEstado('Solo los docentes pueden desasignarse', 403);
  }
  const proyecto = await exigirProyecto(id_proyecto);
  if (proyecto.id_docente !== usuario.id_usuario) {
    throw errorConEstado('No eres el docente asesor asignado a este proyecto', 403);
  }
  return prisma.proyecto.update({
    where: { id_proyecto },
    data: { id_docente: null }
  });
};

export { errorConEstado, exigirProyecto, exigirPuedeModificar, esIntegrante };

export const listarMisProyectos = async (usuario) => {
  const includes = {
    creador: { select: { id_usuario: true, nombre: true, correo: true, rol: true } },
    docente: { select: { id_usuario: true, nombre: true, correo: true } },
    integrantes: { include: { usuario: { select: { id_usuario: true, nombre: true, correo: true, rol: true } } } },
    versiones: { include: { archivos: true }, orderBy: { fecha_creacion: 'asc' } },
    evaluaciones: {
      orderBy: { fecha: 'desc' },
      take: 1,
      include: { docente: { select: { id_usuario: true, nombre: true, correo: true } }, calificaciones: { include: { criterio: true } } }
    },
    campos_tecnicos: true,
    repositorio: true
  };

  if (usuario.rol === 'admin') {
    return prisma.proyecto.findMany({ include: includes });
  }

  if (usuario.rol === 'docente') {
    return prisma.proyecto.findMany({
      where: { id_docente: usuario.id_usuario },
      include: includes
    });
  }

  // Estudiante
  return prisma.proyecto.findMany({
    where: {
      OR: [
        { id_creador: usuario.id_usuario },
        { integrantes: { some: { id_usuario: usuario.id_usuario } } }
      ]
    },
    include: includes
  });
};
