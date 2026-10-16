import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/actividad.dart';

void main() {
  // Forma real de GET /api/actividades-entregables: los Decimal de Prisma
  // llegan como texto ("4.50").
  final json = <String, dynamic>{
    'id_actividad': 3,
    'nombre': 'Sprint 2',
    'descripcion': 'Entrega del incremento',
    'fecha_limite': '2026-10-20T15:00:00.000Z',
    'tipo': 'GRUPAL',
    'estado': 'PUBLICADO',
    'coevaluacion_activa': true,
    'docente': {'id_usuario': 9, 'nombre': 'Docente'},
    'criterios_snapshot': [
      {
        'id_criterio': 1,
        'nombre': 'Calidad',
        'descripcion': null,
        'peso': 60,
        'es_hoja': true,
        'seleccionado': true,
        'niveles': [
          {'nivel': 1, 'puntos': 1, 'descripcion': 'Bajo'},
          {'nivel': 5, 'puntos': 5, 'descripcion': 'Excelente'},
        ],
      },
      {
        'id_criterio': 2,
        'nombre': 'Padre',
        'peso': 40,
        'es_hoja': false,
        'seleccionado': false,
        'niveles': [],
      },
    ],
    'rubrica_coevaluacion': {
      'criterios': [
        {'id_criterio': 11, 'nombre': 'Aportes', 'peso': '20.00'},
      ],
    },
    'proyectos': [
      {
        'id_actividad_proyecto': 5,
        'id_proyecto': 7,
        'proyecto': {
          'id_proyecto': 7,
          'titulo': 'Plataforma',
          'id_docente': 9,
          'repositorio': {
            'url': 'https://github.com/x/y',
            'es_privado': true,
            'origen': 'github',
          },
          'integrantes': [
            {
              'id_usuario': 1,
              'usuario': {'id_usuario': 1, 'nombre': 'Caren', 'correo': 'c@u.co'},
            },
          ],
        },
        'entrega': {
          'id_entrega': 20,
          'estado': 'ENTREGADA',
          'fecha_entrega': '2026-10-16T01:00:00.000Z',
          'entregada_a_tiempo': true,
          'nota_base': null,
          'archivos': [
            {
              'id_archivo_entrega': 40,
              'nombre': 'informe.pdf',
              'extension': '.PDF',
              'tamano': 1048576,
              'fecha_subida': '2026-10-16T01:00:00.000Z',
            },
          ],
          'evaluacion': {'nota_final': '4.50'},
          'coevaluaciones': [
            {
              'id_coevaluacion': 1,
              'id_evaluador': 1,
              'id_evaluado': 2,
              'estado': 'PENDIENTE',
              'evaluado': {'id_usuario': 2, 'nombre': 'Juan'},
            },
            {
              'id_coevaluacion': 2,
              'id_evaluador': 2,
              'id_evaluado': 1,
              'estado': 'ENVIADA',
              'evaluado': {'id_usuario': 1, 'nombre': 'Caren'},
            },
          ],
          'resultados_coevaluacion': [
            {
              'id_usuario': 1,
              'total_coevaluacion': '80.00',
              'nota_base': '4.50',
              'nota_final': '3.60',
              'usuario': {'id_usuario': 1, 'nombre': 'Caren'},
            },
          ],
        },
      },
    ],
  };

  test('Actividad.fromJson lee actividad, criterios y asignaciones', () {
    final actividad = Actividad.fromJson(json);

    expect(actividad.conCoevaluacion, isTrue);
    // Solo cuenta la hoja seleccionada; los niveles quedan de 5 a 1.
    expect(actividad.criteriosEvaluables.length, 1);
    expect(actividad.criteriosEvaluables.first.niveles.first.nivel, 5);
    expect(actividad.criteriosCoevaluacion.single.idCriterio, 11);

    final asignacion = actividad.asignaciones.single;
    expect(asignacion.idDocenteProyecto, 9);
    expect(asignacion.tieneIntegrante(1), isTrue);
    expect(asignacion.tieneIntegrante(99), isFalse);
    expect(asignacion.repositorio?.esPrivado, isTrue);
  });

  test('Entrega convierte Decimal-texto y calcula pendientes y nota', () {
    final entrega =
        Actividad.fromJson(json).asignaciones.single.entrega!;

    expect(entrega.entregada, isTrue);
    expect(entrega.archivos.single.extension, '.pdf');
    expect(entrega.archivos.single.tamanoLegible, '1.00 MB');
    // nota_base null → cae a evaluacion.nota_final (como la web).
    expect(entrega.notaBase, 4.5);
    expect(entrega.pendientesDe(1).single.nombreEvaluado, 'Juan');
    expect(entrega.pendientesDe(2), isEmpty);
    expect(entrega.coevaluacionesEnviadas, 1);

    final resultado = entrega.resultadoDe(1)!;
    expect(resultado.totalCoevaluacion, 80);
    expect(resultado.notaFinal, 3.6);
    expect(entrega.resultadoDe(2), isNull);
  });
}
