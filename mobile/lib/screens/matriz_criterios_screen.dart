import 'package:flutter/material.dart';

import '../core/tema_upb.dart';
import '../models/actividad.dart';
import '../services/actividad_service.dart';

/// Réplica de MatrizCriteriosModal.jsx: criterios docentes con su peso,
/// la matriz de niveles (0 a 5) y, si la entrega es grupal con
/// coevaluación, los 5 criterios entre compañeros (20 % c/u, escala 0-100).
class MatrizCriteriosScreen extends StatelessWidget {
  const MatrizCriteriosScreen({super.key, required this.actividad});

  final Actividad actividad;

  // Mismos criterios por defecto que usa la web cuando la rúbrica de
  // coevaluación no trae hojas.
  static const _coevaluacionPorDefecto = [
    'Cumplimiento de tareas asignadas',
    'Calidad técnica de los aportes',
    'Puntualidad en los compromisos del sprint',
    'Comunicación asertiva y proactividad',
    'Participación en reuniones y sincronizaciones',
  ];

  @override
  Widget build(BuildContext context) {
    final criterios = actividad.criteriosEvaluables;
    final nombresCoevaluacion = actividad.criteriosCoevaluacion.isNotEmpty
        ? actividad.criteriosCoevaluacion.map((c) => c.nombre).toList()
        : _coevaluacionPorDefecto;

    return Scaffold(
      appBar: AppBar(title: const Text('Criterios y matriz')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: TemaUpb.sidebarFondo,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                const Icon(Icons.workspace_premium_outlined,
                    color: TemaUpb.dorado, size: 30),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(actividad.nombre,
                          style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 16)),
                      const SizedBox(height: 2),
                      const Text('Guía de evaluación y matriz de desempeño',
                          style: TextStyle(color: Colors.white70, fontSize: 12)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _TituloSeccion(
            icono: Icons.check_circle_outline,
            texto: 'Criterios de evaluación docente (${criterios.length})',
          ),
          if (criterios.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 12),
              child: Text(
                'Esta actividad aún no tiene criterios seleccionados.',
                style: TextStyle(color: Colors.black54),
              ),
            ),
          for (final criterio in criterios) _TarjetaCriterio(criterio: criterio),
          const SizedBox(height: 8),
          _TarjetaFormula(conCoevaluacion: actividad.conCoevaluacion),
          if (actividad.conCoevaluacion) ...[
            const SizedBox(height: 16),
            _GuiaCoevaluacion(nombres: nombresCoevaluacion),
          ],
        ],
      ),
    );
  }
}

class _TituloSeccion extends StatelessWidget {
  const _TituloSeccion({required this.icono, required this.texto});

  final IconData icono;
  final String texto;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icono, size: 18, color: TemaUpb.rojo),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              texto.toUpperCase(),
              style: const TextStyle(
                  fontWeight: FontWeight.w800, fontSize: 12, letterSpacing: 0.6),
            ),
          ),
        ],
      ),
    );
  }
}

class _TarjetaCriterio extends StatelessWidget {
  const _TarjetaCriterio({required this.criterio});

  final CriterioSnapshot criterio;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(criterio.nombre,
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 15)),
                ),
                const SizedBox(width: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: TemaUpb.rojoClaro,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${_formatearPeso(criterio.peso)}%',
                    style: const TextStyle(
                        color: TemaUpb.rojo,
                        fontWeight: FontWeight.w800,
                        fontSize: 12),
                  ),
                ),
              ],
            ),
            if ((criterio.descripcion ?? '').trim().isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(criterio.descripcion!.trim(),
                  style: const TextStyle(color: Colors.black54, fontSize: 13)),
            ],
            const SizedBox(height: 12),
            if (criterio.niveles.isEmpty)
              const Text('Sin niveles de desempeño definidos.',
                  style: TextStyle(color: Colors.black45, fontSize: 12))
            else
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.black12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Column(
                  children: [
                    const _FilaNivel(
                        nivel: 'Nivel', puntos: 'Puntos', texto: 'Requisitos',
                        encabezado: true),
                    for (final nivel in criterio.niveles)
                      _FilaNivel(
                        nivel: '${nivel.nivel}',
                        puntos: nivel.puntos.toStringAsFixed(1),
                        texto: (nivel.descripcion ?? '').trim().isEmpty
                            ? 'Cumple con los requisitos correspondientes a este nivel.'
                            : nivel.descripcion!.trim(),
                      ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  static String _formatearPeso(double peso) =>
      peso == peso.roundToDouble() ? peso.toStringAsFixed(0) : peso.toStringAsFixed(1);
}

class _FilaNivel extends StatelessWidget {
  const _FilaNivel({
    required this.nivel,
    required this.puntos,
    required this.texto,
    this.encabezado = false,
  });

  final String nivel;
  final String puntos;
  final String texto;
  final bool encabezado;

  @override
  Widget build(BuildContext context) {
    final estilo = TextStyle(
      fontSize: 12,
      fontWeight: encabezado ? FontWeight.w800 : FontWeight.w500,
      color: encabezado ? Colors.black54 : Colors.black87,
    );
    return Container(
      color: encabezado ? const Color(0xFFF1F1F1) : null,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 44,
            child: Text(nivel,
                textAlign: TextAlign.center,
                style: estilo.copyWith(
                    fontWeight: FontWeight.w800)),
          ),
          SizedBox(
            width: 52,
            child: Text(puntos,
                textAlign: TextAlign.center,
                style: estilo.copyWith(
                    fontWeight: FontWeight.w800,
                    color: encabezado ? Colors.black54 : TemaUpb.rojo)),
          ),
          const SizedBox(width: 8),
          Expanded(child: Text(texto, style: estilo)),
        ],
      ),
    );
  }
}

class _TarjetaFormula extends StatelessWidget {
  const _TarjetaFormula({required this.conCoevaluacion});

  final bool conCoevaluacion;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: TemaUpb.doradoClaro,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.calculate_outlined, size: 18, color: Color(0xFF8A6D1F)),
                SizedBox(width: 8),
                Text('Cómo se calcula tu nota',
                    style: TextStyle(fontWeight: FontWeight.w800)),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              conCoevaluacion
                  ? 'N_D = N_B × (F_C / 100)\n\n'
                      'N_B: nota base del docente (0.0 a 5.0) según esta matriz.\n'
                      'F_C: resultado de tu coevaluación entre compañeros (0 a 100).\n'
                      'N_D: tu nota definitiva individual.'
                  : 'La nota de esta actividad es la nota base del docente '
                      '(0.0 a 5.0) según esta matriz.',
              style: const TextStyle(fontSize: 13, height: 1.4),
            ),
          ],
        ),
      ),
    );
  }
}

class _GuiaCoevaluacion extends StatelessWidget {
  const _GuiaCoevaluacion({required this.nombres});

  final List<String> nombres;

  @override
  Widget build(BuildContext context) {
    final escala = ActividadService.escalaCoevaluacion.join(', ');
    return Card(
      color: const Color(0xFFFFFBEB),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.groups_outlined, size: 18, color: Color(0xFFB45309)),
                SizedBox(width: 8),
                Expanded(
                  child: Text('Coevaluación entre compañeros de equipo',
                      style: TextStyle(fontWeight: FontWeight.w800)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Tus compañeros valorarán tu desempeño en ${nombres.length} '
              'aspectos. Cada uno pesa 20 % y se califica con: $escala.',
              style: const TextStyle(fontSize: 13, height: 1.4),
            ),
            const SizedBox(height: 10),
            for (var i = 0; i < nombres.length; i++)
              Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 6),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFFDE68A)),
                ),
                child: Text('${i + 1}. ${nombres[i]}',
                    style: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 13)),
              ),
          ],
        ),
      ),
    );
  }
}
