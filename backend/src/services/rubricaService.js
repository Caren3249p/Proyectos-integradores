import { PrismaClient } from '@prisma/client';
import { errorConEstado } from './proyectoService.js';
import { validarJerarquiaRubrica } from '../utils/validators.js';

const prisma = new PrismaClient();
const exigirDocente = (usuario) => {
  if (usuario?.rol !== 'docente') throw errorConEstado('Solo los docentes pueden gestionar rúbricas', 403);
};

const incluir = {
  criterios: {
    include: { niveles: { orderBy: { nivel: 'asc' } } },
    orderBy: { orden: 'asc' }
  },
  docente: {
    select: { id_usuario: true, nombre: true, correo: true }
  }
};

const inferirTipo = (criterio, idPadre, tieneHijos) => {
  if (criterio.tipo) return criterio.tipo;
  if (!idPadre && tieneHijos) return 'CORTE_ACADEMICO';
  if (tieneHijos) return 'ACTIVIDAD';
  return 'CRITERIO_EVALUABLE';
};

export const transformarPlanoAArbol = (criterios = []) => {
  const nodos = (Array.isArray(criterios) ? criterios : []).map((criterio, index) => ({
    ...criterio,
    id: criterio.id_criterio ?? criterio.id ?? index,
    nombre: criterio.nombre,
    descripcion: criterio.descripcion ?? '',
    peso: Number(criterio.peso ?? criterio.ponderacion ?? 0),
    tipo: criterio.tipo || 'CRITERIO_EVALUABLE',
    esHoja: criterio.es_hoja ?? criterio.esHoja ?? true,
    es_hoja: criterio.es_hoja ?? criterio.esHoja ?? true,
    parentId: criterio.id_padre ?? criterio.parentId ?? null,
    id_padre: criterio.id_padre ?? criterio.parentId ?? null,
    orden: criterio.orden ?? index,
    niveles: Array.isArray(criterio.niveles) ? criterio.niveles : [],
    hijos: []
  }));

  const mapa = new Map(nodos.map((nodo) => [String(nodo.id), nodo]));
  const raices = [];

  for (const nodo of nodos) {
    if (nodo.parentId === null || nodo.parentId === undefined) {
      raices.push(nodo);
      continue;
    }
    const padre = mapa.get(String(nodo.parentId));
    if (padre) {
      padre.hijos.push(nodo);
      padre.esHoja = false;
      padre.es_hoja = false;
    } else {
      raices.push(nodo);
    }
  }

  return raices;
};

const persistirNodos = async (tx, nodos, idRubrica, idPadre = null) => {
  for (let i = 0; i < nodos.length; i++) {
    const criterio = nodos[i];
    const hijos = Array.isArray(criterio.hijos) ? criterio.hijos : [];
    const tieneHijos = hijos.length > 0;
    const esHoja = tieneHijos ? false : Boolean(criterio.esHoja ?? criterio.es_hoja ?? true);
    const peso = Number(criterio.peso ?? criterio.ponderacion ?? 0);
    const niveles = esHoja && Array.isArray(criterio.niveles) ? criterio.niveles : [];

    const creado = await tx.criterioRubrica.create({
      data: {
        id_rubrica: idRubrica,
        id_padre: idPadre,
        nombre: criterio.nombre,
        descripcion: criterio.descripcion || '',
        peso,
        tipo: inferirTipo(criterio, idPadre, tieneHijos),
        es_hoja: esHoja,
        orden: criterio.orden ?? i,
        ...(niveles.length
          ? {
              niveles: {
                create: niveles.map((nivel) => ({
                  nivel: Number(nivel.nivel),
                  puntos: Number(nivel.puntos ?? nivel.nivel ?? 0),
                  descripcion: nivel.descripcion || ''
                }))
              }
            }
          : {})
      }
    });

    if (tieneHijos) {
      await persistirNodos(tx, hijos, idRubrica, creado.id_criterio);
    }
  }
};

const hidratarRubrica = (rubrica) => {
  if (!rubrica) return rubrica;
  return {
    ...rubrica,
    criterios: transformarPlanoAArbol(rubrica.criterios)
  };
};

export const crearRubrica = async (data, usuario) => {
  exigirDocente(usuario);
  const validacion = validarJerarquiaRubrica(data.criterios || []);
  if (!validacion.esValido) {
    throw errorConEstado(`Rúbrica inválida: ${validacion.errores.join(' | ')}`, 400);
  }

  const rubrica = await prisma.$transaction(async (tx) => {
    const creada = await tx.rubrica.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        id_docente: usuario.id_usuario
      }
    });
    await persistirNodos(tx, data.criterios, creada.id_rubrica);
    return tx.rubrica.findUnique({ where: { id_rubrica: creada.id_rubrica }, include: incluir });
  });

  return hidratarRubrica(rubrica);
};

export const obtenerRubrica = async (id) => {
  const rubrica = await prisma.rubrica.findUnique({ where: { id_rubrica: id }, include: incluir });
  if (!rubrica) throw errorConEstado('Rúbrica no encontrada', 404);
  return hidratarRubrica(rubrica);
};

export const listarRubricas = (usuario) => prisma.rubrica.findMany({
  where: usuario.rol === 'docente' ? { id_docente: usuario.id_usuario } : { activa: true },
  include: incluir,
  orderBy: { fecha_creacion: 'desc' }
}).then((rubricas) => rubricas.map(hidratarRubrica));

const exigirEditable = async (id, usuario) => {
  exigirDocente(usuario);
  const rubrica = await prisma.rubrica.findUnique({ where: { id_rubrica: id }, include: { evaluaciones: true } });
  if (!rubrica) throw errorConEstado('Rúbrica no encontrada', 404);
  if (rubrica.id_docente !== usuario.id_usuario) throw errorConEstado('No tiene permisos para modificar esta rúbrica', 403);
  if (rubrica.evaluaciones.length) throw errorConEstado('La rúbrica no puede modificarse porque ya fue usada en una evaluación');
  return rubrica;
};

export const actualizarRubrica = async (id, data, usuario) => {
  await exigirEditable(id, usuario);
  const validacion = validarJerarquiaRubrica(data.criterios || []);
  if (!validacion.esValido) {
    throw errorConEstado(`Rúbrica inválida: ${validacion.errores.join(' | ')}`, 400);
  }

  const rubrica = await prisma.$transaction(async (tx) => {
    await tx.criterioRubrica.deleteMany({ where: { id_rubrica: id } });
    await tx.rubrica.update({
      where: { id_rubrica: id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion
      }
    });
    await persistirNodos(tx, data.criterios, id);
    return tx.rubrica.findUnique({ where: { id_rubrica: id }, include: incluir });
  });

  return hidratarRubrica(rubrica);
};

export const desactivarRubrica = async (id, usuario) => {
  await exigirEditable(id, usuario);
  return prisma.rubrica.update({ where: { id_rubrica: id }, data: { activa: false }, include: incluir }).then(hidratarRubrica);
};
