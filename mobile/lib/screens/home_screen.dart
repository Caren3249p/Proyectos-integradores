import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/tema_upb.dart';
import '../models/proyecto.dart';
import '../services/api_client.dart';
import '../services/proyecto_service.dart';
import '../state/sesion.dart';
import '../widgets/app_drawer.dart';
import '../widgets/proyecto_card.dart';
import 'crear_proyecto_screen.dart';
import 'docente_dashboard_screen.dart';
import 'proyecto_detalle_screen.dart';
import 'proyectos_sin_asesor_screen.dart';

/// Réplica del dashboard web (frontend/src/pages/DashboardEstudiante.jsx):
/// mismo banner oscuro de bienvenida y mismo estado vacío cuando el
/// estudiante aún no tiene proyecto.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<List<Proyecto>> _futuro;

  @override
  void initState() {
    super.initState();
    _futuro = context.read<ProyectoService>().misProyectos();
  }

  Future<void> _recargar() async {
    final futuro = context.read<ProyectoService>().misProyectos();
    setState(() => _futuro = futuro);
    await futuro.catchError((_) => <Proyecto>[]);
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

  Future<void> _crearProyecto() async {
    final creado = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => const CrearProyectoScreen()),
    );
    if (creado == true && mounted) _recargar();
  }

  void _pendiente(String funcion) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$funcion — próximamente')),
    );
  }

  void _manejarMenu(String accion) {
    switch (accion) {
      case 'mi_proyecto':
        break; // ya estamos aquí
      case 'sin_asesor':
        Navigator.push(
          context,
          MaterialPageRoute(
              builder: (_) => const ProyectosSinAsesorScreen()),
        ).then((_) => _recargar());
        break;
      case 'ficha':
        _pendiente('Ficha & Entregas');
        break;
      case 'backlog':
        _pendiente('Backlog / Kanban');
        break;
      case 'actas':
        _pendiente('Actas de Asesoría');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final usuario = context.watch<Sesion>().usuario;
    if (usuario == null) return const SizedBox.shrink();

    return Scaffold(
      backgroundColor: TemaUpb.fondo,
      drawer: AppDrawer(onSeleccionar: _manejarMenu),
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: TemaUpb.textoOscuro,
        elevation: 0,
        titleSpacing: 0,
        title: Row(
          children: [
            const Text('UPB Bucaramanga',
                style: TextStyle(fontSize: 12, color: Colors.black45)),
            const SizedBox(width: 6),
            const Text('/', style: TextStyle(color: Colors.black26)),
            const SizedBox(width: 6),
            const Flexible(
              child: Text(
                'Proyectos Integradores 2026',
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: TemaUpb.textoOscuro),
              ),
            ),
          ],
        ),
        actions: [
          if (usuario.esDocente)
            IconButton(
              tooltip: 'Proyectos sin asesor',
              icon: const Icon(Icons.how_to_reg_outlined),
              onPressed: () async {
                await Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => const ProyectosSinAsesorScreen()),
                );
                if (mounted) _recargar();
              },
            ),
          const SizedBox(width: 4),
        ],
      ),
      floatingActionButton: usuario.esDocente
          ? null
          : FloatingActionButton.extended(
        onPressed: _crearProyecto,
        backgroundColor: TemaUpb.rojo,
        icon: const Icon(Icons.add),
        label: const Text('Nuevo proyecto'),
      ),
      body: usuario.esDocente
          ? const DocenteDashboardScreen()
          : RefreshIndicator(
        onRefresh: _recargar,
        child: FutureBuilder<List<Proyecto>>(
          future: _futuro,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }

            if (snapshot.hasError) {
              return _ErrorConexion(
                mensaje: snapshot.error is ApiException
                    ? (snapshot.error as ApiException).mensaje
                    : 'Error inesperado',
                onReintentar: _recargar,
              );
            }

            final proyectos = snapshot.data ?? const <Proyecto>[];

            return ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 90),
              children: [
                _BannerBienvenida(usuario: usuario, onCrear: _crearProyecto),
                const SizedBox(height: 18),
                if (proyectos.isEmpty)
                  _EstadoVacio(
                    correo: usuario.correo,
                    esDocente: usuario.esDocente,
                    onCrear: _crearProyecto,
                  )
                else if (proyectos.length == 1)
                  ProyectoCard(
                    proyecto: proyectos.first,
                    onTap: () => _abrirDetalle(proyectos.first),
                  )
                else ...[
                    Text(
                      usuario.esDocente ? 'Mis asesorías' : 'Mis proyectos',
                      style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: TemaUpb.textoOscuro),
                    ),
                    const SizedBox(height: 4),
                    Text('${proyectos.length} registrados',
                        style: const TextStyle(
                            fontSize: 12, color: TemaUpb.textoGris)),
                    const SizedBox(height: 10),
                    ...proyectos.map((p) => ProyectoCard(
                      proyecto: p,
                      onTap: () => _abrirDetalle(p),
                    )),
                  ],
              ],
            );
          },
        ),
      ),
    );
  }
}

/// Banner de bienvenida oscuro con degradado, igual al de la web.
class _BannerBienvenida extends StatelessWidget {
  const _BannerBienvenida({required this.usuario, required this.onCrear});

  final dynamic usuario;
  final VoidCallback onCrear;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [Color(0xFF1A1A1A), Color(0xFF242424), Color(0xFF1A1A1A)],
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
              border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                Icon(Icons.auto_awesome, size: 13, color: TemaUpb.dorado),
                SizedBox(width: 6),
                Text(
                  'Semestre Académico 2026-10',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: TemaUpb.dorado,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          RichText(
            text: TextSpan(
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
              children: [
                const TextSpan(text: 'Bienvenido, '),
                TextSpan(
                  text: usuario.nombre as String,
                  style: const TextStyle(color: TemaUpb.dorado),
                ),
              ],
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Plataforma de gestión y seguimiento continuo de '
                'Proyectos Integradores UPB.',
            style: TextStyle(fontSize: 12.5, color: Colors.white54),
          ),
          if (!(usuario.esDocente as bool)) ...[
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: onCrear,
              style: OutlinedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: TemaUpb.textoOscuro,
                side: BorderSide.none,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              icon: const Icon(Icons.create_new_folder_outlined, size: 18),
              label: const Text('Nuevo Proyecto',
                  style: TextStyle(fontWeight: FontWeight.w700)),
            ),
          ],
        ],
      ),
    );
  }
}

/// Estado vacío — mismo texto, ícono y botón que la captura de la web.
class _EstadoVacio extends StatelessWidget {
  const _EstadoVacio({
    required this.correo,
    required this.esDocente,
    required this.onCrear,
  });

  final String correo;
  final bool esDocente;
  final VoidCallback onCrear;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
      ),
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: TemaUpb.rojo.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(Icons.folder_special_outlined,
                color: TemaUpb.rojo, size: 30),
          ),
          const SizedBox(height: 18),
          Text(
            esDocente
                ? 'No tienes proyectos asignados como asesor'
                : 'No tienes ningún proyecto activo asignado',
            textAlign: TextAlign.center,
            style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: TemaUpb.textoOscuro),
          ),
          const SizedBox(height: 8),
          Text(
            esDocente
                ? 'Toma un proyecto de la bolsa de proyectos sin asesor '
                'para empezar.'
                : 'Tu cuenta ($correo) aún no tiene proyectos registrados. '
                'Crea tu ficha técnica para comenzar.',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 12.5, color: TemaUpb.textoGris),
          ),
          if (!esDocente) ...[
            const SizedBox(height: 22),
            ElevatedButton.icon(
              onPressed: onCrear,
              style: ElevatedButton.styleFrom(
                padding:
                const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              icon: const Icon(Icons.create_new_folder_outlined),
              label: const Text('Crear mi Primer Proyecto',
                  style: TextStyle(fontWeight: FontWeight.w700)),
            ),
          ],
        ],
      ),
    );
  }
}

class _ErrorConexion extends StatelessWidget {
  const _ErrorConexion({required this.mensaje, required this.onReintentar});

  final String mensaje;
  final Future<void> Function() onReintentar;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(32),
      children: [
        const SizedBox(height: 60),
        const Icon(Icons.wifi_off, size: 56, color: Colors.black26),
        const SizedBox(height: 16),
        const Text('No se pudieron cargar los proyectos',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        Text(mensaje,
            textAlign: TextAlign.center,
            style: const TextStyle(color: TemaUpb.textoGris)),
        const SizedBox(height: 20),
        Center(
          child: OutlinedButton.icon(
            onPressed: () => onReintentar(),
            icon: const Icon(Icons.refresh),
            label: const Text('Reintentar'),
          ),
        ),
      ],
    );
  }
}