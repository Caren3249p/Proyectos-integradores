import '../models/usuario.dart';
import 'api_client.dart';

/// Resultado de un login o registro exitoso.
class ResultadoAuth {
  final String token;
  final Usuario usuario;

  const ResultadoAuth({required this.token, required this.usuario});
}

class AuthService {
  AuthService(this._api);

  final ApiClient _api;

  /// POST /api/auth/login
  /// OJO: el backend valida la clave "contraseña" (con ñ) en el login,
  /// pero "contrasena" (sin ñ) en el registro. No es un typo de la app.
  Future<ResultadoAuth> login({
    required String correo,
    required String contrasena,
  }) async {
    final datos = await _api.post('/auth/login', {
      'correo': correo.trim().toLowerCase(),
      'contraseña': contrasena,
    });
    return _leer(datos);
  }

  /// POST /api/auth/register — el registro público siempre crea rol
  /// 'estudiante'; las cuentas docente/admin se crean desde la consola.
  Future<ResultadoAuth> registrar({
    required String nombre,
    required String correo,
    required String contrasena,
  }) async {
    final datos = await _api.post('/auth/register', {
      'nombre': nombre.trim(),
      'correo': correo.trim().toLowerCase(),
      'contrasena': contrasena,
    });
    return _leer(datos);
  }

  /// GET /api/auth/me — sirve para validar el token guardado al abrir la app.
  Future<Usuario> perfil() async {
    final datos = await _api.get('/auth/me');
    return Usuario.fromJson(
        (datos as Map<String, dynamic>)['usuario'] as Map<String, dynamic>);
  }

  ResultadoAuth _leer(dynamic datos) {
    final mapa = datos as Map<String, dynamic>;
    return ResultadoAuth(
      token: mapa['token'] as String,
      usuario: Usuario.fromJson(mapa['usuario'] as Map<String, dynamic>),
    );
  }
}