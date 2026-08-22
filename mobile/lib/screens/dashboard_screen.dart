import 'package:flutter/material.dart';

class DashboardScreenUPB extends StatefulWidget {
  const DashboardScreenUPB({super.key});

  @override
  State<DashboardScreenUPB> createState() => _DashboardScreenUPBState();
}

class _DashboardScreenUPBState extends State<DashboardScreenUPB> {
  final Color upbRed = const Color(0xFF8B0000);
  int _currentIndex = 0;
  String _searchQuery = '';

  // Datos mock de proyectos
  final List<Map<String, String>> _proyectos = [
    {
      'id': '1',
      'titulo': 'Sistema de Monitorización Ambiental',
      'facultad': 'Ing. Ambiental',
      'autor': 'Caren Díaz',
      'fecha': '15 Ago 2026',
      'estado': 'En Revisión',
    },
    {
      'id': '2',
      'titulo': 'Plataforma de Gestión Académica',
      'facultad': 'Ing. de Sistemas',
      'autor': 'Carlos Gómez',
      'fecha': '10 Ago 2026',
      'estado': 'Aprobado',
    },
    {
      'id': '3',
      'titulo': 'Análisis de Movilidad Bucaramanga',
      'facultad': 'Ing. Civil',
      'autor': 'Ana Martínez',
      'fecha': '28 Jul 2026',
      'estado': 'Borrador',
    },
  ];

  @override
  Widget build(BuildContext context) {
    // Filtrado de proyectos
    final proyectosFiltrados = _proyectos.where((p) {
      final query = _searchQuery.toLowerCase();
      return p['titulo']!.toLowerCase().contains(query) ||
             p['facultad']!.toLowerCase().contains(query) ||
             p['autor']!.toLowerCase().contains(query);
    }).toList();

    return Scaffold(
      backgroundColor: Colors.black,

      // Encabezado Superior
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: upbRed,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text(
                'UPB',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
            const SizedBox(width: 12),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Proyectos UPB',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                Text(
                  'Campus Bucaramanga',
                  style: TextStyle(color: Colors.grey, fontSize: 10),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded, color: Colors.white),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),

      // Cuerpo Principal
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: Column(
          children: [
            const SizedBox(height: 12),

            // Campo de Búsqueda
            TextField(
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
              },
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Buscar proyectos o facultades...',
                hintStyle: const TextStyle(color: Colors.grey, fontSize: 13),
                prefixIcon: const Icon(Icons.search_rounded, color: Colors.grey),
                filled: true,
                fillColor: const Color(0xFF18181B), // Zinc-900
                contentPadding: const EdgeInsets.symmetric(vertical: 14),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: Color(0xFF27272A)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: Color(0xFF27272A)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide(color: upbRed, width: 1.5),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Lista de Tarjetas
            Expanded(
              child: proyectosFiltrados.isEmpty
                  ? const Center(
                      child: Text(
                        'No se encontraron proyectos',
                        style: TextStyle(color: Colors.grey),
                      ),
                    )
                  : ListView.builder(
                      itemCount: proyectosFiltrados.length,
                      itemBuilder: (context, index) {
                        final proyecto = proyectosFiltrados[index];
                        return _buildProyectoCard(proyecto);
                      },
                    ),
            ),
          ],
        ),
      ),

      // Botón flotante para crear nuevo proyecto
      floatingActionButton: FloatingActionButton(
        backgroundColor: upbRed,
        child: const Icon(Icons.add, color: Colors.white),
        onPressed: () {
          // Abrir modal o pantalla de creación
        },
      ),

      // Barra de Navegación Inferior
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        backgroundColor: const Color(0xFF18181B),
        selectedItemColor: upbRed,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.folder_outlined),
            activeIcon: Icon(Icons.folder),
            label: 'Proyectos',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.bookmark_border_rounded),
            activeIcon: Icon(Icons.bookmark_rounded),
            label: 'Guardados',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline_rounded),
            activeIcon: Icon(Icons.person_rounded),
            label: 'Perfil',
          ),
        ],
      ),
    );
  }

  // Widget para construir cada tarjeta
  Widget _buildProyectoCard(Map<String, String> proyecto) {
    Color estadoColor;
    switch (proyecto['estado']) {
      case 'Aprobado':
        estadoColor = Colors.greenAccent;
        break;
      case 'En Revisión':
        estadoColor = Colors.amberAccent;
        break;
      default:
        estadoColor = Colors.grey;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF27272A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: upbRed.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: upbRed.withOpacity(0.4)),
                ),
                child: Text(
                  proyecto['facultad']!,
                  style: TextStyle(color: upbRed, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
              Text(
                proyecto['estado']!,
                style: TextStyle(color: estadoColor, fontSize: 11, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            proyecto['titulo']!,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 15,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Divider(color: Colors.white.withOpacity(0.08)),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.person_outline_rounded, size: 14, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(proyecto['autor']!, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                ],
              ),
              Row(
                children: [
                  const Icon(Icons.access_time_rounded, size: 14, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(proyecto['fecha']!, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}