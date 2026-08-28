import { eliminarArchivo, guardarArchivo, obtenerArchivo } from '../services/archivoService.js';

const responderError = (res, error) => res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });

export const subir = async (req, res) => {
  try { res.status(201).json({ message: 'Archivo subido exitosamente', archivo: await guardarArchivo(Number.parseInt(req.params.id, 10), req.file, req.body.tipo, req.usuario) }); }
  catch (error) { responderError(res, error); }
};

export const descargar = async (req, res) => {
  try {
    const archivo = await obtenerArchivo(Number.parseInt(req.params.id, 10), req.usuario);
    res.download(archivo.ruta, archivo.nombre);
  } catch (error) { responderError(res, error); }
};

export const eliminar = async (req, res) => {
  try { await eliminarArchivo(Number.parseInt(req.params.id, 10), req.usuario); res.json({ message: 'Archivo eliminado exitosamente' }); }
  catch (error) { responderError(res, error); }
};
