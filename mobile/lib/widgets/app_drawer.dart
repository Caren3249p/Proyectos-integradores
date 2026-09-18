import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/tema_upb.dart';
import '../models/usuario.dart';
import '../state/sesion.dart';

class _ItemMenu {
  const _ItemMenu(this.icono, this.etiqueta, this.insignia, this.accion);
  final IconData icono;
  final String etiqueta;
  final String? insignia;
  final String accion; // clave usada por onSeleccionar
}

/// Réplica del sidebar oscuro "Antigravity" (frontend/src/components/
/// Navigation.jsx) como Drawer, con el menú según el rol del usuario.
class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key, required this.onSeleccionar});

  final void Function(String accion) onSeleccionar;

  static const _menuEstudiante = [
    _ItemMenu(Icons.folder_special_outlined, 'Mi Proyecto', 'Principal',
        'mi_proyecto'),
    _ItemMenu(Icons.layers_outlined, 'Ficha & Entregas', null, 'ficha'),
    _ItemMenu(
        Icons.view_kanban_outlined, 'Backlog / Kanban', 'Plane', 'backlog'),
    _ItemMenu(Icons.description_outlined, 'Actas de Asesoría', null, 'actas'),
  ];

  static const _menuDocente = [
    _ItemMenu(
        Icons.school_outlined, 'Panel Docente', 'Cursos', 'mi_proyecto'),
    _ItemMenu(Icons.how_to_reg_outlined, 'Proyectos sin asesor', null,
        'sin_asesor'),
  ];

  @override
  Widget build(BuildContext context) {
    final usuario = context.watch<Sesion>().usuario;
    if (usuario == null) return const SizedBox.shrink();

    final menu = usuario.esDocente ? _menuDocente : _menuEstudiante;

    return Drawer(
      backgroundColor: TemaUpb.sidebarFondo,
      width: 280,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // --- Logo institucional ---
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [TemaUpb.rojo, Color(0xFFE30613)],
                        ),
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                            color: TemaUpb.rojo.withValues(alpha: 0.3),
                            blurRadius: 12,
                          ),
                        ],
                      ),
                      child: const Text(
                        'UPB',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: const [
                              Text(
                                'Antigravity',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                              SizedBox(width: 4),
                              Icon(Icons.auto_awesome,
                                  size: 12, color: TemaUpb.dorado),
                            ],
                          ),
                          const Text(
                            'Proyectos Integradores',
                            style: TextStyle(
                                color: Colors.white38, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(color: TemaUpb.sidebarBorde, height: 24),

              // --- Tarjeta del usuario ---
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.04),
                  borderRadius: BorderRadius.circular(16),
                  border:
                  Border.all(color: Colors.white.withValues(alpha: 0.06)),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 18,
                      backgroundColor: TemaUpb.rojo.withValues(alpha: 0.25),
                      child: Text(
                        usuario.nombre.isNotEmpty
                            ? usuario.nombre[0].toUpperCase()
                            : '?',
                        style: const TextStyle(
                            color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            usuario.nombre,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 4),
                          _InsigniaRol(usuario: usuario),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Text(
                  'NAVEGACIÓN ${usuario.esDocente ? "DOCENTE" : "ACADÉMICA"}',
                  style: const TextStyle(
                    color: Colors.white38,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.6,
                  ),
                ),
              ),
              const SizedBox(height: 8),

              ...menu.map((item) => _BotonMenu(
                item: item,
                onTap: () {
                  Navigator.pop(context);
                  onSeleccionar(item.accion);
                },
              )),

              const Spacer(),

              // --- Pie: puerto/estado + cerrar sesión ---
              Container(
                padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.02),
                  borderRadius: BorderRadius.circular(12),
                  border:
                  Border.all(color: Colors.white.withValues(alpha: 0.05)),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.podcasts, size: 12, color: Colors.white38),
                        SizedBox(width: 6),
                        Text('App móvil',
                            style:
                            TextStyle(color: Colors.white38, fontSize: 11)),
                      ],
                    ),
                    Text(
                      'CONECTADO',
                      style: TextStyle(
                        color: Colors.white54,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: () {
                  Navigator.pop(context);
                  context.read<Sesion>().cerrarSesion();
                },
                child: const Padding(
                  padding:
                  EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                  child: Row(
                    children: [
                      Icon(Icons.logout, size: 16, color: Colors.white38),
                      SizedBox(width: 10),
                      Text('Cerrar Sesión',
                          style:
                          TextStyle(color: Colors.white70, fontSize: 12)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InsigniaRol extends StatelessWidget {
  const _InsigniaRol({required this.usuario});

  final Usuario usuario;

  @override
  Widget build(BuildContext context) {
    final Color color = usuario.esAdmin
        ? const Color(0xFFA78BFA)
        : usuario.esDocente
        ? TemaUpb.dorado
        : const Color(0xFFFF6B81);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.18),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        usuario.rol.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 9,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

class _BotonMenu extends StatelessWidget {
  const _BotonMenu({required this.item, required this.onTap});

  final _ItemMenu item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: onTap,
          child: Padding(
            padding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(item.icono, size: 17, color: Colors.white70),
                    const SizedBox(width: 12),
                    Text(
                      item.etiqueta,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12.5,
                          fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
                if (item.insignia != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      item.insignia!,
                      style: const TextStyle(
                          color: Colors.white60, fontSize: 9.5),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}