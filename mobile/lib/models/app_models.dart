class Usuario {
  final int idUsuario;
  final String nombre;
  final String correo;
  final String rol; // 'estudiante' | 'docente'
  final String? githubUsername;

  Usuario({
    required this.idUsuario,
    required this.nombre,
    required this.correo,
    required this.rol,
    this.githubUsername,
  });

  factory Usuario.fromJson(Map<String, dynamic> json) {
    return Usuario(
      idUsuario: json['id_usuario'],
      nombre: json['nombre'],
      correo: json['correo'],
      rol: json['rol'],
      githubUsername: json['github_username'],
    );
  }
}

class Proyecto {
  final int idProyecto;
  final String titulo;
  final String resumen;
  final String curso; // 'PI I', 'PI II', 'PI III'
  final String estado; // 'borrador', 'en_revision', 'publicado'
  final double porcentajeAvance;
  final String? idGithubRepo;

  Proyecto({
    required this.idProyecto,
    required this.titulo,
    required this.resumen,
    required this.curso,
    required this.estado,
    required this.porcentajeAvance,
    this.idGithubRepo,
  });

  factory Proyecto.fromJson(Map<String, dynamic> json) {
    return Proyecto(
      idProyecto: json['id_proyecto'],
      titulo: json['titulo'],
      resumen: json['resumen'] ?? '',
      curso: json['curso'],
      estado: json['estado'],
      porcentajeAvance: (json['porcentaje_avance'] as num).toDouble(),
      idGithubRepo: json['id_github_repo'],
    );
  }
}

class CriterioRubrica {
  final int idCriterio;
  final String nombre;
  final String descripcion;
  final double pesoPorcentual;
  double calificacion; // Escala 0.0 a 5.0

  CriterioRubrica({
    required this.idCriterio,
    required this.nombre,
    required this.descripcion,
    required this.pesoPorcentual,
    this.calificacion = 0.0,
  });
}