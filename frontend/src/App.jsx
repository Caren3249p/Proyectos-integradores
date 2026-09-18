import React from 'react';
import { useApp } from './context/AppContext';
import { Sidebar, Header } from './components/Navigation';
import { AuthScreen } from './pages/AuthScreen';
import { DashboardEstudiante } from './pages/DashboardEstudiante';
import { DashboardDocente } from './pages/DashboardDocente';
import { DashboardAdmin } from './pages/DashboardAdmin';
import { FichaProyecto } from './pages/FichaProyecto';
import { GestionRubricas } from './pages/GestionRubricas';
import { EvaluacionProyecto } from './pages/EvaluacionProyecto';
import { Entregables } from './pages/Entregables';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const { user, currentView, activeNotificationToast } = useApp();

  if (!user || currentView === 'login') {
    return <AuthScreen />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard_admin':
        return <DashboardAdmin />;
      case 'dashboard_estudiante':
        return <DashboardEstudiante />;
      case 'dashboard_docente':
        return <DashboardDocente />;
      case 'ficha_proyecto':
      case 'backlog_plane':
      case 'actas_seguimiento':
        return <FichaProyecto />;
      case 'gestion_rubricas':
        return <GestionRubricas />;
      case 'evaluacion_proyecto':
        return <EvaluacionProyecto />;
      case 'entregables':
        return <Entregables />;
      default:
        return user?.rol === 'admin' ? <DashboardAdmin /> : <DashboardEstudiante />;
    }
  };

  const getToastStyle = (type) => {
    if (type === 'error') return 'bg-red-500/90 text-white border-red-400 shadow-red-500/20';
    if (type === 'info') return 'bg-neutral-900/90 text-white border-neutral-700 shadow-black/20';
    return 'bg-emerald-600/90 text-white border-emerald-500 shadow-emerald-500/20';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F9FA]">
      {activeNotificationToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={'px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold backdrop-blur-xl ' + getToastStyle(activeNotificationToast.type)}>
            {activeNotificationToast.type === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : activeNotificationToast.type === 'info' ? (
              <Info className="w-4 h-4 text-[#C9A84C]" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{activeNotificationToast.msg}</span>
          </div>
        </div>
      )}

      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}
