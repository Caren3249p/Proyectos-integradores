import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/proyecto.dart';
import '../services/api_client.dart';
import '../services/proyecto_service.dart';
import '../widgets/proyecto_card.dart';

/// Bolsa de proyectos sin docente asesor. Solo tiene sentido para el rol
/// docente: el backend rechaza la asignación para otros roles.
class ProyectosSinAsesorScreen extends StatefulWidget {
  const ProyectosSinAsesorScreen({super.key});

  @override
  State<ProyectosSinAsesorScreen> createState() =>
      _ProyectosSinAsesorScreenState();
}

class _ProyectosSinAsesorScreenState extends State<ProyectosSinAsesorScreen> {
  late Future<List<Proyecto>> _futuro;

  @override
  void initState() {
    super.initState();
    _futuro = context.read<ProyectoService>().sinDocente();
  }

  Future<void> _recargar() async {
    final futuro = context.read<ProyectoService>().sinDocente();
    setState(() => _futuro = futuro);
    await futuro.catchError((_) => <Proyecto>[]);
  }

  Future<void> _tomar(Proyecto proyecto) async {
    try {
      await context.read<ProyectoService>().tomarComoAsesor(
            proyecto.idProyecto,
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Ahora asesoras "${proyecto.titulo}"')),
      );
      _recargar();
    } on ApiException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(error.mensaje)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Proyectos sin asesor')),
      body: RefreshIndicator(
        onRefresh: _recargar,
        child: FutureBuilder<List<Proyecto>>(
          future: _futuro,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }

            if (snapshot.hasError) {
              return ListView(
                padding: const EdgeInsets.all(32),
                children: [
                  const SizedBox(height: 60),
                  Text(
                    snapshot.error is ApiException
                        ? (snapshot.error as ApiException).mensaje
                        : 'Error inesperado',
                    textAlign: TextAlign.center,
                  ),
                ],
              );
            }

            final proyectos = snapshot.data ?? const <Proyecto>[];
            if (proyectos.isEmpty) {
              return ListView(
                padding: const EdgeInsets.all(32),
                children: const [
                  SizedBox(height: 80),
                  Icon(Icons.check_circle_outline,
                      size: 56, color: Colors.black26),
                  SizedBox(height: 12),
                  Text('Todos los proyectos tienen asesor asignado',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.black54)),
                ],
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: proyectos.length,
              itemBuilder: (context, indice) {
                final proyecto = proyectos[indice];
                return ProyectoCard(
                  proyecto: proyecto,
                  accion: FilledButton.icon(
                    onPressed: () => _tomar(proyecto),
                    icon: const Icon(Icons.how_to_reg, size: 18),
                    label: const Text('Asesorar'),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}