import React from 'react';
import { Award, CheckCircle2, Users, X } from 'lucide-react';
import { Button } from './UIComponents';

export const MatrizCriteriosModal = ({ actividad, onClose }) => {
  if (!actividad) return null;

  const criterios = Array.isArray(actividad.criterios_snapshot)
    ? actividad.criterios_snapshot.filter((criterio) => criterio.seleccionado !== false && criterio.es_hoja)
    : [];
  const coevaluacion = actividad.rubrica_coevaluacion?.criterios || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Matriz de criterios">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <header className="p-6 bg-[#1A1A1A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-[#C9A84C]" />
            <div><h2 className="text-lg font-black">{actividad.nombre}</h2><p className="text-xs text-neutral-300">Criterios y matriz de calificacion</p></div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20" aria-label="Cerrar matriz"><X className="w-5 h-5" /></button>
        </header>
        <div className="p-6 overflow-y-auto space-y-6">
          <section className="space-y-4">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#C8102E]" /><h3 className="font-extrabold text-sm uppercase tracking-wider">Criterios docentes ({criterios.length})</h3></div>
            {criterios.length === 0 && <p className="text-sm text-neutral-500">Esta actividad no tiene criterios visibles.</p>}
            {criterios.map((criterio) => (
              <article key={criterio.id_criterio} className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-bold text-sm text-neutral-900">{criterio.nombre}</h4><span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#C8102E]/10 text-[#C8102E]">Ponderacion: {criterio.peso}%</span></div>
                {criterio.descripcion && <p className="text-xs text-neutral-500 leading-relaxed">{criterio.descripcion}</p>}
                <div className="overflow-x-auto"><table className="w-full text-left text-xs bg-white rounded-xl border border-neutral-200"><thead className="bg-neutral-100 text-neutral-600 font-bold"><tr><th className="py-2.5 px-3 text-center">Nivel</th><th className="py-2.5 px-3 text-center">Puntos</th><th className="py-2.5 px-4">Descripcion cualitativa</th></tr></thead><tbody className="divide-y divide-neutral-100">{[...(criterio.niveles || [])].sort((a, b) => b.nivel - a.nivel).map((nivel) => <tr key={nivel.nivel}><td className="py-2.5 px-3 text-center font-bold">{nivel.nivel}</td><td className="py-2.5 px-3 text-center font-extrabold text-[#C8102E]">{Number(nivel.puntos).toFixed(1)}</td><td className="py-2.5 px-4 text-neutral-600">{nivel.descripcion || 'Cumple los requisitos correspondientes a este nivel.'}</td></tr>)}</tbody></table></div>
              </article>
            ))}
          </section>
          {actividad.tipo === 'GRUPAL' && actividad.coevaluacion_activa && <section className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3"><div className="flex items-center gap-2 text-amber-900 font-bold text-sm"><Users className="w-4 h-4 text-amber-700" /><span>Matriz de coevaluacion</span></div><p className="text-xs text-amber-800">Tus companeros valoraran estos criterios de 0 a 100 puntos.</p>{coevaluacion.length ? <div className="grid sm:grid-cols-2 gap-2">{coevaluacion.map((criterio) => <div key={criterio.id_criterio} className="p-3 bg-white rounded-xl border border-amber-100 text-xs"><p className="font-bold text-neutral-800">{criterio.nombre}</p><p className="text-[10px] text-amber-700 font-semibold mt-0.5">Peso relativo: {criterio.peso}%</p></div>)}</div> : <p className="text-xs text-amber-800">La matriz de coevaluacion aun no esta disponible.</p>}</section>}
        </div>
        <footer className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end"><Button variant="secondary" onClick={onClose}>Cerrar</Button></footer>
      </div>
    </div>
  );
};
