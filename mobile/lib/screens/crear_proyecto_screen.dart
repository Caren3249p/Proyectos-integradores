import 'package:flutter/material.dart';

class CrearProyectoScreen extends StatefulWidget {
  const CrearProyectoScreen({super.key});

  @override
  State<CrearProyectoScreen> createState() => _CrearProyectoScreenState();
}

class _CrearProyectoScreenState extends State<CrearProyectoScreen> {
  final _formKey = GlobalKey<FormState>();
  String _curso = 'PI I';
  final _tituloCtrl = TextEditingController();
  final _resumenCtrl = TextEditingController();
  final _githubRepoCtrl = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Registrar Proyecto - UPB'),
        backgroundColor: const Color(0xFF8B0000),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              DropdownButtonFormField<String>(
                value: _curso,
                decoration: const InputDecoration(labelText: 'Curso'),
                items: ['PI I', 'PI II', 'PI III'].map((c) {
                  return DropdownMenuItem(value: c, child: Text(c));
                }).toList(),
                onChanged: (val) => setState(() => _curso = val!),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _tituloCtrl,
                decoration: const InputDecoration(labelText: 'Título del Proyecto'),
                validator: (v) => v!.isEmpty ? 'Campo requerido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _resumenCtrl,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Resumen'),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _githubRepoCtrl,
                decoration: const InputDecoration(
                  labelText: 'Repositorio GitHub',
                  hintText: 'usuario/nombre-repo',
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF8B0000)),
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      // Guardar en tabla 'proyecto'
                    }
                  },
                  child: const Text('Crear Proyecto', style: TextStyle(color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}