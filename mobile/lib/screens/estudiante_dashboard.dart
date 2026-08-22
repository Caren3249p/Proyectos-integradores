import 'package:flutter/material.dart';
import '../models/app_models.dart';
import 'crear_proyecto_screen.dart';
import '../widgets/avance_plane_widget.dart';

class EstudianteDashboard extends StatelessWidget {
  final Usuario estudiante;

  const EstudianteDashboard({super.key, required this.estudiante});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Panel Estudiante: ${estudiante.nombre}'),
        backgroundColor: const Color(0xFF8B0000),
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF8B0000),
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(48),
              ),
              icon: const Icon(Icons.add_circle_outline),
              label: const Text('Subir Nuevo Proyecto Integrador'),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const CrearProyectoScreen()),
                );
              },
            ),
            const SizedBox(height: 20),
            const Text(
              'Catálogo de Proyectos Publicados',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Expanded(
              child: ListView(
                children: [
                  _buildProyectoCard(
                    context,
                    titulo: 'Sistema de Gestión UPB',
                    curso: 'PI III',
                    idPlane: 'aux-3-uuid',
                    repo: 'estudiante/pi-upb',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProyectoCard(
    BuildContext context, {
    required String titulo,
    required String curso,
    required String idPlane,
    required String repo,
  }) {
    return Card(
      elevation: 3,
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(14.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(titulo, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Chip(label: Text(curso)),
              ],
            ),
            Text('GitHub: $repo', style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 10),
            AvancePlaneWidget(idPlaneProyecto: idPlane),
          ],
        ),
      ),
    );
  }
}