import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const MiAppUPB());
}

class MiAppUPB extends StatelessWidget {
  const MiAppUPB({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Proyectos Integradores UPB',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF8B0000), // Rojo UPB
          primary: const Color(0xFF8B0000),
        ),
        useMaterial3: true,
      ),
      home: const LoginScreen(),
    );
  }
}