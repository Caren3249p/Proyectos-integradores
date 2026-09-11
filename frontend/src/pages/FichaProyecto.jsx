import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Layers, 
  Kanban, 
  Award, 
  FolderGit2, 
  Upload, 
  ExternalLink, 
  Trash2,
  Users, 
  Calendar,
  FileCheck,
  Code,
  Plus,
  ArrowRight,
  FolderKanban
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Badge, Card, FloatingInput } from '../components/UIComponents';
import { ModalCrearProyecto } from '../components/ModalCrearProyecto';

export const FichaProyecto = () => {
  const { user, currentProject, currentProjectIssues, selectedTab, setSelectedTab, addVersion, addActa, addProjectTask, updateTaskState, syncProjectBacklog, showToast, deleteProject, addProjectMember, removeProjectMember } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync Backlog con Plane al abrir el tab
  useEffect(() => {
    if (selectedTab === 'backlog' && currentProject) {
      syncProjectBacklog(currentProject.id);
    }
  }, [selectedTab, currentProject?.id]);

  // Version Upload State
  const [newVersionNum, setNewVersionNum] = useState('');
  const [newVersionDesc, setNewVersionDesc] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [isFinal, setIsFinal] = useState(false);

  // Acta Creation State
  const [actaDocente, setActaDocente] = useState('Dr. Carlos Mario Morales');
  const [actaTemas, setActaTemas] = useState('');
  const [actaCompromisos, setActaCompromisos] = useState('');

  // Kanban State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberError, setMemberError] = useState('');

  if (!currentProject) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ModalCrearProyecto isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        <div className="bg-white rounded-3xl border border-neutral-100 p-12 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#C8102E]/10 text-[#C8102E] flex items-center justify-center mx-auto shadow-inner">
            <FolderKanban className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-[#1A1A1A]">No tienes ningun proyecto activo para visualizar</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Debes registrar tu primer proyecto integrador para acceder a su Ficha, Versiones, Backlog y Evaluacion.
            </p>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            size="lg"
            onClick={() => setIsModalOpen(true)}
          >
            Crear mi Primer Proyecto
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'ficha', label: 'Ficha Tecnica', icon: FileText },
    { id: 'versiones', label: 'Versiones y Archivos', icon: Layers, badge: currentProject?.versiones?.length || 0 },
    { id: 'backlog', label: 'Backlog / Plane', icon: Kanban, badge: currentProjectIssues.length },
    { id: 'actas', label: 'Actas de Asesoria', icon: FileCheck, badge: currentProject?.actas?.length || 0 },
    { id: 'evaluacion', label: 'Evaluacion y Notas', icon: Award }
  ];

  const [newFile, setNewFile] = useState(null);

  const handleAddVersion = async (e) => {
    e.preventDefault();
    if (!newVersionNum || !newVersionDesc) return;

    // Si hay backend conectado, delegamos todo a AppContext con el archivo real
    const versionObj = {
      numero: newVersionNum,
      descripcion: newVersionDesc || 'Entrega de avance del proyecto',
      es_final: isFinal,
    };

    await addVersion(currentProject.id, versionObj, newFile);
    setNewVersionNum('');
    setNewVersionDesc('');
    setNewFile(null);
    setIsFinal(false);
  };

  const handleCreateActa = (e) => {
    e.preventDefault();
    if (!actaTemas || !actaCompromisos) {
      showToast('Por favor llena los campos de temas y compromisos', 'error');
      return;
    }

    const actaObj = {
      id: Date.now(),
      fecha: new Date().toISOString().split('T')[0],
      docente: actaDocente,
      temas: actaTemas,
      compromisos: actaCompromisos,
      estado: 'Pendiente Firma'
    };

    addActa(currentProject.id, actaObj);
    setActaTemas('');
    setActaCompromisos('');
  };

  const handleDeleteProject = async () => {
    const confirmed = window.confirm(`¿Seguro que deseas eliminar el proyecto "${currentProject.titulo}"? Esta acción eliminará la ficha y sus datos locales, pero no borrará el repositorio de GitHub.`);
    if (confirmed) await deleteProject(currentProject.id);
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    const email = memberEmail.trim().toLowerCase();
    if (!/^[^\s@]+@upb\.edu\.co$/i.test(email)) {
      setMemberError('Usa un correo institucional (@upb.edu.co).');
      return;
    }
    const added = await addProjectMember(currentProject.id, email);
    if (added) {
      setMemberEmail('');
      setMemberError('');
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addProjectTask(currentProject.id, newTaskTitle.trim());
    setNewTaskTitle('');
    setShowTaskInput(false);
  };

  const porHacerTasks = currentProjectIssues.filter(i => i.estado === 'por_hacer');
  const enProgresoTasks = currentProjectIssues.filter(i => i.estado === 'en_progreso');
  const completadasTasks = currentProjectIssues.filter(i => i.estado === 'completado');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Floating Header */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#C8102E] uppercase tracking-wider">{currentProject?.curso}</span>
            <Badge status={currentProject?.estado} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A]">{currentProject?.titulo}</h1>
          <p className="text-xs text-neutral-500 mt-0.5">Lider: {currentProject?.creador} - Periodo {currentProject?.periodo}</p>
        </div>

        <div className="flex items-center gap-3">
          {currentProject?.estado === 'borrador' && (
            <Button
              type="button"
              variant="danger"
              icon={Trash2}
              onClick={handleDeleteProject}
              title="Eliminar proyecto"
            >
              Eliminar
            </Button>
          )}
          {currentProject?.repositorio?.url && (
            <a
              href={currentProject.repositorio.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-all shadow-sm"
            >
              <FolderGit2 className="w-4 h-4" />
              <span>{currentProject.repositorio.github_owner && currentProject.repositorio.github_name ? `${currentProject.repositorio.github_owner}/${currentProject.repositorio.github_name}` : 'Abrir repositorio'}</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
          )}
        </div>
      </div>

      {/* Floating Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-200/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shrink-0 ' + 
                (isActive 
                  ? 'bg-[#C8102E] text-white shadow-md shadow-[#C8102E]/25 -translate-y-0.5' 
                  : 'bg-white text-neutral-600 hover:text-[#1A1A1A] hover:bg-neutral-50 border border-neutral-200/70')}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={'text-[10px] px-1.5 py-0.2 rounded-full ' + (isActive ? 'bg-white/25 text-white' : 'bg-neutral-100 text-neutral-600')}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Ficha Tecnica */}
      {selectedTab === 'ficha' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="font-bold text-sm text-[#1A1A1A] mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C8102E]" />
                Descripcion del Proyecto Integrador
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">{currentProject?.descripcion}</p>
            </Card>

            <Card>
              <h3 className="font-bold text-sm text-[#1A1A1A] mb-4 flex items-center gap-2">
                <Code className="w-4 h-4 text-[#C9A84C]" />
                Campos Tecnicos y Stack Tecnologico
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <span className="text-neutral-400 font-bold block text-[10px] uppercase">Lenguaje Principal</span>
                  <span className="font-semibold text-neutral-800">{currentProject?.campos_tecnicos?.lenguaje_principal || 'JavaScript/TypeScript'}</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <span className="text-neutral-400 font-bold block text-[10px] uppercase">Frameworks / Librerias</span>
                  <span className="font-semibold text-neutral-800">{currentProject?.campos_tecnicos?.frameworks || 'React, Tailwind CSS, Express'}</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <span className="text-neutral-400 font-bold block text-[10px] uppercase">Base de Datos</span>
                  <span className="font-semibold text-neutral-800">{currentProject?.campos_tecnicos?.base_datos || 'PostgreSQL'}</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <span className="text-neutral-400 font-bold block text-[10px] uppercase">Despliegue y Nube</span>
                  <span className="font-semibold text-neutral-800">{currentProject?.campos_tecnicos?.entorno_despliegue || 'Vercel / Railway'}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="font-bold text-sm text-[#1A1A1A] mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C8102E]" />
                Equipo de Trabajo
              </h3>
              <div className="space-y-3">
                {currentProject?.integrantes?.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                    <div>
                      <p className="text-xs font-bold text-neutral-800">{m.nombre}</p>
                      <p className="text-[10px] text-neutral-400">{m.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-neutral-600 border border-neutral-200">
                        {m.id === currentProject.creador_id ? 'Dueño' : 'Integrante'}
                      </span>
                      {user?.id === currentProject.creador_id && m.id !== currentProject.creador_id && (
                        <button type="button" onClick={() => removeProjectMember(currentProject.id, m.id)} className="text-[10px] text-red-600 hover:underline">Quitar</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {user?.id === currentProject.creador_id && (
                <form onSubmit={handleAddMember} className="mt-4 pt-4 border-t border-neutral-200 space-y-2">
                  <label htmlFor="project-member-email" className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Agregar por correo</label>
                  <div className="flex gap-2">
                    <input id="project-member-email" type="email" value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} placeholder="compañero@upb.edu.co" className="min-w-0 flex-1 p-2.5 text-xs bg-white rounded-xl border border-neutral-200 outline-none focus:border-[#C8102E]" />
                    <Button type="submit" size="sm" variant="secondary">Agregar</Button>
                  </div>
                  {memberError && <p className="text-[11px] text-red-600">{memberError}</p>}
                </form>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Versiones y Archivos */}
      {selectedTab === 'versiones' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-sm text-[#1A1A1A]">Historial de Versiones Registradas</h3>
            {(!currentProject?.versiones || currentProject.versiones.length === 0) ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-neutral-100 text-xs text-neutral-500">
                Aun no has registrado ninguna version para este proyecto.
              </div>
            ) : (
              currentProject.versiones.map((ver) => (
                <div key={ver.id} className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#C8102E] bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-100">
                        {ver.numero}
                      </span>
                      <span className="text-xs text-neutral-500 font-medium">Publicado el {ver.fecha}</span>
                    </div>
                    {ver.es_final && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        Entrega Final
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-600">{ver.descripcion}</p>

                  <div className="pt-2 border-t border-neutral-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-neutral-400">Archivos Adjuntos:</span>
                    {(!ver.archivos || ver.archivos.length === 0) ? (
                      <p className="text-[11px] text-neutral-400 italic">Sin archivos adjuntos en esta version</p>
                    ) : (
                      ver.archivos.map((arch) => (
                        <div key={arch.id} className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 text-xs">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#C8102E]" />
                            <span className="font-medium text-neutral-800">{arch.nombre}</span>
                            <span className="text-[10px] text-neutral-400">({arch.tamano})</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => showToast('Descargando archivo ' + arch.nombre)}
                            className="text-xs font-semibold text-[#C8102E] hover:underline"
                          >
                            Descargar
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            <Card>
              <h3 className="font-bold text-sm text-[#1A1A1A] mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#C8102E]" />
                Registrar Nueva Version
              </h3>
              <form onSubmit={handleAddVersion} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Numero de Version *</label>
                    <input 
                      type="text" 
                      placeholder="ej. v1.2"
                      value={newVersionNum}
                      onChange={e => setNewVersionNum(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#C8102E]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Archivo / Entregable (.zip, .pdf)</label>
                    <input 
                      type="file"
                      onChange={e => setNewFile(e.target.files[0])}
                      className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#C8102E]/10 file:text-[#C8102E] hover:file:bg-[#C8102E]/20 cursor-pointer bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#C8102E]"
                    />
                  </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Descripcion de Cambios</label>
                  <textarea 
                    placeholder="Describe que incluye esta version..."
                    value={newVersionDesc}
                    onChange={e => setNewVersionDesc(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#C8102E] min-h-[80px]"
                  ></textarea>
                </div>

                <label className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isFinal}
                    onChange={e => setIsFinal(e.target.checked)}
                    className="w-4 h-4 text-[#C8102E] rounded focus:ring-[#C8102E]"
                  />
                  <span className="text-sm font-bold text-amber-900">Marcar como Entrega Final del Semestre</span>
                </label>

                <Button type="submit" variant="primary" className="w-full">
                  Subir Version y Archivo
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 3: Backlog / Plane Slot (Strictly for currentProject) */}
      {selectedTab === 'backlog' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
                <Kanban className="w-4 h-4 text-[#C9A84C]" />
                Tablero de Tareas y Backlog ({currentProject.titulo})
              </h3>
              <p className="text-xs text-neutral-500">
                Workspace: <span className="font-semibold text-neutral-700">{currentProject?.plane_workspace || 'upb-integradores'}</span> - Gestiona exclusivamente las tareas de este proyecto.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {currentProject?.id_plane_proyecto && (
                <a 
                  href={`https://app.plane.so/${currentProject.plane_workspace || 'upb-integradores'}/projects/${currentProject.id_plane_proyecto}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200 text-neutral-600 hover:border-[#C8102E] hover:text-[#C8102E] transition-all flex items-center gap-2"
                >
                  Abrir en Plane
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setShowTaskInput(!showTaskInput)}
              >
                Nueva Tarea
              </Button>
            </div>
          </div>

          {showTaskInput && (
            <form onSubmit={handleAddTask} className="p-4 rounded-3xl bg-white border border-neutral-200 shadow-sm flex gap-3">
              <input
                type="text"
                placeholder="Titulo de la nueva tarea para este proyecto..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 px-4 py-2 text-xs bg-neutral-50 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#C8102E]"
                autoFocus
              />
              <Button type="submit" size="md" variant="primary">
                Guardar Tarea
              </Button>
            </form>
          )}

          {currentProjectIssues.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-neutral-100 text-xs text-neutral-500">
              <Kanban className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              Este proyecto todavia no tiene tareas registradas en su Backlog. Haz clic en <strong>"Nueva Tarea"</strong> arriba para anadir la primera.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Columna Por Hacer */}
              <div className="bg-neutral-100/70 p-4 rounded-3xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-700 px-1">
                  <span>POR HACER ({porHacerTasks.length})</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-400"></span>
                </div>
                {porHacerTasks.map(t => (
                  <div key={t.id} className="bg-white p-4 rounded-2xl border border-neutral-200/70 shadow-sm space-y-2">
                    <span className="text-[10px] font-bold text-[#C8102E]">{t.id}</span>
                    <h4 className="text-xs font-bold text-neutral-800">{t.titulo}</h4>
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[10px]">
                      <span className="text-neutral-500">{t.modulo}</span>
                      <button 
                        type="button"
                        onClick={() => updateTaskState(currentProject.id, t.id, 'en_progreso')}
                        className="text-[#C8102E] font-bold hover:underline flex items-center gap-1"
                      >
                        <span>Avanzar</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Columna En Progreso */}
              <div className="bg-amber-50/50 p-4 rounded-3xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-amber-800 px-1">
                  <span>EN PROGRESO ({enProgresoTasks.length})</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                </div>
                {enProgresoTasks.map(t => (
                  <div key={t.id} className="bg-white p-4 rounded-2xl border border-amber-200/70 shadow-sm space-y-2">
                    <span className="text-[10px] font-bold text-amber-600">{t.id}</span>
                    <h4 className="text-xs font-bold text-neutral-800">{t.titulo}</h4>
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[10px]">
                      <span className="text-neutral-500">{t.modulo}</span>
                      <button 
                        type="button"
                        onClick={() => updateTaskState(currentProject.id, t.id, 'completado')}
                        className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <span>Completar</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Columna Completado */}
              <div className="bg-emerald-50/50 p-4 rounded-3xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800 px-1">
                  <span>COMPLETADO ({completadasTasks.length})</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>
                {completadasTasks.map(t => (
                  <div key={t.id} className="bg-white p-4 rounded-2xl border border-emerald-200/70 shadow-sm space-y-2 opacity-95">
                    <span className="text-[10px] font-bold text-emerald-600">{t.id}</span>
                    <h4 className="text-xs font-bold text-neutral-700 line-through">{t.titulo}</h4>
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[10px]">
                      <span className="text-neutral-400">{t.modulo}</span>
                      <span className="text-emerald-600 font-bold">Hecho</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Actas de Asesoria */}
      {selectedTab === 'actas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-sm text-[#1A1A1A]">Actas de Asesoria Registradas</h3>
            {(!currentProject?.actas || currentProject.actas.length === 0) ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-neutral-100 text-xs text-neutral-500">
                Aun no se han registrado actas de asesoria con el docente para este proyecto.
              </div>
            ) : (
              currentProject.actas.map((acta) => (
                <div key={acta.id} className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C8102E]" />
                      Fecha: {acta.fecha} - Asesor: {acta.docente}
                    </span>
                    <span className={'text-[10px] font-bold px-2 py-0.5 rounded ' + 
                      (acta.estado === 'Aprobada' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>
                      {acta.estado}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-neutral-700">Temas Tratados:</p>
                    <p className="text-neutral-600 bg-neutral-50 p-2.5 rounded-xl">{acta.temas}</p>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-neutral-700">Compromisos Acordados:</p>
                    <p className="text-neutral-600 bg-neutral-50 p-2.5 rounded-xl">{acta.compromisos}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            <Card>
              <h3 className="font-bold text-sm text-[#1A1A1A] mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#C9A84C]" />
                Registrar Nueva Acta
              </h3>
              <form onSubmit={handleCreateActa} className="space-y-4">
                <FloatingInput
                  label="Docente / Asesor"
                  value={actaDocente}
                  onChange={(e) => setActaDocente(e.target.value)}
                  required
                />
                <FloatingInput
                  label="Temas Tratados en la Asesoria"
                  value={actaTemas}
                  onChange={(e) => setActaTemas(e.target.value)}
                  required
                />
                <FloatingInput
                  label="Compromisos y Acuerdos"
                  value={actaCompromisos}
                  onChange={(e) => setActaCompromisos(e.target.value)}
                  required
                />
                <Button type="submit" variant="primary" className="w-full">
                  Crear Acta
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 5: Evaluacion y Notas */}
      {selectedTab === 'evaluacion' && (
        <div className="space-y-6">
          {currentProject?.evaluacion ? (
            <div className="bg-white p-7 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 text-white">
                <div>
                  <span className="text-xs text-[#C9A84C] font-bold uppercase tracking-wider">Calificacion Consolidada</span>
                  <h3 className="text-2xl font-black mt-0.5">Nota Final: {currentProject.evaluacion.nota_final} / 5.0</h3>
                  <p className="text-xs text-neutral-400 mt-1">Evaluado por: {currentProject.evaluacion.docente} el {currentProject.evaluacion.fecha}</p>
                </div>
                <Badge status={currentProject.evaluacion.estado} className="self-start sm:self-auto" />
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#1A1A1A] mb-3">Desglose por Criterios de la Rubrica</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentProject.evaluacion.detalles?.map((c) => (
                    <div key={c.criterio_id} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-neutral-800">{c.nombre}</p>
                        <p className="text-[10px] text-neutral-500">Ponderacion: {c.peso}%</p>
                      </div>
                      <span className="text-sm font-extrabold text-[#C8102E] bg-white px-2.5 py-1 rounded-xl shadow-sm border border-neutral-200">
                        {c.nota}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#1A1A1A] mb-2">Retroalimentacion del Docente</h4>
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-700 leading-relaxed italic">
                  "{currentProject.evaluacion.retroalimentacion}"
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-neutral-100 text-center space-y-3">
              <Award className="w-8 h-8 text-neutral-300 mx-auto" />
              <h3 className="text-base font-bold text-neutral-800">Evaluacion Pendiente</h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                El docente aun no ha emitido la calificacion final para este proyecto integrador.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};