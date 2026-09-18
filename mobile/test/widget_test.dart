import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/proyecto.dart';

void main() {
  test('Proyecto.fromJson lee la respuesta del backend', () {
    final json = <String, dynamic>{
      'id_proyecto': 7,
      'titulo': 'Plataforma de Proyectos Integradores',
      'descripcion': 'Gestión académica con integración a Plane y GitHub',
      'estado': 'en_revision',
      'porcentaje_avance': 45,
      'id_plane_proyecto': 'abc-123',
      'creador': {
        'id_usuario': 1,
        'nombre': 'Caren',
        'correo': 'caren@upb.edu.co',
        'rol': 'estudiante',
      },
      'docente': null,
      'integrantes': [
        {
          'id_usuario': 1,
          'usuario': {
            'id_usuario': 1,
            'nombre': 'Caren',
            'correo': 'caren@upb.edu.co',
            'rol': 'estudiante',
          }
        }
      ],
      'campos_tecnicos': {
        'lenguaje_principal': 'Dart',
        'frameworks': 'Flutter',
        'base_datos': 'PostgreSQL',
        'es_movil': true,
        'entorno_despliegue': 'Android',
      },
      'repositorio': {'url': 'https://github.com/Caren3249p/Proyectos-integradores'},
      // nota_final llega como string: en Postgres es DECIMAL(4,2)
      'evaluaciones': [
        {'nota_final': '4.20', 'retroalimentacion': 'Buen avance'}
      ],
    };

    final proyecto = Proyecto.fromJson(json);

    expect(proyecto.idProyecto, 7);
    expect(proyecto.estado, 'en_revision');
    expect(proyecto.porcentajeAvance, 45);
    expect(proyecto.integrantes.single.nombre, 'Caren');
    expect(proyecto.camposTecnicos!.esMovil, isTrue);
    expect(proyecto.tieneRepositorio, isTrue);
    expect(proyecto.notaFinal, 4.2);
  });
}