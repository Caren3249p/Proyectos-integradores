/// Espejo de VersionProyecto + Archivo (backend/prisma/schema.prisma).
class Archivo {
  final int idArchivo;
  final String nombre;
  final String? tipo;
  final int tamano;
  final String extension;

  const Archivo({
    required this.idArchivo,
    required this.nombre,
    required this.tamano,
    required this.extension,
    this.tipo,
  });

  factory Archivo.fromJson(Map<String, dynamic> json) => Archivo(
        idArchivo: json['id_archivo'] as int,
        nombre: (json['nombre'] ?? '') as String,
        tamano: (json['tamano'] as num?)?.toInt() ?? 0,
        extension: (json['extension'] ?? '') as String,
        tipo: json['tipo'] as String?,
      );

  String get tamanoLegible {
    if (tamano < 1024) return '$tamano B';
    if (tamano < 1024 * 1024) return '${(tamano / 1024).toStringAsFixed(1)} KB';
    return '${(tamano / (1024 * 1024)).toStringAsFixed(1)} MB';
  }
}

class VersionProyecto {
  final int idVersion;
  final String numero;
  final bool esFinal;
  final DateTime? fechaCreacion;
  final List<Archivo> archivos;

  const VersionProyecto({
    required this.idVersion,
    required this.numero,
    required this.esFinal,
    this.fechaCreacion,
    this.archivos = const [],
  });

  factory VersionProyecto.fromJson(Map<String, dynamic> json) {
    return VersionProyecto(
      idVersion: json['id_version'] as int,
      numero: (json['numero'] ?? '—') as String,
      esFinal: json['es_final'] == true,
      fechaCreacion: json['fecha_creacion'] != null
          ? DateTime.tryParse(json['fecha_creacion'] as String)
          : null,
      archivos: (json['archivos'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(Archivo.fromJson)
          .toList(),
    );
  }
}