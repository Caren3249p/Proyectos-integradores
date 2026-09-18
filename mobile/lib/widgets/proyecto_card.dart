import 'package:flutter/material.dart';

import '../core/tema_upb.dart';
import '../models/proyecto.dart';

class ProyectoCard extends StatelessWidget {
  const ProyectoCard({
    super.key,
    required this.proyecto,
    this.onTap,
    this.accion,
  });

  final Proyecto proyecto;
  final VoidCallback? onTap;
  final Widget? accion;

  @override
  Widget build(BuildContext context) {
    final avance = proyecto.porcentajeAvance.clamp(0, 100);

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      proyecto.titulo,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                  _Insignia(estado: proyecto.estado),
                ],
              ),
              if (proyecto.descripcion.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text(
                  proyecto.descripcion,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.black54, fontSize: 13),
                ),
              ],
              const SizedBox(height: 12),
              // Avance calculado desde Plane por el backend.
              Row(
                children: [
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: avance / 100,
                        minHeight: 8,
                        backgroundColor: Colors.grey.shade200,
                        color: TemaUpb.rojo,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text('$avance%',
                      style: const TextStyle(
                          fontSize: 12, fontWeight: FontWeight.w600)),
                ],
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 12,
                runSpacing: 4,
                children: [
                  _Dato(
                    icono: Icons.group,
                    texto: '${proyecto.integrantes.length} integrantes',
                  ),
                  _Dato(
                    icono: Icons.person_outline,
                    texto: proyecto.docente?.nombre ?? 'Sin asesor',
                  ),
                  if (proyecto.notaFinal != null)
                    _Dato(
                      icono: Icons.grade_outlined,
                      texto:
                          'Nota ${proyecto.notaFinal!.toStringAsFixed(2)}',
                    ),
                ],
              ),
              if (accion != null) ...[
                const SizedBox(height: 8),
                Align(alignment: Alignment.centerRight, child: accion!),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _Insignia extends StatelessWidget {
  const _Insignia({required this.estado});

  final String estado;

  @override
  Widget build(BuildContext context) {
    final color = TemaUpb.colorEstado(estado);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Text(
        TemaUpb.etiquetaEstado(estado),
        style: TextStyle(
            color: color, fontSize: 11, fontWeight: FontWeight.w600),
      ),
    );
  }
}

class _Dato extends StatelessWidget {
  const _Dato({required this.icono, required this.texto});

  final IconData icono;
  final String texto;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icono, size: 14, color: Colors.black45),
        const SizedBox(width: 4),
        Text(texto,
            style: const TextStyle(fontSize: 12, color: Colors.black54)),
      ],
    );
  }
}