import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialProjects, initialRubrics, mockPlaneIssues, mockNotifications } from '../data/mockData';
import { api } from '../services/api';

const AppContext = createContext();

const getApiError = (response, fallback) => {
  if (Array.isArray(response?.detalles) && response.detalles.length > 0) {
    return response.detalles.map((detail) => detail.message).filter(Boolean).join(' ');
  }
  return response?.error || fallback;
};

const normalizeNodoRubrica = (criterio, parentId = null) => {
  const hijosRaw = Array.isArray(criterio?.hijos) ? criterio.hijos : [];
  const id = criterio?.id_criterio ?? criterio?.id;
  const esHoja = (criterio?.es_hoja ?? criterio?.esHoja ?? null) !== null
    ? Boolean(criterio?.es_hoja ?? criterio?.esHoja)
    : hijosRaw.length === 0;

  return {
    id,
    nombre: criterio?.nombre || 'Criterio sin nombre',
    descripcion: criterio?.descripcion || '',
    peso: Number(criterio?.peso ?? criterio?.ponderacion ?? 0),
    parentId: criterio?.id_padre ?? criterio?.parentId ?? parentId,
    tipo: criterio?.tipo || (parentId == null ? 'CORTE_ACADEMICO' : (hijosRaw.length ? 'ACTIVIDAD' : 'CRITERIO_EVALUABLE')),
    orden: criterio?.orden ?? 0,
    esHoja,
    niveles: Array.isArray(criterio?.niveles) ? criterio.niveles : [],
    hijos: hijosRaw.map((hijo) => normalizeNodoRubrica(hijo, id))
  };
};

const normalizeRubricCriteria = (criterios = []) => {
  if (!Array.isArray(criterios) || criterios.length === 0) return [];
  const tieneHijosAnidados = criterios.some((criterio) => Array.isArray(criterio.hijos) && criterio.hijos.length);
  if (tieneHijosAnidados || criterios.every((criterio) => !criterio.parentId && !criterio.id_padre)) {
    return criterios.map((criterio) => normalizeNodoRubrica(criterio, null));
  }

  const mapa = new Map();
  criterios.forEach((criterio) => {
    const nodo = { ...normalizeNodoRubrica({ ...criterio, hijos: [] }), hijos: [] };
    mapa.set(String(nodo.id), nodo);
  });

  const raices = [];
  criterios.forEach((criterio) => {
    const id = String(criterio.id_criterio ?? criterio.id);
    const nodo = mapa.get(id);
    const parentId = criterio.id_padre ?? criterio.parentId ?? null;
    if (parentId == null) {
      raices.push(nodo);
      return;
    }
    const padre = mapa.get(String(parentId));
    if (padre) {
      padre.hijos.push(nodo);
      padre.esHoja = false;
    } else {
      raices.push(nodo);
    }
  });
  return raices;
};

const serializarCriterioRubrica = (criterio) => ({
  nombre: criterio.nombre,
  descripcion: criterio.descripcion || '',
  peso: Number(criterio.peso) || 0,
  tipo: criterio.tipo,
  esHoja: criterio.esHoja,
  orden: criterio.orden ?? 0,
  niveles: criterio.esHoja ? (criterio.niveles || []) : [],
  hijos: (criterio.hijos || []).map(serializarCriterioRubrica)
});

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('upb_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState(() => {
    const saved = localStorage.getItem('upb_user');
    if (!saved) return 'login';
    const parsed = JSON.parse(saved);
    return parsed.rol === 'docente' ? 'dashboard_docente' : 'dashboard_estudiante';
  });

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('upb_projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [rubrics, setRubrics] = useState(() => {
    const saved = localStorage.getItem('upb_rubrics');
    return saved ? JSON.parse(saved) : initialRubrics;
  });

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedTab, setSelectedTab] = useState('ficha');
  const [notifications, setNotifications] = useState(mockNotifications);
  const [backendConnected, setBackendConnected] = useState(false);
  const [activeNotificationToast, setActiveNotificationToast] = useState(null);
  const [githubConnection, setGithubConnection] = useState({ connected: false, username: null });

  // Sync projects with localStorage
  useEffect(() => {
    localStorage.setItem('upb_projects', JSON.stringify(projects));
  }, [projects]);

  // Sync rubrics with localStorage
  useEffect(() => {
    localStorage.setItem('upb_rubrics', JSON.stringify(rubrics));
  }, [rubrics]);

  // Proyectos del usuario actual:
  // - Estudiante: solo los que creó o en los que es integrante
  // - Docente: solo los que le fueron asignados (docente_id === user.id)
  const userProjects = user ? projects.filter(p => {
    if (user.rol === 'docente') {
      return p.docente_id === user.id || p.docente_correo === user.correo;
    }
    const isCreator = p.creador_id === user.id || p.creador === user.nombre || p.creador === user.correo;
    const isMember = p.integrantes?.some(m => m.id === user.id || m.email === user.correo || m.nombre === user.nombre);
    return isCreator || isMember;
  }) : [];

  // Proyectos SIN asesor asignado (visibles para que el docente pueda tomarlos)
  const unassignedProjects = user?.rol === 'docente'
    ? projects.filter(p => !p.docente_id && !p.docente_correo)
    : [];

  // Active selected project for the current user
  const currentProject = userProjects.find(p => p.id === selectedProjectId) || userProjects[0] || null;

  // Real issues linked specifically to the current project
  const currentProjectIssues = currentProject?.tareas || [];

  // Check backend connectivity on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:3000/');
        if (res.ok) {
          setBackendConnected(true);
        }
      } catch (e) {
        setBackendConnected(false);
      }
    };
    checkBackend();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get('github')) return;
    const result = params.get('github');
    const message = params.get('message');
    window.history.replaceState({}, document.title, window.location.pathname);
    if (result !== 'connected') {
      showToast(message || 'No se pudo conectar con GitHub', 'error');
      return;
    }
    api.get('/auth/me').then((res) => {
      if (!res?.usuario) return;
      const backendUser = res.usuario;
      const updatedUser = { ...user, id: backendUser.id_usuario, nombre: backendUser.nombre, correo: backendUser.correo, rol: backendUser.rol, github_connected: true, github_username: backendUser.github_username };
      setUser(updatedUser);
      localStorage.setItem('upb_user', JSON.stringify(updatedUser));
      setGithubConnection({ connected: true, username: backendUser.github_username });
      showToast(`GitHub conectado como @${backendUser.github_username}`);
    });
  }, []);

  // Fetch projects from backend if connected and logged in
  useEffect(() => {
    const fetchProjects = async () => {
      if (backendConnected && user) {
        const res = await api.get('/proyectos');
        if (res && Array.isArray(res)) {
          const mapProject = (p) => ({
            id: p.id_proyecto,
            titulo: p.titulo,
            descripcion: p.descripcion || '',
            curso: 'Proyecto Integrador II - UPB',
            periodo: '2026-10',
            porcentaje_avance: p.porcentaje_avance,
            estado: p.estado,
            creador: p.creador?.nombre || 'Estudiante',
            creador_id: p.id_creador,
            docente_id: p.id_docente,
            docente_nombre: p.docente?.nombre || '',
            id_plane_proyecto: p.id_plane_proyecto,
            plane_workspace: 'upb-integradores',
            integrantes: p.integrantes?.map(i => ({
              id: i.usuario?.id_usuario,
              nombre: i.usuario?.nombre,
              correo: i.usuario?.correo,
              rol: i.usuario?.rol
            })) || [],
            campos_tecnicos: p.campos_tecnicos || {},
            repositorio: p.repositorio || null,
            versiones: p.versiones?.map(v => ({
              id: v.id_version,
              id_version: v.id_version,
              numero: v.numero,
              es_final: v.es_final,
              archivos: v.archivos?.map(a => ({
                id_archivo: a.id_archivo,
                nombre: a.nombre,
                tamano: a.tamano,
                extension: a.extension,
                ruta: a.ruta
              })) || []
            })) || [],
            tareas: p.tareas || [],
            actas: [],
            evaluacion: p.evaluaciones?.[0] ? {
              id_evaluacion: p.evaluaciones[0].id_evaluacion,
              rubrica_id: p.evaluaciones[0].id_rubrica,
              docente: p.evaluaciones[0].docente?.nombre || '',
              nota_final: Number(p.evaluaciones[0].nota_final),
              retroalimentacion: p.evaluaciones[0].retroalimentacion,
              estado: p.evaluaciones[0].estado,
              fecha: p.evaluaciones[0].fecha,
              detalles: p.evaluaciones[0].calificaciones?.map(c => ({
                criterio_id: c.id_criterio,
                nombre: c.criterio?.nombre,
                peso: Number(c.criterio?.peso || 0),
                nota: Number(c.nota)
              })) || []
            } : null
          });
          let mapped = res.map(mapProject);

          if (user.rol === 'docente') {
            const availableRes = await api.get('/proyectos/sin-docente');
            const available = availableRes?.proyectos || [];
            const assignedIds = new Set(mapped.map(project => project.id));
            mapped = [...mapped, ...available.filter(project => !assignedIds.has(project.id_proyecto)).map(mapProject)];
          }

          setProjects(mapped);
          
          if (mapped.length > 0) {
            setSelectedProjectId(mapped[0].id);
          }
        }
      }
    };
    fetchProjects();
  }, [backendConnected, user]);

  useEffect(() => {
    if (!backendConnected || !user || !localStorage.getItem('upb_token')) return;
    api.get('/auth/github/status').then((res) => {
      if (!res || res.error) return;
      setGithubConnection({ connected: Boolean(res.connected), username: res.username || null });
      if (user.github_connected !== Boolean(res.connected) || user.github_username !== res.username) {
        const updatedUser = { ...user, github_connected: Boolean(res.connected), github_username: res.username || null };
        setUser(updatedUser);
        localStorage.setItem('upb_user', JSON.stringify(updatedUser));
      }
    });
  }, [backendConnected, user?.id]);

  useEffect(() => {
    const fetchRubrics = async () => {
      if (!backendConnected || user?.rol !== 'docente' || !localStorage.getItem('upb_token')) return;
      const res = await api.get('/rubricas');
      if (res?.rubricas) {
        setRubrics(res.rubricas.map(r => ({
          id: r.id_rubrica,
          nombre: r.nombre,
          descripcion: r.descripcion || '',
          activa: r.activa,
          id_docente: r.id_docente,
          docente_nombre: r.docente?.nombre || user.nombre,
          criterios: normalizeRubricCriteria(r.criterios)
        })));
      }
    };
    fetchRubrics();
  }, [backendConnected, user]);

  const showToast = (msg, type = 'success') => {
    setActiveNotificationToast({ msg, type });
    setTimeout(() => setActiveNotificationToast(null), 4000);
  };

  // isRegister=true → siempre rol estudiante. Docentes solo pueden hacer login.
  const login = async (email, password, isRegister = false, nombreCompleto = '') => {
    // Intento contra el backend real primero
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const body = isRegister
      ? { correo: email, contrasena: password, nombre: nombreCompleto, rol: 'estudiante' }
      : { correo: email, contraseña: password };

    const res = await api.post(endpoint, body);
    if (res && res.token && res.usuario) {
      localStorage.setItem('upb_token', res.token);
      const userObj = {
        id: res.usuario.id_usuario,
        nombre: res.usuario.nombre,
        correo: res.usuario.correo,
        rol: res.usuario.rol,
        github_connected: Boolean(res.usuario.github_connected),
        github_username: res.usuario.github_username || null,
        avatar: 'https://i.pravatar.cc/150?u=' + res.usuario.correo
      };
      localStorage.setItem('upb_user', JSON.stringify(userObj));
      setUser(userObj);
      setGithubConnection({ connected: userObj.github_connected, username: userObj.github_username });
      if (userObj.rol === 'admin') setCurrentView('dashboard_admin');
      else if (userObj.rol === 'docente') setCurrentView('dashboard_docente');
      else setCurrentView('dashboard_estudiante');
      showToast('Bienvenido, ' + userObj.nombre + '!');
      return { success: true };
    }

    if (res?.error) {
      throw new Error(res.error);
    }

    throw new Error('No se pudo conectar con el backend. Enciéndelo e inténtalo de nuevo.');

    // Fallback local (sin backend activo)
    const rawName = nombreCompleto || email.split('@')[0];
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const rol = isRegister
      ? 'estudiante'
      : (email.toLowerCase().includes('admin') ? 'admin' : (email.toLowerCase().includes('docente') ? 'docente' : 'estudiante'));

    const loggedUser = {
      id: Date.now(),
      correo: email,
      rol,
      nombre: formattedName,
      avatar: 'https://i.pravatar.cc/150?u=' + email
    };

    localStorage.setItem('upb_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    if (loggedUser.rol === 'admin') setCurrentView('dashboard_admin');
    else if (loggedUser.rol === 'docente') setCurrentView('dashboard_docente');
    else setCurrentView('dashboard_estudiante');
    showToast('Sesion iniciada como ' + loggedUser.rol.toUpperCase());
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('upb_token');
    localStorage.removeItem('upb_user');
    setUser(null);
    setSelectedProjectId(null);
    setCurrentView('login');
    showToast('Sesion cerrada correctamente', 'info');
  };

  const deleteProject = async (projectId) => {
    const token = localStorage.getItem('upb_token');
    if (!token) {
      showToast('Necesitas una sesión activa para eliminar el proyecto.', 'error');
      return false;
    }

    const res = await api.delete(`/proyectos/${projectId}`);
    if (res?.error) {
      showToast(getApiError(res, 'No se pudo eliminar el proyecto'), 'error');
      return false;
    }

    setProjects((previousProjects) => previousProjects.filter((project) => project.id !== projectId));
    setSelectedProjectId(null);
    setCurrentView('dashboard_estudiante');
    showToast('Proyecto eliminado correctamente', 'info');
    return true;
  };

  const addProjectMember = async (projectId, correo) => {
    const res = await api.post(`/proyectos/${projectId}/integrantes`, { correo: correo.trim().toLowerCase() });
    if (res?.error || !res?.integrante) {
      showToast(getApiError(res, 'No se pudo agregar el integrante'), 'error');
      return false;
    }
    const integrante = res.integrante;
    const normalizedMember = {
      id: integrante.id_usuario,
      nombre: integrante.usuario?.nombre || correo,
      email: integrante.usuario?.correo || correo,
      rol: integrante.usuario?.rol || 'estudiante'
    };
    setProjects((previousProjects) => previousProjects.map((project) => project.id === projectId
      ? { ...project, integrantes: [...(project.integrantes || []), normalizedMember] }
      : project));
    showToast('Integrante agregado correctamente');
    return true;
  };

  const removeProjectMember = async (projectId, userId) => {
    const res = await api.delete(`/proyectos/${projectId}/integrantes/${userId}`);
    if (res?.error || res === null) {
      showToast(getApiError(res, 'No se pudo eliminar el integrante'), 'error');
      return false;
    }
    setProjects((previousProjects) => previousProjects.map((project) => project.id === projectId
      ? { ...project, integrantes: (project.integrantes || []).filter((member) => member.id !== userId) }
      : project));
    showToast('Integrante eliminado del proyecto', 'info');
    return true;
  };

  const connectGithub = async () => {
    const res = await api.get('/auth/github/url');
    if (!res?.url) throw new Error(res?.error || 'No se pudo iniciar la conexión con GitHub');
    window.location.assign(res.url);
  };

  const disconnectGithub = async () => {
    const res = await api.delete('/auth/github');
    if (res?.error) throw new Error(res.error);
    const updatedUser = { ...user, github_connected: false, github_username: null };
    setUser(updatedUser);
    localStorage.setItem('upb_user', JSON.stringify(updatedUser));
    setGithubConnection({ connected: false, username: null });
    showToast('Cuenta de GitHub desconectada', 'info');
  };

  const fetchGithubRepositories = async () => {
    const res = await api.get('/proyectos/github/repos');
    if (res?.error) throw new Error(res.error);
    return res?.repositorios || [];
  };

  const fetchGithubOrganizations = async () => {
    const res = await api.get('/proyectos/github/organizations');
    if (res?.error) throw new Error(res.error);
    return res?.organizaciones || [];
  };

  const createProject = async (projectData) => {
    const token = localStorage.getItem('upb_token');

    // Si hay token, intenta crear en el backend real (que a su vez crea en Plane)
    if (token) {
      try {
        const res = await api.post('/proyectos', {
          titulo: projectData.titulo,
          descripcion: projectData.descripcion || '',
          integrantes: projectData.memberEmails || []
        });

        if (res?.error) throw new Error(getApiError(res, 'No se pudo crear el proyecto'));

        if (res && res.proyecto) {
          const backendProject = res.proyecto;

          // Guardar campos técnicos si los hay
          if (projectData.lenguaje || projectData.frameworks) {
            await api.patch(`/proyectos/${backendProject.id_proyecto}/campos-tecnicos`, {
              lenguaje_principal: projectData.lenguaje || '',
              frameworks: projectData.frameworks || '',
              base_datos: projectData.baseDatos || '',
              es_movil: projectData.esMovil || false,
              entorno_despliegue: projectData.entornoDespliegue || ''
            });
          }

          let linkedRepository = null;
          if (projectData.githubMode === 'existing') {
            const repoRes = await api.post(`/proyectos/${backendProject.id_proyecto}/repositorio/github`, {
              owner: projectData.githubOwner,
              repo: projectData.githubRepo
            });
            if (repoRes?.error) throw new Error(getApiError(repoRes, 'No se pudo enlazar el repositorio'));
            linkedRepository = repoRes.repositorio;
          } else if (projectData.githubMode === 'create') {
            const repoRes = await api.post(`/proyectos/${backendProject.id_proyecto}/repositorio/github/create`, projectData.githubCreate);
            if (repoRes?.error) throw new Error(getApiError(repoRes, 'No se pudo crear el repositorio'));
            linkedRepository = repoRes.repositorio;
          } else if (projectData.repoUrl && projectData.repoUrl !== 'https://github.com/upb/') {
            await api.post(`/proyectos/${backendProject.id_proyecto}/repositorio`, {
              url: projectData.repoUrl,
              es_privado: false
            });
          }

          // Normalizar el proyecto del backend al formato local
          const normalizado = {
            id: backendProject.id_proyecto,
            titulo: backendProject.titulo,
            descripcion: backendProject.descripcion || '',
            curso: projectData.curso || 'Proyecto Integrador II - UPB',
            periodo: projectData.periodo || '2026-10',
            porcentaje_avance: 0,
            estado: 'borrador',
            creador: user?.nombre,
            creador_id: user?.id,
            id_plane_proyecto: backendProject.id_plane_proyecto || null,
            plane_workspace: import.meta.env.VITE_PLANE_WORKSPACE || 'aux-3',
            integrantes: (backendProject.integrantes || []).map(i => ({
              id: i.id_usuario || i.usuario?.id_usuario,
              nombre: i.usuario?.nombre || user?.nombre,
              email: i.usuario?.correo || user?.correo,
              rol: (i.id_usuario || i.usuario?.id_usuario) === backendProject.id_creador ? 'Dueño' : 'Integrante'
            })),
            campos_tecnicos: {
              lenguaje_principal: projectData.lenguaje || '',
              frameworks: projectData.frameworks || '',
              base_datos: projectData.baseDatos || '',
              es_movil: projectData.esMovil || false,
              entorno_despliegue: projectData.entornoDespliegue || ''
            },
            repositorio: linkedRepository || (projectData.repoUrl ? { url: projectData.repoUrl, es_privado: false } : null),
            versiones: [{ id: Date.now(), numero: 'v1.0', descripcion: 'Versión inicial', es_final: false, fecha: new Date().toISOString().split('T')[0], archivos: [] }],
            tareas: [],
            actas: [],
            evaluacion: null
          };

          setProjects(prev => [normalizado, ...prev]);
          setSelectedProjectId(normalizado.id);
          setCurrentView('ficha_proyecto');
          setSelectedTab('ficha');
          const planeMsg = normalizado.id_plane_proyecto ? ' y sincronizado con Plane' : '';
          showToast('Proyecto "' + normalizado.titulo + '" creado' + planeMsg + ' exitosamente');
          return true;
        }

        throw new Error(res?.error || 'El backend no confirmó la creación del proyecto');
      } catch (err) {
        console.error('[createProject] Error backend:', err);
        showToast(err.message || 'No se pudo crear el proyecto en el backend', 'error');
        return false;
      }
    }

    showToast('No hay una sesión conectada al backend. Inicia sesión con el backend encendido para guardar el proyecto.', 'error');
    return false;

    // Fallback local (sin backend o sin token)
    const newProject = {
      id: Date.now(),
      titulo: projectData.titulo,
      descripcion: projectData.descripcion || '',
      curso: projectData.curso || 'Proyecto Integrador II - UPB',
      periodo: projectData.periodo || '2026-10',
      porcentaje_avance: 0,
      estado: 'borrador',
      creador: user?.nombre || 'Estudiante',
      creador_id: user?.id || Date.now(),
      id_plane_proyecto: null,
      plane_workspace: 'upb-integradores',
      integrantes: [{ id: user?.id || Date.now(), nombre: user?.nombre || 'Estudiante', rol: 'Lider de Proyecto', email: user?.correo || '' }],
      campos_tecnicos: { lenguaje_principal: projectData.lenguaje || '', frameworks: projectData.frameworks || '', base_datos: projectData.baseDatos || '', es_movil: projectData.esMovil || false, entorno_despliegue: projectData.entornoDespliegue || '' },
      repositorio: { url: projectData.repoUrl || '', es_privado: true },
      versiones: [{ id: Date.now() + 1, numero: 'v1.0', descripcion: 'Registro inicial', es_final: false, fecha: new Date().toISOString().split('T')[0], archivos: [] }],
      tareas: [],
      actas: [],
      evaluacion: null
    };

    setProjects(prev => [newProject, ...prev]);
    setSelectedProjectId(newProject.id);
    setCurrentView('ficha_proyecto');
    setSelectedTab('ficha');
    showToast('Proyecto "' + newProject.titulo + '" creado (modo local — inicia el backend para sincronizar con Plane)');
    return true;
  };

  const addProjectTask = async (projectId, taskTitle, modulo = 'General') => {
    const project = projects.find(p => p.id === projectId);
    const token = localStorage.getItem('upb_token');

    // Si el proyecto tiene Plane sincronizado, crear la tarea vía backend
    if (token && project?.id_plane_proyecto) {
      try {
        const res = await api.post(`/proyecto/${projectId}/tareas`, {
          titulo: taskTitle,
          estado: 'por_hacer'
        });
        if (res && res.tarea) {
          const newTask = {
            id: res.tarea.id,
            titulo: res.tarea.name || taskTitle,
            estado: 'por_hacer',
            prioridad: 'media',
            modulo,
            asignado: user?.nombre || 'Estudiante'
          };
          setProjects(prev => prev.map(p => {
            if (p.id !== projectId) return p;
            const updatedTareas = [newTask, ...(p.tareas || [])];
            return { ...p, tareas: updatedTareas, porcentaje_avance: _calcAvance(updatedTareas) };
          }));
          showToast('Tarea creada y sincronizada con Plane');
          return;
        }
      } catch (err) {
        console.warn('[addProjectTask] Fallback local:', err);
      }
    }

    // Fallback local
    const newTask = {
      id: 'ISSUE-' + Math.floor(100 + Math.random() * 900),
      titulo: taskTitle,
      estado: 'por_hacer',
      prioridad: 'media',
      modulo,
      asignado: user?.nombre || 'Estudiante'
    };
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const updatedTareas = [newTask, ...(p.tareas || [])];
      return { ...p, tareas: updatedTareas, porcentaje_avance: _calcAvance(updatedTareas) };
    }));
    showToast('Tarea agregada al Backlog del proyecto');
  };

  const _calcAvance = (tareas) => {
    if (!tareas.length) return 0;
    return Math.round((tareas.filter(t => t.estado === 'completado' || t.estado === 'hecho').length / tareas.length) * 100);
  };

  const syncProjectBacklog = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    const token = localStorage.getItem('upb_token');

    if (token && project?.id_plane_proyecto) {
      try {
        const res = await api.get(`/proyecto/${projectId}/backlog`);
        if (res && res.tareas) {
          const mappedTasks = res.tareas.map(t => ({
            id: t.id,
            titulo: t.name,
            estado: t.state_detail?.name?.toLowerCase() === 'done' ? 'completado' 
                  : t.state_detail?.name?.toLowerCase() === 'in progress' ? 'en_progreso' 
                  : 'por_hacer',
            prioridad: t.priority || 'media',
            modulo: 'General',
            asignado: t.assignees?.[0]?.display_name || user?.nombre || 'Estudiante'
          }));
          
          setProjects(prev => prev.map(p => {
            if (p.id !== projectId) return p;
            return { ...p, tareas: mappedTasks, porcentaje_avance: res.proyecto?.porcentaje_avance || _calcAvance(mappedTasks) };
          }));
        }
      } catch (err) {
        console.warn('[syncProjectBacklog] Error sincronizando con Plane:', err);
      }
    }
  };

  const updateTaskState = async (projectId, taskId, nextState) => {
    const project = projects.find(p => p.id === projectId);
    const token = localStorage.getItem('upb_token');
    const planeState = nextState === 'completado' ? 'hecho' : nextState;

    if (token && project?.id_plane_proyecto && !String(taskId).startsWith('ISSUE-')) {
      try {
        await api.patch(`/proyecto/${projectId}/tareas/${taskId}/estado`, { estado: planeState });
      } catch (err) {
        console.warn('[updateTaskState] Fallback local:', err);
      }
    }

    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const updatedTareas = (p.tareas || []).map(t => t.id === taskId ? { ...t, estado: nextState } : t);
      return { ...p, tareas: updatedTareas, porcentaje_avance: _calcAvance(updatedTareas) };
    }));
    showToast('Estado actualizado a ' + nextState.toUpperCase());
  };

  const addRubric = async (newRubric) => {
    if (backendConnected && localStorage.getItem('upb_token')) {
      const res = await api.post('/rubricas', {
        nombre: newRubric.nombre,
        descripcion: newRubric.descripcion,
        criterios: (newRubric.criterios || []).map(serializarCriterioRubrica)
      });
      if (!res?.rubrica) {
        showToast(res?.error || 'No se pudo guardar la rúbrica', 'error');
        return false;
      }
      newRubric = {
        ...newRubric,
        id: res.rubrica.id_rubrica,
        id_docente: res.rubrica.id_docente,
        criterios: normalizeRubricCriteria(res.rubrica.criterios)
      };
    }
    setRubrics(prev => [newRubric, ...prev]);
    showToast('Nueva rúbrica guardada y validada al 100%');
    return true;
  };

  const updateRubric = (id, updated) => {
    setRubrics(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    showToast('Rubrica actualizada con exito');
  };

  const saveEvaluation = async (projectId, evalData) => {
    if (backendConnected && localStorage.getItem('upb_token')) {
      const body = {
        calificaciones: evalData.detalles.map(item => ({ id_criterio: item.criterio_id, nota: item.nota })),
        retroalimentacion: evalData.retroalimentacion
      };
      if (evalData.id_evaluacion && evalData.estado === 'cerrada') {
        const current = projects.find(p => p.id === projectId)?.evaluacion;
        if (current?.estado === 'cerrada') {
          const reopened = await api.patch(`/evaluaciones/${evalData.id_evaluacion}/reabrir`);
          if (!reopened?.evaluacion) {
            showToast(reopened?.error || 'No se pudo reabrir la evaluación', 'error');
            return false;
          }
        }
      }
      const res = evalData.id_evaluacion
        ? await api.put(`/evaluaciones/${evalData.id_evaluacion}`, body)
        : await api.post(`/proyectos/${projectId}/evaluaciones`, { id_rubrica: evalData.rubrica_id, ...body });
      if (!res?.evaluacion) {
        showToast(res?.error || 'No se pudo guardar la evaluación', 'error');
        return false;
      }
      evalData = { ...evalData, id_evaluacion: res.evaluacion.id_evaluacion };
      if (evalData.estado === 'cerrada') {
        const closed = await api.patch(`/evaluaciones/${evalData.id_evaluacion}/cerrar`);
        if (!closed?.evaluacion) {
          showToast(closed?.error || 'La evaluación se guardó pero no pudo cerrarse', 'error');
          return false;
        }
      }
    }
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          estado: evalData.estado === 'cerrada' ? 'calificado' : 'en_revision',
          evaluacion: evalData
        };
      }
      return p;
    }));
    showToast(evalData.estado === 'cerrada' ? 'Evaluacion cerrada y nota final registrada!' : 'Borrador de evaluacion guardado');
    return true;
  };

  const addVersion = async (projectId, version, file = null) => {
    try {
      const token = localStorage.getItem('upb_token');
      let createdVersion = { ...version, id: Date.now(), archivos: [] };

      // Si hay conexion con backend
      if (token && backendConnected) {
        // 1. Crear la version
        const verRes = await api.post(`/proyectos/${projectId}/versiones`, {
          numero: version.numero,
          descripcion: version.descripcion,
          es_final: version.es_final
        });

        if (verRes && verRes.version) {
          createdVersion = { ...verRes.version, archivos: [] };

          // 2. Si hay archivo, subirlo
          if (file) {
            const formData = new FormData();
            formData.append('archivo', file);
            formData.append('tipo', 'entregable');
            
            const uploadRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/versiones/${createdVersion.id_version}/archivos`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
              body: formData
            });

            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              if (uploadData.archivo) {
                createdVersion.archivos = [uploadData.archivo];
              }
            } else {
              const errData = await uploadRes.json();
              showToast(errData.error || 'Error al subir el archivo físico', 'error');
              return; // Detenemos aquí si falla el archivo
            }
          }
        } else {
          showToast(verRes?.error || 'Error al crear la versión en la BD', 'error');
          return;
        }
      } else {
        // Fallback local
        if (file) {
          createdVersion.archivos = [{
            id_archivo: Date.now(),
            nombre: file.name,
            tamano: file.size,
            extension: file.name.split('.').pop(),
            fecha_subida: new Date().toISOString()
          }];
        }
      }

      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            versiones: [createdVersion, ...(p.versiones || [])]
          };
        }
        return p;
      }));
      showToast('Version ' + version.numero + ' registrada con exito');
    } catch (error) {
      showToast('Error al registrar la version', 'error');
    }
  };

  const addActa = (projectId, acta) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          actas: [acta, ...(p.actas || [])]
        };
      }
      return p;
    }));
    showToast('Acta de asesoria creada satisfactoriamente');
  };

  // Docente toma un proyecto sin asesor y se lo asigna a sí mismo
  const assignDocente = async (projectId) => {
    const res = await api.patch(`/proyectos/${projectId}/asignar-docente`);
    if (!res?.proyecto) {
      showToast(res?.error || 'No se pudo asignar el proyecto', 'error');
      return false;
    }

    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      docente_id: user.id,
      docente_correo: user.correo,
      docente_nombre: user.nombre,
      estado: res.proyecto.estado || p.estado
    } : p));
    showToast('Proyecto asignado a tu cartera de asesoría. Ya puedes revisarlo y evaluarlo.');
    return true;
  };

  // Docente libera un proyecto de su cartera
  const unassignDocente = async (projectId) => {
    const res = await api.delete(`/proyectos/${projectId}/asignar-docente`);
    if (res?.error) {
      showToast(res.error, 'error');
      return false;
    }

    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const { docente_id, docente_correo, docente_nombre, ...rest } = p;
      return rest;
    }));
    showToast('Proyecto desasignado de tu cartera', 'info');
    return true;
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      currentView,
      setCurrentView,
      selectedProjectId,
      setSelectedProjectId,
      selectedTab,
      setSelectedTab,
      projects,
      setProjects,
      userProjects,
      unassignedProjects,
      currentProject,
      currentProjectIssues,
      rubrics,
      setRubrics,
      notifications,
      backendConnected,
      githubConnection,
      activeNotificationToast,
      showToast,
      login,
      logout,
      deleteProject,
      addProjectMember,
      removeProjectMember,
      connectGithub,
      disconnectGithub,
      fetchGithubRepositories,
      fetchGithubOrganizations,
      createProject,
      syncProjectBacklog,
      addProjectTask,
      updateTaskState,
      addRubric,
      updateRubric,
      saveEvaluation,
      addVersion,
      addActa,
      assignDocente,
      unassignDocente
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);