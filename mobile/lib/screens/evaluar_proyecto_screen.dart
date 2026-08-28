import 'package:flutter/material.dart';
import '../models/app_models.dart';

class EvaluarProyectoScreen extends StatefulWidget {
  final Proyecto proyecto;
  final List<CriterioRubrica> criterios;

  const EvaluarProyectoScreen({
    super.key,
    required this.proyecto,
    required this.criterios,
  });

  @override
  State<EvaluarProyectoScreen> createState() => _EvaluarProyectoScreenState();
}

class _EvaluarProyectoScreenState extends State<EvaluarProyectoScreen> {
  final _retroalimentacionCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  double get notaFinal {
    double suma = 0.0;
    for (var c in widget.criterios) {
      suma += c.calificacion * (c.pesoPorcentual / 100);
    }
    return suma;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Evaluación: ${widget.proyecto.titulo}'),
        backgroundColor: const Color(0xFF8B0000),
      ),
      body: Form(
        key: _formKey,
        child: Column(
          children: [
            Expanded(
              child: ListView.builder(
                itemCount: widget.criterios.length,
                itemBuilder: (context, index) {
                  final item = widget.criterios[index];
                  return Card(
                    margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(item.nombre, style: const TextStyle(fontWeight: FontWeight.bold)),
                              Text('${item.pesoPorcentual}%', style: const TextStyle(color: Colors.grey)),
                            ],
                          ),
                          Text(item.descripcion, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                          Slider(
                            value: item.calificacion,
                            min: 0.0,
                            max: 5.0,
                            divisions: 50,
                            label: item.calificacion.toStringAsFixed(1),
                            onChanged: (val) {
                              setState(() => item.calificacion = val);
                            },
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: TextFormField(
                controller: _retroalimentacionCtrl,
                maxLines: 2,
                decoration: const InputDecoration(
                  labelText: 'Retroalimentación (Tabla evaluacion - RF-08)',
                  border: OutlineInputBorder(),
                ),
                validator: (val) {
                  if (val == null || val.length < 20) {
                    return 'Debe ingresar al menos 20 caracteres';
                  }
                  return null;
                },
              ),
            ),
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.grey[200],
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Nota Final: ${notaFinal.toStringAsFixed(2)} / 5.0',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF8B0000)),
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        // Guardar en tabla 'evaluacion'
                      }
                    },
                    child: const Text('Guardar Evaluación', style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}