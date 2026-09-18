import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  GitBranch,
  ArrowUp,
  ArrowDown,
  Minimize2,
  Maximize2
} from 'lucide-react';

const NodoRubricaItem = ({
  criterio,
  nivel = 0,
  indice,
  totalHermanos,
  onAgregarSubcriterio,
  onEliminar,
  onCambiar,
  onCambiarNivel,
  onReordenar,
  expandidos,
  onToggleExpander,
  minimizados,
  onToggleMinimizar,
  maxPuntos = 5,
  nivelesPuntos = null
}) => {
  const [mostrarNiveles, setMostrarNiveles] = useState(true);
  const hijos = criterio.hijos || [];
  const esExpandible = hijos.length > 0;
  const isExpanded = expandidos.has(criterio.id);
  const cuerpoVisible = !minimizados?.has(criterio.id);
  const esHoja = criterio.esHoja ?? criterio.es_hoja ?? hijos.length === 0;

  const sumaPeso = hijos.reduce((sum, h) => sum + (Number(h.peso) || 0), 0);
  const sumaValida = hijos.length === 0 || Math.abs(sumaPeso - 100) < 0.01;

  const backgroundNivel = [
    'bg-gradient-to-r from-blue-50 to-blue-100',
    'bg-gradient-to-r from-purple-50 to-purple-100',
    'bg-gradient-to-r from-amber-50 to-amber-100',
    'bg-gradient-to-r from-green-50 to-green-100'
  ][nivel % 4];

  const borderNivel = [
    'border-blue-200',
    'border-purple-200',
    'border-amber-200',
    'border-green-200'
  ][nivel % 4];

  const labelTipo = {
    CORTE_ACADEMICO: 'Corte Académico',
    ACTIVIDAD: 'Actividad / Entrega',
    CRITERIO_EVALUABLE: 'Criterio Evaluable'
  }[criterio.tipo] || 'Nodo';

  return (
    <div className="space-y-2">
      <div
        className={`rounded-2xl border-2 ${backgroundNivel} ${borderNivel} ${cuerpoVisible ? 'p-4 space-y-4' : 'px-4 py-2.5'}`}
        style={{ marginLeft: `${nivel * 16}px` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {esExpandible && (
              <button
                type="button"
                onClick={() => onToggleExpander(criterio.id)}
                className="text-neutral-600 hover:text-neutral-900 transition shrink-0"
                title={isExpanded ? 'Ocultar hijos' : 'Mostrar hijos'}
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            )}
            {!esExpandible && (
              <GitBranch className="w-5 h-5 text-neutral-400 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-neutral-600 uppercase">
                  {labelTipo}
                </span>
                {nivel > 0 && (
                  <span className="text-xs bg-white px-2 py-0.5 rounded text-neutral-700 font-mono">
                    Nivel {nivel}
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    esHoja ? 'bg-white text-emerald-800' : 'bg-white/70 text-neutral-700'
                  }`}
                >
                  {esHoja ? 'Hoja evaluable' : 'Nodo intermedio'}
                </span>
                {!cuerpoVisible && (
                  <>
                    <span className="text-xs font-semibold text-neutral-800 truncate max-w-[220px]">
                      {criterio.nombre?.trim() || 'Sin nombre'}
                    </span>
                    <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full text-neutral-700">
                      {Number(criterio.peso) || 0}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {hijos.length > 0 && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  sumaValida ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {sumaPeso.toFixed(1)}%
              </span>
            )}
            <button
              type="button"
              onClick={() => onToggleMinimizar?.(criterio.id)}
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-neutral-300 bg-white text-neutral-600 hover:border-[#C8102E] hover:text-[#C8102E] hover:bg-white transition"
              title={cuerpoVisible ? 'Minimizar tarjeta' : 'Ver completa'}
              aria-label={cuerpoVisible ? 'Minimizar tarjeta' : 'Ver completa'}
            >
              {cuerpoVisible ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => onReordenar(criterio.id, 'up')}
              disabled={indice === 0}
              className="text-neutral-400 hover:text-neutral-800 disabled:opacity-30 p-1"
              title="Subir"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onReordenar(criterio.id, 'down')}
              disabled={indice === totalHermanos - 1}
              className="text-neutral-400 hover:text-neutral-800 disabled:opacity-30 p-1"
              title="Bajar"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onEliminar(criterio.id)}
              className="text-neutral-400 hover:text-red-600 transition p-1"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {cuerpoVisible && (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-neutral-700 mb-1">Nombre</label>
            <input
              type="text"
              placeholder={`Nombre de ${labelTipo.toLowerCase()}`}
              value={criterio.nombre || ''}
              onChange={(e) => onCambiar(criterio.id, 'nombre', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-neutral-300 focus:outline-none focus:border-[#C8102E]"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-neutral-700 mb-1">Ponderación %</label>
            <input
              type="number"
              placeholder="Peso %"
              min="0"
              max="100"
              step="0.1"
              value={criterio.peso ?? ''}
              onChange={(e) => onCambiar(criterio.id, 'peso', e.target.value)}
              className="w-full px-3 py-2 text-sm font-bold bg-white rounded-lg border border-neutral-300 focus:outline-none focus:border-[#C8102E]"
              required
            />
            <span className="absolute right-3 top-7 text-xs text-neutral-500">%</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">Descripción</label>
          <textarea
            placeholder="Descripción y/o instrucciones de evaluación..."
            value={criterio.descripcion || ''}
            onChange={(e) => onCambiar(criterio.id, 'descripcion', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-neutral-300 focus:outline-none focus:border-[#C8102E]"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
          <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              checked={!esHoja}
              onChange={(e) => onCambiar(criterio.id, 'esHoja', !e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 cursor-pointer"
            />
            Tiene subcategorías
          </label>

          {!esHoja && (
            <button
              type="button"
              onClick={() => onAgregarSubcriterio(criterio.id, nivel)}
              className="flex items-center gap-1 text-xs text-[#C8102E] hover:text-[#A00724] font-bold transition"
            >
              <Plus className="w-4 h-4" />
              Agregar {nivel === 0 ? 'actividad' : 'criterio hoja'}
            </button>
          )}
        </div>

        {esHoja && (
          <div className="border-t pt-3">
            <button
              type="button"
              onClick={() => setMostrarNiveles(!mostrarNiveles)}
              className="flex items-center gap-1 text-xs font-bold text-neutral-700 hover:text-[#C8102E] transition mb-2"
            >
              {mostrarNiveles ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              Matriz de niveles de desempeño (0-{maxPuntos})
            </button>

            {mostrarNiveles && (
              <div className="space-y-2 bg-white p-3 rounded-lg border border-neutral-200">
                {(nivelesPuntos || [0, 1, 2, 3, 4, 5]).map((nivelDesempeno, indiceNivel) => {
                  const nivelId = nivelesPuntos ? indiceNivel : nivelDesempeno;
                  const nivelExistente = (criterio.niveles || []).find((n) => Number(n.nivel) === nivelId) || {
                    nivel: nivelId,
                    puntos: nivelDesempeno,
                    descripcion: ''
                  };
                  return (
                    <div key={nivelDesempeno} className="grid grid-cols-12 gap-2 text-xs">
                      <div className="col-span-1 font-bold bg-neutral-100 rounded p-1 text-center">
                        {nivelesPuntos ? indiceNivel : nivelDesempeno}
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max={maxPuntos}
                        placeholder="Puntos"
                        value={nivelExistente.puntos ?? ''}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === '') {
                            onCambiarNivel(criterio.id, nivelId, 'puntos', 0);
                            return;
                          }
                          const puntos = Number(raw);
                          if (Number.isNaN(puntos)) return;
                          onCambiarNivel(
                            criterio.id,
                            nivelId,
                            'puntos',
                            Math.min(maxPuntos, Math.max(0, puntos))
                          );
                        }}
                        className="col-span-2 px-2 py-1 border border-neutral-200 rounded"
                      />
                      <input
                        type="text"
                        placeholder="Descripción cualitativa"
                        value={nivelExistente.descripcion || ''}
                        onChange={(e) => onCambiarNivel(criterio.id, nivelId, 'descripcion', e.target.value)}
                        className="col-span-9 px-2 py-1 border border-neutral-200 rounded"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        </>
        )}
      </div>

      {hijos.length > 0 && (
        <div
          className={`mx-2 p-2 rounded text-xs font-bold flex items-center gap-2 ${
            sumaValida
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
          style={{ marginLeft: `${nivel * 16}px` }}
        >
          {sumaValida ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {sumaValida
            ? `Hermanos suman ${sumaPeso.toFixed(1)}%`
            : `Hermanos suman ${sumaPeso.toFixed(1)}% (deben ser 100%)`}
        </div>
      )}

      {isExpanded && hijos.length > 0 && (
        <div className="space-y-2">
          {hijos.map((hijo, idx) => (
            <NodoRubricaItem
              key={hijo.id}
              criterio={hijo}
              nivel={nivel + 1}
              indice={idx}
              totalHermanos={hijos.length}
              onAgregarSubcriterio={onAgregarSubcriterio}
              onEliminar={onEliminar}
              onCambiar={onCambiar}
              onCambiarNivel={onCambiarNivel}
              onReordenar={onReordenar}
              expandidos={expandidos}
              onToggleExpander={onToggleExpander}
              minimizados={minimizados}
              onToggleMinimizar={onToggleMinimizar}
              maxPuntos={maxPuntos}
              nivelesPuntos={nivelesPuntos}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NodoRubricaItem;
