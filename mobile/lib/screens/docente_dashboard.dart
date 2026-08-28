import 'package:flutter/material.dart';
import '../models/app_models.dart';
import 'evaluar_proyecto_screen.dart';
import '../widgets/avance_plane_widget.dart';

class DocenteDashboard extends StatelessWidget {
  final Usuario docente;

  const DocenteDashboard({super.key, required this.docente});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Panel Docente: ${docente.nombre}'),
        backgroundColor: const Color(0xFF8B0000),
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          const Text(
            'Proyectos Pendientes de Evaluación',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          Card(
            elevation: 3,
            child: Padding(
              padding: const EdgeInsets.all(14.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Proyecto: Plataforma de Recolección',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const Text('Curso: PI II | Estado: en_revision'),
                  const SizedBox(height: 8),
                  const AvancePlaneWidget(idPlaneProyecto: 'aux-3-uuid'),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF8B0000)),
                        foregroundColor: const Color(0xFF8B0000),
                      ),
                      icon: const Icon(Icons.fact_check),
                      label: const Text('Evaluar con Rúbrica'),
                      onPressed: () {
                        final proyecto = Proyecto(
                          idProyecto: 1,
                          titulo: 'Plataforma de Recolección',
                          resumen: 'App para la UPB',
                          curso: 'PI II',
                          estado: 'en_revision',
                          porcentajeAvance: 80.0,
                        );

                        final criterios = [
                          CriterioRubrica(
                            idCriterio: 1,
                            nombre: 'Avance del Kanban (Plane)',
                            descripcion: 'Tareas completadas según planificación.',
                            pesoPorcentual: 50.0,
                          ),
                          CriterioRubrica(
                            idCriterio: 2,
                            nombre: 'Arquitectura Backend / DB',
                            descripcion: 'Diseño PostgreSQL/Spring o Node.js.',
                            pesoPorcentual: 50.0,
                          ),
                        ];

                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => EvaluarProyectoScreen(proyecto: proyecto, criterios: criterios),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}