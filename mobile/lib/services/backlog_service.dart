import '../models/tarea_backlog.dart';
import 'api_client.dart';

class BacklogResultado {
  final List<TareaBacklog> tareas;
  final int porcentajeAvance;

  const BacklogResultado({required this.tareas, required this.porcentajeAvance});
}

class BacklogService {
  BacklogService(this._api);

  final ApiClient _api;

  /// GET /api/proyecto/:id_proyecto/backlog
  /// Lanza ApiException(400, ...) si el proyecto no está sincronizado con
  /// Plane — el backend lo valida así, no es un fallo de red.
  Future<BacklogResultado> obtener(int idProyecto) async {
    final datos =
        await _api.get('/proyecto/$idProyecto/backlog') as Map<String, dynamic>;
    final tareas = (datos['tareas'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .map(TareaBacklog.fromJson)
        .toList();
    final avance =
        (datos['proyecto'] as Map<String, dynamic>?)?['porcentaje_avance'];
    return BacklogResultado(
      tareas: tareas,
      porcentajeAvance: (avance as num?)?.round() ?? 0,
    );
  }

  /// POST /api/proyecto/:id_proyecto/tareas
  Future<void> crearTarea(
    int idProyecto, {
    required String titulo,
    String? descripcion,
    String estado = 'por_hacer',
  }) async {
    await _api.post('/proyecto/$idProyecto/tareas', {
      'titulo': titulo.trim(),
      if (descripcion != null && descripcion.trim().isNotEmpty)
        'descripcion': descripcion.trim(),
      'estado': estado,
    });
  }

  /// PATCH /api/proyecto/:id_proyecto/tareas/:id_tarea/estado
  Future<void> actualizarEstado(
      int idProyecto, String idTarea, String estado) async {
    await _api.patch(
        '/proyecto/$idProyecto/tareas/$idTarea/estado', {'estado': estado});
  }

  /// DELETE /api/proyecto/:id_proyecto/tareas/:id_tarea
  Future<void> eliminarTarea(int idProyecto, String idTarea) async {
    await _api.delete('/proyecto/$idProyecto/tareas/$idTarea');
  }
}