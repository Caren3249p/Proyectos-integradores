import React, { useState } from 'react';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, FloatingInput } from '../components/UIComponents';

export const GestionRubricas = () => {
  const { rubrics, addRubric, showToast, user } = useApp();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [criterios, setCriterios] = useState([
    { id: 1, nombre: 'Arquitectura y Patrones de Software', descripcion: 'Modularidad, Clean Architecture y separación de capas', peso: 30 },
    { id: 2, nombre: 'Look & Feel Antigravity UI/UX', descripcion: 'Fidelidad visual, paleta UPB y componentes dinámicos', peso: 35 },
    { id: 3, nombre: 'Validaciones de Negocio y Reglas', descripcion: 'Regla del 100% y restricciones de retroalimentación', peso: 20 },
    { id: 4, nombre: 'Documentación Técnica y Entrega', descripcion: 'Claridad en SRS, diagramas y actas de asesoría', peso: 15 },
  ]);

  const totalPeso = criterios.reduce((sum, c) => sum + (Number(c.peso) || 0), 0);
  const isValid100 = totalPeso === 100;

  const handleAddCriterio = () => {
    setCriterios([
      ...criterios,
      {
        id: Date.now(),
        nombre: '',
        descripcion: '',
        peso: 0
      }
    ]);
  };

  const handleRemoveCriterio = (id) => {
    if (criterios.length <= 1) {
      showToast('La rúbrica debe contener al menos un criterio', 'error');
      return;
    }
    setCriterios(criterios.filter(c => c.id !== id));
  };

  const handleCriterioChange = (id, field, val) => {
    setCriterios(criterios.map(c => {
      if (c.id === id) {
        return { ...c, [field]: field === 'peso' ? (parseFloat(val) || 0) : val };
      }
      return c;
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      showToast('Por favor ingresa un nombre para la rúbrica', 'error');
      return;
    }

    if (!isValid100) {
      showToast('La suma de pesos debe ser exactamente 100% (actual: ' + totalPeso + '%)', 'error');
      return;
    }

    const newRubric = {
      id: Date.now(),
      nombre,
      descripcion,
      activa: true,
      id_docente: user?.id || 10,
      docente_nombre: user?.nombre || 'Dr. Carlos Mario Morales',
      criterios
    };

    addRubric(newRubric);
    setNombre('');
    setDescripcion('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-4 h-4 text-[#C9A84C]" />
            <span className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider">Módulo Docente</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A]">Gestión y Creación de Rúbricas</h1>
          <p className="text-xs text-neutral-500">Configura criterios y valida la regla obligatoria del 100% de ponderación.</p>
        </div>

        <div className={'px-5 py-3 rounded-2xl border transition-all duration-300 flex items-center gap-3 ' + 
          (isValid100 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-lg shadow-emerald-500/10' 
            : 'bg-amber-50 border-amber-300 text-amber-800 shadow-lg shadow-amber-500/10')}>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider block">Suma de Criterios</span>
            <span className="text-xl font-black">{totalPeso}% / 100%</span>
          </div>
          {isValid100 ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-600 animate-bounce" />
          ) : (
            <AlertCircle className="w-7 h-7 text-amber-600 animate-pulse" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[#1A1A1A]">Rúbricas Institucionales</h3>
          {rubrics.map((rub) => (
            <div key={rub.id} className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm space-y-3 hover:border-neutral-200 transition-all">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-xs text-[#1A1A1A]">{rub.nombre}</h4>
                <span className={'text-[10px] font-bold px-2 py-0.5 rounded ' + (rub.activa ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500')}>
                  {rub.activa ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 line-clamp-2">{rub.descripcion}</p>
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                <span>{rub.criterios?.length} criterios</span>
                <span className="font-semibold text-neutral-700">100% Validado</span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
            <h3 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C8102E]" />
              Constructor de Nueva Rúbrica
            </h3>

            <div className="space-y-4">
              <FloatingInput
                label="Nombre de la Rúbrica (ej: Evaluación Final Sprint 4)"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
              <FloatingInput
                label="Descripción y Propósito Académico"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div className="space-y-3 pt-4 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Criterios de Evaluación</span>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={handleAddCriterio}
                >
                  Agregar Criterio
                </Button>
              </div>

              <div className="space-y-3">
                {criterios.map((crit, idx) => (
                  <div key={crit.id} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-bold text-neutral-400">Criterio #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterio(crit.id)}
                        className="text-neutral-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          placeholder="Nombre del criterio (ej: Arquitectura)"
                          value={crit.nombre}
                          onChange={(e) => handleCriterioChange(crit.id, 'nombre', e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-neutral-200 focus:outline-none focus:border-[#C8102E]"
                          required
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Peso %"
                          min="1"
                          max="100"
                          value={crit.peso}
                          onChange={(e) => handleCriterioChange(crit.id, 'peso', e.target.value)}
                          className="w-full px-3 py-2 text-xs font-bold bg-white rounded-xl border border-neutral-200 focus:outline-none focus:border-[#C8102E] pr-7"
                          required
                        />
                        <span className="absolute right-3 top-2 text-xs text-neutral-400 font-bold">%</span>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Descripción y nivel de logro esperado..."
                      value={crit.descripcion}
                      onChange={(e) => handleCriterioChange(crit.id, 'descripcion', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-neutral-200 focus:outline-none focus:border-[#C8102E]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {!isValid100 && (
                  <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Ajusta los porcentajes para que la suma sea exactamente 100%</span>
                  </p>
                )}
                {isValid100 && (
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Regla del 100% cumplida exitosamente. Lista para guardar.</span>
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant={isValid100 ? 'primary' : 'secondary'}
                disabled={!isValid100}
                icon={Save}
                size="lg"
              >
                Guardar Rúbrica
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};