import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/tema_upb.dart';
import '../models/proyecto.dart';
import '../services/api_client.dart';
import '../services/proyecto_service.dart';
import '../state/sesion.dart';
import '../widgets/proyecto_card.dart';
import 'proyecto_detalle_screen.dart';

/// Réplica de DashboardDocente.jsx: banner dorado, tarjetas de resumen,
/// "Mis proyectos asignados" con buscador, y la sección plegable de
/// "Proyectos Disponibles para Tomar".
class DocenteDashboardScreen extends StatefulWidget {
  const DocenteDashboardScreen({super.key});

  @override
  State<DocenteDashboardScreen> createState() =>
      _DocenteDashboardScreenState();
}

class _DocenteDashboardScreenState extends State<DocenteDashboardScreen> {
  late Future<List<Proyecto>> _asignados;
  late Future<List<Proyecto>> _sinAsesor;
  final _busquedaCtrl = TextEditingController();
  bool _mostrarSinAsesor = true;

  @override
  void initState() {
    super.initState();
    _cargarTodo();
  }

  @override
  void dispose() {
    _busquedaCtrl.dispose();
    super.dispose();
  }

  void _cargarTodo() {
    final servicio = context.read<ProyectoService>();
    _asignados = servicio.misProyectos();
    _sinAsesor = servicio.sinDocente();
  }

  Future<void> _recargar() async {
    setState(_cargarTodo);
    await Future.wait([
      _asignados.catchError((_) => <Proyecto>[]),
      _sinAsesor.catchError((_) => <Proyecto>[]),
    ]);
  }

  void _avisar(String mensaje) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(mensaje)));
  }

  Future<void> _tomar(Proyecto proyecto) async {
    try {
      await context.read<ProyectoService>().tomarComoAsesor(
        proyecto.idProyecto,
      );
      _avisar('Ahora asesoras "${proyecto.titulo}"');
      _recargar();
    } on ApiException catch (error) {
      _avisar(error.mensaje);
    }
  }

  Future<void> _abrirDetalle(Proyecto proyecto) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ProyectoDetalleScreen(idProyecto: proyecto.idProyecto),
      ),
    );
    if (mounted) _recargar();
  }

  @override
  Widget build(BuildContext context) {
    final usuario = context.watch<Sesion>().usuario;
    if (usuario == null) return const SizedBox.shrink();

    return RefreshIndicator(
      onRefresh: _recargar,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: [
          _BannerDocente(nombre: usuario.nombre),
          const SizedBox(height: 18),
          FutureBuilder<List<Proyecto>>(
            future: _asignados,
            builder: (context, snapshot) {
              final proyectos = snapshot.data ?? const <Proyecto>[];
              final pendientes = proyectos
                  .where((p) => p.notaFinal == null)
                  .length;
              final calificados = proyectos.length - pendientes;

              return Row(
                children: [
                  Expanded(
                    child: _TarjetaEstadistica(
                      etiqueta: 'Mis Proyectos',
                      valor: '${proyectos.length}',
                      subEtiqueta: 'Asignados a ti',
                      colorSub: const Color(0xFF059669),
                      icono: Icons.layers_outlined,
                      colorIcono: TemaUpb.textoOscuro,
                      fondoIcono: const Color(0xFFF5F5F5),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _TarjetaEstadistica(
                      etiqueta: 'Por Calificar',
                      valor: '$pendientes',
                      subEtiqueta: 'Sin nota',
                      colorSub: const Color(0xFFD97706),
                      icono: Icons.hourglass_empty,
                      colorIcono: const Color(0xFFD97706),
                      fondoIcono: const Color(0xFFFFFBEB),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _TarjetaEstadistica(
                      etiqueta: 'Evaluados',
                      valor: '$calificados',
                      subEtiqueta: 'Con nota',
                      colorSub: const Color(0xFF059669),
                      icono: Icons.check_circle_outline,
                      colorIcono: const Color(0xFF059669),
                      fondoIcono: const Color(0xFFECFDF5),
                    ),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 20),

          // --- Mis proyectos asignados ---
          const Text('Mis Proyectos Asignados',
              style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: TemaUpb.textoOscuro)),
          const SizedBox(height: 2),
          const Text('Solo los proyectos donde eres el asesor registrado.',
              style: TextStyle(fontSize: 11.5, color: TemaUpb.textoGris)),
          const SizedBox(height: 10),
          TextField(
            controller: _busquedaCtrl,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              hintText: 'Buscar proyecto o estudiante...',
              hintStyle: const TextStyle(fontSize: 12.5),
              prefixIcon: const Icon(Icons.search, size: 18),
              filled: true,
              fillColor: Colors.white,
              contentPadding:
              const EdgeInsets.symmetric(vertical: 4, horizontal: 12),
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.black.withValues(alpha: 0.08))),
            ),
          ),
          const SizedBox(height: 12),
          FutureBuilder<List<Proyecto>>(
            future: _asignados,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: Center(child: CircularProgressIndicator()),
                );
              }
              if (snapshot.hasError) {
                return Text(
                  snapshot.error is ApiException
                      ? (snapshot.error as ApiException).mensaje
                      : 'No se pudieron cargar tus proyectos',
                  style: const TextStyle(color: TemaUpb.textoGris),
                );
              }

              final termino = _busquedaCtrl.text.trim().toLowerCase();
              final proyectos = (snapshot.data ?? const <Proyecto>[])
                  .where((p) =>
              termino.isEmpty ||
                  p.titulo.toLowerCase().contains(termino) ||
                  (p.creador?.nombre.toLowerCase().contains(termino) ??
                      false))
                  .toList();

              if (proyectos.isEmpty) {
                return Container(
                  padding: const EdgeInsets.symmetric(vertical: 40),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Column(
                    children: [
                      Icon(Icons.folder_open_outlined,
                          size: 34, color: Colors.black26),
                      SizedBox(height: 10),
                      Text('Aún no tienes proyectos asignados',
                          style: TextStyle(
                              fontSize: 13, fontWeight: FontWeight.w600)),
                      SizedBox(height: 4),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 24),
                        child: Text(
                          'Desplázate a "Proyectos Disponibles" y '
                              'asígnate como asesor.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              fontSize: 11.5, color: TemaUpb.textoGris),
                        ),
                      ),
                    ],
                  ),
                );
              }

              return Column(
                children: proyectos
                    .map((p) => ProyectoCard(
                  proyecto: p,
                  onTap: () => _abrirDetalle(p),
                ))
                    .toList(),
              );
            },
          ),

          const SizedBox(height: 24),

          // --- Proyectos disponibles para tomar (plegable) ---
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                InkWell(
                  borderRadius: BorderRadius.circular(20),
                  onTap: () =>
                      setState(() => _mostrarSinAsesor = !_mostrarSinAsesor),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          width: 38,
                          height: 38,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFFBEB),
                            borderRadius: BorderRadius.circular(14),
                            border:
                            Border.all(color: const Color(0xFFFDE68A)),
                          ),
                          child: const Icon(Icons.error_outline,
                              size: 18, color: Color(0xFFD97706)),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Proyectos Disponibles para Tomar',
                                  style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold)),
                              const SizedBox(height: 2),
                              const Text(
                                'Proyectos sin docente asesor asignado.',
                                style: TextStyle(
                                    fontSize: 11, color: TemaUpb.textoGris),
                              ),
                            ],
                          ),
                        ),
                        Icon(
                          _mostrarSinAsesor
                              ? Icons.keyboard_arrow_up
                              : Icons.keyboard_arrow_down,
                          color: Colors.black38,
                        ),
                      ],
                    ),
                  ),
                ),
                if (_mostrarSinAsesor)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    child: FutureBuilder<List<Proyecto>>(
                      future: _sinAsesor,
                      builder: (context, snapshot) {
                        if (snapshot.connectionState ==
                            ConnectionState.waiting) {
                          return const Padding(
                            padding: EdgeInsets.symmetric(vertical: 16),
                            child:
                            Center(child: CircularProgressIndicator()),
                          );
                        }
                        final proyectos =
                            snapshot.data ?? const <Proyecto>[];
                        if (proyectos.isEmpty) {
                          return Container(
                            padding: const EdgeInsets.symmetric(
                                vertical: 24),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                  color: Colors.black12,
                                  style: BorderStyle.solid),
                            ),
                            child: const Column(
                              children: [
                                Icon(Icons.check_circle_outline,
                                    color: Color(0xFF34D399), size: 22),
                                SizedBox(height: 6),
                                Text(
                                  'Todos los proyectos tienen asesor '
                                      'asignado. ¡Buen trabajo!',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                      fontSize: 11.5,
                                      color: TemaUpb.textoGris),
                                ),
                              ],
                            ),
                          );
                        }
                        return Column(
                          children: proyectos
                              .map((p) => Container(
                            margin:
                            const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFAFAFA),
                              borderRadius:
                              BorderRadius.circular(16),
                              border: Border.all(
                                  color: Colors.black12),
                            ),
                            child: Column(
                              crossAxisAlignment:
                              CrossAxisAlignment.start,
                              children: [
                                Text(p.titulo,
                                    style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight:
                                        FontWeight.bold)),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(
                                        Icons.school_outlined,
                                        size: 13,
                                        color: Colors.black38),
                                    const SizedBox(width: 4),
                                    Expanded(
                                      child: Text(
                                        '${p.creador?.nombre ?? "—"}'
                                            ' · ${p.integrantes.length}'
                                            ' integrante(s)',
                                        style: const TextStyle(
                                            fontSize: 11,
                                            color: TemaUpb
                                                .textoGris),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Row(
                                  children: [
                                    Expanded(
                                      child: FilledButton.icon(
                                        onPressed: () =>
                                            _tomar(p),
                                        icon: const Icon(
                                            Icons.person_add_alt,
                                            size: 15),
                                        label: const Text(
                                            'Asignarme',
                                            style: TextStyle(
                                                fontSize: 12)),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    OutlinedButton(
                                      onPressed: () =>
                                          _abrirDetalle(p),
                                      child: const Text('Ver',
                                          style: TextStyle(
                                              fontSize: 12)),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ))
                              .toList(),
                        );
                      },
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _BannerDocente extends StatelessWidget {
  const _BannerDocente({required this.nombre});

  final String nombre;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [Color(0xFF1A1A1A), Color(0xFF2A2020), Color(0xFF1A1A1A)],
        ),
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                Icon(Icons.school_outlined, size: 13, color: TemaUpb.dorado),
                SizedBox(width: 6),
                Text('Panel Docente / Asesor UPB',
                    style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: TemaUpb.dorado)),
              ],
            ),
          ),
          const SizedBox(height: 14),
          RichText(
            text: TextSpan(
              style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: Colors.white),
              children: [
                const TextSpan(text: 'Bienvenido, '),
                TextSpan(
                    text: nombre,
                    style: const TextStyle(color: TemaUpb.dorado)),
              ],
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Solo ves los proyectos que tienes asignados como asesor. '
                'Toma proyectos disponibles más abajo.',
            style: TextStyle(fontSize: 12.5, color: Colors.white54),
          ),
        ],
      ),
    );
  }
}

class _TarjetaEstadistica extends StatelessWidget {
  const _TarjetaEstadistica({
    required this.etiqueta,
    required this.valor,
    required this.subEtiqueta,
    required this.colorSub,
    required this.icono,
    required this.colorIcono,
    required this.fondoIcono,
  });

  final String etiqueta;
  final String valor;
  final String subEtiqueta;
  final Color colorSub;
  final IconData icono;
  final Color colorIcono;
  final Color fondoIcono;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 34,
            height: 34,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: fondoIcono,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icono, size: 17, color: colorIcono),
          ),
          const SizedBox(height: 10),
          Text(valor,
              style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: TemaUpb.textoOscuro)),
          Text(etiqueta,
              style: const TextStyle(fontSize: 9.5, color: TemaUpb.textoGris)),
          const SizedBox(height: 2),
          Text(subEtiqueta,
              style: TextStyle(
                  fontSize: 9.5,
                  fontWeight: FontWeight.w600,
                  color: colorSub)),
        ],
      ),
    );
  }
}