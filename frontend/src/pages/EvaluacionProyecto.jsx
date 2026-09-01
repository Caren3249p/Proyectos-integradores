import React, { useMemo, useState } from 'react';
import {
  Award,
  CheckCircle,
  AlertCircle,
  Save,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Badge, Card } from '../components/UIComponents';

const obtenerHojas = (nodos = []) => {
  const hojas = [];
  const walk = (items, profundidad = 0) => {
    (items || []).forEach((nodo) => {
      const hijos = nodo.hijos || [];
      const esHoja = nodo.esHoja ?? nodo.es_hoja ?? hijos.length === 0;
      if (esHoja || hijos.length === 0) {
        hojas.push({ ...nodo, profundidad });
      } else {
        walk(hijos, profundidad + 1);
      }
    });
  };
  walk(nodos);
  return hojas;
};

const calcularNotaNodo = (nodo, grades) => {
  const hijos = nodo.hijos || [];
  const esHoja = nodo.esHoja ?? nodo.es_hoja ?? hijos.length === 0;
  if (esHoja || hijos.length === 0) {
    return Number(grades[nodo.id] ?? 0);
  }
  return hijos.reduce((total, hijo) => {
    return total + calcularNotaNodo(hijo, grades) * ((Number(hijo.peso) || 0) / 100);
  }, 0);
};

const calcularNotaFinalArbol = (raices, grades) =>
  raices.reduce((total, nodo) => total + calcularNotaNodo(nodo, grades) * ((Number(nodo.peso) || 0) / 100), 0);

const NodoEvaluacion = ({ nodo, profundidad, grades, onGradeChange }) => {
  const hijos = nodo.hijos || [];
  const esHoja = nodo.esHoja ?? nodo.es_hoja ?? hijos.length === 0;
  const nota = calcularNotaNodo(nodo, grades);

  return (
    <div className="space-y-3" style={{ marginLeft: profundidad ? `${profundidad * 12}px` : 0 }}>
      <div className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs text-[#1A1A1A]">{nodo.nombre}</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                {Number(nodo.peso || 0)}%
              </span>
              {!esHoja && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800">
                  Calculado
                </span>
              )}
            </div>
            {nodo.descripcion && <p className="text-xs text-neutral-500 mt-1">{nodo.descripcion}</p>}
          </div>
          <div className="text-right shrink-0">
            <span className="text-xl font-black text-[#C8102E] bg-red-50 px-3 py-1 rounded-xl border border-red-100">
              {nota.toFixed(1)}
            </span>
            <span className="text-[10px] text-neutral-400 block mt-1">
              {esHoja ? 'Calificación directa' : 'Nota acumulada'}
            </span>
          </div>
        </div>

        {esHoja && (
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
            <label className="text-[11px] font-medium text-neutral-500">Calificación (0-5):</label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={grades[nodo.id] ?? ''}
              onChange={(e) => onGradeChange(nodo.id, e.target.value)}
              onBlur={(e) => onGradeChange(nodo.id, e.target.value === '' ? 0 : e.target.value)}
              className="w-28 px-3 py-2 text-sm font-bold text-right bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#C8102E]"
            />
          </div>
        )}
      </div>

      {hijos.map((hijo) => (
        <NodoEvaluacion
          key={hijo.id}
          nodo={hijo}
          profundidad={profundidad + 1}
          grades={grades}
          onGradeChange={onGradeChange}
        />
      ))}
    </div>
  );
};

export const EvaluacionProyecto = () => {
  const { projects, selectedProjectId, setSelectedProjectId, rubrics, saveEvaluation, showToast, user } = useApp();

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const [rubricId, setRubricId] = useState(() => rubrics.find((r) => r.activa)?.id || rubrics[0]?.id || '');
  const activeRubric = rubrics.find((r) => String(r.id) === String(rubricId)) || rubrics[0];
  const arbolCriterios = activeRubric?.criterios || [];
  const hojas = useMemo(() => obtenerHojas(arbolCriterios), [activeRubric?.id]);
  const existingEvaluation = selectedProject?.evaluacion;

  const [grades, setGrades] = useState({});
  const [feedback, setFeedback] = useState(
    'Excelente trabajo en la integración del concepto estético Antigravity y la arquitectura limpia de React. El cumplimiento de criterios de interfaz y conexión cumple con creces los requerimientos institucionales.'
  );

  React.useEffect(() => {
    if (existingEvaluation?.rubrica_id) setRubricId(existingEvaluation.rubrica_id);
  }, [existingEvaluation?.id_evaluacion]);

  React.useEffect(() => {
    if (!rubricId && rubrics[0]?.id) setRubricId(rubrics[0].id);
  }, [rubricId, rubrics]);

  React.useEffect(() => {
    const nextGrades = {};
    hojas.forEach((c) => {
      const existing = existingEvaluation?.detalles?.find((item) => String(item.criterio_id) === String(c.id));
      nextGrades[c.id] = existing?.nota ?? 0;
    });
    setGrades(nextGrades);
  }, [activeRubric?.id, existingEvaluation?.id_evaluacion]);

  const minFeedbackLength = 20;
  const currentFeedbackLength = feedback.trim().length;
  const isFeedbackValid = currentFeedbackLength >= minFeedbackLength;
  const finalGrade = Math.round(calcularNotaFinalArbol(arbolCriterios, grades) * 10) / 10;

  const handleGradeChange = (criterioId, val) => {
    if (val === '' || val === null || val === undefined) {
      setGrades((prev) => ({ ...prev, [criterioId]: '' }));
      return;
    }
    const nota = Number.parseFloat(val);
    if (Number.isNaN(nota)) return;
    setGrades((prev) => ({
      ...prev,
      [criterioId]: Math.min(5, Math.max(0, nota))
    }));
  };

  const buildEvalData = (estado) => ({
    id_evaluacion: existingEvaluation?.id_evaluacion,
    rubrica_id: activeRubric.id,
    docente: user?.nombre || 'Dr. Carlos Mario Morales',
    nota_final: finalGrade,
    retroalimentacion: feedback,
    estado,
    fecha: new Date().toISOString().split('T')[0],
    detalles: hojas.map((c) => ({
      criterio_id: c.id,
      nombre: c.nombre,
      peso: c.peso,
      nota: Math.min(5, Math.max(0, Number(grades[c.id]) || 0))
    }))
  });

  const handleSaveDraft = () => {
    saveEvaluation(selectedProject.id, buildEvalData('borrador'));
  };

  const handleCloseEvaluation = () => {
    if (!isFeedbackValid) {
      showToast('La retroalimentación debe tener al menos ' + minFeedbackLength + ' caracteres.', 'error');
      return;
    }
    saveEvaluation(selectedProject.id, buildEvalData('cerrada'));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-[#C8102E]" />
            <span className="text-xs font-bold text-[#C8102E] uppercase tracking-wider">Módulo de Calificación</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A]">Evaluación Paso a Paso de Proyectos</h1>
          <p className="text-xs text-neutral-500">Solo se califican criterios hoja; los nodos padre acumulan la nota ponderada.</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-neutral-500">Rúbrica:</label>
          <select value={rubricId} onChange={(e) => setRubricId(e.target.value)} className="px-3 py-2 text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-xl">
            {rubrics.filter((r) => r.activa).map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
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
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#1A1A1A]">
              Criterios de la Rúbrica: <span className="text-neutral-500 font-normal">{activeRubric?.nombre}</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {hojas.length} criterios hoja
            </span>
          </div>

          <div className="space-y-4">
            {arbolCriterios.map((nodo) => (
              <NodoEvaluacion
                key={nodo.id}
                nodo={nodo}
                profundidad={0}
                grades={grades}
                onGradeChange={handleGradeChange}
              />
            ))}
          </div>
        </div>

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
