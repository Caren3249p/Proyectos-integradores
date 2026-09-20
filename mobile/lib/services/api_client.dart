import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';

/// Error controlado de la API. `statusCode == 0` significa que no hubo
/// respuesta del servidor (red caída, IP equivocada, backend apagado).
class ApiException implements Exception {
  final int statusCode;
  final String mensaje;

  ApiException(this.statusCode, this.mensaje);

  bool get esSesionExpirada => statusCode == 401;
  bool get esSinConexion => statusCode == 0;

  @override
  String toString() => mensaje;
}

/// Cliente HTTP único de la app: agrega el JWT, serializa en UTF-8 y
/// normaliza los errores que devuelve Express.
class ApiClient {
  ApiClient({http.Client? cliente}) : _cliente = cliente ?? http.Client();

  final http.Client _cliente;
  String? _token;

  /// Callback que la capa de sesión usa para cerrar sesión si el JWT expira
  /// (el backend firma el token con expiración de 30 min).
  void Function()? alExpirarSesion;

  void definirToken(String? token) => _token = token;

  Map<String, String> _headers({bool conCuerpo = false}) {
    final headers = <String, String>{'Accept': 'application/json'};
    if (conCuerpo) {
      // El charset explícito es obligatorio: el paquete http codifica el
      // body en latin1 si no se indica, y el backend espera UTF-8
      // (hay campos con "ñ" y tildes).
      headers['Content-Type'] = 'application/json; charset=utf-8';
    }
    if (_token != null) headers['Authorization'] = 'Bearer $_token';
    return headers;
  }

  Uri _uri(String endpoint) => Uri.parse('${ApiConfig.baseUrl}$endpoint');

  List<int>? _cuerpo(Map<String, dynamic>? datos) =>
      datos == null ? null : utf8.encode(jsonEncode(datos));

  Future<dynamic> get(String endpoint) =>
      _enviar(() => _cliente.get(_uri(endpoint), headers: _headers()));

  Future<dynamic> post(String endpoint, [Map<String, dynamic>? datos]) =>
      _enviar(() => _cliente.post(_uri(endpoint),
          headers: _headers(conCuerpo: true), body: _cuerpo(datos)));

  Future<dynamic> put(String endpoint, [Map<String, dynamic>? datos]) =>
      _enviar(() => _cliente.put(_uri(endpoint),
          headers: _headers(conCuerpo: true), body: _cuerpo(datos)));

  Future<dynamic> patch(String endpoint, [Map<String, dynamic>? datos]) =>
      _enviar(() => _cliente.patch(_uri(endpoint),
          headers: _headers(conCuerpo: true), body: _cuerpo(datos)));

  Future<dynamic> delete(String endpoint) =>
      _enviar(() => _cliente.delete(_uri(endpoint), headers: _headers()));

  /// Subida de archivo (multipart/form-data). [rutaArchivo] es la ruta
  /// local elegida con file_picker; [campos] son los demás campos del
  /// formulario (ej. "tipo").
  Future<dynamic> subirArchivo(
    String endpoint,
    String rutaArchivo, {
    Map<String, String> campos = const {},
  }) async {
    final peticion = http.MultipartRequest('POST', _uri(endpoint));
    peticion.headers.addAll(_headers());
    peticion.fields.addAll(campos);
    peticion.files
        .add(await http.MultipartFile.fromPath('archivo', rutaArchivo));

    late http.StreamedResponse enviada;
    try {
      enviada = await peticion.send().timeout(const Duration(seconds: 60));
    } on TimeoutException {
      throw ApiException(0, 'La subida tardó demasiado. Intenta de nuevo.');
    } catch (_) {
      throw ApiException(0, 'No se pudo conectar con el servidor.');
    }

    final respuesta = await http.Response.fromStream(enviada);
    dynamic datos;
    if (respuesta.bodyBytes.isNotEmpty) {
      try {
        datos = jsonDecode(utf8.decode(respuesta.bodyBytes));
      } catch (_) {
        datos = null;
      }
    }
    if (respuesta.statusCode >= 200 && respuesta.statusCode < 300) {
      return datos;
    }
    final mensaje = datos is Map<String, dynamic>
        ? (datos['error'] ?? 'Error ${respuesta.statusCode}').toString()
        : 'Error ${respuesta.statusCode}';
    throw ApiException(respuesta.statusCode, mensaje);
  }

  /// Descarga un archivo del backend y lo guarda en el almacenamiento
  /// temporal del dispositivo. Devuelve el archivo local ya escrito.
  Future<File> descargarArchivo(
      String endpoint, String nombreSugerido) async {
    late http.Response respuesta;
    try {
      respuesta = await _cliente
          .get(_uri(endpoint), headers: _headers())
          .timeout(const Duration(seconds: 30));
    } catch (_) {
      throw ApiException(0, 'No se pudo descargar el archivo.');
    }
    if (respuesta.statusCode != 200) {
      throw ApiException(
          respuesta.statusCode, 'No se pudo descargar el archivo.');
    }
    final archivo = File('${Directory.systemTemp.path}/$nombreSugerido');
    await archivo.writeAsBytes(respuesta.bodyBytes);
    return archivo;
  }

  Future<dynamic> _enviar(Future<http.Response> Function() peticion) async {
    late http.Response respuesta;
    try {
      respuesta = await peticion().timeout(const Duration(seconds: 20));
    } on TimeoutException {
      throw ApiException(0, 'El servidor tardó demasiado en responder.');
    } catch (_) {
      throw ApiException(
        0,
        'No se pudo conectar con el servidor.\n'
        'Verifica que el backend esté corriendo y que la URL '
        '(${ApiConfig.baseUrl}) sea la correcta para este dispositivo.',
      );
    }

    dynamic datos;
    if (respuesta.bodyBytes.isNotEmpty) {
      try {
        datos = jsonDecode(utf8.decode(respuesta.bodyBytes));
      } catch (_) {
        datos = null;
      }
    }

    if (respuesta.statusCode >= 200 && respuesta.statusCode < 300) {
      return datos;
    }

    if (respuesta.statusCode == 401) {
      alExpirarSesion?.call();
    }

    final mensaje = datos is Map<String, dynamic>
        ? (datos['error'] ?? datos['message'] ?? 'Error ${respuesta.statusCode}')
            .toString()
        : 'Error ${respuesta.statusCode}';
    throw ApiException(respuesta.statusCode, mensaje);
  }

  void cerrar() => _cliente.close();
}