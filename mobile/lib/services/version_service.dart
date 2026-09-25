import '../models/version_proyecto.dart';
import 'api_client.dart';

class VersionService {
  VersionService(this._api);

  final ApiClient _api;

  /// POST /api/proyectos/:id/versiones
  Future<VersionProyecto> crearVersion(int idProyecto) async {
    final datos = await _api.post('/proyectos/$idProyecto/versiones');
    return VersionProyecto.fromJson(
        (datos as Map<String, dynamic>)['version'] as Map<String, dynamic>);
  }

  /// GET /api/versiones/:id — incluye los archivos de esa versión.
  Future<VersionProyecto> obtener(int idVersion) async {
    final datos = await _api.get('/versiones/$idVersion');
    return VersionProyecto.fromJson(
        (datos as Map<String, dynamic>)['version'] as Map<String, dynamic>);
  }

  /// PATCH /api/versiones/:id/final — ya no admite más archivos después.
  Future<VersionProyecto> marcarFinal(int idVersion) async {
    final datos = await _api.patch('/versiones/$idVersion/final');
    return VersionProyecto.fromJson(
        (datos as Map<String, dynamic>)['version'] as Map<String, dynamic>);
  }

  /// POST /api/versiones/:id/archivos (multipart)
  Future<Archivo> subirArchivo(
    int idVersion,
    String rutaLocal, {
    String tipo = 'entrega',
  }) async {
    final datos = await _api.subirArchivo(
      '/versiones/$idVersion/archivos',
      rutaLocal,
      campos: {'tipo': tipo},
    );
    return Archivo.fromJson(
        (datos as Map<String, dynamic>)['archivo'] as Map<String, dynamic>);
  }

  /// DELETE /api/archivos/:id
  Future<void> eliminarArchivo(int idArchivo) async {
    await _api.delete('/archivos/$idArchivo');
  }
}