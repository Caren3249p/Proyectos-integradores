import React, { useState } from 'react';
import { 
  FolderPlus, 
  UploadCloud, 
  Sparkles, 
  ArrowUpRight, 
  TrendingUp, 
  FileCheck,
  Plus,
  ArrowRight,
  FolderKanban,
  Kanban
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Badge } from '../components/UIComponents';
import { ModalCrearProyecto } from '../components/ModalCrearProyecto';

export const DashboardEstudiante = () => {
  const { user, currentProject, currentProjectIssues, setCurrentView, setSelectedTab, addProjectTask, updateTaskState, showToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(false);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !currentProject) return;
    addProjectTask(currentProject.id, newTaskTitle.trim());
    setNewTaskTitle('');
    setShowTaskInput(false);
  };

  const porHacerTasks = (currentProjectIssues || []).filter(i => i.estado === 'por_hacer');
  const enProgresoTasks = (currentProjectIssues || []).filter(i => i.estado === 'en_progreso');
  const completadasTasks = (currentProjectIssues || []).filter(i => i.estado === 'completado');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Modal para Crear Proyecto */}
      <ModalCrearProyecto isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1A1A1A] via-[#242424] to-[#1A1A1A] text-white p-8 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#C8102E]/30 via-[#C9A84C]/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#C9A84C] mb-3 border border-white/10 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Semestre Academico 2026-10</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-[#C9A84C]">{user?.nombre || 'Estudiante'}</span>
            </h1>
            <p className="text-neutral-400 text-sm mt-1 max-w-xl">
              Plataforma de gestion y seguimiento continuo de Proyectos Integradores UPB.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentProject && (
              <Button
                variant="primary"
                icon={UploadCloud}
                onClick={() => {
                  setCurrentView('ficha_proyecto');
                  setSelectedTab('versiones');
                }}
              >
                Registrar Entrega
              </Button>
            )}
            <Button
              variant="secondary"
              icon={FolderPlus}
              onClick={() => setIsModalOpen(true)}
            >
              Nuevo Proyecto
            </Button>
          </div>
        </div>
      </div>

      {/* Si el estudiante NO tiene ningun proyecto creado o asignado */}
      {!currentProject ? (
        <div className="bg-white rounded-3xl border border-neutral-100 p-12 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#C8102E]/10 text-[#C8102E] flex items-center justify-center mx-auto shadow-inner">
            <FolderKanban className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-[#1A1A1A]">No tienes ningun proyecto activo asignado</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Tu cuenta ({user?.correo}) aun no tiene proyectos registrados. Crea tu ficha tecnica para comenzar.
            </p>
          </div>
          <Button
            variant="primary"
            icon={FolderPlus}
            size="lg"
            onClick={() => setIsModalOpen(true)}
          >
            Crear mi Primer Proyecto
          </Button>
        </div>
      ) : (
        /* Main Project Floating Card */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-neutral-100 p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C8102E] via-[#E5B83B] to-[#C8102E]"></div>

              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C8102E]">Proyecto Activo Asignado</span>
                  <h2 className="text-xl font-bold text-[#1A1A1A] mt-1 group-hover:text-[#C8102E] transition-colors">
                    {currentProject?.titulo}
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">{currentProject?.curso} - Periodo {currentProject?.periodo}</p>
                </div>
                <Badge status={currentProject?.estado} className="shrink-0" />
              </div>

              <p className="text-sm text-neutral-600 line-clamp-2 mb-6">
                {currentProject?.descripcion}
              </p>

              {/* Dynamic Antigravity Progress Bar */}
              <div className="mb-6 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-neutral-700 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#C8102E]" />
                    Porcentaje de Avance General
                  </span>
                  <span className="text-base font-extrabold text-[#C8102E]">
                    {currentProject?.porcentaje_avance || 0}%
                  </span>
                </div>
                <div className="h-3 w-full bg-neutral-200/80 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-[#C8102E] via-[#D4AF37] to-[#C9A84C] transition-all duration-1000 shadow-sm"
                    style={{ width: (currentProject?.porcentaje_avance || 0) + '%' }}
                  ></div>
                </div>
              </div>

              {/* Project Quick Meta & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {currentProject?.integrantes?.map((m) => (
                      <div 
                        key={m.id} 
                        className="w-8 h-8 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-600 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white shadow-sm"
                        title={m.nombre + ' (' + m.rol + ')'}
                      >
                        {m.nombre.charAt(0)}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-neutral-500 font-medium pl-1">
                    {currentProject?.integrantes?.length || 1} Integrantes
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentView('ficha_proyecto');
                      setSelectedTab('ficha');
                    }}
                  >
                    Ver Ficha Completa
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ArrowUpRight}
                    onClick={() => {
                      setCurrentView('ficha_proyecto');
                      setSelectedTab('backlog');
                    }}
                  >
                    Tablero Kanban
                  </Button>
                </div>
              </div>
            </div>

            {/* Interactive Native Kanban for THIS project */}
            <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C8102E]"></div>
                  <h3 className="font-bold text-sm text-[#1A1A1A]">Tablero Backlog / Tareas del Proyecto</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTaskInput(!showTaskInput)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nueva Tarea</span>
                </button>
              </div>

              {showTaskInput && (
                <form onSubmit={handleAddTask} className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe el titulo de la nueva tarea para tu proyecto..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white rounded-xl border border-neutral-200 focus:outline-none focus:border-[#C8102E]"
                    autoFocus
                  />
                  <Button type="submit" size="sm" variant="primary">
                    Agregar
                  </Button>
                </form>
              )}

              {currentProjectIssues.length === 0 ? (
                <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 text-xs text-neutral-500">
                  <Kanban className="w-6 h-6 mx-auto mb-2 text-neutral-400" />
                  Aun no has agregado tareas a este proyecto. Haz clic en <strong>"Nueva Tarea"</strong> para planificar tu avance.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Columna Por Hacer */}
                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600">
                      <span>POR HACER ({porHacerTasks.length})</span>
                      <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
                    </div>
                    {porHacerTasks.map(t => (
                      <div key={t.id} className="bg-white p-3 rounded-xl border border-neutral-200/70 shadow-sm space-y-2">
                        <span className="text-[9px] font-bold text-[#C8102E]">{t.id}</span>
                        <p className="text-xs font-semibold text-neutral-800 leading-tight">{t.titulo}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[10px]">
                          <span className="text-neutral-400">{t.modulo}</span>
                          <button 
                            type="button"
                            onClick={() => updateTaskState(currentProject.id, t.id, 'en_progreso')}
                            className="text-[#C8102E] font-bold hover:underline flex items-center gap-0.5"
                          >
                            <span>Mover</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Columna En Progreso */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-800">
                      <span>EN PROGRESO ({enProgresoTasks.length})</span>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    </div>
                    {enProgresoTasks.map(t => (
                      <div key={t.id} className="bg-white p-3 rounded-xl border border-amber-200/70 shadow-sm space-y-2">
                        <span className="text-[9px] font-bold text-amber-600">{t.id}</span>
                        <p className="text-xs font-semibold text-neutral-800 leading-tight">{t.titulo}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[10px]">
                          <span className="text-neutral-400">{t.modulo}</span>
                          <button 
                            type="button"
                            onClick={() => updateTaskState(currentProject.id, t.id, 'completado')}
                            className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
                          >
                            <span>Completar</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Columna Completado */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                      <span>COMPLETADO ({completadasTasks.length})</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </div>
                    {completadasTasks.map(t => (
                      <div key={t.id} className="bg-white p-3 rounded-xl border border-emerald-200/70 shadow-sm space-y-2 opacity-90">
                        <span className="text-[9px] font-bold text-emerald-600">{t.id}</span>
                        <p className="text-xs font-semibold text-neutral-800 leading-tight line-through text-neutral-500">{t.titulo}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[10px]">
                          <span className="text-neutral-400">{t.modulo}</span>
                          <span className="text-emerald-600 font-bold">Hecho</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
              <h3 className="font-bold text-sm text-[#1A1A1A] mb-4">Accesos Directos</h3>
              <div className="space-y-2.5">
                <button 
                  type="button"
                  onClick={() => {
                    setCurrentView('ficha_proyecto');
                    setSelectedTab('versiones');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-[#C8102E]/5 hover:border-[#C8102E]/20 border border-neutral-100 text-xs font-semibold text-neutral-800 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white shadow-sm text-[#C8102E] group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <span>Subir Version / Entregable</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-[#C8102E]" />
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    setCurrentView('ficha_proyecto');
                    setSelectedTab('actas');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-[#C9A84C]/10 hover:border-[#C9A84C]/30 border border-neutral-100 text-xs font-semibold text-neutral-800 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white shadow-sm text-[#C9A84C] group-hover:scale-110 transition-transform">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <span>Nueva Acta de Asesoria</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-[#C9A84C]" />
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    setCurrentView('ficha_proyecto');
                    setSelectedTab('evaluacion');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-100 text-xs font-semibold text-neutral-800 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white shadow-sm text-neutral-700 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span>Ver Calificacion y Feedback</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-[#1A1A1A]">Notificaciones UPB</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C8102E]/10 text-[#C8102E]">
                  En vivo
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-neutral-800">Espacio de Trabajo Activo</span>
                    <span className="text-[10px] text-neutral-400">Hoy</span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1">Tu proyecto se encuentra listo para registro de versiones.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};