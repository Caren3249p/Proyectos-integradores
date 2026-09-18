/// Configuración de red del backend (Node.js + Express).
///
/// IMPORTANTE — la URL cambia según dónde se ejecute la app:
///  * Emulador de Android : http://10.0.2.2:3000/api  (10.0.2.2 = localhost del PC)
///  * Celular físico      : http://<IP-LAN-de-tu-PC>:3000/api  (ej. 192.168.1.12)
///  * Flutter web/desktop : http://localhost:3000/api
///
/// Se puede sobreescribir sin tocar el código:
///   flutter run --dart-define=API_BASE_URL=http://192.168.1.12:3000/api
class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000/api',
  );
}