import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Kanban,
  Loader2,
  RefreshCw,
  UserRound,
  CheckCircle2,
  Circle,
  Clock3,
  ListTodo,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Button } from '../components/UIComponents';

const columns = [
  {
    id: 'backlog',
    label: 'Backlog',
    states: ['backlog'],
    tone: 'neutral',
    icon: ListTodo
  },
  {
    id: 'por_hacer',
    label: 'Por Hacer',
    states: ['por_hacer', 'todo'],
    tone: 'red',
    icon: Circle
  },
  {
    id: 'en_progreso',
    label: 'En Progreso',
    states: ['en_progreso', 'in progress'],
    tone: 'amber',
    icon: Clock3
  },
  {
    id: 'completado',
    label: 'Hecho',
    states: ['completado', 'hecho', 'done'],
    tone: 'emerald',
    icon: CheckCircle2
  }
];

const toneStyles = {
  neutral: {
    header: 'text-neutral-700',
    dot: 'bg-neutral-400',
    surface: 'bg-neutral-100/70',
    border: 'border-neutral-200',
    badge: 'bg-neutral-100 text-neutral-600 border-neutral-200'
  },
  red: {
    header: 'text-[#C8102E]',
    dot: 'bg-[#C8102E]',
    surface: 'bg-red-50/70',
    border: 'border-red-100',
    badge: 'bg-red-50 text-[#C8102E] border-red-100'
  },
  amber: {
    header: 'text-amber-700',
    dot: 'bg-amber-500',
    surface: 'bg-amber-50/70',
    border: 'border-amber-100',
    badge: 'bg-amber-50 text-amber-700 border-amber-100'
  },
  emerald: {
    header: 'text-emerald-700',
    dot: 'bg-emerald-500',
    surface: 'bg-emerald-50/70',
    border: 'border-emerald-100',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100'
  }
};

const normalizeState = (task) => {
  const state = String(task.estado || task.state || '').toLowerCase();
  if (state.includes('done') || state.includes('hecho') || state.includes('complet')) return 'completado';
  if (state.includes('progress') || state.includes('progreso')) return 'en_progreso';
  if (state.includes('backlog')) return 'backlog';
  return 'por_hacer';
};

const getTaskTitle = (task) => task.titulo || task.name || 'Tarea sin nombre';
const getTaskAssignee = (task) => task.asignado || task.assignee || task.assignees?.[0]?.display_name || 'Sin asignar';

export const TableroKanban = () => {
  const {
    currentProject,
    currentProjectIssues,
    addProjectTask,
    syncProjectBacklog,
    updateTaskState,
    setCurrentView,
    setSelectedTab,
    showToast
  } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    titulo: '',
    descripcion: '',
    estado: 'por_hacer',
    prioridad: 'medium',
    fecha_limite: '',
    puntos_estimacion: ''
  });

  useEffect(() => {
    if (!currentProject) return;
    setIsRefreshing(true);
    Promise.resolve(syncProjectBacklog(currentProject.id)).finally(() => setIsRefreshing(false));
  }, [currentProject?.id]);

  const groupedTasks = useMemo(() => {
    return columns.reduce((groups, column) => {
      groups[column.id] = currentProjectIssues.filter((task) => column.states.includes(normalizeState(task)));
      return groups;
    }, {});
  }, [currentProjectIssues]);

  const completedTasks = groupedTasks.completado?.length || 0;
  const totalTasks = currentProjectIssues.length;
  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const planeUrl = currentProject?.plane_url
    || (currentProject?.id_plane_proyecto
      ? `https://app.plane.so/${currentProject.plane_workspace || 'upb-integradores'}/projects/${currentProject.id_plane_proyecto}/issues`
      : 'https://app.plane.so/');

  const handleStateChange = async (task, nextState) => {
    if (normalizeState(task) === nextState) return;
    setUpdatingTaskId(task.id);
    try {
      await updateTaskState(currentProject.id, task.id, nextState);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const refreshBoard = async () => {
    if (!currentProject) return;
    setIsRefreshing(true);
    try {
      await syncProjectBacklog(currentProject.id);
      showToast('Tablero sincronizado con Plane');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    if (!newTask.titulo.trim()) return;
    setIsCreating(true);
    try {
      const created = await addProjectTask(currentProject.id, {
        ...newTask,
        titulo: newTask.titulo.trim(),
        puntos_estimacion: newTask.puntos_estimacion === '' ? null : Number(newTask.puntos_estimacion),
        fecha_limite: newTask.fecha_limite || null
      });
      if (!created) return;
      setNewTask({ titulo: '', descripcion: '', estado: 'por_hacer', prioridad: 'medium', fecha_limite: '', puntos_estimacion: '' });
      setShowCreateForm(false);
      await syncProjectBacklog(currentProject.id);
    } finally {
      setIsCreating(false);
    }
  };

  if (!currentProject) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl border border-neutral-100 p-12 text-center shadow-sm">
          <Kanban className="w-10 h-10 mx-auto text-[#C8102E] mb-3" />
          <h2 className="text-lg font-bold text-neutral-900">No hay un proyecto seleccionado</h2>
          <p className="text-xs text-neutral-500 mt-1">Selecciona o crea un proyecto para ver su tablero.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1500px] mx-auto space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => {
              setSelectedTab('ficha');
              setCurrentView('ficha_proyecto');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#C8102E] mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a la ficha del proyecto
          </button>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#C8102E]/10 text-[#C8102E]"><Kanban className="w-5 h-5" /></span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#C8102E]">Backlog conectado</p>
              <h1 className="text-2xl font-extrabold text-[#1A1A1A]">{currentProject.titulo}</h1>
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-2">Organiza el trabajo del equipo y consulta el estado real sincronizado con Plane Cloud.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowCreateForm((visible) => !visible)}>
            Nueva tarea
          </Button>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={refreshBoard} isLoading={isRefreshing}>
            Sincronizar
          </Button>
          <a href={planeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 transition-colors shadow-sm">
            <span>🚀 Abrir en Plane Workspace</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </a>
        </div>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateTask} className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-5 sm:p-6 space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#C8102E] font-bold">Nueva tarea de backlog</p>
            <h2 className="text-lg font-extrabold text-neutral-900 mt-1">Registrar trabajo en Plane</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              required
              value={newTask.titulo}
              onChange={(event) => setNewTask({ ...newTask, titulo: event.target.value })}
              placeholder="Título de la tarea"
              className="md:col-span-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#C8102E]"
            />
            <textarea
              value={newTask.descripcion}
              onChange={(event) => setNewTask({ ...newTask, descripcion: event.target.value })}
              placeholder="Descripción, criterios de aceptación o contexto"
              rows={3}
              className="md:col-span-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[#C8102E]"
            />
            <label className="text-xs font-semibold text-neutral-600">
              Estado
              <select value={newTask.estado} onChange={(event) => setNewTask({ ...newTask, estado: event.target.value })} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-normal">
                <option value="por_hacer">Por hacer</option>
                <option value="en_progreso">En progreso</option>
                <option value="hecho">Hecho</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-neutral-600">
              Prioridad
              <select value={newTask.prioridad} onChange={(event) => setNewTask({ ...newTask, prioridad: event.target.value })} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-normal">
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
                <option value="none">Sin prioridad</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-neutral-600">
              Fecha límite
              <input type="date" value={newTask.fecha_limite} onChange={(event) => setNewTask({ ...newTask, fecha_limite: event.target.value })} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-normal" />
            </label>
            <label className="text-xs font-semibold text-neutral-600">
              Puntos de estimación
              <input type="number" min="0" max="100" value={newTask.puntos_estimacion} onChange={(event) => setNewTask({ ...newTask, puntos_estimacion: event.target.value })} placeholder="Opcional" className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-normal" />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreateForm(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isCreating}>Crear tarea</Button>
          </div>
        </form>
      )}

      <section className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Avance del proyecto</p>
            <p className="text-2xl font-black text-neutral-900 mt-1">{progress}% <span className="text-xs font-medium text-neutral-400">completado</span></p>
          </div>
          <p className="text-xs text-neutral-500">{completedTasks} de {totalTasks} tareas completadas en Plane</p>
        </div>
        <div className="h-3 rounded-full bg-neutral-100 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#C8102E] to-[#C9A84C] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map((column) => {
          const styles = toneStyles[column.tone];
          const ColumnIcon = column.icon;
          const tasks = groupedTasks[column.id] || [];
          return (
            <section key={column.id} className={`${styles.surface} rounded-3xl border ${styles.border} p-3 min-h-[250px]`}>
              <div className={`flex items-center justify-between px-2 py-2 mb-2 ${styles.header}`}>
                <h2 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
                  <ColumnIcon className="w-4 h-4" />
                  {column.label}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${styles.badge}`}>{tasks.length}</span>
              </div>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <article key={task.id} className="bg-white rounded-2xl border border-white/80 shadow-sm p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 font-mono">{task.id}</span>
                      <Badge status={normalizeState(task) === 'completado' ? 'activo' : normalizeState(task) === 'en_progreso' ? 'en_revision' : 'borrador'} dot={false}>
                        {column.label}
                      </Badge>
                    </div>
                    <h3 className={`text-sm font-bold leading-snug ${normalizeState(task) === 'completado' ? 'text-neutral-500 line-through' : 'text-neutral-800'}`}>
                      {getTaskTitle(task)}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                      <UserRound className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="truncate">{getTaskAssignee(task)}</span>
                    </div>
                    <select
                      aria-label={`Cambiar estado de ${getTaskTitle(task)}`}
                      value={normalizeState(task)}
                      disabled={updatingTaskId === task.id}
                      onChange={(event) => handleStateChange(task, event.target.value)}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-[11px] font-semibold text-neutral-700 outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/10 disabled:opacity-60"
                    >
                      {columns.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                    </select>
                    {updatingTaskId === task.id && <Loader2 className="w-3.5 h-3.5 text-[#C8102E] animate-spin mx-auto" />}
                  </article>
                ))}
                {!tasks.length && <p className="text-center text-[11px] text-neutral-400 py-8">No hay tareas en esta columna.</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
