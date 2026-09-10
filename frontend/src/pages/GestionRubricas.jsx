import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Save,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Layers,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, FloatingInput } from '../components/UIComponents';
import NodoRubricaItem from '../components/NodoRubricaItem';

const NIVEL_DEFAULT = [0, 1, 2, 3, 4, 5].map((nivel) => ({
  nivel,
  puntos: nivel,
  descripcion: ''
}));

const crearNodo = ({ parentId = null, tipo, esHoja, peso = 0 }) => ({
  id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  nombre: '',
  descripcion: '',
  peso,
  parentId,
  esHoja,
  tipo,
  niveles: esHoja ? NIVEL_DEFAULT.map((n) => ({ ...n })) : [],
  hijos: []
});

const validarEstructuraJerarquica = (criterios = []) => {
  const errores = [];

  const validarGrupo = (hermanos, etiqueta) => {
    if (!hermanos.length) return;
    const suma = hermanos.reduce((sum, c) => sum + (Number(c.peso) || 0), 0);
    if (Math.abs(suma - 100) > 0.01) {
      errores.push(`${etiqueta} deben sumar 100%. Actual: ${suma.toFixed(2)}%`);
    }
  };

  const validarNodo = (nodo, ruta = []) => {
    const rutaStr = [...ruta, nodo.nombre || 'Sin nombre'].join(' > ');
    const hijos = nodo.hijos || [];
    const esHoja = nodo.esHoja ?? nodo.es_hoja ?? hijos.length === 0;

    if (!nodo.nombre?.trim()) {
      errores.push(`Hay un nodo sin nombre en "${rutaStr}".`);
    }

    if (hijos.length > 0) {
      if (esHoja) {
        errores.push(`"${rutaStr}": un nodo no puede ser hoja si tiene subcategorías.`);
      }
      validarGrupo(hijos, `Los hijos de "${rutaStr}"`);
      hijos.forEach((hijo) => validarNodo(hijo, [...ruta, nodo.nombre || 'Sin nombre']));
    } else if (esHoja === false) {
      errores.push(`"${rutaStr}" está marcado como intermedio pero no tiene hijos.`);
    }

    if (esHoja) {
      (nodo.niveles || []).forEach((nivel) => {
        const puntos = Number(nivel.puntos);
        if (Number.isNaN(puntos) || puntos < 0 || puntos > 5) {
          errores.push(`"${rutaStr}": los puntos del nivel ${nivel.nivel} deben estar entre 0.0 y 5.0.`);
        }
      });
    }
  };

  validarGrupo(criterios, 'Los cortes académicos (raíz)');
  criterios.forEach((raiz) => validarNodo(raiz, []));

  return { esValido: errores.length === 0, errores };
};

const actualizarNodo = (nodos, id, updater) =>
  nodos.map((nodo) => {
    if (nodo.id === id) return updater(nodo);
    return { ...nodo, hijos: actualizarNodo(nodo.hijos || [], id, updater) };
  });

const reordenarNodos = (nodos, id, direccion) => {
  const idx = nodos.findIndex((nodo) => nodo.id === id);
  if (idx !== -1) {
    const siguiente = direccion === 'up' ? idx - 1 : idx + 1;
    if (siguiente < 0 || siguiente >= nodos.length) return nodos;
    const copia = [...nodos];
    [copia[idx], copia[siguiente]] = [copia[siguiente], copia[idx]];
    return copia;
  }
  return nodos.map((nodo) => ({
    ...nodo,
    hijos: reordenarNodos(nodo.hijos || [], id, direccion)
  }));
};

const contarNodos = (nodos = []) =>
  nodos.reduce((total, nodo) => total + 1 + contarNodos(nodo.hijos || []), 0);

const recogerIds = (nodos = []) =>
  nodos.flatMap((nodo) => [nodo.id, ...recogerIds(nodo.hijos || [])]);

export const GestionRubricas = () => {
  const { rubrics, addRubric, showToast, user } = useApp();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [criterios, setCriterios] = useState([
    crearNodo({ tipo: 'CORTE_ACADEMICO', esHoja: true, peso: 100 })
  ]);
  const [expandidos, setExpandidos] = useState(new Set());
  const [minimizados, setMinimizados] = useState(new Set());

  const validacion = validarEstructuraJerarquica(criterios);
  const isValid = validacion.esValido;
  const sumaRaices = criterios.reduce((sum, c) => sum + (Number(c.peso) || 0), 0);

  const toggleExpanded = (id) => {
    const next = new Set(expandidos);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandidos(next);
  };

  const toggleMinimizar = (id) => {
    setMinimizados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const minimizarTodas = () => setMinimizados(new Set(recogerIds(criterios)));
  const expandirTodas = () => setMinimizados(new Set());

  const agregarSubcriterio = (parentId, nivelPadre = 0) => {
    const tipoHijo = nivelPadre === 0 ? 'ACTIVIDAD' : 'CRITERIO_EVALUABLE';
    setCriterios((prev) =>
      actualizarNodo(prev, parentId, (nodo) => ({
        ...nodo,
        esHoja: false,
        niveles: [],
        hijos: [
          ...(nodo.hijos || []),
          crearNodo({
            parentId,
            tipo: tipoHijo,
            esHoja: tipoHijo === 'CRITERIO_EVALUABLE'
          })
        ]
      }))
    );
    setExpandidos((prev) => new Set([...prev, parentId]));
  };

  const eliminarCriterio = (id) => {
    const eliminar = (nodos) =>
      nodos
        .filter((nodo) => nodo.id !== id)
        .map((nodo) => ({ ...nodo, hijos: eliminar(nodo.hijos || []) }));

    const siguiente = eliminar(criterios);
    if (siguiente.length === 0) {
      showToast('La rúbrica debe contener al menos un criterio raíz', 'error');
      return;
    }
    setCriterios(siguiente);
  };

  const cambiarCriterio = (id, campo, valor) => {
    setCriterios((prev) =>
      actualizarNodo(prev, id, (nodo) => {
        if (campo === 'esHoja') {
          const esHoja = Boolean(valor);
          if (esHoja && (nodo.hijos || []).length > 0) {
            showToast('Elimina las subcategorías antes de convertir el nodo en hoja', 'error');
            return nodo;
          }
          if (!esHoja) {
            setExpandidos((prev) => new Set([...prev, id]));
          }
          return {
            ...nodo,
            esHoja,
            tipo: esHoja ? 'CRITERIO_EVALUABLE' : (nodo.parentId ? 'ACTIVIDAD' : 'CORTE_ACADEMICO'),
            niveles: esHoja ? NIVEL_DEFAULT.map((n) => ({ ...n })) : [],
            hijos: esHoja ? [] : (nodo.hijos?.length ? nodo.hijos : [
              crearNodo({
                parentId: nodo.id,
                tipo: nodo.parentId ? 'CRITERIO_EVALUABLE' : 'ACTIVIDAD',
                esHoja: Boolean(nodo.parentId)
              })
            ])
          };
        }
        return { ...nodo, [campo]: campo === 'peso' ? parseFloat(valor) || 0 : valor };
      })
    );
  };

  const cambiarNivel = (id, nivel, campo, valor) => {
    setCriterios((prev) =>
      actualizarNodo(prev, id, (nodo) => {
        const actuales = [...(nodo.niveles || [])];
        const idx = actuales.findIndex((n) => Number(n.nivel) === Number(nivel));
        const siguienteValor = campo === 'puntos'
          ? Math.min(5, Math.max(0, Number.parseFloat(valor) || 0))
          : valor;
        if (idx === -1) {
          actuales.push({ nivel, puntos: campo === 'puntos' ? siguienteValor : nivel, descripcion: campo === 'descripcion' ? valor : '' });
        } else {
          actuales[idx] = { ...actuales[idx], [campo]: siguienteValor };
        }
        return { ...nodo, niveles: actuales };
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      showToast('Por favor ingresa un nombre para la rúbrica', 'error');
      return;
    }
    if (!isValid) {
      showToast('Estructura jerárquica inválida: ' + validacion.errores[0], 'error');
      return;
    }

    const ok = await addRubric({
      nombre,
      descripcion,
      activa: true,
      id_docente: user?.id || 10,
      docente_nombre: user?.nombre || 'Dr. Carlos Mario Morales',
      criterios
    });

    if (ok === false) return;

    setNombre('');
    setDescripcion('');
    setCriterios([crearNodo({ tipo: 'CORTE_ACADEMICO', esHoja: true, peso: 100 })]);
    setExpandidos(new Set());
    setMinimizados(new Set());
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-4 h-4 text-[#C9A84C]" />
            <span className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider">Módulo Docente</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A]">Gestión de Rúbricas Jerárquicas Multinivel</h1>
          <p className="text-xs text-neutral-500">Constructor árbol padre-hijo con validación automática de ponderaciones por nivel y matriz de desempeño.</p>
        </div>

        <div
          className={`px-5 py-3 rounded-2xl border transition-all duration-300 flex items-center gap-3 ${
            Math.abs(sumaRaices - 100) < 0.01
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider block">Cortes (Raíz)</span>
            <span className="text-xl font-black">{sumaRaices.toFixed(1)}% / 100%</span>
          </div>
          {isValid ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          ) : (
            <AlertCircle className="w-7 h-7 text-red-600" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[#1A1A1A]">Rúbricas Institucionales</h3>
          {rubrics.length === 0 ? (
            <div className="bg-white p-5 rounded-3xl border border-dashed border-neutral-200 text-sm text-neutral-500">
              Aún no hay rúbricas creadas.
            </div>
          ) : (
            rubrics.map((rub) => (
              <div
                key={rub.id}
                className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm space-y-3 hover:border-neutral-200 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-xs text-[#1A1A1A]">{rub.nombre}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      rub.activa ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {rub.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 line-clamp-2">{rub.descripcion}</p>
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>{contarNodos(rub.criterios || [])} nodos</span>
                  <span className="font-semibold text-neutral-700">Árbol validado</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
            <h3 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C8102E]" />
              Constructor jerárquico multinivel
            </h3>

            <div className="space-y-4">
              <FloatingInput
                label="Nombre de la Rúbrica (ej: Evaluación Integrada 2026)"
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
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-4 h-4" />
                  Estructura jerárquica
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Minimize2}
                    onClick={(e) => {
                      e.preventDefault();
                      minimizarTodas();
                    }}
                  >
                    Minimizar todas
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Maximize2}
                    onClick={(e) => {
                      e.preventDefault();
                      expandirTodas();
                    }}
                  >
                    Ver completas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Plus}
                    onClick={(e) => {
                      e.preventDefault();
                      setCriterios((prev) => [...prev, crearNodo({ tipo: 'CORTE_ACADEMICO', esHoja: true, peso: 0 })]);
                    }}
                  >
                    Agregar corte
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {criterios.map((criterio, idx) => (
                  <NodoRubricaItem
                    key={criterio.id}
                    criterio={criterio}
                    nivel={0}
                    indice={idx}
                    totalHermanos={criterios.length}
                    onAgregarSubcriterio={agregarSubcriterio}
                    onEliminar={eliminarCriterio}
                    onCambiar={cambiarCriterio}
                    onCambiarNivel={cambiarNivel}
                    onReordenar={(id, direccion) => setCriterios((prev) => reordenarNodos(prev, id, direccion))}
                    expandidos={expandidos}
                    onToggleExpander={toggleExpanded}
                    minimizados={minimizados}
                    onToggleMinimizar={toggleMinimizar}
                  />
                ))}
              </div>

              {validacion.errores.length > 0 && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-1">
                  {validacion.errores.map((error, idx) => (
                    <p key={idx} className="text-xs text-red-700 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {!isValid && (
                  <p className="text-xs text-red-700 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    Corrige la estructura jerárquica
                  </p>
                )}
                {isValid && (
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Estructura válida. Lista para guardar.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant={isValid ? 'primary' : 'secondary'}
                disabled={!isValid}
                icon={Save}
                size="lg"
              >
                Guardar rúbrica jerárquica
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
