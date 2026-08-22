import 'package:flutter/material.dart';
import '../services/plane_service.dart';

class AvancePlaneWidget extends StatelessWidget {
  final String idPlaneProyecto;

  const AvancePlaneWidget({super.key, required this.idPlaneProyecto});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<double>(
      future: PlaneService.obtenerAvanceProyecto(idPlaneProyecto),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const CircularProgressIndicator();
        }

        final porcentaje = snapshot.data ?? 0.0;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Avance en Plane: $porcentaje%', 
              style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            LinearProgressIndicator(
              value: porcentaje / 100,
              backgroundColor: Colors.grey[300],
              color: const Color(0xFF8B0000),
            ),
          ],
        );
      },
    );
  }
}