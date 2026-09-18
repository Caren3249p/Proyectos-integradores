import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/tema_upb.dart';
import '../models/proyecto.dart';
import '../services/api_client.dart';
import '../services/proyecto_service.dart';
import '../state/sesion.dart';

/// Ficha del proyecto: datos generales, integrantes, campos técnicos,
/// repositorio y la última evaluación registrada.
class ProyectoDetalleScreen extends StatefulWidget {
  const ProyectoDetalleScreen({super.key, required this.idProyecto});

  final int idProyecto;

  @override
  State<ProyectoDetalleScreen> createState() => _ProyectoDetalleScreenState();
}

class _ProyectoDetalleScreenState extends State<ProyectoDetalleScreen> {
  Proyecto? _proyecto;
  String? _error;
  bool _cargando = true;

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    setState(() {
      _cargando = true;
      _error = null;
    });
    try {
      final proyecto =
          await context.read<ProyectoService>().detalle(widget.idProyecto);
      if (mounted) setState(() => _proyecto = proyecto);
    } on ApiException catch (error) {
      if (mounted) setState(() => _error = error.mensaje);
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  void _avisar(String mensaje) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(mensaje)));
  }

  Future<void> _cambiarEstado(String estado) async {
    try {
      await context
          .read<ProyectoService>()
          .actualizarEstado(widget.idProyecto, estado);
      _avisar('Estado actualizado a "${TemaUpb.etiquetaEstado(estado)}"');
      _cargar();
    } on ApiException catch (error) {
      _avisar(error.mensaje);
    }
  }

  Future<void> _agregarIntegrante() async {
    final correo = await _pedirTexto(
      titulo: 'Agregar integrante',
      etiqueta: 'correo@upb.edu.co',
    );
    if (correo == null) return;
    try {
      await context
          .read<ProyectoService>()
          .agregarIntegrante(widget.idProyecto, correo);
      _avisar('Integrante agregado');
      _cargar();
    } on ApiException catch (error) {
      _avisar(error.mensaje);
    }
  }

  Future<void> _enlazarRepositorio() async {
    final url = await _pedirTexto(
      titulo: 'Enlazar repositorio',
      etiqueta: 'https://github.com/usuario/repo',
    );
    if (url == null) return;
    try {
      await context
          .read<ProyectoService>()
          .enlazarRepositorio(widget.idProyecto, url);
      _avisar('Repositorio enlazado');
      _cargar();
    } on ApiException catch (error) {
      _avisar(error.mensaje);
    }
  }

  Future<String?> _pedirTexto({
    required String titulo,
    required String etiqueta,
  }) async {
    final controlador = TextEditingController();
    final valor = await showDialog<String>(
      context: context,
      builder: (contexto) => AlertDialog(
        title: Text(titulo),
        content: TextField(
          controller: controlador,
          autofocus: true,
          decoration: InputDecoration(labelText: etiqueta),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(contexto),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(contexto, controlador.text.trim()),
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
    controlador.dispose();
    return (valor == null || valor.isEmpty) ? null : valor;
  }

  @override
  Widget build(BuildContext context) {
    final usuario = context.watch<Sesion>().usuario;
    final proyecto = _proyecto;

    return Scaffold(
      appBar: AppBar(
        title: Text(proyecto?.titulo ?? 'Proyecto'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _cargando ? null : _cargar,
          ),
        ],
      ),
      body: _cargando
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(_error!, textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                        OutlinedButton(
                          onPressed: _cargar,
                          child: const Text('Reintentar'),
                        ),
                      ],
                    ),
                  ),
                )
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    _Bloque(
                      titulo: 'Información general',
                      hijos: [
                        _Fila(
                            etiqueta: 'Estado',
                            valor:
                                TemaUpb.etiquetaEstado(proyecto!.estado)),
                        _Fila(
                            etiqueta: 'Avance',
                            valor: '${proyecto.porcentajeAvance}%'),
                        _Fila(
                            etiqueta: 'Creador',
                            valor: proyecto.creador?.nombre ?? '—'),
                        _Fila(
                            etiqueta: 'Docente asesor',
                            valor: proyecto.docente?.nombre ??
                                'Sin asignar'),
                        if (proyecto.descripcion.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Text(proyecto.descripcion,
                              style: const TextStyle(color: Colors.black87)),
                        ],
                      ],
                    ),
                    _Bloque(
                      titulo: 'Integrantes (${proyecto.integrantes.length})',
                      accion: usuario != null && !usuario.esDocente
                          ? IconButton(
                              icon: const Icon(Icons.person_add_alt),
                              onPressed: _agregarIntegrante,
                            )
                          : null,
                      hijos: proyecto.integrantes.isEmpty
                          ? [const Text('Sin integrantes registrados')]
                          : proyecto.integrantes
                              .map((integrante) => ListTile(
                                    dense: true,
                                    contentPadding: EdgeInsets.zero,
                                    leading: const Icon(Icons.person_outline),
                                    title: Text(integrante.nombre),
                                    subtitle: Text(integrante.correo),
                                  ))
                              .toList(),
                    ),
                    _Bloque(
                      titulo: 'Campos técnicos',
                      hijos: proyecto.camposTecnicos == null
                          ? [const Text('Aún no se han registrado')]
                          : [
                              _Fila(
                                  etiqueta: 'Lenguaje',
                                  valor: proyecto.camposTecnicos!
                                          .lenguajePrincipal ??
                                      '—'),
                              _Fila(
                                  etiqueta: 'Frameworks',
                                  valor:
                                      proyecto.camposTecnicos!.frameworks ??
                                          '—'),
                              _Fila(
                                  etiqueta: 'Base de datos',
                                  valor:
                                      proyecto.camposTecnicos!.baseDatos ??
                                          '—'),
                              _Fila(
                                  etiqueta: 'Es móvil',
                                  valor: proyecto.camposTecnicos!.esMovil
                                      ? 'Sí'
                                      : 'No'),
                              _Fila(
                                  etiqueta: 'Despliegue',
                                  valor: proyecto.camposTecnicos!
                                          .entornoDespliegue ??
                                      '—'),
                            ],
                    ),
                    _Bloque(
                      titulo: 'Repositorio',
                      accion: usuario != null && !usuario.esDocente
                          ? IconButton(
                              icon: const Icon(Icons.link),
                              onPressed: _enlazarRepositorio,
                            )
                          : null,
                      hijos: [
                        Text(proyecto.urlRepositorio ??
                            'Sin repositorio enlazado'),
                      ],
                    ),
                    if (proyecto.notaFinal != null)
                      _Bloque(
                        titulo: 'Última evaluación',
                        hijos: [
                          _Fila(
                              etiqueta: 'Nota final',
                              valor: proyecto.notaFinal!
                                  .toStringAsFixed(2)),
                          const SizedBox(height: 6),
                          Text(proyecto.retroalimentacion ?? '',
                              style:
                                  const TextStyle(color: Colors.black87)),
                        ],
                      ),
                    const SizedBox(height: 12),
                    if (usuario != null &&
                        !usuario.esDocente &&
                        proyecto.estado != 'en_revision' &&
                        proyecto.estado != 'publicado')
                      ElevatedButton.icon(
                        onPressed: () => _cambiarEstado('en_revision'),
                        icon: const Icon(Icons.send),
                        label: const Text('Enviar a revisión'),
                      ),
                    const SizedBox(height: 24),
                  ],
                ),
    );
  }
}

class _Bloque extends StatelessWidget {
  const _Bloque({required this.titulo, required this.hijos, this.accion});

  final String titulo;
  final List<Widget> hijos;
  final Widget? accion;

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
              children: [
                Expanded(
                  child: Text(
                    titulo,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: TemaUpb.rojo,
                    ),
                  ),
                ),
                if (accion != null) accion!,
              ],
            ),
            const Divider(),
            ...hijos,
          ],
        ),
      ),
    );
  }
}

class _Fila extends StatelessWidget {
  const _Fila({required this.etiqueta, required this.valor});

  final String etiqueta;
  final String valor;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 130,
            child: Text(etiqueta,
                style: const TextStyle(color: Colors.black54, fontSize: 13)),
          ),
          Expanded(
            child: Text(valor,
                style: const TextStyle(fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }
}