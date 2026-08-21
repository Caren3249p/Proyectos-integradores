import { registrarUsuario, iniciarSesion } from '../services/authService.js';
import { registerSchema, loginSchema } from '../utils/validators.js';

export const register = async (req, res) => {
  try {
    const validData = registerSchema.parse(req.body);
    const usuario = await registrarUsuario(validData);
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Datos inválidos',
        detalles: error.errors
      });
    }
    if (error.code === 'EMAIL_EXISTS') {
      return res.status(400).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { correo, contraseña } = loginSchema.parse(req.body);
    const { token, usuario } = await iniciarSesion(correo, contraseña);
    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Datos inválidos',
        detalles: error.errors
      });
    }
    res.status(401).json({ error: error.message });
  }
};

export const getPerfil = async (req, res) => {
  res.json({ usuario: req.usuario });
};
