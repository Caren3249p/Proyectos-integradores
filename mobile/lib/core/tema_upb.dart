import 'package:flutter/material.dart';

/// Paleta institucional — copiada 1:1 de frontend/tailwind.config.js
/// (bloque theme.extend.colors.upb) para que el móvil se vea consistente
/// con el dashboard web.
class TemaUpb {
  static const Color rojo = Color(0xFFC8102E);
  static const Color rojoOscuro = Color(0xFF9B0D23);
  static const Color rojoClaro = Color(0xFFFFF0F2);
  static const Color dorado = Color(0xFFC9A84C);
  static const Color doradoClaro = Color(0xFFFDF8EA);
  static const Color textoOscuro = Color(0xFF1A1A1A);
  static const Color textoGris = Color(0xFF555555);
  static const Color fondo = Color(0xFFF8F9FA);
  static const Color tarjeta = Color(0xFFFFFFFF);

  // Paleta del sidebar oscuro "Antigravity" (Navigation.jsx)
  static const Color sidebarFondo = Color(0xFF141414);
  static const Color sidebarBorde = Color(0xFF262626);

  static ThemeData construir() {
    final esquema = ColorScheme.fromSeed(
      seedColor: rojo,
      primary: rojo,
      secondary: dorado,
      surface: tarjeta,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: esquema,
      scaffoldBackgroundColor: fondo,
      // La web usa Poppins/Inter; sin fuentes empaquetadas el sistema
      // aplica la más parecida disponible en el dispositivo.
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: rojo,
        foregroundColor: Colors.white,
        elevation: 0,
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: rojo.withValues(alpha: 0.15)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: rojo.withValues(alpha: 0.15)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: rojo, width: 1.5),
        ),
        filled: true,
        fillColor: tarjeta,
        labelStyle: const TextStyle(color: textoGris),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: rojo,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.w600),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: rojo,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(foregroundColor: rojoOscuro),
      ),
      // Sombra suave equivalente a "antigravity-sm" de Tailwind.
      cardTheme: CardThemeData(
        color: tarjeta,
        elevation: 2,
        shadowColor: Colors.black.withValues(alpha: 0.06),
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      textTheme: const TextTheme(
        bodyMedium: TextStyle(color: textoOscuro),
        bodySmall: TextStyle(color: textoGris),
      ),
    );
  }

  /// Colores de estado — mismos tonos que las insignias del dashboard web.
  static Color colorEstado(String estado) {
    switch (estado) {
      case 'publicado':
        return const Color(0xFF2E7D32);
      case 'en_revision':
        return dorado;
      case 'activo':
        return const Color(0xFF1565C0);
      default:
        return textoGris;
    }
  }

  static String etiquetaEstado(String estado) {
    switch (estado) {
      case 'en_revision':
        return 'En revisión';
      case 'publicado':
        return 'Publicado';
      case 'activo':
        return 'Activo';
      case 'borrador':
        return 'Borrador';
      default:
        return estado;
    }
  }
}