import 'dart:convert';
import 'package:http/http.dart' as http;

class PlaneService {
  static const String baseUrl = 'https://api.plane.so/api/v1';
  static const String apiKey = 'plane_api_955083e52c464cbb969de73b0bcbacce';
  static const String workspaceSlug = 'aux-3';

  // Encabezados requeridos por Plane.so
  static const Map<String, String> _headers = {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json',
  };

  /// Obtiene las tareas (issues) y calcula el porcentaje de avance
  static Future<double> obtenerAvanceProyecto(String idPlaneProyecto) async {
    final url = Uri.parse('$baseUrl/workspaces/$workspaceSlug/projects/$idPlaneProyecto/issues/');

    try {
      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        final List<dynamic> issues = data['results'] ?? [];

        if (issues.isEmpty) return 0.0;

        // Filtrar tareas que estén completadas
        final completadas = issues.where((issue) {
          final stateDetail = issue['state_detail'];
          return stateDetail != null && stateDetail['group'] == 'completed';
        }).length;

        // Cálculo de porcentaje (tareas_hechas / total_tareas) * 100
        double porcentaje = (completadas / issues.length) * 100;
        return double.parse(porcentaje.toStringAsFixed(2));
      } else {
        print('Error Plane API: ${response.statusCode}');
        return 0.0;
      }
    } catch (e) {
      print('Excepción al conectar con Plane: $e');
      return 0.0;
    }
  }
}