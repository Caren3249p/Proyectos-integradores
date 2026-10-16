import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/tema_upb.dart';
import '../models/actividad.dart';
import '../services/actividad_service.dart';
import '../services/api_client.dart';
import '../state/sesion.dart';
import '../widgets/actividad_comunes.dart';
import '../widgets/entrega_estudiante_seccion.dart';
import '../widgets/evidencias_docente_seccion.dart';
import 'matriz_criterios_screen.dart';

/// Detalle de una actividad para un proyecto concreto. El estudiante sube la
/// entrega, coevalúa y ve su nota; el docente revisa archivos, repositorio
/// Git y resultados.
class ActividadDetalleScreen extends StatefulWidget {
  const ActividadDetalleScreen({
    super.key,
    required this.actividad,
    required this.idActividadProyecto,
  });

  final Actividad actividad;
  final int idActividadProyecto;

  @override
  State<ActividadDetalleScreen> createState() => _ActividadDetalleScreenState();
}

class _ActividadDetalleScreenState extends State<ActividadDetalleScreen> {
  late Actividad _actividad;
  bool _recargando = false;

  @override
  void initState() {
    super.initState();
    _actividad = widget.actividad;
  }

  AsignacionActividad? get _asignacion {
    for (final a in _actividad.asignaciones) {
      if (a.idActividadProyecto == widget.idActividadProyecto) return a;
    }
    return null;
  }

  void _avisar(String mensaje) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(mensaje)));
  }

  Future<void> _recargar() async {
    if (_recargando) return;
    setState(() => _recargando = true);
    try {
      final actualizada = await context
          .read<ActividadService>()
          .obtener(_actividad.idActividad);
      if (mounted) setState(() => _actividad = actualizada);
    } on ApiException catch (error) {
      _avisar(error.mensaje);
    } finally {
      if (mounted) setState(() => _recargando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final usuario = context.watch<Sesion>().usuario;
    final asignacion = _asignacion;
    if (usuario == null) return const SizedBox.shrink();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Actividad'),
        actions: [
          if (_recargando)
            const Padding(
              padding: EdgeInsets.only(right: 16),
              child: Center(
                child: SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: Colors.white),
                ),
              ),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _recargar,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          children: [
            _Encabezado(actividad: _actividad, asignacion: asignacion),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => MatrizCriteriosScreen(actividad: _actividad),
                ),
              ),
              icon: const Icon(Icons.visibility_outlined),
              label: const Text('Ver criterios y matriz de calificación'),
            ),
            const SizedBox(height: 12),
            if (asignacion == null)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Text('No se encontró esta asignación. Vuelve a la lista y actualiza.'),
                ),
              )
            else if (usuario.esDocente)
              EvidenciasDocenteSeccion(
                actividad: _actividad,
                asignacion: asignacion,
                onAviso: _avisar,
              )
            else
              EntregaEstudianteSeccion(
                actividad: _actividad,
                asignacion: asignacion,
                idUsuario: usuario.idUsuario,
                onCambio: _recargar,
                onAviso: _avisar,
              ),
          ],
        ),
      ),
    );
  }
}

class _Encabezado extends StatelessWidget {
  const _Encabezado({required this.actividad, required this.asignacion});

  final Actividad actividad;
  final AsignacionActividad? asignacion;

  @override
  Widget build(BuildContext context) {
    final vencida = actividad.vencida && actividad.estado == 'PUBLICADO';

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: [
                InsigniaEstado(
                  texto: actividad.esGrupal ? 'Grupal' : 'Individual',
                  color: const Color(0xFF1D4ED8),
                ),
                if (actividad.estado != 'PUBLICADO')
                  InsigniaEstado(
                    texto: actividad.estado == 'BORRADOR' ? 'Borrador' : 'Cerrada',
                    color: Colors.black54,
                  ),
                if (vencida)
                  const InsigniaEstado(
                      texto: 'Plazo vencido', color: Color(0xFFB91C1C)),
              ],
            ),
            const SizedBox(height: 10),
            Text(actividad.nombre,
                style: const TextStyle(
                    fontSize: 20, fontWeight: FontWeight.w800)),
            if (asignacion != null) ...[
              const SizedBox(height: 4),
              Text(asignacion!.tituloProyecto,
                  style: const TextStyle(color: Colors.black54)),
            ],
            if (actividad.descripcion.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(actividad.descripcion,
                  style: const TextStyle(fontSize: 14, height: 1.4)),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.schedule, size: 18, color: TemaUpb.rojo),
                const SizedBox(width: 6),
                Text('Fecha límite: ${formatearFechaHora(actividad.fechaLimite)}',
                    style: const TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 13)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
