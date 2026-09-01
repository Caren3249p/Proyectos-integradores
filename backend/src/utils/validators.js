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
  integrantes: z.array(idSchema).min(1, 'El proyecto debe tener al menos un integrante').optional()
});

export const actualizarProyectoSchema = z.object({
  titulo: z.string().trim().min(1, 'El título es obligatorio').max(150).optional(),
  descripcion: z.string().trim().nullable().optional(),
  estado: z.enum(['borrador', 'en_revision', 'publicado'], { errorMap: () => ({ message: 'El estado del proyecto no es válido' }) }).optional()
}).refine((data) => Object.keys(data).length > 0, 'Debe enviar al menos un campo para actualizar');

export const integranteSchema = z.object({ id_usuario: idSchema });

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

const criterioSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre del criterio es obligatorio'),
  descripcion: z.string().trim().min(1, 'La descripción del criterio es obligatoria'),
  peso: z.coerce.number().min(0, 'El peso no puede ser negativo').max(100, 'El peso no puede superar 100')
});

export const rubricaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre de la rúbrica es obligatorio'),
  descripcion: z.string().trim().optional(),
  criterios: z.array(criterioSchema).min(1, 'Debe incluir al menos un criterio')
}).superRefine((data, context) => {
  const total = data.criterios.reduce((sum, criterio) => sum + criterio.peso, 0);
  if (Math.abs(total - 100) > 0.001) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['criterios'], message: 'La suma de los pesos debe ser 100%' });
  }
});

const calificacionItemSchema = z.object({
  id_criterio: idSchema,
  nota: z.coerce.number().min(0, 'La calificación no puede ser menor que 0').max(5, 'La calificación máxima es 5.0')
});

export const evaluacionSchema = z.object({
  id_rubrica: idSchema,
  calificaciones: z.array(calificacionItemSchema).min(1, 'Debe calificar al menos un criterio'),
  retroalimentacion: z.string().trim().min(20, 'La retroalimentación debe tener al menos 20 caracteres')
});
