import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/enlaces.dart';
import '../core/tema_upb.dart';
import '../models/actividad.dart';
import '../services/actividad_service.dart';
import '../services/api_client.dart';
import 'actividad_comunes.dart';

/// Vista del docente dentro del detalle de una actividad: repositorio Git
/// del equipo, archivos entregados (con descarga autenticada), nota base y
/// avance / resultados de la coevaluación.
class EvidenciasDocenteSeccion extends StatelessWidget {
  const EvidenciasDocenteSeccion({
    super.key,
    required this.actividad,
    required this.asignacion,
    required this.onAviso,
  });

  final Actividad actividad;
  final AsignacionActividad asignacion;
  final void Function(String) onAviso;

  @override
  Widget build(BuildContext context) {
    final entrega = asignacion.entrega;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _BloqueRepositorio(asignacion: asignacion),
        const SizedBox(height: 12),
        if (entrega == null)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Text(
                'Este equipo aún no tiene entrega: la actividad está en borrador.',
                style: TextStyle(color: Colors.black54),
              ),
            ),
          )
        else ...[
          _BloqueArchivos(entrega: entrega, onAviso: onAviso),
          const SizedBox(height: 12),
          _BloqueNotas(actividad: actividad, entrega: entrega),
        ],
      ],
    );
  }
}

class _BloqueRepositorio extends StatelessWidget {
  const _BloqueRepositorio({required this.asignacion});

  final AsignacionActividad asignacion;

  @override
  Widget build(BuildContext context) {
    final repo = asignacion.repositorio;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const TituloBloque('Repositorio del proyecto',
                icono: Icons.code_outlined),
            if (repo != null)
              Row(
                children: [
                  Expanded(
                    child: Text(
                      repo.url,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 12, color: Colors.black54),
                    ),
                  ),
                  if (repo.esPrivado)
                    const Padding(
                      padding: EdgeInsets.only(left: 6),
                      child: Tooltip(
                        message: 'Repositorio privado',
                        child: Icon(Icons.lock_outline, size: 16),
                      ),
                    ),
                  const SizedBox(width: 8),
                  FilledButton.icon(
                    style: FilledButton.styleFrom(
                        backgroundColor: TemaUpb.textoOscuro),
                    onPressed: () => abrirUrlExterna(context, repo.url),
                    icon: const Icon(Icons.open_in_new, size: 16),
                    label: const Text('Ver repositorio'),
                  ),
                ],
              )
            else
              const Align(
                alignment: Alignment.centerLeft,
                child: InsigniaEstado(
                  texto: '⚠️ Sin repositorio enlazado',
                  color: Color(0xFFB45309),
                ),
              ),
            if (asignacion.integrantes.isNotEmpty) ...[
              const SizedBox(height: 12),
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: [
                  for (final integrante in asignacion.integrantes)
                    Chip(
                      visualDensity: VisualDensity.compact,
                      avatar: const Icon(Icons.person_outline, size: 16),
                      label: Text(integrante.nombre,
                          style: const TextStyle(fontSize: 12)),
                    ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _BloqueArchivos extends StatefulWidget {
  const _BloqueArchivos({required this.entrega, required this.onAviso});

  final Entrega entrega;
  final void Function(String) onAviso;

  @override
  State<_BloqueArchivos> createState() => _BloqueArchivosState();
}

class _BloqueArchivosState extends State<_BloqueArchivos> {
  final Set<int> _descargando = {};

  Future<void> _descargar(ArchivoEntrega archivo) async {
    if (_descargando.contains(archivo.idArchivo)) return;
    setState(() => _descargando.add(archivo.idArchivo));
    try {
      final local = await context
          .read<ActividadService>()
          .descargar(widget.entrega.idEntrega, archivo);
      if (!mounted) return;
      await abrirArchivoLocal(context, local);
    } on ApiException catch (error) {
      if (mounted) widget.onAviso(error.mensaje);
    } finally {
      if (mounted) setState(() => _descargando.remove(archivo.idArchivo));
    }
  }

  @override
  Widget build(BuildContext context) {
    final entrega = widget.entrega;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TituloBloque(
              'Archivos entregados (${entrega.archivos.length})',
              icono: Icons.folder_open_outlined,
              trailing: InsigniaEstado(
                texto: entrega.entregada ? 'Entregada' : 'Pendiente',
                color: entrega.entregada
                    ? const Color(0xFF15803D)
                    : const Color(0xFFB45309),
              ),
            ),
            if (entrega.entregada && entrega.fechaEntrega != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Text(
                  'Entregada el ${formatearFechaHora(entrega.fechaEntrega!)}'
                  '${entrega.entregadaATiempo == false ? ' · fuera de plazo' : ' · a tiempo'}',
                  style: const TextStyle(color: Colors.black54, fontSize: 12),
                ),
              ),
            if (entrega.archivos.isEmpty)
              const Text('El equipo todavía no ha subido archivos.',
                  style: TextStyle(color: Colors.black54, fontSize: 13)),
            for (final archivo in entrega.archivos)
              ListTile(
                dense: true,
                contentPadding: EdgeInsets.zero,
                leading: Icon(iconoDeArchivo(archivo), color: TemaUpb.rojo),
                title: Text(archivo.nombre,
                    maxLines: 1, overflow: TextOverflow.ellipsis),
                subtitle: Text(
                  [
                    archivo.tamanoLegible,
                    if (archivo.fechaSubida != null)
                      formatearFechaHora(archivo.fechaSubida!),
                  ].join(' · '),
                ),
                trailing: _descargando.contains(archivo.idArchivo)
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : IconButton(
                        tooltip: 'Descargar',
                        icon: const Icon(Icons.download_outlined),
                        onPressed: () => _descargar(archivo),
                      ),
              ),
          ],
        ),
      ),
    );
  }
}

class _BloqueNotas extends StatelessWidget {
  const _BloqueNotas({required this.actividad, required this.entrega});

  final Actividad actividad;
  final Entrega entrega;

  @override
  Widget build(BuildContext context) {
    final total = entrega.coevaluaciones.length;
    final enviadas = entrega.coevaluacionesEnviadas;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const TituloBloque('Calificación y coevaluación',
                icono: Icons.grade_outlined),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Nota base docente',
                    style: TextStyle(color: Colors.black54)),
                Text(
                  entrega.notaBase == null
                      ? 'Pendiente'
                      : formatearNota(entrega.notaBase),
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
              ],
            ),
            if (actividad.conCoevaluacion) ...[
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Coevaluaciones enviadas',
                      style: TextStyle(color: Colors.black54)),
                  Text('$enviadas / $total',
                      style: const TextStyle(fontWeight: FontWeight.w800)),
                ],
              ),
              if (total > 0) ...[
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: LinearProgressIndicator(
                    value: enviadas / total,
                    minHeight: 6,
                    color: TemaUpb.rojo,
                    backgroundColor: Colors.black12,
                  ),
                ),
              ],
              const Divider(height: 24),
              if (entrega.resultados.isEmpty)
                const Text(
                  'Los resultados consolidados aparecerán cuando todo el equipo complete la coevaluación.',
                  style: TextStyle(color: Colors.black54, fontSize: 12),
                )
              else
                for (final resultado in entrega.resultados)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(resultado.nombre,
                              style:
                                  const TextStyle(fontWeight: FontWeight.w600)),
                        ),
                        Text(
                          '${resultado.totalCoevaluacion.toStringAsFixed(1)} % · '
                          '${resultado.notaFinal == null ? 'sin nota base' : formatearNota(resultado.notaFinal)}',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ],
                    ),
                  ),
            ],
          ],
        ),
      ),
    );
  }
}
