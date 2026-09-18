import '../models/proyecto.dart';
import 'api_client.dart';

class ProyectoService {
  ProyectoService(this._api);

  final ApiClient _api;

  List<Proyecto> _mapear(dynamic datos) =>
      (datos as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(Proyecto.fromJson)
          .toList();

  /// GET /api/proyectos — el backend filtra según el rol del token:
  /// estudiante ve los suyos, docente los que asesora, admin todos.
  Future<List<Proyecto>> misProyectos() async =>
      _mapear(await _api.get('/proyectos'));

  /// GET /api/proyectos/sin-docente — bolsa de proyectos sin asesor.
  Future<List<Proyecto>> sinDocente() async =>
      _mapear(await _api.get('/proyectos/sin-docente'));

  /// GET /api/proyectos/:id
  Future<Proyecto> detalle(int idProyecto) async {
    final datos = await _api.get('/proyectos/$idProyecto');
    return Proyecto.fromJson(
        (datos as Map<String, dynamic>)['proyecto'] as Map<String, dynamic>);
  }

  /// POST /api/proyectos — los integrantes se envían por correo
  /// institucional y deben existir previamente en la BD.
  Future<Proyecto> crear({
    required String titulo,
    String? descripcion,
    List<String> integrantes = const [],
  }) async {
    final datos = await _api.post('/proyectos', {
      'titulo': titulo.trim(),
      if (descripcion != null && descripcion.trim().isNotEmpty)
        'descripcion': descripcion.trim(),
      if (integrantes.isNotEmpty) 'integrantes': integrantes,
    });
    return Proyecto.fromJson(
        (datos as Map<String, dynamic>)['proyecto'] as Map<String, dynamic>);
  }

  /// PUT /api/proyectos/:id — estado válido: borrador | en_revision | publicado
  Future<Proyecto> actualizarEstado(int idProyecto, String estado) async {
    final datos = await _api.put('/proyectos/$idProyecto', {'estado': estado});
    return Proyecto.fromJson(
        (datos as Map<String, dynamic>)['proyecto'] as Map<String, dynamic>);
  }

  /// PATCH /api/proyectos/:id/campos-tecnicos (RF-04)
  Future<void> guardarCamposTecnicos(
      int idProyecto,
      CamposTecnicos campos,
      ) async {
    await _api.patch('/proyectos/$idProyecto/campos-tecnicos', {
      if (campos.lenguajePrincipal != null)
        'lenguaje_principal': campos.lenguajePrincipal,
      if (campos.frameworks != null) 'frameworks': campos.frameworks,
      if (campos.baseDatos != null) 'base_datos': campos.baseDatos,
      'es_movil': campos.esMovil,
      if (campos.entornoDespliegue != null)
        'entorno_despliegue': campos.entornoDespliegue,
    });
  }

  /// POST /api/proyectos/:id/integrantes
  Future<void> agregarIntegrante(int idProyecto, String correo) async {
    await _api.post('/proyectos/$idProyecto/integrantes',
        {'correo': correo.trim().toLowerCase()});
  }

  /// POST /api/proyectos/:id/repositorio
  Future<void> enlazarRepositorio(int idProyecto, String url,
      {bool esPrivado = false}) async {
    await _api.post('/proyectos/$idProyecto/repositorio', {
      'url': url.trim(),
      'es_privado': esPrivado,
    });
  }

  /// PATCH /api/proyectos/:id/asignar-docente — solo rol docente.
  Future<void> tomarComoAsesor(int idProyecto) async {
    await _api.patch('/proyectos/$idProyecto/asignar-docente');
  }
  /// DELETE /api/proyectos/:id/asignar-docente — el docente se desasigna.
  Future<void> dejarDeAsesorar(int idProyecto) async {
    await _api.delete('/proyectos/$idProyecto/asignar-docente');
  }
}