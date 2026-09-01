import React, { useState } from 'react';
import { X, FolderPlus, Code, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, FloatingInput } from './UIComponents';

export const ModalCrearProyecto = ({ isOpen, onClose }) => {
  const { user, createProject } = useApp();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [curso, setCurso] = useState('Proyecto Integrador II - UPB');
  const [periodo, setPeriodo] = useState('2026-10');
  const [lenguaje, setLenguaje] = useState('JavaScript / TypeScript');
  const [frameworks, setFrameworks] = useState('React, Tailwind CSS, Express');
  const [baseDatos, setBaseDatos] = useState('PostgreSQL');
  const [esMovil, setEsMovil] = useState(false);
  const [entornoDespliegue, setEntornoDespliegue] = useState('Vercel + Railway');
  const [repoUrl, setRepoUrl] = useState('https://github.com/upb/');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    const created = await createProject({
      titulo,
      descripcion,
      curso,
      periodo,
      lenguaje,
      frameworks,
      baseDatos,
      esMovil,
      entornoDespliegue,
      repoUrl
    });

    if (created) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-neutral-900 to-neutral-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#C8102E] to-[#E30613] flex items-center justify-center text-white shadow-lg shadow-[#C8102E]/30">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Registrar Nuevo Proyecto Integrador</h2>
              <p className="text-xs text-neutral-300">Asignacion directa al estudiante: {user?.nombre} ({user?.correo})</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <FloatingInput
            label="Titulo del Proyecto"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="ej: Plataforma de Telemetria Satelital"
            required
          />

          <div>
            <label className="text-xs font-semibold text-neutral-600 block mb-1.5">
              Descripcion y Alcance del Proyecto
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe los objetivos, problematica y propuesta de valor..."
              className="w-full p-3 text-xs bg-neutral-50 rounded-xl border border-neutral-200/80 focus:border-[#C8102E] outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingInput
              label="Curso / Asignatura"
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
            />
            <FloatingInput
              label="Periodo Academico"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
            />
          </div>

          <div className="pt-3 border-t border-neutral-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C8102E] mb-3 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" />
              Campos Tecnicos y Stack
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FloatingInput
                label="Lenguaje Principal"
                value={lenguaje}
                onChange={(e) => setLenguaje(e.target.value)}
              />
              <FloatingInput
                label="Frameworks / Librerias"
                value={frameworks}
                onChange={(e) => setFrameworks(e.target.value)}
              />
              <FloatingInput
                label="Base de Datos"
                value={baseDatos}
                onChange={(e) => setBaseDatos(e.target.value)}
              />
              <FloatingInput
                label="Entorno de Despliegue"
                value={entornoDespliegue}
                onChange={(e) => setEntornoDespliegue(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100">
            <FloatingInput
              label="URL Repositorio GitHub / GitLab"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
            <label className="flex items-center gap-2 text-xs text-neutral-600 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={esMovil}
                onChange={(e) => setEsMovil(e.target.checked)}
                className="rounded text-[#C8102E] focus:ring-[#C8102E]"
              />
              <span>Este proyecto incluye desarrollo movil (Flutter / React Native)</span>
            </label>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Crear y Abrir Ficha
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};