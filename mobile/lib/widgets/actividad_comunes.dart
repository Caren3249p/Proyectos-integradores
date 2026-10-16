import 'package:flutter/material.dart';

import '../models/actividad.dart';

/// Fecha y hora legibles sin depender del paquete intl: 15/10/2026 3:30 p. m.
String formatearFechaHora(DateTime fecha) {
  final dia = fecha.day.toString().padLeft(2, '0');
  final mes = fecha.month.toString().padLeft(2, '0');
  final hora12 = fecha.hour % 12 == 0 ? 12 : fecha.hour % 12;
  final minuto = fecha.minute.toString().padLeft(2, '0');
  final sufijo = fecha.hour >= 12 ? 'p. m.' : 'a. m.';
  return '$dia/$mes/${fecha.year} $hora12:$minuto $sufijo';
}

/// "4.50 / 5.0" o "—" cuando aún no hay nota.
String formatearNota(double? nota) =>
    nota == null ? '—' : '${nota.toStringAsFixed(2)} / 5.0';

IconData iconoDeArchivo(ArchivoEntrega archivo) {
  switch (archivo.extension) {
    case '.zip':
      return Icons.folder_zip_outlined;
    case '.pdf':
      return Icons.picture_as_pdf_outlined;
    case '.docx':
      return Icons.description_outlined;
    case '.pptx':
      return Icons.slideshow_outlined;
    default:
      return Icons.insert_drive_file_outlined;
  }
}

/// Etiqueta de color para estados (Entregada, Pendiente, Vencida…).
class InsigniaEstado extends StatelessWidget {
  const InsigniaEstado({super.key, required this.texto, required this.color});

  final String texto;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        texto,
        style: TextStyle(
            color: color, fontSize: 11, fontWeight: FontWeight.w700),
      ),
    );
  }
}

/// Encabezado de bloque dentro de una tarjeta.
class TituloBloque extends StatelessWidget {
  const TituloBloque(this.texto, {super.key, this.icono, this.trailing});

  final String texto;
  final IconData? icono;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          if (icono != null) ...[
            Icon(icono, size: 18, color: const Color(0xFFC8102E)),
            const SizedBox(width: 8),
          ],
          Expanded(
            child: Text(texto,
                style: const TextStyle(
                    fontWeight: FontWeight.w800, fontSize: 15)),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}
