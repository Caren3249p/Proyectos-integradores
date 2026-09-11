import { registrarUsuario, iniciarSesion, obtenerPerfil } from '../services/authService.js';
import { registerSchema, loginSchema } from '../utils/validators.js';
import { PrismaClient } from '@prisma/client';
import { buildAuthorizationUrl, exchangeCode, getGithubUser } from '../services/githubService.js';
import { createOAuthState, encryptSecret } from '../utils/encryption.js';

const prisma = new PrismaClient();

export const register = async (req, res) => {
  try {
    const validData = registerSchema.parse(req.body);
    const usuario = await registrarUsuario(validData);
    const sesion = await iniciarSesion(validData.correo, validData.contrasena);
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token: sesion.token,
      usuario: sesion.usuario
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
  const usuario = await obtenerPerfil(req.usuario.id_usuario);
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json({ usuario: { ...usuario, github_connected: Boolean(usuario.github_access_token_encrypted), github_access_token_encrypted: undefined } });
};

export const githubUrl = async (req, res) => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_REDIRECT_URI) return res.status(503).json({ error: 'La integración con GitHub no está configurada' });
  const state = createOAuthState();
  await prisma.githubOAuthState.create({ data: { state, id_usuario: req.usuario.id_usuario, expires_at: new Date(Date.now() + 10 * 60 * 1000) } });
  res.json({ url: buildAuthorizationUrl(state) });
};

export const githubCallback = async (req, res) => {
  const frontendUrl = process.env.GITHUB_FRONTEND_REDIRECT_URI || 'http://localhost:3312';
  try {
    const { code, state, error: githubError } = req.query;
    if (githubError || !code || !state) throw Object.assign(new Error('La autorización de GitHub fue cancelada o es inválida'), { status: 400 });
    const oauthState = await prisma.githubOAuthState.findUnique({ where: { state } });
    if (!oauthState || oauthState.used_at || oauthState.expires_at < new Date()) throw Object.assign(new Error('La autorización de GitHub expiró'), { status: 400 });
    const accessToken = await exchangeCode(code);
    const githubUser = await getGithubUser(accessToken);
    await prisma.$transaction([
      prisma.usuario.update({ where: { id_usuario: oauthState.id_usuario }, data: { github_user_id: String(githubUser.id), github_username: githubUser.login, github_access_token_encrypted: encryptSecret(accessToken), github_connected_at: new Date() } }),
      prisma.githubOAuthState.update({ where: { id: oauthState.id }, data: { used_at: new Date() } })
    ]);
    res.redirect(`${frontendUrl}?github=connected`);
  } catch (error) {
    res.redirect(`${frontendUrl}?github=error&message=${encodeURIComponent(error.message)}`);
  }
};

export const githubStatus = async (req, res) => {
  const usuario = await prisma.usuario.findUnique({ where: { id_usuario: req.usuario.id_usuario }, select: { github_username: true, github_user_id: true, github_access_token_encrypted: true } });
  res.json({ connected: Boolean(usuario?.github_access_token_encrypted), username: usuario?.github_username || null, github_user_id: usuario?.github_user_id || null });
};

export const disconnectGithub = async (req, res) => {
  await prisma.usuario.update({ where: { id_usuario: req.usuario.id_usuario }, data: { github_user_id: null, github_username: null, github_access_token_encrypted: null, github_connected_at: null } });
  res.json({ message: 'Cuenta de GitHub desconectada' });
};
