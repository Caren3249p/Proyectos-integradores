import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Badge, Card } from '../components/UIComponents';

export const EvaluacionProyecto = () => {
  const { projects, selectedProjectId, setSelectedProjectId, rubrics, saveEvaluation, showToast, user } = useApp();

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const [rubricId, setRubricId] = useState(() => rubrics.find(r => r.activa)?.id || rubrics[0]?.id || '');
  const activeRubric = rubrics.find(r => String(r.id) === String(rubricId)) || rubrics[0];
  const existingEvaluation = selectedProject?.evaluacion;

  const [grades, setGrades] = useState(() => {
    const init = {};
    activeRubric?.criterios?.forEach(c => {
      const existing = existingEvaluation?.detalles?.find(item => item.criterio_id === c.id);
      init[c.id] = existing?.nota ?? 0;
    });
    return init;
  });

  React.useEffect(() => {
    if (existingEvaluation?.rubrica_id) setRubricId(existingEvaluation.rubrica_id);
  }, [existingEvaluation?.id_evaluacion]);

  React.useEffect(() => {
    if (!rubricId && rubrics[0]?.id) setRubricId(rubrics[0].id);
  }, [rubricId, rubrics]);

  React.useEffect(() => {
    const nextGrades = {};
    activeRubric?.criterios?.forEach(c => { nextGrades[c.id] = 0; });
    setGrades(nextGrades);
  }, [activeRubric?.id]);

  const [feedback, setFeedback] = useState(
    'Excelente trabajo en la integración del concepto estético Antigravity y la arquitectura limpia de React. El cumplimiento de criterios de interfaz y conexión cumple con creces los requerimientos institucionales.'
  );

  const minFeedbackLength = 20;
  const currentFeedbackLength = feedback.trim().length;
  const isFeedbackValid = currentFeedbackLength >= minFeedbackLength;

  const calculateFinalGrade = () => {
    if (!activeRubric?.criterios?.length) return 0;
    let total = 0;
    activeRubric.criterios.forEach(c => {
      const g = grades[c.id] || 0;
      total += g * (c.peso / 100);
    });
    return Math.round(total * 10) / 10;
  };

  const finalGrade = calculateFinalGrade();

  const handleGradeChange = (criterioId, val) => {
    setGrades({
      ...grades,
      [criterioId]: parseFloat(val)
    });
  };

  const handleSaveDraft = () => {
    const evalData = {
      id_evaluacion: existingEvaluation?.id_evaluacion,
      rubrica_id: activeRubric.id,
      docente: user?.nombre || 'Dr. Carlos Mario Morales',
      nota_final: finalGrade,
      retroalimentacion: feedback,
      estado: 'borrador',
      fecha: new Date().toISOString().split('T')[0],
      detalles: activeRubric.criterios.map(c => ({
        criterio_id: c.id,
        nombre: c.nombre,
        peso: c.peso,
        nota: grades[c.id] || 0
      }))
    };
    saveEvaluation(selectedProject.id, evalData);
  };

  const handleCloseEvaluation = () => {
    if (!isFeedbackValid) {
      showToast('La retroalimentación debe tener al menos ' + minFeedbackLength + ' caracteres.', 'error');
      return;
    }

    const evalData = {
      id_evaluacion: existingEvaluation?.id_evaluacion,
      rubrica_id: activeRubric.id,
      docente: user?.nombre || 'Dr. Carlos Mario Morales',
      nota_final: finalGrade,
      retroalimentacion: feedback,
      estado: 'cerrada',
      fecha: new Date().toISOString().split('T')[0],
      detalles: activeRubric.criterios.map(c => ({
        criterio_id: c.id,
        nombre: c.nombre,
        peso: c.peso,
        nota: grades[c.id] || 0
      }))
    };
    saveEvaluation(selectedProject.id, evalData);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Project Selector */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-[#C8102E]" />
            <span className="text-xs font-bold text-[#C8102E] uppercase tracking-wider">Módulo de Calificación</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A]">Evaluación Paso a Paso de Proyectos</h1>
          <p className="text-xs text-neutral-500">Aplica la rúbrica activa institucional y emite retroalimentación detallada.</p>
        </div>

        {/* Project Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-neutral-500">Rúbrica:</label>
          <select value={rubricId} onChange={(e) => setRubricId(e.target.value)} className="px-3 py-2 text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-xl">
            {rubrics.filter(r => r.activa).map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
          <label className="text-xs font-bold text-neutral-500">Proyecto:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            className="px-3 py-2 text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#C8102E] text-neutral-800"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.titulo} ({p.creador})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Criteria Interactive Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#1A1A1A]">
              Criterios de la Rúbrica: <span className="text-neutral-500 font-normal">{activeRubric?.nombre}</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Rúbrica al 100%
            </span>
          </div>

          <div className="space-y-4">
            {activeRubric?.criterios?.map((crit) => {
              const currentGrade = Number(grades[crit.id] ?? 0);
              return (
                <div 
                  key={crit.id} 
                  className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm hover:border-[#C8102E]/30 transition-all duration-300 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#1A1A1A]">{crit.nombre}</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.2 rounded bg-neutral-100 text-neutral-700">
                          {crit.peso}%
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">{crit.descripcion}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xl font-black text-[#C8102E] bg-red-50 px-3 py-1 rounded-xl border border-red-100">
                        {currentGrade.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-neutral-400 block mt-1">Calificación libre</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <label className="text-[11px] font-medium text-neutral-500">Calificación:</label>
                    <input type="number" min="0" max="5" step="0.1" value={grades[crit.id] ?? ''} onChange={(e) => handleGradeChange(crit.id, e.target.value)} className="w-28 px-3 py-2 text-sm font-bold text-right bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#C8102E]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Grade Summary & Feedback */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2B2B2B] text-white p-7 rounded-3xl shadow-xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#C8102E]/20 rounded-full blur-2xl pointer-events-none"></div>

            <span className="text-xs font-bold uppercase tracking-wider text-[#C9A84C]">Nota Final Ponderada</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-black tracking-tight text-white">{finalGrade.toFixed(1)}</span>
              <span className="text-lg text-neutral-400 font-bold">total ponderado</span>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-300">
              <span>Estado:</span>
              <Badge status={selectedProject?.evaluacion?.estado || 'en_revision'} />
            </div>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xs text-[#1A1A1A] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#C8102E]" />
                Retroalimentación Cualitativa
              </h3>
              <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full ' + (isFeedbackValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800')}>
                {currentFeedbackLength} / {minFeedbackLength} min
              </span>
            </div>

            <textarea
              rows={5}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Escribe aquí las observaciones, fortalezas y puntos de mejora para el equipo (mínimo 20 caracteres)..."
              className={'w-full p-3 text-xs bg-neutral-50 rounded-2xl border ' + 
                (isFeedbackValid ? 'border-neutral-200 focus:border-[#C8102E]' : 'border-red-300 focus:border-red-500') + 
                ' outline-none transition-all resize-none'}
            ></textarea>

            {!isFeedbackValid && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Faltan {minFeedbackLength - currentFeedbackLength} caracteres para habilitar el cierre.
              </p>
            )}

            <div className="space-y-2 mt-4">
              <Button
                variant="primary"
                className="w-full"
                icon={CheckCircle}
                disabled={!isFeedbackValid}
                onClick={handleCloseEvaluation}
              >
                {existingEvaluation ? 'Corregir y Publicar Evaluación' : 'Cerrar y Publicar Evaluación'}
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                icon={Save}
                onClick={handleSaveDraft}
              >
                Guardar Borrador
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};