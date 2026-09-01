import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, FloatingInput } from '../components/UIComponents';

export const AuthScreen = () => {
  const { login } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const calculatePasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 30;
    if (pass.length >= 8) score += 30;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 20;
    return Math.min(score, 100);
  };

  const strength = calculatePasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        setError('Por favor completa todos los campos.');
        setIsLoading(false);
        return;
      }

      if (!email.includes('@upb.edu.co')) {
        setError('Por favor utiliza tu correo institucional (@upb.edu.co)');
        setIsLoading(false);
        return;
      }

      if (isRegister) {
        if (!nombre.trim()) {
          setError('Por favor ingresa tu nombre completo.');
          setIsLoading(false);
          return;
        }
      }

      await login(email.trim(), password, isRegister, nombre.trim());
    } catch (err) {
      setError('Error al procesar la solicitud. Revisa tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#F8F9FA] p-4">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#C8102E]/15 to-[#C9A84C]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#1A1A1A]/10 to-[#C8102E]/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#C8102E 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      ></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-white/60 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#C8102E] to-[#E30613] text-white font-extrabold text-2xl mb-3 shadow-lg shadow-[#C8102E]/30 ring-4 ring-[#C8102E]/10">
              UPB
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
              {isRegister ? 'Registro de Estudiante' : 'Portal Institucional UPB'}
            </h2>
            <p className="text-xs text-neutral-500 mt-1 flex items-center justify-center gap-1 font-medium">
              <span>Plataforma de Proyectos Integradores</span>
              <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
            </p>
          </div>

          {/* Banner explicativo del Registro (Solo Estudiantes) */}
          {isRegister && (
            <div className="mb-5 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 leading-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600" />
              <span>El auto-registro esta habilitado exclusivamente para el rol <strong>Estudiante</strong>. Las cuentas docentes son asignadas por coordinacion academica.</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200/80 flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <FloatingInput
                label="Nombre Completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                icon={User}
                placeholder=" "
                required
              />
            )}

            <FloatingInput
              label="Correo Institucional (@upb.edu.co)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              placeholder=" "
              required
            />

            <div>
              <FloatingInput
                label="Contrasena"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                placeholder=" "
                required
              />
              
              {isRegister && (
                <div className="mt-2 px-1">
                  <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
                    <span>Fuerza de contrasena:</span>
                    <span className="font-semibold">{strength >= 80 ? 'Fuerte' : strength >= 50 ? 'Media' : 'Debil'}</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                    <div 
                      className={'h-full transition-all duration-300 ' + 
                        (strength >= 80 ? 'bg-emerald-500' : strength >= 50 ? 'bg-amber-500' : 'bg-red-500')}
                      style={{ width: strength + '%' }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 group"
              isLoading={isLoading}
            >
              <span>{isRegister ? 'Registrarme como Estudiante' : 'Iniciar Sesion'}</span>
              <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-neutral-500">
            {isRegister ? (
              <p>
                Ya tienes cuenta?{' '}
                <button 
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError('');
                  }}
                  className="font-bold text-[#C8102E] hover:underline"
                >
                  Inicia Sesion
                </button>
              </p>
            ) : (
              <p>
                Eres estudiante nuevo?{' '}
                <button 
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError('');
                  }}
                  className="font-bold text-[#C8102E] hover:underline"
                >
                  Registrate aqui
                </button>
              </p>
            )}
          </div>
        </div>

        <p className="text-[11px] text-center text-neutral-400 mt-6 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
          Universidad Pontificia Bolivariana - Antigravity UI Framework
        </p>
      </div>
    </div>
  );
};