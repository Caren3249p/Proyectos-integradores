import 'usuario.dart';

/// Campos técnicos del proyecto (tabla `campo_tecnico`, RF-04).
class CamposTecnicos {
  final String? lenguajePrincipal;
  final String? frameworks;
  final String? baseDatos;
  final bool esMovil;
  final String? entornoDespliegue;

  const CamposTecnicos({
    this.lenguajePrincipal,
    this.frameworks,
    this.baseDatos,
    this.esMovil = false,
    this.entornoDespliegue,
  });

  factory CamposTecnicos.fromJson(Map<String, dynamic> json) {
    return CamposTecnicos(
      lenguajePrincipal: json['lenguaje_principal'] as String?,
      frameworks: json['frameworks'] as String?,
      baseDatos: json['base_datos'] as String?,
      esMovil: json['es_movil'] == true,
      entornoDespliegue: json['entorno_despliegue'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'lenguaje_principal': lenguajePrincipal,
        'frameworks': frameworks,
        'base_datos': baseDatos,
        'es_movil': esMovil,
        'entorno_despliegue': entornoDespliegue,
      };
}

/// Espejo de la tabla `proyecto` con sus relaciones incluidas por el backend.
class Proyecto {
  final int idProyecto;
  final String titulo;
  final String descripcion;
  final String estado; // borrador | activo | en_revision | publicado
  final int porcentajeAvance;
  final String? idPlaneProyecto;
  final Usuario? creador;
  final Usuario? docente;
  final List<Usuario> integrantes;
  final CamposTecnicos? camposTecnicos;
  final String? urlRepositorio;
  final double? notaFinal;
  final String? retroalimentacion;

  const Proyecto({
    required this.idProyecto,
    required this.titulo,
    required this.descripcion,
    required this.estado,
    required this.porcentajeAvance,
    this.idPlaneProyecto,
    this.creador,
    this.docente,
    this.integrantes = const [],
    this.camposTecnicos,
    this.urlRepositorio,
    this.notaFinal,
    this.retroalimentacion,
  });

  bool get tienePlane => (idPlaneProyecto ?? '').isNotEmpty;
  bool get tieneRepositorio => (urlRepositorio ?? '').isNotEmpty;

  factory Proyecto.fromJson(Map<String, dynamic> json) {
    // El backend devuelve `integrantes` como filas de IntegranteProyecto
    // con el usuario anidado.
    final listaIntegrantes = (json['integrantes'] as List<dynamic>? ?? [])
        .map((fila) => fila is Map<String, dynamic> ? fila['usuario'] : null)
        .whereType<Map<String, dynamic>>()
        .map(Usuario.fromJson)
        .toList();

    // Solo llega la evaluación más reciente (take: 1).
    final evaluaciones = json['evaluaciones'] as List<dynamic>? ?? [];
    final ultima =
        evaluaciones.isNotEmpty && evaluaciones.first is Map<String, dynamic>
            ? evaluaciones.first as Map<String, dynamic>
            : null;

    final repositorio = json['repositorio'];
    final tecnicos = json['campos_tecnicos'];

    return Proyecto(
      idProyecto: json['id_proyecto'] as int,
      titulo: (json['titulo'] ?? 'Sin título') as String,
      descripcion: (json['descripcion'] ?? '') as String,
      estado: (json['estado'] ?? 'borrador') as String,
      porcentajeAvance: (json['porcentaje_avance'] as num?)?.round() ?? 0,
      idPlaneProyecto: json['id_plane_proyecto'] as String?,
      creador: json['creador'] is Map<String, dynamic>
          ? Usuario.fromJson(json['creador'] as Map<String, dynamic>)
          : null,
      docente: json['docente'] is Map<String, dynamic>
          ? Usuario.fromJson(json['docente'] as Map<String, dynamic>)
          : null,
      integrantes: listaIntegrantes,
      camposTecnicos: tecnicos is Map<String, dynamic>
          ? CamposTecnicos.fromJson(tecnicos)
          : null,
      urlRepositorio:
          repositorio is Map<String, dynamic> ? repositorio['url'] as String? : null,
      // nota_final viaja como string porque en Postgres es DECIMAL(4,2).
      notaFinal: ultima == null
          ? null
          : double.tryParse('${ultima['nota_final']}'),
      retroalimentacion: ultima?['retroalimentacion'] as String?,
    );
  }
}