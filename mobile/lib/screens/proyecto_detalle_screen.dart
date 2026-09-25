import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/tema_upb.dart';
import '../models/proyecto.dart';
import '../models/tarea_backlog.dart';
import '../models/version_proyecto.dart';
import '../services/api_client.dart';
import '../services/backlog_service.dart';
import '../services/proyecto_service.dart';
import '../services/version_service.dart';
import '../state/sesion.dart';

/// Réplica de FichaProyecto.jsx: mismas 5 pestañas (Ficha Técnica,
/// Versiones y Archivos, Backlog/Kanban, Actas de Asesoría, Evaluación).
/// [pestanaInicial] permite abrir directo en una pestaña desde el drawer.
class ProyectoDetalleScreen extends StatefulWidget {
  const ProyectoDetalleScreen({
    super.key,
    required this.idProyecto,
    this.pestanaInicial = 0,
  });

  final int idProyecto;
  final int pestanaInicial;

  @override
  State<ProyectoDetalleScreen> createState() => _ProyectoDetalleScreenState();
}

class _ProyectoDetalleScreenState extends State<ProyectoDetalleScreen> {
  Proyecto? _proyecto;
  String? _error;
  bool _cargando = true;
  late int _pestana;

  @override
  void initState() {
    super.initState();
    _pestana = widget.pestanaInicial;
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

  @override
  Widget build(BuildContext context) {
    final proyecto = _proyecto;

    return Scaffold(
      backgroundColor: TemaUpb.fondo,
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
              ? _MensajeError(mensaje: _error!, onReintentar: _cargar)
              : Column(
                  children: [
                    _BarraPestanas(
                      seleccionada: _pestana,
                      onSeleccionar: (i) => setState(() => _pestana = i),
                    ),
                    Expanded(
                      child: IndexedStack(
                        index: _pestana,
                        children: [
                          _TabFichaTecnica(
                              proyecto: proyecto!, onCambio: _cargar),
                          _TabVersiones(
                              proyecto: proyecto, onAviso: _avisar),
                          _TabBacklog(
                              proyecto: proyecto, onAviso: _avisar),
                          _TabActas(proyecto: proyecto),
                          _TabEvaluacion(proyecto: proyecto),
                        ],
                      ),
                    ),
                  ],
                ),
    );
  }
}

class _BarraPestanas extends StatelessWidget {
  const _BarraPestanas({required this.seleccionada, required this.onSeleccionar});

  final int seleccionada;
  final void Function(int) onSeleccionar;

  static const _pestanas = [
    ('Ficha Técnica', Icons.description_outlined),
    ('Versiones y Archivos', Icons.layers_outlined),
    ('Backlog / Kanban', Icons.view_kanban_outlined),
    ('Actas de Asesoría', Icons.article_outlined),
    ('Evaluación y Notas', Icons.grade_outlined),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        child: Row(
          children: List.generate(_pestanas.length, (i) {
            final activo = i == seleccionada;
            final (etiqueta, icono) = _pestanas[i];
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: ChoiceChip(
                selected: activo,
                onSelected: (_) => onSeleccionar(i),
                selectedColor: TemaUpb.rojo,
                backgroundColor: const Color(0xFFF5F5F5),
                labelStyle: TextStyle(
                  color: activo ? Colors.white : TemaUpb.textoOscuro,
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                  side: BorderSide.none,
                ),
                avatar: Icon(icono,
                    size: 15, color: activo ? Colors.white : Colors.black45),
                label: Text(etiqueta),
              ),
            );
          }),
        ),
      ),
    );
  }
}

// ==================== PESTAÑA 1: FICHA TÉCNICA ====================

class _TabFichaTecnica extends StatelessWidget {
  const _TabFichaTecnica({required this.proyecto, required this.onCambio});

  final Proyecto proyecto;
  final Future<void> Function() onCambio;

  Future<void> _agregarIntegrante(BuildContext context) async {
    final correo = await _pedirTexto(
        context, titulo: 'Agregar integrante', etiqueta: 'correo@upb.edu.co');
    if (correo == null) return;
    try {
      await context
          .read<ProyectoService>()
          .agregarIntegrante(proyecto.idProyecto, correo);
      onCambio();
    } on ApiException catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(error.mensaje)));
      }
    }
  }

  Future<void> _enlazarRepositorio(BuildContext context) async {
    final url = await _pedirTexto(context,
        titulo: 'Enlazar repositorio',
        etiqueta: 'https://github.com/usuario/repo');
    if (url == null) return;
    try {
      await context
          .read<ProyectoService>()
          .enlazarRepositorio(proyecto.idProyecto, url);
      onCambio();
    } on ApiException catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(error.mensaje)));
      }
    }
  }

  Future<void> _cambiarEstado(BuildContext context, String estado) async {
    try {
      await context
          .read<ProyectoService>()
          .actualizarEstado(proyecto.idProyecto, estado);
      onCambio();
    } on ApiException catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(error.mensaje)));
      }
    }
  }

  static Future<String?> _pedirTexto(BuildContext context,
      {required String titulo, required String etiqueta}) async {
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
              child: const Text('Cancelar')),
          ElevatedButton(
              onPressed: () => Navigator.pop(contexto, controlador.text.trim()),
              child: const Text('Guardar')),
        ],
      ),
    );
    controlador.dispose();
    return (valor == null || valor.isEmpty) ? null : valor;
  }

  @override
  Widget build(BuildContext context) {
    final usuario = context.watch<Sesion>().usuario;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _Bloque(
          titulo: 'Información general',
          hijos: [
            _Fila(etiqueta: 'Estado', valor: TemaUpb.etiquetaEstado(proyecto.estado)),
            _Fila(etiqueta: 'Avance', valor: '${proyecto.porcentajeAvance}%'),
            _Fila(etiqueta: 'Creador', valor: proyecto.creador?.nombre ?? '—'),
            _Fila(
                etiqueta: 'Docente asesor',
                valor: proyecto.docente?.nombre ?? 'Sin asignar'),
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
                  onPressed: () => _agregarIntegrante(context),
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
                      valor: proyecto.camposTecnicos!.lenguajePrincipal ?? '—'),
                  _Fila(
                      etiqueta: 'Frameworks',
                      valor: proyecto.camposTecnicos!.frameworks ?? '—'),
                  _Fila(
                      etiqueta: 'Base de datos',
                      valor: proyecto.camposTecnicos!.baseDatos ?? '—'),
                  _Fila(
                      etiqueta: 'Es móvil',
                      valor: proyecto.camposTecnicos!.esMovil ? 'Sí' : 'No'),
                  _Fila(
                      etiqueta: 'Despliegue',
                      valor:
                          proyecto.camposTecnicos!.entornoDespliegue ?? '—'),
                ],
        ),
        _Bloque(
          titulo: 'Repositorio',
          accion: usuario != null && !usuario.esDocente
              ? IconButton(
                  icon: const Icon(Icons.link),
                  onPressed: () => _enlazarRepositorio(context),
                )
              : null,
          hijos: [Text(proyecto.urlRepositorio ?? 'Sin repositorio enlazado')],
        ),
        const SizedBox(height: 8),
        if (usuario != null &&
            !usuario.esDocente &&
            proyecto.estado != 'en_revision' &&
            proyecto.estado != 'publicado')
          ElevatedButton.icon(
            onPressed: () => _cambiarEstado(context, 'en_revision'),
            icon: const Icon(Icons.send),
            label: const Text('Enviar a revisión'),
          ),
        const SizedBox(height: 24),
      ],
    );
  }
}

// ==================== PESTAÑA 2: VERSIONES Y ARCHIVOS ====================

class _TabVersiones extends StatefulWidget {
  const _TabVersiones({required this.proyecto, required this.onAviso});

  final Proyecto proyecto;
  final void Function(String) onAviso;

  @override
  State<_TabVersiones> createState() => _TabVersionesState();
}

class _TabVersionesState extends State<_TabVersiones> {
  final List<VersionProyecto> _versiones = [];
  bool _cargando = false;
  bool _huboError = false;

  @override
  void initState() {
    super.initState();
    // El backend no expone "listar versiones"; se van agregando a medida
    // que el usuario crea versiones nuevas en esta sesión.
  }

  Future<void> _crearVersion() async {
    setState(() => _cargando = true);
    try {
      final version = await context
          .read<VersionService>()
          .crearVersion(widget.proyecto.idProyecto);
      setState(() {
        _versiones.insert(0, version);
        _huboError = false;
      });
      widget.onAviso('Versión ${version.numero} creada');
    } on ApiException catch (error) {
      setState(() => _huboError = true);
      widget.onAviso(error.mensaje);
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

Future<void> _subirArchivo(VersionProyecto version) async {
    final archivoElegido = await FilePicker.pickFile();
    if (archivoElegido == null || archivoElegido.path == null) return;

    widget.onAviso('Subiendo archivo...');
    try {
      final archivo = await context.read<VersionService>().subirArchivo(
            version.idVersion,
            archivoElegido.path!,
          );
      setState(() {
        final indice =
            _versiones.indexWhere((v) => v.idVersion == version.idVersion);
        if (indice != -1) {
          final actual = _versiones[indice];
          _versiones[indice] = VersionProyecto(
            idVersion: actual.idVersion,
            numero: actual.numero,
            esFinal: actual.esFinal,
            fechaCreacion: actual.fechaCreacion,
            archivos: [...actual.archivos, archivo],
          );
        }
      });
      widget.onAviso('"${archivo.nombre}" subido');
    } on ApiException catch (error) {
      widget.onAviso(error.mensaje);
    }
  }

  Future<void> _marcarFinal(VersionProyecto version) async {
    try {
      final actualizada =
          await context.read<VersionService>().marcarFinal(version.idVersion);
      setState(() {
        final indice =
            _versiones.indexWhere((v) => v.idVersion == version.idVersion);
        if (indice != -1) _versiones[indice] = actualizada;
      });
      widget.onAviso('Versión ${version.numero} marcada como final');
    } on ApiException catch (error) {
      widget.onAviso(error.mensaje);
    }
  }

  @override
  Widget build(BuildContext context) {
    final usuario = context.watch<Sesion>().usuario;
    final puedeCrear = usuario != null &&
        !usuario.esDocente &&
        widget.proyecto.estado != 'publicado';

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (puedeCrear)
          ElevatedButton.icon(
            onPressed: _cargando ? null : _crearVersion,
            icon: _cargando
                ? const SizedBox(
                    height: 16,
                    width: 16,
                    child:
                        CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Icon(Icons.add),
            label: const Text('Nueva versión'),
          )
        else
          const Text(
            'Solo el equipo puede crear versiones, y no una vez el '
            'proyecto está publicado.',
            style: TextStyle(fontSize: 12, color: TemaUpb.textoGris),
          ),
        const SizedBox(height: 16),
        if (_versiones.isEmpty && !_huboError)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 32),
            child: Center(
              child: Text(
                'Aún no has creado versiones en esta sesión.\n'
                'Usa el botón de arriba para registrar la primera.',
                textAlign: TextAlign.center,
                style: TextStyle(color: TemaUpb.textoGris),
              ),
            ),
          ),
        ..._versiones.map((version) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(version.numero,
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 14)),
                      const SizedBox(width: 8),
                      if (version.esFinal)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(20),
                            border:
                                Border.all(color: const Color(0xFFA7F3D0)),
                          ),
                          child: const Text('FINAL',
                              style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF059669))),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (version.archivos.isEmpty)
                    const Text('Sin archivos todavía',
                        style: TextStyle(
                            fontSize: 12, color: TemaUpb.textoGris))
                  else
                    ...version.archivos.map((a) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 2),
                          child: Row(
                            children: [
                              const Icon(Icons.insert_drive_file_outlined,
                                  size: 14, color: Colors.black45),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(a.nombre,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 12)),
                              ),
                              Text(a.tamanoLegible,
                                  style: const TextStyle(
                                      fontSize: 10,
                                      color: TemaUpb.textoGris)),
                            ],
                          ),
                        )),
                  const SizedBox(height: 10),
                  if (!version.esFinal)
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => _subirArchivo(version),
                            icon: const Icon(Icons.upload_file, size: 16),
                            label: const Text('Subir archivo',
                                style: TextStyle(fontSize: 12)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => _marcarFinal(version),
                            icon: const Icon(Icons.lock_outline, size: 16),
                            label: const Text('Marcar final',
                                style: TextStyle(fontSize: 12)),
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            )),
      ],
    );
  }
}

// ==================== PESTAÑA 3: BACKLOG / KANBAN ====================

class _TabBacklog extends StatefulWidget {
  const _TabBacklog({required this.proyecto, required this.onAviso});

  final Proyecto proyecto;
  final void Function(String) onAviso;

  @override
  State<_TabBacklog> createState() => _TabBacklogState();
}

class _TabBacklogState extends State<_TabBacklog> {
  late Future<BacklogResultado> _futuro;

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  void _cargar() {
    _futuro =
        context.read<BacklogService>().obtener(widget.proyecto.idProyecto);
  }

  Future<void> _recargar() async {
    setState(_cargar);
    await _futuro.catchError(
        (_) => const BacklogResultado(tareas: [], porcentajeAvance: 0));
  }

  Future<void> _crearTarea() async {
    final controlador = TextEditingController();
    final titulo = await showDialog<String>(
      context: context,
      builder: (contexto) => AlertDialog(
        title: const Text('Nueva tarea'),
        content: TextField(
          controller: controlador,
          autofocus: true,
          decoration: const InputDecoration(labelText: 'Título de la tarea'),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(contexto),
              child: const Text('Cancelar')),
          ElevatedButton(
              onPressed: () => Navigator.pop(contexto, controlador.text.trim()),
              child: const Text('Crear')),
        ],
      ),
    );
    controlador.dispose();
    if (titulo == null || titulo.isEmpty) return;

    try {
      await context
          .read<BacklogService>()
          .crearTarea(widget.proyecto.idProyecto, titulo: titulo);
      widget.onAviso('Tarea creada');
      _recargar();
    } on ApiException catch (error) {
      widget.onAviso(error.mensaje);
    }
  }

  Future<void> _moverTarea(TareaBacklog tarea, String nuevoEstado) async {
    try {
      await context.read<BacklogService>().actualizarEstado(
          widget.proyecto.idProyecto, tarea.id, nuevoEstado);
      _recargar();
    } on ApiException catch (error) {
      widget.onAviso(error.mensaje);
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _recargar,
      child: FutureBuilder<BacklogResultado>(
        future: _futuro,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            final error = snapshot.error;
            final noSincronizado =
                error is ApiException && error.statusCode == 400;
            return ListView(
              padding: const EdgeInsets.all(32),
              children: [
                const SizedBox(height: 40),
                Icon(
                  noSincronizado
                      ? Icons.cloud_off_outlined
                      : Icons.error_outline,
                  size: 48,
                  color: Colors.black26,
                ),
                const SizedBox(height: 12),
                Text(
                  noSincronizado
                      ? 'Este proyecto aún no está sincronizado con Plane'
                      : (error is ApiException
                          ? error.mensaje
                          : 'No se pudo cargar el backlog'),
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: TemaUpb.textoGris),
                ),
              ],
            );
          }

          final resultado = snapshot.data!;
          final columnas = {
            'por_hacer': 'Por hacer',
            'en_progreso': 'En progreso',
            'hecho': 'Hecho',
          };

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Row(
                children: [
                  Expanded(
                    child: LinearProgressIndicator(
                      value: resultado.porcentajeAvance / 100,
                      minHeight: 8,
                      backgroundColor: Colors.grey.shade200,
                      color: TemaUpb.rojo,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text('${resultado.porcentajeAvance}%',
                      style:
                          const TextStyle(fontWeight: FontWeight.w700)),
                ],
              ),
              const SizedBox(height: 14),
              ElevatedButton.icon(
                onPressed: _crearTarea,
                icon: const Icon(Icons.add),
                label: const Text('Nueva tarea'),
              ),
              const SizedBox(height: 16),
              ...columnas.entries.map((columna) {
                final tareas = resultado.tareas
                    .where((t) => t.estado == columna.key)
                    .toList();
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${columna.value} (${tareas.length})',
                            style: const TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 13)),
                        const SizedBox(height: 8),
                        if (tareas.isEmpty)
                          const Text('Sin tareas',
                              style: TextStyle(
                                  fontSize: 12, color: TemaUpb.textoGris))
                        else
                          ...tareas.map((t) => Container(
                                margin: const EdgeInsets.only(bottom: 6),
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFAFAFA),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Text(t.titulo,
                                          style:
                                              const TextStyle(fontSize: 12.5)),
                                    ),
                                    PopupMenuButton<String>(
                                      icon: const Icon(Icons.more_horiz,
                                          size: 18),
                                      onSelected: (nuevo) =>
                                          _moverTarea(t, nuevo),
                                      itemBuilder: (context) => columnas
                                          .entries
                                          .where((e) => e.key != t.estado)
                                          .map((e) => PopupMenuItem(
                                                value: e.key,
                                                child: Text(
                                                    'Mover a ${e.value}'),
                                              ))
                                          .toList(),
                                    ),
                                  ],
                                ),
                              )),
                      ],
                    ),
                  ),
                );
              }),
            ],
          );
        },
      ),
    );
  }
}

// ==================== PESTAÑA 4: ACTAS DE ASESORÍA ====================
// Igual que en la web: no hay endpoint de backend para esto todavía, es
// una lista que vive solo mientras dure esta pantalla abierta.

class _TabActas extends StatefulWidget {
  const _TabActas({required this.proyecto});

  final Proyecto proyecto;

  @override
  State<_TabActas> createState() => _TabActasState();
}

class _ActaLocal {
  _ActaLocal({required this.titulo, required this.notas})
      : fecha = DateTime.now();
  final String titulo;
  final String notas;
  final DateTime fecha;
}

class _TabActasState extends State<_TabActas> {
  final List<_ActaLocal> _actas = [];

  Future<void> _nuevaActa() async {
    final tituloCtrl = TextEditingController();
    final notasCtrl = TextEditingController();
    final guardar = await showDialog<bool>(
      context: context,
      builder: (contexto) => AlertDialog(
        title: const Text('Nueva acta de asesoría'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: tituloCtrl,
              autofocus: true,
              decoration: const InputDecoration(labelText: 'Título de la reunión'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: notasCtrl,
              maxLines: 4,
              decoration: const InputDecoration(labelText: 'Notas / acuerdos'),
            ),
          ],
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(contexto, false),
              child: const Text('Cancelar')),
          ElevatedButton(
              onPressed: () => Navigator.pop(contexto, true),
              child: const Text('Guardar')),
        ],
      ),
    );
    if (guardar != true || tituloCtrl.text.trim().isEmpty) return;
    setState(() {
      _actas.insert(
        0,
        _ActaLocal(titulo: tituloCtrl.text.trim(), notas: notasCtrl.text.trim()),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFFFFFBEB),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFFDE68A)),
          ),
          child: const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.info_outline, size: 16, color: Color(0xFFB45309)),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Las actas todavía no se guardan en el servidor '
                  '(tampoco en la versión web). Se pierden al cerrar '
                  'esta pantalla.',
                  style: TextStyle(fontSize: 11.5, color: Color(0xFF92400E)),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        ElevatedButton.icon(
          onPressed: _nuevaActa,
          icon: const Icon(Icons.add),
          label: const Text('Registrar acta'),
        ),
        const SizedBox(height: 16),
        if (_actas.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: Center(
              child: Text('Sin actas registradas en esta sesión.',
                  style: TextStyle(color: TemaUpb.textoGris)),
            ),
          ),
        ..._actas.map((acta) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(acta.titulo,
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 4),
                  Text(
                    '${acta.fecha.day}/${acta.fecha.month}/${acta.fecha.year}',
                    style:
                        const TextStyle(fontSize: 11, color: TemaUpb.textoGris),
                  ),
                  if (acta.notas.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(acta.notas,
                        style: const TextStyle(fontSize: 12.5)),
                  ],
                ],
              ),
            )),
      ],
    );
  }
}

// ==================== PESTAÑA 5: EVALUACIÓN Y NOTAS ====================

class _TabEvaluacion extends StatelessWidget {
  const _TabEvaluacion({required this.proyecto});

  final Proyecto proyecto;

  @override
  Widget build(BuildContext context) {
    if (proyecto.notaFinal == null) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          SizedBox(height: 60),
          Icon(Icons.grade_outlined, size: 48, color: Colors.black26),
          SizedBox(height: 12),
          Center(
            child: Text(
              'Este proyecto aún no tiene evaluaciones registradas.',
              textAlign: TextAlign.center,
              style: TextStyle(color: TemaUpb.textoGris),
            ),
          ),
        ],
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Última evaluación',
                  style: TextStyle(fontSize: 12, color: TemaUpb.textoGris)),
              const SizedBox(height: 6),
              Text(proyecto.notaFinal!.toStringAsFixed(2),
                  style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                      color: TemaUpb.rojo)),
              if ((proyecto.retroalimentacion ?? '').isNotEmpty) ...[
                const SizedBox(height: 12),
                const Divider(),
                const SizedBox(height: 8),
                const Text('Retroalimentación',
                    style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: TemaUpb.textoGris)),
                const SizedBox(height: 4),
                Text(proyecto.retroalimentacion!,
                    style: const TextStyle(fontSize: 13)),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

// ==================== WIDGETS COMPARTIDOS ====================

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
                        fontWeight: FontWeight.bold, color: TemaUpb.rojo),
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
            child:
                Text(valor, style: const TextStyle(fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }
}

class _MensajeError extends StatelessWidget {
  const _MensajeError({required this.mensaje, required this.onReintentar});

  final String mensaje;
  final Future<void> Function() onReintentar;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(mensaje, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            OutlinedButton(
                onPressed: onReintentar, child: const Text('Reintentar')),
          ],
        ),
      ),
    );
  }
}