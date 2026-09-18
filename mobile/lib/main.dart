import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/tema_upb.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'services/api_client.dart';
import 'services/proyecto_service.dart';
import 'state/sesion.dart';

void main() {
  final api = ApiClient();

  runApp(
    MultiProvider(
      providers: [
        Provider<ApiClient>.value(value: api),
        Provider<ProyectoService>(create: (_) => ProyectoService(api)),
        ChangeNotifierProvider<Sesion>(
          create: (_) => Sesion(api: api)..restaurar(),
        ),
      ],
      child: const AppUpb(),
    ),
  );
}

class AppUpb extends StatelessWidget {
  const AppUpb({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Proyectos Integradores UPB',
      debugShowCheckedModeBanner: false,
      theme: TemaUpb.construir(),
      home: const _Enrutador(),
    );
  }
}

/// Decide qué pantalla mostrar según el estado de la sesión.
class _Enrutador extends StatelessWidget {
  const _Enrutador();

  @override
  Widget build(BuildContext context) {
    final estado = context.watch<Sesion>().estado;

    switch (estado) {
      case EstadoSesion.cargando:
        return const Scaffold(
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.school, size: 64, color: TemaUpb.rojo),
                SizedBox(height: 24),
                CircularProgressIndicator(color: TemaUpb.rojo),
              ],
            ),
          ),
        );
      case EstadoSesion.autenticado:
        return const HomeScreen();
      case EstadoSesion.invitado:
        return const LoginScreen();
    }
  }
}