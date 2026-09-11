import React, { useEffect, useState } from 'react';
import { X, FolderPlus, Code, Github, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, FloatingInput } from './UIComponents';

export const ModalCrearProyecto = ({ isOpen, onClose }) => {
  const { user, createProject, githubConnection, connectGithub, disconnectGithub, fetchGithubRepositories, fetchGithubOrganizations } = useApp();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [curso, setCurso] = useState('Proyecto Integrador II - UPB');
  const [periodo, setPeriodo] = useState('2026-10');
  const [lenguaje, setLenguaje] = useState('JavaScript / TypeScript');
  const [frameworks, setFrameworks] = useState('React, Tailwind CSS, Express');
  const [baseDatos, setBaseDatos] = useState('PostgreSQL');
  const [esMovil, setEsMovil] = useState(false);
  const [entornoDespliegue, setEntornoDespliegue] = useState('Vercel + Railway');
  const [githubMode, setGithubMode] = useState('none');
  const [githubRepos, setGithubRepos] = useState([]);
  const [githubOrganizations, setGithubOrganizations] = useState([]);
  const [selectedGithubRepo, setSelectedGithubRepo] = useState('');
  const [githubName, setGithubName] = useState('');
  const [githubDescription, setGithubDescription] = useState('');
  const [githubPrivate, setGithubPrivate] = useState(true);
  const [githubOrganization, setGithubOrganization] = useState('');
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberEmails, setMemberEmails] = useState([]);
  const [memberError, setMemberError] = useState('');

  const handleConnectGithub = async () => {
    setGithubError('');
    try {
      await connectGithub();
    } catch (error) {
      setGithubError(error.message || 'No se pudo iniciar la conexión con GitHub.');
    }
  };

  const handleAddMember = () => {
    const email = memberEmail.trim().toLowerCase();
    if (!/^[^\s@]+@upb\.edu\.co$/i.test(email)) {
      setMemberError('El correo del integrante debe ser institucional (@upb.edu.co).');
      return;
    }
    if (email === user?.correo?.toLowerCase() || memberEmails.includes(email)) {
      setMemberError('Ese usuario ya está incluido en el proyecto.');
      return;
    }
    setMemberEmails((current) => [...current, email]);
    setMemberEmail('');
    setMemberError('');
  };

  useEffect(() => {
    if (!isOpen || !githubConnection.connected || githubMode === 'none') return;
    setGithubLoading(true);
    setGithubError('');
    Promise.all([
      githubMode === 'existing' ? fetchGithubRepositories() : Promise.resolve([]),
      githubMode === 'create' ? fetchGithubOrganizations() : Promise.resolve([])
    ]).then(([repos, organizations]) => {
      setGithubRepos(repos);
      setGithubOrganizations(organizations);
    }).catch((error) => setGithubError(error.message)).finally(() => setGithubLoading(false));
  }, [isOpen, githubConnection.connected, githubMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    if (githubMode === 'existing' && !selectedGithubRepo) {
      setGithubError('Selecciona un repositorio existente.');
      return;
    }
    if (githubMode === 'create' && !githubName.trim()) {
      setGithubError('Escribe el nombre del repositorio nuevo.');
      return;
    }

    const created = await createProject({
      titulo,
      descripcion,
      curso,
      periodo,
      lenguaje,
      frameworks,
      baseDatos,
      esMovil,
      entornoDespliegue,
      memberEmails,
      githubMode,
      githubOwner: githubRepos.find((repo) => String(repo.id) === selectedGithubRepo)?.owner?.login,
      githubRepo: githubRepos.find((repo) => String(repo.id) === selectedGithubRepo)?.name,
      githubCreate: {
        name: githubName,
        description: githubDescription || descripcion,
        private: githubPrivate,
        organization: githubOrganization || null,
        auto_init: true
      }
    });

    if (created) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-neutral-900 to-neutral-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#C8102E] to-[#E30613] flex items-center justify-center text-white shadow-lg shadow-[#C8102E]/30">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Registrar Nuevo Proyecto Integrador</h2>
              <p className="text-xs text-neutral-300">Asignacion directa al estudiante: {user?.nombre} ({user?.correo})</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <FloatingInput
            label="Titulo del Proyecto"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="ej: Plataforma de Telemetria Satelital"
            required
          />

          <div>
            <label className="text-xs font-semibold text-neutral-600 block mb-1.5">
              Descripcion y Alcance del Proyecto
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe los objetivos, problematica y propuesta de valor..."
              className="w-full p-3 text-xs bg-neutral-50 rounded-xl border border-neutral-200/80 focus:border-[#C8102E] outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingInput
              label="Curso / Asignatura"
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
            />
            <FloatingInput
              label="Periodo Academico"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
            />
          </div>

          <div className="pt-3 border-t border-neutral-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C8102E] mb-3">Integrantes adicionales</h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddMember(); } }}
                placeholder="compañero@upb.edu.co"
                className="flex-1 p-3 text-xs bg-neutral-50 rounded-xl border border-neutral-200 outline-none focus:border-[#C8102E]"
              />
              <Button type="button" variant="secondary" onClick={handleAddMember}>Agregar</Button>
            </div>
            {memberError && <p className="text-xs text-red-600 mt-2">{memberError}</p>}
            {memberEmails.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {memberEmails.map((email) => (
                  <span key={email} className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-100 text-[11px] text-neutral-700">
                    {email}
                    <button type="button" onClick={() => setMemberEmails((current) => current.filter((item) => item !== email))} className="text-neutral-400 hover:text-red-600" aria-label={`Quitar ${email}`}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-neutral-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C8102E] mb-3 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" />
              Campos Tecnicos y Stack
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FloatingInput
                label="Lenguaje Principal"
                value={lenguaje}
                onChange={(e) => setLenguaje(e.target.value)}
              />
              <FloatingInput
                label="Frameworks / Librerias"
                value={frameworks}
                onChange={(e) => setFrameworks(e.target.value)}
              />
              <FloatingInput
                label="Base de Datos"
                value={baseDatos}
                onChange={(e) => setBaseDatos(e.target.value)}
              />
              <FloatingInput
                label="Entorno de Despliegue"
                value={entornoDespliegue}
                onChange={(e) => setEntornoDespliegue(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C8102E] mb-3 flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5" />
              Repositorio de código
            </h3>
            {!githubConnection.connected ? (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-neutral-800">Conecta GitHub para enlazar o crear un repositorio</p>
                  <p className="text-[11px] text-neutral-500 mt-1">La autorización se realiza directamente con GitHub.</p>
                </div>
                <Button type="button" variant="secondary" onClick={handleConnectGithub}>
                  <Github className="w-4 h-4" /> Conectar con GitHub
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-emerald-700 font-semibold">Conectado como @{githubConnection.username}</span>
                  <button type="button" onClick={disconnectGithub} className="text-[11px] text-neutral-500 hover:text-red-600">Desconectar</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[['none', 'No utilizar'], ['existing', 'Usar existente'], ['create', 'Crear nuevo']].map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setGithubMode(value)} className={'p-2.5 rounded-xl border text-xs font-semibold transition-colors ' + (githubMode === value ? 'border-[#C8102E] bg-red-50 text-[#C8102E]' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50')}>
                      {label}
                    </button>
                  ))}
                </div>
                {githubLoading && <p className="text-xs text-neutral-500 mt-3 flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Consultando GitHub...</p>}
                {githubError && <p className="text-xs text-red-600 mt-3">{githubError}</p>}
                {githubMode === 'existing' && !githubLoading && (
                  <select value={selectedGithubRepo} onChange={(e) => setSelectedGithubRepo(e.target.value)} className="w-full mt-3 p-3 text-xs bg-neutral-50 rounded-xl border border-neutral-200">
                    <option value="">Selecciona un repositorio existente</option>
                    {githubRepos.map((repo) => <option key={repo.id} value={repo.id}>{repo.full_name}{repo.private ? ' (privado)' : ''}</option>)}
                  </select>
                )}
                {githubMode === 'create' && (
                  <div className="mt-3 space-y-3">
                    <FloatingInput
                      label="Nombre del repositorio"
                      value={githubName}
                      onChange={(e) => setGithubName(e.target.value.replace(/\s+/g, '-'))}
                      placeholder="mi-proyecto-integrador"
                      required
                    />
                    <FloatingInput label="Descripcion del repositorio" value={githubDescription} onChange={(e) => setGithubDescription(e.target.value)} />
                    <select value={githubOrganization} onChange={(e) => setGithubOrganization(e.target.value)} className="w-full p-3 text-xs bg-neutral-50 rounded-xl border border-neutral-200">
                      <option value="">Cuenta personal</option>
                      {githubOrganizations.map((organization) => <option key={organization.id} value={organization.login}>{organization.login}</option>)}
                    </select>
                    <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer"><input type="checkbox" checked={githubPrivate} onChange={(e) => setGithubPrivate(e.target.checked)} /> Repositorio privado</label>
                  </div>
                )}
              </>
            )}
            <label className="flex items-center gap-2 text-xs text-neutral-600 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={esMovil}
                onChange={(e) => setEsMovil(e.target.checked)}
                className="rounded text-[#C8102E] focus:ring-[#C8102E]"
              />
              <span>Este proyecto incluye desarrollo movil (Flutter / React Native)</span>
            </label>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Crear y Abrir Ficha
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};