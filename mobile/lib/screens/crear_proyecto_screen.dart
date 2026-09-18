import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/api_client.dart';
import '../services/proyecto_service.dart';

/// RF-03: registro de un proyecto. Los integrantes se agregan por correo
/// institucional y deben tener cuenta previa en la plataforma.
class CrearProyectoScreen extends StatefulWidget {
  const CrearProyectoScreen({super.key});

  @override
  State<CrearProyectoScreen> createState() => _CrearProyectoScreenState();
}

class _CrearProyectoScreenState extends State<CrearProyectoScreen> {
  final _formKey = GlobalKey<FormState>();
  final _tituloCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _integranteCtrl = TextEditingController();

  final List<String> _integrantes = [];
  bool _cargando = false;

  @override
  void dispose() {
    _tituloCtrl.dispose();
    _descCtrl.dispose();
    _integranteCtrl.dispose();
    super.dispose();
  }

  void _agregarIntegrante() {
    final correo = _integranteCtrl.text.trim().toLowerCase();
    if (!correo.endsWith('@upb.edu.co')) {
      _avisar('El correo debe ser institucional (@upb.edu.co)');
      return;
    }
    if (_integrantes.contains(correo)) {
      _avisar('Ese integrante ya está en la lista');
      return;
    }
    setState(() {
      _integrantes.add(correo);
      _integranteCtrl.clear();
    });
  }

  void _avisar(String mensaje) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(mensaje)));
  }

  Future<void> _guardar() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _cargando = true);

    try {
      await context.read<ProyectoService>().crear(
            titulo: _tituloCtrl.text,
            descripcion: _descCtrl.text,
            integrantes: _integrantes,
          );
      if (mounted) Navigator.pop(context, true);
    } on ApiException catch (error) {
      if (mounted) _avisar(error.mensaje);
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nuevo proyecto')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _tituloCtrl,
              maxLength: 150,
              decoration:
                  const InputDecoration(labelText: 'Título del proyecto'),
              validator: (v) => (v == null || v.trim().isEmpty)
                  ? 'El título es obligatorio'
                  : null,
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _descCtrl,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Descripción',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 20),
            const Text('Integrantes',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const Text(
              'Tu cuenta queda incluida automáticamente.',
              style: TextStyle(fontSize: 12, color: Colors.black54),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _integranteCtrl,
                    keyboardType: TextInputType.emailAddress,
                    autocorrect: false,
                    decoration: const InputDecoration(
                        labelText: 'correo@upb.edu.co'),
                    onFieldSubmitted: (_) => _agregarIntegrante(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _agregarIntegrante,
                  icon: const Icon(Icons.person_add_alt),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _integrantes
                  .map((correo) => Chip(
                        label: Text(correo),
                        onDeleted: () =>
                            setState(() => _integrantes.remove(correo)),
                      ))
                  .toList(),
            ),
            const SizedBox(height: 28),
            ElevatedButton.icon(
              onPressed: _cargando ? null : _guardar,
              icon: _cargando
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.save),
              label: const Text('Crear proyecto'),
            ),
          ],
        ),
      ),
    );
  }
}