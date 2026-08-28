import 'package:flutter/material.dart';
import '../models/app_models.dart';
import 'estudiante_dashboard.dart';
import 'docente_dashboard.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _correoCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _nombreCtrl = TextEditingController();
  final _githubCtrl = TextEditingController();

  bool _esRegistro = false;
  String _rolSeleccionado = 'estudiante';

  void _procesarAutenticacion() {
    if (_formKey.currentState!.validate()) {
      final usuario = Usuario(
        idUsuario: 1,
        nombre: _esRegistro ? _nombreCtrl.text : 'Usuario UPB',
        correo: _correoCtrl.text,
        rol: _rolSeleccionado,
        githubUsername: _githubCtrl.text.isNotEmpty ? _githubCtrl.text : null,
      );

      // Redirección según el Rol de la BD (tabla: usuario)
      if (usuario.rol == 'estudiante') {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => EstudianteDashboard(estudiante: usuario)),
        );
      } else {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => DocenteDashboard(docente: usuario)),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_esRegistro ? 'Registro - UPB' : 'Login - UPB'),
        backgroundColor: const Color(0xFF8B0000),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.school, size: 70, color: Color(0xFF8B0000)),
              const SizedBox(height: 20),
              if (_esRegistro) ...[
                TextFormField(
                  controller: _nombreCtrl,
                  decoration: const InputDecoration(labelText: 'Nombre Completo', border: OutlineInputBorder()),
                  validator: (v) => v!.isEmpty ? 'Ingrese su nombre' : null,
                ),
                const SizedBox(height: 12),
              ],
              TextFormField(
                controller: _correoCtrl,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Correo Institucional (@upb.edu.co)',
                  border: OutlineInputBorder(),
                ),
                validator: (val) {
                  if (val == null || !val.endsWith('@upb.edu.co')) {
                    return 'Debe ser un correo institucional @upb.edu.co';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _passCtrl,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Contraseña', border: OutlineInputBorder()),
                validator: (v) => v!.isEmpty ? 'Ingrese contraseña' : null,
              ),
              const SizedBox(height: 12),
              if (_esRegistro) ...[
                TextFormField(
                  controller: _githubCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Usuario GitHub (Opcional)',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _rolSeleccionado,
                  decoration: const InputDecoration(labelText: 'Rol en el sistema', border: OutlineInputBorder()),
                  items: const [
                    DropdownMenuItem(value: 'estudiante', child: Text('Estudiante')),
                    DropdownMenuItem(value: 'docente', child: Text('Docente')),
                  ],
                  onChanged: (v) => setState(() => _rolSeleccionado = v!),
                ),
                const SizedBox(height: 12),
              ],
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF8B0000),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                onPressed: _procesarAutenticacion,
                child: Text(_esRegistro ? 'Registrarse' : 'Iniciar Sesión'),
              ),
              TextButton(
                onPressed: () => setState(() => _esRegistro = !_esRegistro),
                child: Text(_esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}