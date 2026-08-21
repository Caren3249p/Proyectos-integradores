import dotenv from 'dotenv';
import { resultados, estadoPlaneEsHecho } from '../utils/planeHelpers.js';

dotenv.config();

const apiUrl = (process.env.PLANE_API_URL || 'https://app.plane.so/api/v1').replace(/\/$/, '');
const workspace = process.env.PLANE_WORKSPACE_SLUG;
const timeoutMs = Number(process.env.PLANE_TIMEOUT_MS || 10000);

const requestPlane = async (path, options = {}) => {
  if (!process.env.PLANE_API_KEY || !workspace) {
    const error = new Error('La integración de Plane no está configurada. Define PLANE_API_KEY y PLANE_WORKSPACE_SLUG.');
    error.status = 503;
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${apiUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PLANE_API_KEY}`,
        'X-API-Key': process.env.PLANE_API_KEY,
        ...options.headers
      }
    });
    const data = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(data?.detail || data?.message || `Plane respondió con ${response.status}`);
      error.status = response.status === 401 || response.status === 403 ? 502 : response.status;
      throw error;
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('La API de Plane agotó el tiempo de espera.');
      timeoutError.status = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export const crearProyectoPlane = (nombre, descripcion = '', identifier) =>
  requestPlane(`/workspaces/${workspace}/projects/`, {
    method: 'POST',
    body: JSON.stringify({ name: nombre, identifier, description: descripcion })
  });

export const obtenerTareasPlane = async (projectId) =>
  resultados(await requestPlane(`/workspaces/${workspace}/projects/${projectId}/work-items/`));

export const obtenerEstadosPlane = async (projectId) =>
  resultados(await requestPlane(`/workspaces/${workspace}/projects/${projectId}/states/`));

const resolverEstado = async (projectId, estado) => {
  const estados = await obtenerEstadosPlane(projectId);
  const aliases = { por_hacer: ['backlog', 'to do', 'todo', 'por hacer'], en_progreso: ['in progress', 'en progreso'], hecho: ['done', 'hecho', 'completed'] };
  const encontrado = estados.find((item) => aliases[estado].includes(String(item.name).toLowerCase()));
  return encontrado?.id || estado;
};

export const crearTareaPlane = async (projectId, data) => {
  const state = await resolverEstado(projectId, data.state || 'por_hacer');
  return requestPlane(`/workspaces/${workspace}/projects/${projectId}/work-items/`, { method: 'POST', body: JSON.stringify({ name: data.name, description_html: data.description || '', state, assignees: data.assignee ? [data.assignee] : [] }) });
};

export const actualizarEstadoTareaPlane = async (projectId, issueId, estado) => {
  const state = await resolverEstado(projectId, estado);
  return requestPlane(`/workspaces/${workspace}/projects/${projectId}/work-items/${issueId}/`, { method: 'PATCH', body: JSON.stringify({ state }) });
};

export const eliminarTareaPlane = (projectId, issueId) =>
  requestPlane(`/workspaces/${workspace}/projects/${projectId}/work-items/${issueId}/`, { method: 'DELETE' });

export const calcularPorcentajeAvance = async (projectId) => {
  const tareas = await obtenerTareasPlane(projectId);
  if (!tareas.length) return 0;
  return Math.round((tareas.filter(estadoPlaneEsHecho).length / tareas.length) * 100);
};