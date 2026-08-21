import { z } from 'zod';

const correoRegex = /^[a-zA-Z0-9._%+-]+@upb\.edu\.co$/;
const contraseñaRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export const registerSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  correo: z.string().regex(correoRegex, 'El correo debe ser institucional (@upb.edu.co)'),
  contraseña: z.string().regex(contraseñaRegex, 'La contraseña debe tener mínimo 8 caracteres, 1 mayúscula y 1 número'),
  rol: z.enum(['estudiante', 'docente'])
});

export const loginSchema = z.object({
  correo: z.string().regex(correoRegex, 'El correo debe ser institucional (@upb.edu.co)'),
  contraseña: z.string().min(1, 'La contraseña es obligatoria')
});
