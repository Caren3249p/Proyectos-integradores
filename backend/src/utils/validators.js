import { z } from 'zod';

const correoRegex = /^[a-zA-Z0-9._%+-]+@upb\.edu\.co$/;
const contraseñaRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

// El registro público siempre produce rol=estudiante.
// Las cuentas docente solo se crean desde la consola/admin, nunca desde la API pública.
export const registerSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  correo: z.string().regex(correoRegex, 'El correo debe ser institucional (@upb.edu.co)'),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
}).transform((data) => ({ ...data, rol: 'estudiante' }));

// Esquema para creación de usuarios por parte de un Administrador
export const crearUsuarioAdminSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  correo: z.string().regex(correoRegex, 'El correo debe ser institucional (@upb.edu.co)'),
  contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: z.enum(['estudiante', 'docente', 'admin'], { errorMap: () => ({ message: 'Rol inválido' }) })
});

export const loginSchema = z.object({
  correo: z.string().regex(correoRegex, 'El correo debe ser institucional (@upb.edu.co)'),
  contraseña: z.string().min(1, 'La contraseña es obligatoria')
});

const idSchema = z.coerce.number().int().positive('El identificador debe ser válido');

export const crearProyectoSchema = z.object({
  titulo: z.string().trim().min(1, 'El título es obligatorio').max(150, 'El título no puede superar 150 caracteres'),
  descripcion: z.string().trim().optional(),
  integrantes: z.array(z.string().trim().email('El correo del integrante no es válido').regex(correoRegex, 'El correo debe ser institucional (@upb.edu.co)')).optional()
});

export const actualizarProyectoSchema = z.object({
  titulo: z.string().trim().min(1, 'El título es obligatorio').max(150).optional(),
  descripcion: z.string().trim().nullable().optional(),
  estado: z.enum(['borrador', 'en_revision', 'publicado'], { errorMap: () => ({ message: 'El estado del proyecto no es válido' }) }).optional()
}).refine((data) => Object.keys(data).length > 0, 'Debe enviar al menos un campo para actualizar');

export const integranteSchema = z.object({
  correo: z.string().trim().email('El correo del integrante no es válido').regex(correoRegex, 'El correo debe ser institucional (@upb.edu.co)')
});

export const camposTecnicosSchema = z.object({
  lenguaje_principal: z.string().trim().optional(),
  frameworks: z.string().trim().optional(),
  base_datos: z.string().trim().optional(),
  es_movil: z.boolean().optional(),
  entorno_despliegue: z.string().trim().optional()
}).superRefine((data, context) => {
  if (data.es_movil === true && !data.entorno_despliegue) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['entorno_despliegue'], message: 'El entorno de despliegue es obligatorio para proyectos móviles' });
  }
});

export const repositorioSchema = z.object({
  url: z.string().url('La URL del repositorio no es válida').regex(/^https:\/\/(www\.)?(github|gitlab)\.com\/[\w.-]+\/[\w.-]+(?:\/.*)?$/i, 'El repositorio debe pertenecer a GitHub o GitLab'),
  es_privado: z.boolean().optional().default(false)
});

export const githubRepositorySelectionSchema = z.object({
  owner: z.string().trim().min(1).max(100),
  repo: z.string().trim().min(1).max(150)
});

export const githubRepositoryCreateSchema = z.object({
  name: z.string().trim().regex(/^[A-Za-z0-9._-]+$/, 'El nombre del repositorio contiene caracteres no válidos').max(100),
  description: z.string().trim().max(350).optional(),
  private: z.boolean().default(false),
  organization: z.string().trim().max(100).nullable().optional(),
  auto_init: z.boolean().default(false)
});

const nivelDesempenoInputSchema = z.object({
  nivel: z.coerce.number().int().min(0, 'El nivel mínimo es 0').max(5, 'El nivel máximo es 5'),
  puntos: z.coerce.number().min(0, 'Los puntos no pueden ser negativos').max(100, 'Los puntos no pueden superar 100'),
  descripcion: z.string().trim().optional().default('')
});

const criterioNodoSchema = z.lazy(() => z.object({
  nombre: z.string().trim().min(1, 'El nombre del criterio es obligatorio'),
  descripcion: z.string().trim().optional().default(''),
  peso: z.coerce.number().min(0, 'El peso no puede ser negativo').max(100, 'El peso no puede superar 100').optional(),
  ponderacion: z.coerce.number().min(0).max(100).optional(),
  tipo: z.enum(['CORTE_ACADEMICO', 'ACTIVIDAD', 'CRITERIO_EVALUABLE']).optional(),
  esHoja: z.boolean().optional(),
  es_hoja: z.boolean().optional(),
  id_padre: z.coerce.number().int().positive().nullable().optional(),
  parentId: z.union([z.string(), z.number()]).nullable().optional(),
  orden: z.coerce.number().int().nonnegative().optional(),
  niveles: z.array(nivelDesempenoInputSchema).optional().default([]),
  hijos: z.array(criterioNodoSchema).optional().default([])
}));

const TOLERANCIA_PONDERACION = 0.01;

const aplanarNodosRubrica = (nodos = [], parentId = null, acc = []) => {
  (Array.isArray(nodos) ? nodos : []).forEach((item, idx) => {
    const hijos = Array.isArray(item.hijos) ? item.hijos : [];
    const id = String(item.id_criterio ?? item.id ?? `${parentId ?? 'raiz'}-${idx}`);
    const peso = Number(item.peso ?? item.ponderacion ?? 0);
    const esHoja = item.es_hoja ?? item.esHoja ?? hijos.length === 0;
    acc.push({
      id,
      nombre: item.nombre || `Nodo ${id}`,
      peso,
      parentId: item.id_padre ?? item.parentId ?? parentId,
      esHoja: Boolean(esHoja),
      tipo: item.tipo || 'CRITERIO_EVALUABLE',
      niveles: Array.isArray(item.niveles) ? item.niveles : []
    });
    if (hijos.length) aplanarNodosRubrica(hijos, id, acc);
  });
  return acc;
};

export const validarJerarquiaRubrica = (nodos = []) => {
  const errores = [];
  if (!Array.isArray(nodos) || nodos.length === 0) {
    return { esValido: false, errores: ['La rúbrica debe contener al menos un criterio'], arbol: [] };
  }

  const lista = aplanarNodosRubrica(nodos);
  const ids = new Set(lista.map((nodo) => String(nodo.id)));

  lista.forEach((nodo) => {
    if (nodo.parentId !== null && nodo.parentId !== undefined && !ids.has(String(nodo.parentId))) {
      errores.push(`El nodo "${nodo.nombre}" referencia un padre inexistente (${nodo.parentId}).`);
    }
  });

  const porPadre = new Map();
  lista.forEach((nodo) => {
    const key = nodo.parentId === null || nodo.parentId === undefined ? 'raiz' : String(nodo.parentId);
    if (!porPadre.has(key)) porPadre.set(key, []);
    porPadre.get(key).push(nodo);
  });

  const validarHermanos = (hermanos, etiqueta) => {
    if (!hermanos.length) return;
    const suma = hermanos.reduce((total, nodo) => total + Number(nodo.peso ?? 0), 0);
    if (Math.abs(suma - 100) > TOLERANCIA_PONDERACION) {
      errores.push(`${etiqueta} deben sumar exactamente 100%. Actual: ${suma.toFixed(2)}%.`);
    }
  };

  validarHermanos(porPadre.get('raiz') || [], 'Los nodos raíz');

  lista.forEach((nodo) => {
    const hijos = porPadre.get(String(nodo.id)) || [];
    if (hijos.length > 0) {
      if (nodo.esHoja) {
        errores.push(`"${nodo.nombre}": un nodo no puede ser hoja si tiene hijos.`);
      }
      validarHermanos(hijos, `Los hijos de "${nodo.nombre}"`);
    } else if (nodo.esHoja === false) {
      errores.push(`"${nodo.nombre}" está marcado como nodo intermedio pero no tiene hijos.`);
    }
  });

  return {
    esValido: errores.length === 0,
    errores,
    arbol: nodos
  };
};

export const validarEstructuraArbol = validarJerarquiaRubrica;

export const obtenerHojasEvaluables = (criterios = []) => {
  const hojas = [];
  const walk = (nodos) => {
    (Array.isArray(nodos) ? nodos : []).forEach((nodo) => {
      const hijos = nodo.hijos || [];
      const esHoja = nodo.es_hoja ?? nodo.esHoja ?? hijos.length === 0;
      if (esHoja || hijos.length === 0) {
        hojas.push({
          id: nodo.id_criterio ?? nodo.id,
          nombre: nodo.nombre,
          peso: Number(nodo.peso ?? nodo.ponderacion ?? 0),
          niveles: Array.isArray(nodo.niveles) ? nodo.niveles : []
        });
      } else {
        walk(hijos);
      }
    });
  };
  walk(criterios);
  return hojas;
};

export const rubricaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre de la rúbrica es obligatorio'),
  descripcion: z.string().trim().optional(),
  tipo: z.enum(['DOCENTE', 'COEVALUACION']).optional().default('DOCENTE'),
  criterios: z.array(criterioNodoSchema).min(1, 'Debe incluir al menos un criterio')
}).superRefine((data, context) => {
  const resultado = validarJerarquiaRubrica(data.criterios);
  if (!resultado.esValido) {
    resultado.errores.forEach((message) => {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['criterios'], message });
    });
  }
  const hojas = obtenerHojasEvaluables(data.criterios);
  if (data.tipo === 'COEVALUACION') {
    if (hojas.length !== 5 || hojas.some((hoja) => Number(hoja.peso) !== 20)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['criterios'], message: 'La rúbrica de coevaluación debe tener cinco criterios con peso de 20%' });
    }
    hojas.forEach((hoja) => {
      const niveles = hoja.niveles.map((nivel) => Number(nivel.puntos));
      if (niveles.length !== 6 || ![0, 20, 40, 60, 80, 100].every((valor) => niveles.includes(valor))) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['criterios'], message: 'Cada criterio de coevaluación debe tener niveles 0, 20, 40, 60, 80 y 100' });
      }
    });
  } else if (hojas.some((hoja) => hoja.niveles.some((nivel) => Number(nivel.puntos) > 5))) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['criterios'], message: 'Las rúbricas docentes usan una escala máxima de 5' });
  }
});

const calificacionItemSchema = z.object({
  id_criterio: idSchema,
  nota: z.coerce.number().min(0, 'La calificación no puede ser menor que 0').max(5, 'La calificación máxima es 5.0').optional(),
  nivel: z.coerce.number().int().min(0).max(5).optional()
}).refine((item) => item.nota !== undefined || item.nivel !== undefined, {
  message: 'Debe enviar la nota o el nivel de desempeño del criterio hoja'
});

export const evaluacionSchema = z.object({
  id_rubrica: idSchema,
  id_entrega: idSchema.optional(),
  calificaciones: z.array(calificacionItemSchema).min(1, 'Debe calificar al menos un criterio hoja'),
  retroalimentacion: z.string().trim().min(20, 'La retroalimentación debe tener al menos 20 caracteres')
});

const entregableBaseSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre del entregable es obligatorio').max(150),
  descripcion: z.string().trim().min(1, 'La descripción del entregable es obligatoria'),
  fecha_limite: z.coerce.date(),
  tipo: z.enum(['INDIVIDUAL', 'GRUPAL']),
  id_rubrica_docente: idSchema,
  id_rubrica_coevaluacion: idSchema.nullable().optional(),
  coevaluacion_activa: z.boolean().optional().default(false)
});

export const entregableSchema = entregableBaseSchema.superRefine((data, context) => {
  if (data.coevaluacion_activa && data.tipo !== 'GRUPAL') {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['coevaluacion_activa'], message: 'La coevaluación solo aplica a entregables grupales' });
  }
  if (data.coevaluacion_activa && !data.id_rubrica_coevaluacion) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['id_rubrica_coevaluacion'], message: 'Debe seleccionar una rúbrica de coevaluación' });
  }
});

export const actualizarEntregableSchema = entregableBaseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  'Debe enviar al menos un campo para actualizar'
);

const escalaCoevaluacion = z.union([
  z.literal(0), z.literal(20), z.literal(40), z.literal(60), z.literal(80), z.literal(100)
]);

export const coevaluacionSchema = z.object({
  calificaciones: z.array(z.object({
    id_criterio: idSchema,
    calificacion_base: z.coerce.number().pipe(escalaCoevaluacion)
  })).length(5, 'Debe calificar los cinco criterios de coevaluación'),
  observacion: z.string().trim().max(2000).optional().default('')
});

export const actividadEntregableSchema = z.object({
  nombre: z.string().trim().min(1).max(150),
  descripcion: z.string().trim().min(1),
  fecha_limite: z.coerce.date(),
  tipo: z.enum(['INDIVIDUAL', 'GRUPAL']),
  id_rubrica_docente: idSchema,
  id_rubrica_coevaluacion: idSchema.nullable().optional(),
  coevaluacion_activa: z.boolean().default(false),
  criterios: z.array(idSchema).min(1, 'Seleccione al menos un nodo de la rúbrica'),
  proyectos: z.array(idSchema).min(1, 'Seleccione al menos un proyecto')
}).superRefine((data, context) => {
  if (data.tipo !== 'GRUPAL' && data.coevaluacion_activa) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['coevaluacion_activa'], message: 'La coevaluación solo aplica a actividades grupales' });
  }
  if (data.coevaluacion_activa && !data.id_rubrica_coevaluacion) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['id_rubrica_coevaluacion'], message: 'Seleccione la rúbrica de coevaluación' });
  }
});

export const evaluacionEntregaSchema = z.object({
  calificaciones: z.array(calificacionItemSchema).min(1),
  retroalimentacion: z.string().trim().min(20)
});
