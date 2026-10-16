import 'dart:io';

import '../models/actividad.dart';
import 'api_client.dart';

/// Actividades entregables, entregas, descarga de evidencias y
/// coevaluación (backend: actividadEntregableRoutes, entregableRoutes y
/// coevaluacionRoutes; todos bajo /api y con JWT).
class ActividadService {
  ActividadService(this._api);

  final ApiClient _api;

  /// Extensiones que acepta el backend (filePolicy.js) y límite por archivo.
  static const extensionesPermitidas = ['pdf', 'docx', 'pptx', 'zip'];
  static const maxBytesPorArchivo = 25 * 1024 * 1024;
  static const maxArchivosPorEntrega = 10;

  /// Escala de coevaluación válida en el backend.
  static const escalaCoevaluacion = [0, 20, 40, 60, 80, 100];

  /// GET /api/actividades-entregables — el backend filtra por rol, pero
  /// devuelve todas las asignaciones de cada actividad: el filtrado por
  /// proyecto propio se hace en la pantalla.
  Future<List<Actividad>> listar() async {
    final datos = await _api.get('/actividades-entregables');
    final lista = (datos as Map<String, dynamic>)['actividades'] as List<dynamic>? ??
        const [];
    return lista
        .whereType<Map<String, dynamic>>()
        .map(Actividad.fromJson)
        .toList();
  }

  /// GET /api/actividades-entregables/:id
  Future<Actividad> obtener(int idActividad) async {
    final datos = await _api.get('/actividades-entregables/$idActividad');
    return Actividad.fromJson(
        (datos as Map<String, dynamic>)['actividad'] as Map<String, dynamic>);
  }

  /// POST /api/entregas/:idEntrega/archivos (multipart, campo "archivos").
  /// El backend marca la entrega como ENTREGADA al recibir los archivos.
  Future<void> subirArchivos(int idEntrega, List<String> rutasLocales) async {
    await _api.subirArchivos('/entregas/$idEntrega/archivos', rutasLocales);
  }

  /// GET /api/entregas/:idEntrega/archivos/:idArchivo/descarga — solo el
  /// docente asignado al proyecto puede descargar (el backend responde 403
  /// al resto). Devuelve el archivo ya guardado en el almacenamiento temporal.
  Future<File> descargar(int idEntrega, ArchivoEntrega archivo) {
    return _api.descargarArchivo(
      '/entregas/$idEntrega/archivos/${archivo.idArchivo}/descarga',
      archivo.nombre,
    );
  }

  /// POST /api/entregas/:idEntrega/coevaluaciones/:idEvaluado
  /// [calificaciones]: id_criterio → valor de la escala (0, 20, …, 100).
  Future<void> enviarCoevaluacion(
    int idEntrega,
    int idEvaluado,
    Map<int, int> calificaciones, {
    String observacion = '',
  }) async {
    await _api.post('/entregas/$idEntrega/coevaluaciones/$idEvaluado', {
      'calificaciones': [
        for (final e in calificaciones.entries)
          {'id_criterio': e.key, 'calificacion_base': e.value},
      ],
      'observacion': observacion,
    });
  }
}
