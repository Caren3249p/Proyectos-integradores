import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/usuario.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';

enum EstadoSesion { cargando, autenticado, invitado }

/// Sesión de la app: guarda el JWT y el usuario en el dispositivo y los
/// restaura al abrir. Es el único punto que conoce el token.
class Sesion extends ChangeNotifier {
  Sesion({required ApiClient api})
      : _api = api,
        _auth = AuthService(api) {
    _api.alExpirarSesion = () {
      // El token dura 30 min en el backend; si expira, se cierra sesión.
      cerrarSesion();
    };
  }

  static const _claveToken = 'upb_token';
  static const _claveUsuario = 'upb_usuario';

  final ApiClient _api;
  final AuthService _auth;

  EstadoSesion _estado = EstadoSesion.cargando;
  Usuario? _usuario;

  EstadoSesion get estado => _estado;
  Usuario? get usuario => _usuario;

  /// Se llama una vez al arrancar la app.
  Future<void> restaurar() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_claveToken);
    final usuarioGuardado = prefs.getString(_claveUsuario);

    if (token == null || usuarioGuardado == null) {
      _cambiar(EstadoSesion.invitado, null);
      return;
    }

    _api.definirToken(token);
    _usuario =
        Usuario.fromJson(jsonDecode(usuarioGuardado) as Map<String, dynamic>);

    try {
      // Valida el token contra /auth/me y refresca los datos del perfil.
      _usuario = await _auth.perfil();
      await _guardar(token, _usuario!);
      _cambiar(EstadoSesion.autenticado, _usuario);
    } on ApiException catch (error) {
      if (error.esSinConexion) {
        // Sin red: se deja entrar con los datos locales.
        _cambiar(EstadoSesion.autenticado, _usuario);
      } else {
        await cerrarSesion();
      }
    }
  }

  Future<void> iniciarSesion(String correo, String contrasena) async {
    final resultado =
        await _auth.login(correo: correo, contrasena: contrasena);
    await _aplicar(resultado);
  }

  Future<void> registrar(
      String nombre, String correo, String contrasena) async {
    final resultado = await _auth.registrar(
        nombre: nombre, correo: correo, contrasena: contrasena);
    await _aplicar(resultado);
  }

  Future<void> cerrarSesion() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_claveToken);
    await prefs.remove(_claveUsuario);
    _api.definirToken(null);
    _cambiar(EstadoSesion.invitado, null);
  }

  Future<void> _aplicar(ResultadoAuth resultado) async {
    _api.definirToken(resultado.token);
    await _guardar(resultado.token, resultado.usuario);
    _cambiar(EstadoSesion.autenticado, resultado.usuario);
  }

  Future<void> _guardar(String token, Usuario usuario) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_claveToken, token);
    await prefs.setString(_claveUsuario, jsonEncode(usuario.toJson()));
  }

  void _cambiar(EstadoSesion estado, Usuario? usuario) {
    _estado = estado;
    _usuario = usuario;
    notifyListeners();
  }
}