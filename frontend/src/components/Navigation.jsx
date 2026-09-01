import React from 'react';
import { 
  FolderGit2, 
  Kanban, 
  FileText, 
  Award, 
  Sliders, 
  LogOut, 
  Sparkles, 
  GraduationCap, 
  Layers,
  Radio
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar = () => {
  const { user, currentView, setCurrentView, logout, backendConnected } = useApp();

  const isDocente = user?.rol === 'docente';
  const isAdmin = user?.rol === 'admin';

  const menuEstudiante = [
    { id: 'dashboard_estudiante', label: 'Mi Proyecto', icon: FolderGit2, badge: 'Principal' },
    { id: 'ficha_proyecto', label: 'Ficha & Entregas', icon: Layers },
    { id: 'backlog_plane', label: 'Backlog / Kanban', icon: Kanban, badge: 'Plane' },
    { id: 'actas_seguimiento', label: 'Actas de Asesoria', icon: FileText },
  ];

  const menuDocente = [
    { id: 'dashboard_docente', label: 'Panel Docente', icon: GraduationCap, badge: 'Cursos' },
    { id: 'gestion_rubricas', label: 'Gestion de Rubricas', icon: Sliders, badge: '100%' },
    { id: 'evaluacion_proyecto', label: 'Evaluar Proyectos', icon: Award },
    { id: 'ficha_proyecto', label: 'Explorador Fichas', icon: Layers },
  ];

  const menuAdmin = [
    { id: 'dashboard_admin', label: 'Panel de Control', icon: Sliders, badge: 'Admin' },
    { id: 'ficha_proyecto', label: 'Explorador Global', icon: Layers },
  ];

  const currentMenu = isAdmin ? menuAdmin : isDocente ? menuDocente : menuEstudiante;

  return (
    <aside className="w-64 bg-[#141414] text-white flex flex-col justify-between p-4 shadow-2xl relative z-30 border-r border-neutral-800 selection:bg-[#C8102E]">
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#C8102E]/15 to-transparent pointer-events-none"></div>

      <div>
        {/* Institutional Logo Section */}
        <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-neutral-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C8102E] to-[#E30613] p-1.5 flex items-center justify-center shadow-lg shadow-[#C8102E]/30 ring-1 ring-white/20">
            <span className="font-extrabold text-lg text-white tracking-tighter">UPB</span>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-white tracking-wide flex items-center gap-1.5">
              Antigravity <Sparkles className="w-3.5 h-3.5 text-[#C9A84C] animate-pulse" />
            </h1>
            <p className="text-[11px] text-neutral-400 font-light">Proyectos Integradores</p>
          </div>
        </div>

        {/* User Card inside Sidebar (Strict Role Based) */}
        <div className="mb-6 p-3.5 rounded-2xl bg-white/[0.04] border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
              alt={user?.nombre} 
              className="w-10 h-10 rounded-xl object-cover border border-white/10"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.nombre}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={'text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full tracking-wider ' + 
                  (isAdmin ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                   isDocente ? 'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30' : 'bg-[#C8102E]/20 text-[#FF6B81] border border-[#C8102E]/30')}>
                  {user?.rol}
                </span>
                {backendConnected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" title="Backend Conectado" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider px-3 mb-2">
            Navegacion {isDocente ? 'Docente' : 'Academica'}
          </p>
          {currentMenu.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentView(item.id)}
                className={'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ' + 
                  (isActive
                    ? 'bg-gradient-to-r from-[#C8102E] to-[#A60D26] text-white shadow-lg shadow-[#C8102E]/25 translate-x-1 font-semibold'
                    : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white')}
              >
                <div className="flex items-center gap-3">
                  <Icon className={'w-4 h-4 transition-transform group-hover:scale-110 ' + (isActive ? 'text-white' : 'text-neutral-400')} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={'text-[10px] px-1.5 py-0.5 rounded-md ' + 
                    (isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-neutral-400 group-hover:text-neutral-200')}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 border-t border-neutral-800/80 space-y-2">
        <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Radio className={'w-3 h-3 ' + (backendConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400')} />
            Puerto :3312
          </span>
          <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-neutral-300 font-mono">
            {backendConnected ? 'API OK' : 'APP LOCAL'}
          </span>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesion</span>
        </button>
      </div>
    </aside>
  );
};

export const Header = () => {
  const { user, notifications, showToast } = useApp();
  const unreadCount = notifications.filter(n => !n.leida).length;

  return (
    <header className="h-16 px-6 glass-panel sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200/70">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
          <span className="text-neutral-400">UPB Medellin</span>
          <span>/</span>
          <span className="text-neutral-700 font-semibold">Proyectos Integradores 2026</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Plane Sync Badge */}
        <div 
          onClick={() => showToast('Sincronizado con Plane Workspace: upb-integradores')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200/80 cursor-pointer border border-neutral-200 text-neutral-700 text-xs transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-[#C9A84C]"></span>
          <span className="font-medium">Plane Sync</span>
          <span className="text-[10px] text-neutral-500">v2.4</span>
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button 
            type="button"
            onClick={() => showToast('Tienes ' + unreadCount + ' notificaciones')}
            className="p-2 rounded-xl text-neutral-600 hover:text-[#1A1A1A] hover:bg-neutral-100 transition-all relative"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#C8102E] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Profile Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-neutral-200">
          <img 
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
            alt={user?.nombre} 
            className="w-8 h-8 rounded-full object-cover border-2 border-[#C8102E]/20"
          />
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-[#1A1A1A] leading-tight">{user?.nombre}</p>
            <p className="text-[10px] text-neutral-500">{user?.correo}</p>
          </div>
        </div>
      </div>
    </header>
  );
};