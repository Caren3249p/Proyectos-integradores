import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/tema_upb.dart';
import '../models/actividad.dart';
import '../services/actividad_service.dart';
import '../services/api_client.dart';
import 'actividad_comunes.dart';

/// Vista del estudiante dentro del detalle de una actividad: subir la
/// entrega, coevaluar a los compañeros y ver su calificación.
class EntregaEstudianteSeccion extends StatelessWidget {
  const EntregaEstudianteSeccion({
    super.key,
    required this.actividad,
    required this.asignacion,
    required this.idUsuario,
    required this.onCambio,
    required this.onAviso,
  });

  final Actividad actividad;
  final AsignacionActividad asignacion;
  final int idUsuario;

  /// Se llama tras subir o enviar algo para que la pantalla recargue.
  final Future<void> Function() onCambio;
  final void Function(String) onAviso;

  @override
  Widget build(BuildContext context) {
    final entrega = asignacion.entrega;
    if (entrega == null) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Text(
            'La entrega de esta actividad aún no está habilitada. '
            'Aparecerá cuando el docente la publique.',
            style: TextStyle(color: Colors.black54),
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _BloqueSubida(
          actividad: actividad,
          entrega: entrega,
          onCambio: onCambio,
          onAviso: onAviso,
        ),
        if (actividad.conCoevaluacion) ...[
          const SizedBox(height: 12),
          _BloqueCoevaluacion(
            actividad: actividad,
            entrega: entrega,
            idUsuario: idUsuario,
            onCambio: onCambio,
            onAviso: onAviso,
          ),
        ],
        const SizedBox(height: 12),
        _BloqueCalificacion(
          actividad: actividad,
          entrega: entrega,
          idUsuario: idUsuario,
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Subida de archivos
// ---------------------------------------------------------------------------

class _BloqueSubida extends StatefulWidget {
  const _BloqueSubida({
    required this.actividad,
    required this.entrega,
    required this.onCambio,
    required this.onAviso,
  });

  final Actividad actividad;
  final Entrega entrega;
  final Future<void> Function() onCambio;
  final void Function(String) onAviso;

  @override
  State<_BloqueSubida> createState() => _BloqueSubidaState();
}

class _BloqueSubidaState extends State<_BloqueSubida> {
  final List<String> _rutas = [];
  bool _subiendo = false;

  bool get _abierta => widget.actividad.estado == 'PUBLICADO';

  String _nombre(String ruta) => ruta.split(RegExp(r'[\\/]')).last;

  Future<void> _elegir() async {
    final elegidos = await FilePicker.pickFiles(
      type: FileType.custom,
      allowedExtensions: ActividadService.extensionesPermitidas,
    );
    if (elegidos.isEmpty) return;

    final rechazados = <String>[];
    for (final elegido in elegidos) {
      final ruta = elegido.path;
      if (ruta == null) {
        rechazados.add('${elegido.name} (no se pudo leer)');
        continue;
      }
      if (_rutas.contains(ruta)) continue;
      final bytes = File(ruta).lengthSync();
      if (bytes > ActividadService.maxBytesPorArchivo) {
        rechazados.add('${elegido.name} (supera 25 MB)');
        continue;
      }
      if (_rutas.length >= ActividadService.maxArchivosPorEntrega) {
        rechazados.add('${elegido.name} (máximo '
            '${ActividadService.maxArchivosPorEntrega} archivos por envío)');
        continue;
      }
      _rutas.add(ruta);
    }
    if (!mounted) return;
    setState(() {});
    if (rechazados.isNotEmpty) {
      widget.onAviso('No se agregó: ${rechazados.join('; ')}');
    }
  }

  Future<void> _subir() async {
    if (_rutas.isEmpty || _subiendo) return;
    setState(() => _subiendo = true);
    try {
      await context
          .read<ActividadService>()
          .subirArchivos(widget.entrega.idEntrega, List.of(_rutas));
      if (!mounted) return;
      setState(_rutas.clear);
      widget.onAviso('Entrega registrada');
      await widget.onCambio();
    } on ApiException catch (error) {
      if (mounted) widget.onAviso(error.mensaje);
    } finally {
      if (mounted) setState(() => _subiendo = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final entrega = widget.entrega;
    final vencida = widget.actividad.vencida;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TituloBloque(
              'Tu entrega',
              icono: Icons.upload_file_outlined,
              trailing: InsigniaEstado(
                texto: entrega.entregada ? 'Entregada' : 'Pendiente',
                color: entrega.entregada
                    ? const Color(0xFF15803D)
                    : const Color(0xFFB45309),
              ),
            ),
            if (entrega.entregada && entrega.fechaEntrega != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Text(
                  'Última entrega: ${formatearFechaHora(entrega.fechaEntrega!)}'
                  '${entrega.entregadaATiempo == false ? ' · fuera de plazo' : ''}',
                  style: TextStyle(
                    fontSize: 12,
                    color: entrega.entregadaATiempo == false
                        ? const Color(0xFFB45309)
                        : Colors.black54,
                  ),
                ),
              ),
            if (entrega.archivos.isEmpty)
              const Text('Todavía no has subido archivos.',
                  style: TextStyle(color: Colors.black54, fontSize: 13))
            else
              for (final archivo in entrega.archivos)
                ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(iconoDeArchivo(archivo), color: TemaUpb.rojo),
                  title: Text(archivo.nombre,
                      maxLines: 1, overflow: TextOverflow.ellipsis),
                  subtitle: Text(archivo.tamanoLegible),
                ),
            const Divider(height: 24),
            if (!_abierta)
              const Text(
                'Esta actividad no está recibiendo entregas.',
                style: TextStyle(color: Colors.black54, fontSize: 13),
              )
            else ...[
              if (vencida)
                const Padding(
                  padding: EdgeInsets.only(bottom: 8),
                  child: Text(
                    'La fecha límite ya pasó: el envío quedará registrado como fuera de plazo.',
                    style: TextStyle(color: Color(0xFFB45309), fontSize: 12),
                  ),
                ),
              Text(
                'Formatos: PDF, DOCX, PPTX o ZIP · máx. 25 MB por archivo · '
                'hasta ${ActividadService.maxArchivosPorEntrega} por envío.',
                style: const TextStyle(color: Colors.black54, fontSize: 12),
              ),
              const SizedBox(height: 8),
              for (final ruta in _rutas)
                ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.attach_file, size: 20),
                  title: Text(_nombre(ruta),
                      maxLines: 1, overflow: TextOverflow.ellipsis),
                  trailing: IconButton(
                    icon: const Icon(Icons.close, size: 18),
                    tooltip: 'Quitar',
                    onPressed:
                        _subiendo ? null : () => setState(() => _rutas.remove(ruta)),
                  ),
                ),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _subiendo ? null : _elegir,
                      icon: const Icon(Icons.add),
                      label: const Text('Elegir archivos'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: FilledButton.icon(
                      onPressed:
                          (_rutas.isEmpty || _subiendo) ? null : _subir,
                      icon: _subiendo
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.cloud_upload_outlined),
                      label: Text(_subiendo ? 'Subiendo…' : 'Subir entrega'),
                    ),
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

// ---------------------------------------------------------------------------
// Coevaluación
// ---------------------------------------------------------------------------

class _BloqueCoevaluacion extends StatelessWidget {
  const _BloqueCoevaluacion({
    required this.actividad,
    required this.entrega,
    required this.idUsuario,
    required this.onCambio,
    required this.onAviso,
  });

  final Actividad actividad;
  final Entrega entrega;
  final int idUsuario;
  final Future<void> Function() onCambio;
  final void Function(String) onAviso;

  Future<void> _evaluar(BuildContext context, Coevaluacion pendiente) async {
    final enviada = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => _FormularioCoevaluacion(
        idEntrega: entrega.idEntrega,
        pendiente: pendiente,
        criterios: actividad.criteriosCoevaluacion,
        servicio: context.read<ActividadService>(),
      ),
    );
    if (enviada == true) {
      onAviso('Coevaluación enviada');
      await onCambio();
    }
  }

  @override
  Widget build(BuildContext context) {
    final mias = entrega.coevaluaciones
        .where((c) => c.idEvaluador == idUsuario)
        .toList();
    final pendientes = entrega.pendientesDe(idUsuario);
    final enviadas = mias.length - pendientes.length;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TituloBloque(
              'Coevaluación anónima',
              icono: Icons.groups_outlined,
              trailing: mias.isEmpty
                  ? null
                  : Text('$enviadas / ${mias.length}',
                      style: const TextStyle(
                          fontWeight: FontWeight.w700, fontSize: 13)),
            ),
            if (mias.isEmpty)
              const Text(
                'No tienes compañeros por evaluar en esta actividad.',
                style: TextStyle(color: Colors.black54, fontSize: 13),
              )
            else if (pendientes.isEmpty)
              const Row(
                children: [
                  Icon(Icons.check_circle, color: Color(0xFF15803D), size: 18),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Ya enviaste todas tus coevaluaciones. Los resultados '
                      'aparecen cuando todo el equipo termine.',
                      style: TextStyle(fontSize: 13),
                    ),
                  ),
                ],
              )
            else ...[
              const Text(
                'Evalúa a cada compañero. Una vez enviada, la coevaluación no se puede modificar.',
                style: TextStyle(color: Colors.black54, fontSize: 12),
              ),
              const SizedBox(height: 6),
              for (final pendiente in pendientes)
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const CircleAvatar(
                    backgroundColor: TemaUpb.rojoClaro,
                    child: Icon(Icons.person_outline, color: TemaUpb.rojo),
                  ),
                  title: Text('Evalúa a ${pendiente.nombreEvaluado}'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => _evaluar(context, pendiente),
                ),
            ],
          ],
        ),
      ),
    );
  }
}

class _FormularioCoevaluacion extends StatefulWidget {
  const _FormularioCoevaluacion({
    required this.idEntrega,
    required this.pendiente,
    required this.criterios,
    required this.servicio,
  });

  final int idEntrega;
  final Coevaluacion pendiente;
  final List<CriterioCoevaluacion> criterios;
  final ActividadService servicio;

  @override
  State<_FormularioCoevaluacion> createState() =>
      _FormularioCoevaluacionState();
}

class _FormularioCoevaluacionState extends State<_FormularioCoevaluacion> {
  final Map<int, int> _valores = {};
  final _observacion = TextEditingController();
  bool _enviando = false;
  String? _error;

  @override
  void dispose() {
    _observacion.dispose();
    super.dispose();
  }

  bool get _completo =>
      widget.criterios.isNotEmpty &&
      widget.criterios.every((c) => _valores.containsKey(c.idCriterio));

  Future<void> _enviar() async {
    if (!_completo || _enviando) return;
    setState(() {
      _enviando = true;
      _error = null;
    });
    try {
      await widget.servicio.enviarCoevaluacion(
        widget.idEntrega,
        widget.pendiente.idEvaluado,
        Map.of(_valores),
        observacion: _observacion.text.trim(),
      );
      if (mounted) Navigator.pop(context, true);
    } on ApiException catch (error) {
      if (mounted) setState(() => _error = error.mensaje);
    } finally {
      if (mounted) setState(() => _enviando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final teclado = MediaQuery.of(context).viewInsets.bottom;

    return Padding(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 16 + teclado),
      child: widget.criterios.length != 5
          ? Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Evaluar a ${widget.pendiente.nombreEvaluado}',
                    style: const TextStyle(
                        fontWeight: FontWeight.w800, fontSize: 17)),
                const SizedBox(height: 12),
                const Text(
                  'La rúbrica de coevaluación de esta actividad no tiene los '
                  '5 criterios requeridos. Avisa a tu docente.',
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text('Cerrar'),
                ),
              ],
            )
          : SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text('Evaluar a ${widget.pendiente.nombreEvaluado}',
                      style: const TextStyle(
                          fontWeight: FontWeight.w800, fontSize: 17)),
                  const SizedBox(height: 4),
                  const Text(
                    'Escala: 0, 20, 40, 60, 80 o 100. Tu evaluación es anónima.',
                    style: TextStyle(color: Colors.black54, fontSize: 12),
                  ),
                  const SizedBox(height: 12),
                  for (final criterio in widget.criterios) ...[
                    Text(criterio.nombre,
                        style: const TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 13)),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 6,
                      children: [
                        for (final valor in ActividadService.escalaCoevaluacion)
                          ChoiceChip(
                            label: Text('$valor'),
                            selected: _valores[criterio.idCriterio] == valor,
                            onSelected: _enviando
                                ? null
                                : (_) => setState(
                                    () => _valores[criterio.idCriterio] = valor),
                          ),
                      ],
                    ),
                    const SizedBox(height: 10),
                  ],
                  TextField(
                    controller: _observacion,
                    maxLength: 2000,
                    maxLines: 2,
                    enabled: !_enviando,
                    decoration: const InputDecoration(
                      labelText: 'Observación (opcional)',
                    ),
                  ),
                  if (_error != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Text(_error!,
                          style: const TextStyle(color: Colors.red)),
                    ),
                  FilledButton(
                    onPressed: (_completo && !_enviando) ? _enviar : null,
                    child: Text(_enviando
                        ? 'Enviando…'
                        : _completo
                            ? 'Enviar evaluación'
                            : 'Califica los 5 criterios'),
                  ),
                ],
              ),
            ),
    );
  }
}

// ---------------------------------------------------------------------------
// Calificación
// ---------------------------------------------------------------------------

class _BloqueCalificacion extends StatelessWidget {
  const _BloqueCalificacion({
    required this.actividad,
    required this.entrega,
    required this.idUsuario,
  });

  final Actividad actividad;
  final Entrega entrega;
  final int idUsuario;

  @override
  Widget build(BuildContext context) {
    final notaBase = entrega.notaBase;
    final resultado = entrega.resultadoDe(idUsuario);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const TituloBloque('Tu calificación', icono: Icons.grade_outlined),
            if (notaBase == null)
              const Text('Sin calificar por el docente.',
                  style: TextStyle(
                      color: Colors.black45, fontStyle: FontStyle.italic))
            else ...[
              _FilaNota('Nota base docente', formatearNota(notaBase)),
              if (actividad.conCoevaluacion) ...[
                _FilaNota(
                  'Desempeño en coevaluación',
                  resultado == null
                      ? '⏳ Pendiente'
                      : '${resultado.totalCoevaluacion.toStringAsFixed(1)} %',
                ),
                const Divider(height: 20),
                _FilaNota(
                  'Nota final individual',
                  resultado?.notaFinal != null
                      ? formatearNota(resultado!.notaFinal)
                      : '⚠️ Provisional',
                  destacada: true,
                ),
                if (resultado == null)
                  const Padding(
                    padding: EdgeInsets.only(top: 6),
                    child: Text(
                      'Será definitiva cuando todo el equipo complete la '
                      'coevaluación: N_D = N_B × (F_C / 100).',
                      style: TextStyle(color: Colors.black54, fontSize: 12),
                    ),
                  ),
              ] else ...[
                const Divider(height: 20),
                _FilaNota('Nota final', formatearNota(notaBase),
                    destacada: true),
              ],
            ],
          ],
        ),
      ),
    );
  }
}

class _FilaNota extends StatelessWidget {
  const _FilaNota(this.etiqueta, this.valor, {this.destacada = false});

  final String etiqueta;
  final String valor;
  final bool destacada;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(etiqueta,
                style: TextStyle(
                    fontSize: destacada ? 14 : 13,
                    fontWeight: destacada ? FontWeight.w800 : FontWeight.w500,
                    color: destacada ? Colors.black87 : Colors.black54)),
          ),
          Text(valor,
              style: TextStyle(
                  fontSize: destacada ? 17 : 14,
                  fontWeight: FontWeight.w800,
                  color: destacada ? TemaUpb.rojo : Colors.black87)),
        ],
      ),
    );
  }
}
