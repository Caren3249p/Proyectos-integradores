/// Espejo de las actividades entregables del backend
/// (GET /api/actividades-entregables): ActividadEntregable → ActividadProyecto
/// → Entrega → ArchivoEntrega / Evaluacion / Coevaluacion.
///
/// Ojo: Prisma serializa los `Decimal` como texto ("4.50"), por eso todo
/// número pasa por [_aNumero].
library;

double? _aNumero(dynamic valor) {
  if (valor == null) return null;
  if (valor is num) return valor.toDouble();
  return double.tryParse(valor.toString());
}

DateTime? _aFecha(dynamic valor) =>
    valor == null ? null : DateTime.tryParse(valor.toString())?.toLocal();

List<Map<String, dynamic>> _lista(dynamic valor) => (valor as List<dynamic>? ??
        const [])
    .whereType<Map<String, dynamic>>()
    .toList();

String _tamanoLegible(int bytes) {
  if (bytes < 1024) return '$bytes B';
  if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
  return '${(bytes / (1024 * 1024)).toStringAsFixed(2)} MB';
}

class ArchivoEntrega {
  final int idArchivo;
  final String nombre;
  final String extension;
  final int tamano;
  final DateTime? fechaSubida;

  const ArchivoEntrega({
    required this.idArchivo,
    required this.nombre,
    required this.extension,
    required this.tamano,
    this.fechaSubida,
  });

  factory ArchivoEntrega.fromJson(Map<String, dynamic> json) => ArchivoEntrega(
        idArchivo: json['id_archivo_entrega'] as int,
        nombre: (json['nombre'] ?? '') as String,
        extension: ((json['extension'] ?? '') as String).toLowerCase(),
        tamano: (json['tamano'] as num?)?.toInt() ?? 0,
        fechaSubida: _aFecha(json['fecha_subida']),
      );

  String get tamanoLegible => _tamanoLegible(tamano);
  bool get esZip => extension == '.zip';
}

class Repositorio {
  final String url;
  final bool esPrivado;
  final String? origen;

  const Repositorio({required this.url, this.esPrivado = false, this.origen});

  static Repositorio? desde(dynamic json) {
    if (json is! Map<String, dynamic>) return null;
    final url = (json['url'] ?? '').toString().trim();
    if (url.isEmpty) return null;
    return Repositorio(
      url: url,
      esPrivado: json['es_privado'] == true,
      origen: json['origen'] as String?,
    );
  }
}

class IntegranteActividad {
  final int idUsuario;
  final String nombre;

  const IntegranteActividad({required this.idUsuario, required this.nombre});

  factory IntegranteActividad.fromJson(Map<String, dynamic> json) {
    final usuario = json['usuario'] as Map<String, dynamic>?;
    return IntegranteActividad(
      idUsuario: (json['id_usuario'] ?? usuario?['id_usuario']) as int,
      nombre: (usuario?['nombre'] ?? 'Integrante') as String,
    );
  }
}

class NivelCriterio {
  final int nivel;
  final double puntos;
  final String? descripcion;

  const NivelCriterio({
    required this.nivel,
    required this.puntos,
    this.descripcion,
  });

  factory NivelCriterio.fromJson(Map<String, dynamic> json) => NivelCriterio(
        nivel: (json['nivel'] as num?)?.toInt() ?? 0,
        puntos: _aNumero(json['puntos']) ?? 0,
        descripcion: json['descripcion'] as String?,
      );
}

/// Criterio del `criterios_snapshot` de la actividad (fuente histórica: no
/// se consulta la rúbrica viva, que el docente puede seguir modificando).
class CriterioSnapshot {
  final int idCriterio;
  final String nombre;
  final String? descripcion;
  final double peso;
  final bool esHoja;
  final bool seleccionado;
  final List<NivelCriterio> niveles;

  const CriterioSnapshot({
    required this.idCriterio,
    required this.nombre,
    required this.peso,
    required this.esHoja,
    required this.seleccionado,
    this.descripcion,
    this.niveles = const [],
  });

  factory CriterioSnapshot.fromJson(Map<String, dynamic> json) {
    final niveles = _lista(json['niveles']).map(NivelCriterio.fromJson).toList()
      ..sort((a, b) => b.nivel.compareTo(a.nivel));
    return CriterioSnapshot(
      idCriterio: json['id_criterio'] as int,
      nombre: (json['nombre'] ?? '') as String,
      descripcion: json['descripcion'] as String?,
      peso: _aNumero(json['peso']) ?? 0,
      esHoja: json['es_hoja'] != false,
      // Igual que la web: solo se excluye si viene explícitamente en false.
      seleccionado: json['seleccionado'] != false,
      niveles: niveles,
    );
  }
}

/// Criterio hoja de la rúbrica de coevaluación (5 criterios, 20 % c/u).
class CriterioCoevaluacion {
  final int idCriterio;
  final String nombre;

  const CriterioCoevaluacion({required this.idCriterio, required this.nombre});

  factory CriterioCoevaluacion.fromJson(Map<String, dynamic> json) =>
      CriterioCoevaluacion(
        idCriterio: json['id_criterio'] as int,
        nombre: (json['nombre'] ?? '') as String,
      );
}

class Coevaluacion {
  final int idCoevaluacion;
  final int idEvaluador;
  final int idEvaluado;
  final String estado; // PENDIENTE | ENVIADA
  final String nombreEvaluado;

  const Coevaluacion({
    required this.idCoevaluacion,
    required this.idEvaluador,
    required this.idEvaluado,
    required this.estado,
    required this.nombreEvaluado,
  });

  bool get enviada => estado == 'ENVIADA';

  factory Coevaluacion.fromJson(Map<String, dynamic> json) => Coevaluacion(
        idCoevaluacion: json['id_coevaluacion'] as int,
        idEvaluador: json['id_evaluador'] as int,
        idEvaluado: json['id_evaluado'] as int,
        estado: (json['estado'] ?? 'PENDIENTE') as String,
        nombreEvaluado:
            ((json['evaluado'] as Map<String, dynamic>?)?['nombre'] ?? 'Compañero')
                as String,
      );
}

class ResultadoCoevaluacion {
  final int idUsuario;
  final String nombre;
  final double totalCoevaluacion; // 0..100
  final double? notaBase; // 0..5
  final double? notaFinal; // 0..5

  const ResultadoCoevaluacion({
    required this.idUsuario,
    required this.nombre,
    required this.totalCoevaluacion,
    this.notaBase,
    this.notaFinal,
  });

  factory ResultadoCoevaluacion.fromJson(Map<String, dynamic> json) =>
      ResultadoCoevaluacion(
        idUsuario: json['id_usuario'] as int,
        nombre:
            ((json['usuario'] as Map<String, dynamic>?)?['nombre'] ?? 'Integrante')
                as String,
        totalCoevaluacion: _aNumero(json['total_coevaluacion']) ?? 0,
        notaBase: _aNumero(json['nota_base']),
        notaFinal: _aNumero(json['nota_final']),
      );
}

class Entrega {
  final int idEntrega;
  final String estado; // PENDIENTE | ENTREGADA
  final DateTime? fechaEntrega;
  final bool? entregadaATiempo;
  final double? _notaBase;
  final double? _notaEvaluacion;
  final List<ArchivoEntrega> archivos;
  final List<Coevaluacion> coevaluaciones;
  final List<ResultadoCoevaluacion> resultados;

  const Entrega({
    required this.idEntrega,
    required this.estado,
    this.fechaEntrega,
    this.entregadaATiempo,
    double? notaBase,
    double? notaEvaluacion,
    this.archivos = const [],
    this.coevaluaciones = const [],
    this.resultados = const [],
  })  : _notaBase = notaBase,
        _notaEvaluacion = notaEvaluacion;

  bool get entregada => estado == 'ENTREGADA';

  /// Nota base docente (N_B, escala 0–5). Misma regla que la web:
  /// `entrega.nota_base ?? entrega.evaluacion.nota_final`.
  double? get notaBase => _notaBase ?? _notaEvaluacion;

  /// Coevaluaciones que [idUsuario] debe responder y aún no ha enviado.
  List<Coevaluacion> pendientesDe(int idUsuario) => coevaluaciones
      .where((c) => c.idEvaluador == idUsuario && !c.enviada)
      .toList();

  int get coevaluacionesEnviadas => coevaluaciones.where((c) => c.enviada).length;

  ResultadoCoevaluacion? resultadoDe(int idUsuario) {
    for (final resultado in resultados) {
      if (resultado.idUsuario == idUsuario) return resultado;
    }
    return null;
  }

  factory Entrega.fromJson(Map<String, dynamic> json) {
    final evaluacion = json['evaluacion'] as Map<String, dynamic>?;
    return Entrega(
      idEntrega: json['id_entrega'] as int,
      estado: (json['estado'] ?? 'PENDIENTE') as String,
      fechaEntrega: _aFecha(json['fecha_entrega']),
      entregadaATiempo: json['entregada_a_tiempo'] as bool?,
      notaBase: _aNumero(json['nota_base']),
      notaEvaluacion: _aNumero(evaluacion?['nota_final']),
      archivos: _lista(json['archivos']).map(ArchivoEntrega.fromJson).toList(),
      coevaluaciones:
          _lista(json['coevaluaciones']).map(Coevaluacion.fromJson).toList(),
      resultados: _lista(json['resultados_coevaluacion'])
          .map(ResultadoCoevaluacion.fromJson)
          .toList(),
    );
  }
}

/// Una actividad asignada a un proyecto concreto (ActividadProyecto).
class AsignacionActividad {
  final int idActividadProyecto;
  final int idProyecto;
  final String tituloProyecto;
  final int? idDocenteProyecto;
  final Repositorio? repositorio;
  final List<IntegranteActividad> integrantes;
  final Entrega? entrega;

  const AsignacionActividad({
    required this.idActividadProyecto,
    required this.idProyecto,
    required this.tituloProyecto,
    this.idDocenteProyecto,
    this.repositorio,
    this.integrantes = const [],
    this.entrega,
  });

  bool tieneIntegrante(int idUsuario) =>
      integrantes.any((i) => i.idUsuario == idUsuario);

  factory AsignacionActividad.fromJson(Map<String, dynamic> json) {
    final proyecto = json['proyecto'] as Map<String, dynamic>? ?? const {};
    final entrega = json['entrega'];
    return AsignacionActividad(
      idActividadProyecto: json['id_actividad_proyecto'] as int,
      idProyecto: (proyecto['id_proyecto'] ?? json['id_proyecto']) as int,
      tituloProyecto: (proyecto['titulo'] ?? 'Proyecto') as String,
      idDocenteProyecto: proyecto['id_docente'] as int?,
      repositorio: Repositorio.desde(proyecto['repositorio']),
      integrantes: _lista(proyecto['integrantes'])
          .map(IntegranteActividad.fromJson)
          .toList(),
      entrega: entrega is Map<String, dynamic> ? Entrega.fromJson(entrega) : null,
    );
  }
}

class Actividad {
  final int idActividad;
  final String nombre;
  final String descripcion;
  final DateTime fechaLimite;
  final String tipo; // INDIVIDUAL | GRUPAL
  final String estado; // BORRADOR | PUBLICADO | CERRADO
  final bool coevaluacionActiva;
  final String? nombreDocente;
  final List<CriterioSnapshot> criterios;
  final List<CriterioCoevaluacion> criteriosCoevaluacion;
  final List<AsignacionActividad> asignaciones;

  const Actividad({
    required this.idActividad,
    required this.nombre,
    required this.descripcion,
    required this.fechaLimite,
    required this.tipo,
    required this.estado,
    required this.coevaluacionActiva,
    this.nombreDocente,
    this.criterios = const [],
    this.criteriosCoevaluacion = const [],
    this.asignaciones = const [],
  });

  bool get esGrupal => tipo == 'GRUPAL';
  bool get conCoevaluacion => esGrupal && coevaluacionActiva;
  bool get vencida => DateTime.now().isAfter(fechaLimite);

  /// Hojas que realmente se evalúan en esta actividad.
  List<CriterioSnapshot> get criteriosEvaluables =>
      criterios.where((c) => c.seleccionado && c.esHoja).toList();

  factory Actividad.fromJson(Map<String, dynamic> json) {
    final rubricaCoevaluacion =
        json['rubrica_coevaluacion'] as Map<String, dynamic>?;
    return Actividad(
      idActividad: json['id_actividad'] as int,
      nombre: (json['nombre'] ?? '') as String,
      descripcion: (json['descripcion'] ?? '') as String,
      fechaLimite: _aFecha(json['fecha_limite']) ?? DateTime.now(),
      tipo: (json['tipo'] ?? 'INDIVIDUAL') as String,
      estado: (json['estado'] ?? 'BORRADOR') as String,
      coevaluacionActiva: json['coevaluacion_activa'] == true,
      nombreDocente:
          (json['docente'] as Map<String, dynamic>?)?['nombre'] as String?,
      criterios:
          _lista(json['criterios_snapshot']).map(CriterioSnapshot.fromJson).toList(),
      criteriosCoevaluacion: _lista(rubricaCoevaluacion?['criterios'])
          .map(CriterioCoevaluacion.fromJson)
          .toList(),
      asignaciones:
          _lista(json['proyectos']).map(AsignacionActividad.fromJson).toList(),
    );
  }
}
