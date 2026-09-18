/// Espejo de la tabla `usuario` del backend (Prisma: model Usuario).
class Usuario {
  final int idUsuario;
  final String nombre;
  final String correo;
  final String rol; // 'estudiante' | 'docente' | 'admin'
  final String? githubUsername;
  final bool githubConectado;

  const Usuario({
    required this.idUsuario,
    required this.nombre,
    required this.correo,
    required this.rol,
    this.githubUsername,
    this.githubConectado = false,
  });

  bool get esEstudiante => rol == 'estudiante';
  bool get esDocente => rol == 'docente';
  bool get esAdmin => rol == 'admin';

  factory Usuario.fromJson(Map<String, dynamic> json) {
    return Usuario(
      idUsuario: json['id_usuario'] as int,
      nombre: (json['nombre'] ?? '') as String,
      correo: (json['correo'] ?? '') as String,
      rol: (json['rol'] ?? 'estudiante') as String,
      githubUsername: json['github_username'] as String?,
      githubConectado: json['github_connected'] == true,
    );
  }

  Map<String, dynamic> toJson() => {
        'id_usuario': idUsuario,
        'nombre': nombre,
        'correo': correo,
        'rol': rol,
        'github_username': githubUsername,
        'github_connected': githubConectado,
      };
}