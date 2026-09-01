import React, { useState, useEffect } from 'react';
import { 
  Users, FolderGit2, ShieldCheck, Plus, Search, 
  Mail, Calendar, CheckCircle, Sliders 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, Badge } from '../components/UIComponents';
import { api } from '../services/api';

export const DashboardAdmin = () => {
  const { user, projects, setSelectedProjectId, setCurrentView, setSelectedTab, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('usuarios');
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Formularios de Creación de Docente
  const [nuevoDocente, setNuevoDocente] = useState({ nombre: '', correo: '', contrasena: '' });

  useEffect(() => {
    if (activeTab === 'usuarios') {
      cargarUsuarios();
    }
  }, [activeTab]);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const data = await api.get('/usuarios');
      if (data && !data.error) {
        setUsuarios(data);
      }
    } catch (error) {
      showToast('Error cargando usuarios', 'error');
    } finally {
      setCargando(false);
    }
  };

  const handleCrearDocente = async (e) => {
    e.preventDefault();
    if (!nuevoDocente.nombre || !nuevoDocente.correo || !nuevoDocente.contrasena) {
      return showToast('Llena todos los campos', 'error');
    }

    try {
      const data = await api.post('/usuarios', {
        ...nuevoDocente,
        rol: 'docente'
      });

      if (data && data.usuario) {
        showToast('Docente creado correctamente');
        setNuevoDocente({ nombre: '', correo: '', contrasena: '' });
        cargarUsuarios();
      } else {
        showToast(data?.error || 'Error al crear', 'error');
      }
    } catch (error) {
      showToast('Error de red al crear docente', 'error');
    }
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.correo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-neutral-900 to-black text-white p-8 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-purple-300 mb-3 border border-white/10 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Panel de Administración UPB</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">{user?.nombre}</span>
          </h1>
          <p className="text-neutral-400 text-sm mt-1 max-w-xl">
            Control total sobre la plataforma. Gestiona roles, revisa todos los proyectos y supervisa la actividad.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'usuarios' ? 'border-purple-600 text-purple-700' : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <Users className="w-4 h-4" /> Gestión de Usuarios
        </button>
        <button
          onClick={() => setActiveTab('proyectos')}
          className={`px-4 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'proyectos' ? 'border-purple-600 text-purple-700' : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          <FolderGit2 className="w-4 h-4" /> Todos los Proyectos
        </button>
      </div>

      {activeTab === 'usuarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Directorio de Usuarios</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-purple-500 w-60"
                />
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-3">Nombre</th>
                    <th className="pb-3 px-3">Correo</th>
                    <th className="pb-3 px-3">Rol</th>
                    <th className="pb-3 px-3">Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {usuariosFiltrados.map(u => (
                    <tr key={u.id_usuario} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-3 font-semibold text-neutral-800">{u.nombre}</td>
                      <td className="py-3 px-3 text-neutral-500">{u.correo}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          u.rol === 'admin' ? 'bg-purple-100 text-purple-700' :
                          u.rol === 'docente' ? 'bg-[#C9A84C]/20 text-[#967d38]' :
                          'bg-neutral-100 text-neutral-600'
                        }`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-neutral-400">
                        {u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                  {usuariosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-neutral-400">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Crear Docente/Asesor</h2>
            <form onSubmit={handleCrearDocente} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={nuevoDocente.nombre}
                  onChange={e => setNuevoDocente({...nuevoDocente, nombre: e.target.value})}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Correo Electrónico (Institucional)</label>
                <input
                  type="email"
                  required
                  value={nuevoDocente.correo}
                  onChange={e => setNuevoDocente({...nuevoDocente, correo: e.target.value})}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Contraseña Temporal</label>
                <input
                  type="text"
                  required
                  value={nuevoDocente.contrasena}
                  onChange={e => setNuevoDocente({...nuevoDocente, contrasena: e.target.value})}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-purple-500"
                />
              </div>
              <Button type="submit" variant="primary" className="w-full bg-purple-600 hover:bg-purple-700">
                Registrar Docente
              </Button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'proyectos' && (
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">Todos los Proyectos</h2>
              <p className="text-xs text-neutral-500">Visualiza la totalidad de proyectos en el sistema.</p>
            </div>
            <div className="px-3 py-1 bg-neutral-100 rounded-lg text-xs font-bold text-neutral-600">
              Total: {projects.length}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">Proyecto</th>
                  <th className="pb-3 px-3">Creador</th>
                  <th className="pb-3 px-3">Asesor Asignado</th>
                  <th className="pb-3 px-3">Estado</th>
                  <th className="pb-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {projects.map(p => (
                  <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-[#1A1A1A]">{p.titulo}</p>
                      <p className="text-[11px] text-neutral-400">{p.curso}</p>
                    </td>
                    <td className="py-3 px-3 font-semibold text-neutral-700">{p.creador}</td>
                    <td className="py-3 px-3">
                      {p.docente_nombre ? (
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          {p.docente_nombre}
                        </span>
                      ) : (
                        <span className="text-neutral-400 italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="py-3 px-3"><Badge status={p.estado} /></td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedProjectId(p.id);
                          setCurrentView('ficha_proyecto');
                          setSelectedTab('ficha');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-all"
                      >
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};