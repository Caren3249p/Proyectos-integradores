import 'package:flutter/material.dart';

class DetallesTecnicosScreen extends StatefulWidget {
  final int idProyecto;
  const DetallesTecnicosScreen({super.key, required this.idProyecto});

  @override
  State<DetallesTecnicosScreen> createState() => _DetallesTecnicosScreenState();
}

class _DetallesTecnicosScreenState extends State<DetallesTecnicosScreen> {
  final _formKey = GlobalKey<FormState>();
  final _arquitecturaCtrl = TextEditingController();
  final _baseDatosCtrl = TextEditingController();
  final _despliegueCtrl = TextEditingController();
  bool _esMovil = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Campos Técnicos y Archivos'),
        backgroundColor: const Color(0xFF8B0000),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Ficha Técnica (Tabla: campo_tecnico)', 
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 10),
              TextFormField(
                controller: _arquitecturaCtrl,
                decoration: const InputDecoration(labelText: 'Arquitectura (ej: MVC, Clean Architecture)'),
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _baseDatosCtrl,
                decoration: const InputDecoration(labelText: 'Base de Datos (ej: PostgreSQL 16)'),
              ),
              const SizedBox(height: 10),
              SwitchListTile(
                title: const Text('¿Es una aplicación móvil?'),
                value: _esMovil,
                onChanged: (val) => setState(() => _esMovil = val),
              ),
              TextFormField(
                controller: _despliegueCtrl,
                decoration: const InputDecoration(labelText: 'Entorno de Despliegue'),
                validator: (val) {
                  if (_esMovil && (val == null || val.isEmpty)) {
                    return 'El entorno es obligatorio si es móvil (RF-04)';
                  }
                  return null;
                },
              ),
              const Divider(height: 40),
              const Text('Carga de Documentos (Tabla: archivo)', 
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 10),
              OutlinedButton.icon(
                onPressed: () {
                  // Lógica para adjuntar archivo (máx 100 MB)
                },
                icon: const Icon(Icons.picture_as_pdf),
                label: const Text('Subir Informe (PDF)'),
              ),
              const SizedBox(height: 30),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF8B0000)),
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Ficha técnica guardada')),
                      );
                    }
                  },
                  child: const Text('Guardar Cambios', style: TextStyle(color: Colors.white)),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}