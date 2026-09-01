import React, { useState } from 'react';
import { 
  GraduationCap, CheckCircle, Clock, Sliders, Award, Search, 
  Layers, FileSpreadsheet, UserPlus, UserMinus, FolderOpen, 
  AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Badge } from '../components/UIComponents';

export const DashboardDocente = () => {
  const { user, userProjects, unassignedProjects, setSelectedProjectId, setCurrentView, setSelectedTab, showToast, assignDocente, unassignDocente } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnassigned, setShowUnassigned] = useState(true);

  const proyectosFiltrados = userProjects.filter(p =>
    p.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.creador?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendientesEval = userProjects.filter(p => !p.evaluacion || p.evaluacion?.estado === 'borrador').length;
  const calificados = userProjects.filter(p => p.evaluacion?.estado === 'cerrada').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1A1A1A] via-[#2A2020] to-[#1A1A1A] text-white p-8 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#C9A84C]/25 via-[#C8102E]/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#C9A84C] mb-3 border border-white/10 backdrop-blur-md">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Panel Docente / Asesor UPB</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-[#C9A84C]">{user?.nombre}</span>
            </h1>
            <p className="text-neutral-400 text-sm mt-1 max-w-xl">
              Solo ves los proyectos que tienes asignados como asesor. Toma proyectos disponibles desde la seccion inferior.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="gold" icon={Sliders} onClick={() => setCurrentView('gestion_rubricas')}>Gestionar Rubricas</Button>
            <Button variant="secondary" icon={Award} onClick={() => setCurrentView('evaluacion_proyecto')}>Evaluar Entrega</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Mis Proyectos</p>
            <h3 className="text-3xl font-extrabold text-[#1A1A1A] mt-1">{userProjects.length}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Asignados a ti</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-700"><Layers className="w-6 h-6" /></div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pendientes de Calificar</p>
            <h3 className="text-3xl font-extrabold text-[#1A1A1A] mt-1">{pendientesEval}</h3>
            <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">Sin nota final</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600"><Clock className="w-6 h-6" /></div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Proyectos Evaluados</p>
            <h3 className="text-3xl font-extrabold text-[#1A1A1A] mt-1">{calificados}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Con nota registrada</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle className="w-6 h-6" /></div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A]">Mis Proyectos Asignados</h2>
            <p className="text-xs text-neutral-500">Solo los proyectos donde eres el asesor registrado.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input type="text" placeholder="Buscar proyecto o estudiante..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-[#C8102E] w-60" />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            </div>
            <Button variant="secondary" size="sm" icon={FileSpreadsheet} onClick={() => showToast('Exportando consolidado de notas')}>Exportar</Button>
          </div>
        </div>

        {proyectosFiltrados.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FolderOpen className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="text-sm font-semibold text-neutral-600">Aun no tienes proyectos asignados</p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">Desplazate a la seccion <strong>Proyectos Disponibles</strong> y asignate como asesor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">Proyecto</th>
                  <th className="pb-3 px-3">Lider</th>
                  <th className="pb-3 px-3">Avance</th>
                  <th className="pb-3 px-3">Estado</th>
                  <th className="pb-3 px-3">Nota</th>
                  <th className="pb-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {proyectosFiltrados.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors group">
                    <td className="py-4 px-3">
                      <p className="font-bold text-[#1A1A1A] group-hover:text-[#C8102E] transition-colors">{p.titulo}</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{p.curso} - {p.periodo}</p>
                    </td>
                    <td className="py-4 px-3">
                      <p className="font-semibold text-neutral-700">{p.creador}</p>
                      <p className="text-[11px] text-neutral-400">{p.integrantes?.length || 1} integrante(s)</p>
                    </td>
                    <td className="py-4 px-3">
                      <div className="w-28">
                        <div className="text-[10px] font-bold text-neutral-600 mb-1">{p.porcentaje_avance || 0}%</div>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#C8102E] to-[#C9A84C]" style={{ width: `${p.porcentaje_avance || 0}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3"><Badge status={p.estado} /></td>
                    <td className="py-4 px-3">
                      {p.evaluacion ? (
                        <span className="font-extrabold text-sm text-[#C8102E] bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">{p.evaluacion.nota_final} / 5.0</span>
                      ) : (
                        <span className="text-neutral-400 italic">Sin calificar</span>
                      )}
                    </td>
                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelectedProjectId(p.id); setCurrentView('ficha_proyecto'); setSelectedTab('ficha'); }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-all">
                          Ficha
                        </button>
                        <button onClick={() => { setSelectedProjectId(p.id); setCurrentView('evaluacion_proyecto'); }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#C8102E] hover:bg-[#A60D26] text-white transition-all shadow-sm">
                          {p.evaluacion ? 'Revisar Nota' : 'Evaluar'}
                        </button>
                        <button onClick={() => unassignDocente(p.id)} title="Desasignarme"
                          className="p-1.5 rounded-lg bg-neutral-100 hover:bg-red-50 hover:text-red-600 text-neutral-400 transition-all">
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        <button type="button" onClick={() => setShowUnassigned(!showUnassigned)}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1A1A]">
                Proyectos Disponibles para Tomar
                {unassignedProjects.length > 0 && (
                  <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{unassignedProjects.length} sin asesor</span>
                )}
              </h2>
              <p className="text-xs text-neutral-500">Proyectos de estudiantes sin docente asesor asignado aun.</p>
            </div>
          </div>
          {showUnassigned ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </button>

        {showUnassigned && (
          <div className="px-6 pb-6">
            {unassignedProjects.length === 0 ? (
              <div className="py-10 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 rounded-2xl">
                <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                Todos los proyectos tienen asesor asignado. Buen trabajo!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {unassignedProjects.map((p) => (
                  <div key={p.id} className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50 hover:border-[#C9A84C]/40 hover:bg-amber-50/30 transition-all space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#1A1A1A] leading-snug truncate">{p.titulo}</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">{p.curso} - {p.periodo}</p>
                      </div>
                      <Badge status={p.estado} />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                      <GraduationCap className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="font-semibold">{p.creador}</span>
                      <span className="text-neutral-400">- {p.integrantes?.length || 1} integrante(s)</span>
                    </div>
                    {p.descripcion && <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">{p.descripcion}</p>}
                    <div className="pt-3 border-t border-neutral-200 flex items-center gap-2">
                      <Button variant="primary" size="sm" icon={UserPlus} onClick={() => assignDocente(p.id)} className="flex-1">
                        Asignarme como Asesor
                      </Button>
                      <button onClick={() => { setSelectedProjectId(p.id); setCurrentView('ficha_proyecto'); setSelectedTab('ficha'); }}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-600 transition-all">
                        Ver Ficha
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};