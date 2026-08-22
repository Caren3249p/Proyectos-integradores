import 'package:flutter/material.dart';

class AvanceCard extends StatelessWidget {
  final double porcentajeAvance;
  final String? repoGithub;

  const AvanceCard({
    super.key,
    required this.porcentajeAvance,
    this.repoGithub,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 3,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Sincronización con APIS Externas', 
              style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Row(
              children: [
                const Icon(Icons.task, color: Colors.blue),
                const SizedBox(width: 8),
                Text('Avance en Plane: ${porcentajeAvance.toStringAsFixed(1)}%'),
              ],
            ),
            const SizedBox(height: 5),
            LinearProgressIndicator(value: porcentajeAvance / 100),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.code, color: Colors.black80),
                const SizedBox(width: 8),
                Text('Repo: ${repoGithub ?? "No vinculado"}'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}