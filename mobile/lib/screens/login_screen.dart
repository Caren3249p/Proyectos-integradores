import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/tema_upb.dart';
import '../services/api_client.dart';
import '../state/sesion.dart';

/// Réplica del login web (frontend/src/pages/AuthScreen.jsx): tarjeta
/// blanca centrada, badge "UPB" con degradado, mismos textos y mismo
/// flujo (registro = solo estudiante, con medidor de fuerza de clave).
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nombreCtrl = TextEditingController();
  final _correoCtrl = TextEditingController();
  final _passCtrl = TextEditingController();

  bool _esRegistro = false;
  bool _cargando = false;
  bool _ocultarPass = true;
  String? _error;

  @override
  void dispose() {
    _nombreCtrl.dispose();
    _correoCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  /// Mismo cálculo que calculatePasswordStrength() en AuthScreen.jsx.
  int _fuerzaClave(String clave) {
    if (clave.isEmpty) return 0;
    var puntaje = 0;
    if (clave.length >= 6) puntaje += 30;
    if (clave.length >= 8) puntaje += 30;
    if (RegExp(r'[A-Z]').hasMatch(clave)) puntaje += 20;
    if (RegExp(r'[0-9]').hasMatch(clave)) puntaje += 20;
    return puntaje > 100 ? 100 : puntaje;
  }

  Future<void> _enviar() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _cargando = true;
      _error = null;
    });

    final sesion = context.read<Sesion>();
    try {
      if (_esRegistro) {
        await sesion.registrar(
            _nombreCtrl.text, _correoCtrl.text, _passCtrl.text);
      } else {
        await sesion.iniciarSesion(_correoCtrl.text, _passCtrl.text);
      }
    } on ApiException catch (error) {
      if (mounted) {
        setState(() => _error = 'Error al procesar la solicitud. '
            'Revisa tus credenciales.\n${error.mensaje}');
      }
    } catch (_) {
      if (mounted) {
        setState(() => _error =
        'Error al procesar la solicitud. Revisa tus credenciales.');
      }
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fuerza = _fuerzaClave(_passCtrl.text);

    return Scaffold(
      backgroundColor: TemaUpb.fondo,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(28),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(28),
                      border: Border.all(color: Colors.white),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.08),
                          blurRadius: 40,
                          offset: const Offset(0, 20),
                        ),
                      ],
                    ),
                    child: Form(
                      key: _formKey,
                      onChanged: () => setState(() {}),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // --- Encabezado: badge UPB + título ---
                          Center(
                            child: Column(
                              children: [
                                Container(
                                  width: 56,
                                  height: 56,
                                  alignment: Alignment.center,
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                      colors: [
                                        TemaUpb.rojo,
                                        Color(0xFFE30613),
                                      ],
                                    ),
                                    borderRadius: BorderRadius.circular(18),
                                    boxShadow: [
                                      BoxShadow(
                                        color: TemaUpb.rojo
                                            .withValues(alpha: 0.3),
                                        blurRadius: 16,
                                        offset: const Offset(0, 6),
                                      ),
                                    ],
                                  ),
                                  child: const Text(
                                    'UPB',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w800,
                                      fontSize: 20,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  _esRegistro
                                      ? 'Registro de Estudiante'
                                      : 'Portal Institucional UPB',
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.bold,
                                    color: TemaUpb.textoOscuro,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      'Plataforma de Proyectos Integradores',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: TemaUpb.textoGris,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                    SizedBox(width: 4),
                                    Icon(Icons.auto_awesome,
                                        size: 14, color: TemaUpb.dorado),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 28),

                          // --- Banner de solo-estudiante en registro ---
                          if (_esRegistro) ...[
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFFBEB),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                    color: const Color(0xFFFDE68A)),
                              ),
                              child: const Row(
                                crossAxisAlignment:
                                CrossAxisAlignment.start,
                                children: [
                                  Icon(Icons.verified_user_outlined,
                                      size: 16, color: Color(0xFFB45309)),
                                  SizedBox(width: 8),
                                  Expanded(
                                    child: Text.rich(
                                      TextSpan(
                                        style: TextStyle(
                                          fontSize: 11,
                                          height: 1.3,
                                          color: Color(0xFF92400E),
                                        ),
                                        children: [
                                          TextSpan(
                                            text: 'El auto-registro esta '
                                                'habilitado exclusivamente '
                                                'para el rol ',
                                          ),
                                          TextSpan(
                                            text: 'Estudiante',
                                            style: TextStyle(
                                                fontWeight:
                                                FontWeight.bold),
                                          ),
                                          TextSpan(
                                            text: '. Las cuentas docentes '
                                                'son asignadas por '
                                                'coordinacion academica.',
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          if (_error != null) ...[
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFEF2F2),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                    color: const Color(0xFFFECACA)),
                              ),
                              child: Row(
                                crossAxisAlignment:
                                CrossAxisAlignment.start,
                                children: [
                                  const Icon(Icons.error_outline,
                                      size: 16, color: Color(0xFFDC2626)),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      _error!,
                                      style: const TextStyle(
                                          fontSize: 12,
                                          color: Color(0xFFB91C1C)),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          // --- Campos ---
                          if (_esRegistro) ...[
                            _CampoFlotante(
                              controlador: _nombreCtrl,
                              etiqueta: 'Nombre Completo',
                              icono: Icons.person_outline,
                              validador: (v) =>
                              (v == null || v.trim().length < 3)
                                  ? 'Mínimo 3 caracteres'
                                  : null,
                            ),
                            const SizedBox(height: 14),
                          ],
                          _CampoFlotante(
                            controlador: _correoCtrl,
                            etiqueta: 'Correo Institucional (@upb.edu.co)',
                            icono: Icons.mail_outline,
                            tipoTeclado: TextInputType.emailAddress,
                            validador: (v) {
                              final valor = (v ?? '').trim().toLowerCase();
                              if (!valor.contains('@upb.edu.co')) {
                                return 'Debe ser un correo @upb.edu.co';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 14),
                          _CampoFlotante(
                            controlador: _passCtrl,
                            etiqueta: 'Contraseña',
                            icono: Icons.lock_outline,
                            ocultar: _ocultarPass,
                            sufijo: IconButton(
                              icon: Icon(
                                _ocultarPass
                                    ? Icons.visibility_outlined
                                    : Icons.visibility_off_outlined,
                                size: 18,
                                color: TemaUpb.textoGris,
                              ),
                              onPressed: () =>
                                  setState(() => _ocultarPass = !_ocultarPass),
                            ),
                            validador: (v) {
                              if (v == null || v.isEmpty) {
                                return 'Ingrese su contraseña';
                              }
                              if (_esRegistro && v.length < 6) {
                                return 'Mínimo 6 caracteres';
                              }
                              return null;
                            },
                          ),

                          // --- Medidor de fuerza (solo en registro) ---
                          if (_esRegistro) ...[
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment:
                              MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Fuerza de contraseña:',
                                  style: TextStyle(
                                      fontSize: 10,
                                      color: TemaUpb.textoGris),
                                ),
                                Text(
                                  fuerza >= 80
                                      ? 'Fuerte'
                                      : fuerza >= 50
                                      ? 'Media'
                                      : 'Débil',
                                  style: const TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w600,
                                      color: TemaUpb.textoGris),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: LinearProgressIndicator(
                                value: fuerza / 100,
                                minHeight: 6,
                                backgroundColor: const Color(0xFFE5E5E5),
                                color: fuerza >= 80
                                    ? const Color(0xFF10B981)
                                    : fuerza >= 50
                                    ? const Color(0xFFF59E0B)
                                    : TemaUpb.rojo,
                              ),
                            ),
                          ],

                          const SizedBox(height: 20),
                          ElevatedButton(
                            onPressed: _cargando ? null : _enviar,
                            style: ElevatedButton.styleFrom(
                              padding:
                              const EdgeInsets.symmetric(vertical: 15),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            child: _cargando
                                ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            )
                                : Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(_esRegistro
                                    ? 'Registrarme como Estudiante'
                                    : 'Iniciar Sesión'),
                                const SizedBox(width: 6),
                                const Icon(Icons.arrow_forward,
                                    size: 16),
                              ],
                            ),
                          ),

                          const SizedBox(height: 20),
                          Center(
                            child: RichText(
                              textAlign: TextAlign.center,
                              text: TextSpan(
                                style: const TextStyle(
                                    fontSize: 12, color: TemaUpb.textoGris),
                                children: [
                                  TextSpan(
                                    text: _esRegistro
                                        ? '¿Ya tienes cuenta? '
                                        : '¿Eres estudiante nuevo? ',
                                  ),
                                  TextSpan(
                                    text: _esRegistro
                                        ? 'Inicia Sesión'
                                        : 'Regístrate aquí',
                                    style: const TextStyle(
                                      color: TemaUpb.rojo,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    recognizer: TapGestureRecognizer()
                                      ..onTap = _cargando
                                          ? null
                                          : () => setState(() {
                                        _esRegistro = !_esRegistro;
                                        _error = null;
                                      }),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.verified_user_outlined,
                          size: 14, color: Colors.black38),
                      SizedBox(width: 6),
                      Text(
                        'Universidad Pontificia Bolivariana · '
                            'Antigravity UI Framework',
                        style: TextStyle(fontSize: 11, color: Colors.black38),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Equivalente al FloatingInput de la web: ícono a la izquierda, borde
/// redondeado, foco en rojo institucional.
class _CampoFlotante extends StatelessWidget {
  const _CampoFlotante({
    required this.controlador,
    required this.etiqueta,
    required this.icono,
    this.validador,
    this.tipoTeclado,
    this.ocultar = false,
    this.sufijo,
  });

  final TextEditingController controlador;
  final String etiqueta;
  final IconData icono;
  final String? Function(String?)? validador;
  final TextInputType? tipoTeclado;
  final bool ocultar;
  final Widget? sufijo;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controlador,
      obscureText: ocultar,
      keyboardType: tipoTeclado,
      autocorrect: false,
      validator: validador,
      style: const TextStyle(fontSize: 14),
      decoration: InputDecoration(
        labelText: etiqueta,
        labelStyle:
        const TextStyle(fontSize: 13, color: TemaUpb.textoGris),
        prefixIcon: Icon(icono, size: 18, color: TemaUpb.textoGris),
        suffixIcon: sufijo,
        filled: true,
        fillColor: const Color(0xFFFAFAFA),
        contentPadding:
        const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFE5E5E5)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFE5E5E5)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: TemaUpb.rojo, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: TemaUpb.rojo),
        ),
      ),
    );
  }
}