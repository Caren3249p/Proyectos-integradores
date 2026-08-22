import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/app_models.dart';

class ApiService {
  // Cambia localhost por la IP de tu servidor o '10.0.2.2' si usas emulador Android
  static const String baseUrl = 'http://localhost:3000/api';

  // --- PROYECTOS ---

  // Obtener la lista de proyectos (Tabla: proyecto + vista_proyecto_completo)
  static Future<List<Proyecto>> obtenerProyectos() async {
    final response = await http.get(Uri.parse('$baseUrl/proyectos'));

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((json) => Proyecto.fromJson(json)).toList();
    } else {
      throw Exception('Error al cargar proyectos');
    }
  }

  // Registrar un proyecto (Tabla: proyecto)
  static Future<bool> crearProyecto(Map<String, dynamic> proyectoData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/proyectos'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(proyectoData),
    );

    return response.statusCode == 201;
  }

  // --- EVALUACIONES Y RÚBRICAS ---

  // Guardar la calificación del docente (Tabla: evaluacion - RF-07, RF-08)
  static Future<bool> guardarEvaluacion({
    required int idProyecto,
    required int idDocente,
    required int idRubrica,
    required double notaFinal,
    required String retroalimentacion,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/evaluaciones'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'id_proyecto': idProyecto,
        'id_docente': idDocente,
        'id_rubrica': idRubrica,
        'nota_final': notaFinal,
        'retroalimentacion': retroalimentacion,
      }),
    );

    return response.statusCode == 201;
  }

  // --- CAMPOS TÉCNICOS ---

  // Guardar ficha técnica (Tabla: campo_tecnico - RF-04)
  static Future<bool> guardarCampoTecnico(Map<String, dynamic> datosTecnicos) async {
    final response = await http.post(
      Uri.parse('$baseUrl/campos-tecnicos'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(datosTecnicos),
    );

    return response.statusCode == 200 || response.statusCode == 201;
  }
}