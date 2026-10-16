import 'dart:io';

import 'package:flutter/material.dart';
import 'package:open_filex/open_filex.dart';
import 'package:url_launcher/url_launcher.dart';

/// Abre [url] en el navegador / app externa (ej. el repositorio Git).
/// Solo admite http(s); cualquier otro esquema se rechaza.
Future<void> abrirUrlExterna(BuildContext context, String url) async {
  final mensajero = ScaffoldMessenger.of(context);
  var texto = url.trim();
  if (!texto.contains('://')) texto = 'https://$texto';

  final uri = Uri.tryParse(texto);
  if (uri == null || (uri.scheme != 'https' && uri.scheme != 'http')) {
    mensajero.showSnackBar(
        const SnackBar(content: Text('El enlace del repositorio no es válido')));
    return;
  }

  var abierto = false;
  try {
    abierto = await launchUrl(uri, mode: LaunchMode.externalApplication);
  } catch (_) {
    abierto = false;
  }
  if (!abierto) {
    mensajero.showSnackBar(
        const SnackBar(content: Text('No se pudo abrir el enlace')));
  }
}

/// Abre un archivo ya descargado con la app instalada que lo soporte
/// (visor de PDF, Word, PowerPoint, gestor de archivos para ZIP…).
Future<void> abrirArchivoLocal(BuildContext context, File archivo) async {
  final mensajero = ScaffoldMessenger.of(context);
  try {
    final resultado = await OpenFilex.open(archivo.path);
    if (resultado.type != ResultType.done) {
      mensajero.showSnackBar(SnackBar(
        content: Text(resultado.type == ResultType.noAppToOpen
            ? 'Descargado, pero no hay una app para abrir este tipo de archivo'
            : 'Descargado, pero no se pudo abrir el archivo'),
      ));
    }
  } catch (_) {
    mensajero.showSnackBar(
        const SnackBar(content: Text('No se pudo abrir el archivo')));
  }
}
