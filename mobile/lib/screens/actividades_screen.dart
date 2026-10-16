import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/tema_upb.dart';
import '../models/actividad.dart';
import '../models/usuario.dart';
import '../services/actividad_service.dart';
import '../services/api_client.dart';
import '../state/sesion.dart';
import '../widgets/actividad_comunes.dart';
import 'actividad_detalle_screen.dart';

/// Lista de actividades entregables del usuario (réplica móvil de
/// Entregables.jsx). Una tarjeta por actividad y proyecto.
class ActividadesScreen extends StatefulWidget {
  const ActividadesScreen({super.key});

  @override
  State<ActividadesScreen> createState() => _ActividadesScreenState();
}

class _Item {
  const _Item(this.actividad, this.asignacion);
  final Actividad actividad;
  final AsignacionActividad asignacion;
}

class _ActividadesScreenState extends State<ActividadesScreen> {
  late Future<List<_Item>> _futuro;

  @override
  void initState() {
    super.initState();
    _futuro = _cargar();
  }

  /// El backend devuelve todas las asignaciones de cada actividad; aquí se
  /// dejan solo las del usuario: sus proyectos (estudiante) o los que asesora
  /// (docente). Los borradores no tienen entrega y se ocultan al estudiante.
  Future<List<_Item>> _cargar() async {
    final Usuario? usuario = context.read<Sesion>().usuario;
    final actividades = await context.read<ActividadService>().listar();
    if (usuario == null) return const [];

    final items = <_Item>[];
    for (final actividad in actividades) {
      if (!usuario.esDocente && actividad.estado == 'BORRADOR') continue;
      for (final asignacion in actividad.asignaciones) {
        final propia = usuario.esDocente
            ? asignacion.idDocenteProyecto == usuario.idUsuario
            : asignacion.tieneIntegrante(usuario.idUsuario);
        if (propia) items.add(_Item(actividad, asignacion));
      }
    }
    return items;
  }

  Future<void> _recargar() async {
    final futuro = _cargar();
    setState(() => _futuro = futuro);
    await futuro.catchError((_) => <_Item>[]);
  }

  Future<void> _abrir(_Item item) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ActividadDetalleScreen(
          actividad: item.actividad,
          idActividadProyecto: item.asignacion.idActividadProyecto,
        ),
      ),
    );
    if (mounted) _recargar();
  }

  @override
  Widget build(BuildContext context) {
    final esDocente = context.watch<Sesion>().usuario?.esDocente ?? false;

    return Scaffold(
      appBar: AppBar(title: const Text('Actividades y entregas')),
      body: FutureBuilder<List<_Item>>(
        future: _futuro,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(
                child: CircularProgressIndicator(color: TemaUpb.rojo));
          }
          if (snapshot.hasError) {
            final error = snapshot.error;
            return _Mensaje(
              icono: Icons.cloud_off_outlined,
              texto: error is ApiException
                  ? error.mensaje
                  : 'No se pudieron cargar las actividades.',
              accion: FilledButton(
                  onPressed: _recargar, child: const Text('Reintentar')),
            );
          }
          final items = snapshot.data ?? const <_Item>[];
          if (items.isEmpty) {
            return RefreshIndicator(
              onRefresh: _recargar,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  SizedBox(
                    height: MediaQuery.of(context).size.height * 0.6,
                    child: _Mensaje(
                      icono: Icons.assignment_outlined,
                      texto: esDocente
                          ? 'Todavía no hay actividades para tus proyectos.'
                          : 'Todavía no hay actividades publicadas para tu proyecto.',
                    ),
                  ),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: _recargar,
            child: ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) =>
                  _TarjetaActividad(item: items[i], onTap: () => _abrir(items[i])),
            ),
          );
        },
      ),
    );
  }
}

class _TarjetaActividad extends StatelessWidget {
  const _TarjetaActividad({required this.item, required this.onTap});

  final _Item item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final actividad = item.actividad;
    final entrega = item.asignacion.entrega;
    final entregada = entrega?.entregada ?? false;
    final vencida = actividad.vencida && actividad.estado == 'PUBLICADO' && !entregada;

    final Widget estado;
    if (actividad.estado == 'BORRADOR') {
      estado = const InsigniaEstado(texto: 'Borrador', color: Colors.black54);
    } else if (entregada) {
      estado = const InsigniaEstado(
          texto: 'Entregada', color: Color(0xFF15803D));
    } else if (vencida) {
      estado = const InsigniaEstado(texto: 'Vencida', color: Color(0xFFB91C1C));
    } else {
      estado =
          const InsigniaEstado(texto: 'Pendiente', color: Color(0xFFB45309));
    }

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
                    child: Text(actividad.nombre,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(width: 8),
                  estado,
                ],
              ),
              const SizedBox(height: 4),
              Text(item.asignacion.tituloProyecto,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.black54, fontSize: 13)),
              const SizedBox(height: 10),
              Row(
                children: [
                  const Icon(Icons.schedule, size: 16, color: TemaUpb.rojo),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(formatearFechaHora(actividad.fechaLimite),
                        style: const TextStyle(fontSize: 12)),
                  ),
                  Text(actividad.esGrupal ? 'Grupal' : 'Individual',
                      style: const TextStyle(
                          fontSize: 12, color: Colors.black54)),
                  if (entrega != null && entrega.archivos.isNotEmpty) ...[
                    const SizedBox(width: 10),
                    const Icon(Icons.attach_file, size: 14, color: Colors.black54),
                    Text('${entrega.archivos.length}',
                        style: const TextStyle(
                            fontSize: 12, color: Colors.black54)),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Mensaje extends StatelessWidget {
  const _Mensaje({required this.icono, required this.texto, this.accion});

  final IconData icono;
  final String texto;
  final Widget? accion;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icono, size: 48, color: Colors.black26),
            const SizedBox(height: 12),
            Text(texto,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.black54)),
            if (accion != null) ...[const SizedBox(height: 16), accion!],
          ],
        ),
      ),
    );
  }
}
