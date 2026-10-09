# 🚀 GUÍA DE IMPLEMENTACIÓN TÉCNICA DETALLADA (PROMPT MASTER PARA COPILOT)

Este documento contiene las especificaciones exactas, rutas de archivos, modelos de base de datos, contratos de API y componentes de interfaz para implementar las mejoras del sistema de Proyectos Integradores UPB.

---

## 🏗️ 1. STACK TECNOLÓGICO Y CONVENCIONES

* **Backend:** Node.js v20+ (ES Modules: `import/export`), Express.js, Prisma ORM, PostgreSQL.
* **Frontend:** React 18, Vite, Tailwind CSS, Lucide React (iconos).
* **Seguridad:** JWT (Bearer token), Zod (validación de esquemas), Bcrypt (hashing).
* **Servicios Externos:** Plane API Cloud (`https://api.plane.so/api/v1`), GitHub OAuth API.

### 1.1 Reglas de compatibilidad con el repositorio actual

* Este plan amplía la implementación existente; no se deben crear entidades ni rutas duplicadas.
* Las actividades usan `ActividadEntregable`, `ActividadProyecto`, `Entrega` y `ArchivoEntrega`. Los entregables anteriores usan rutas distintas y deben conservarse.
* Las rutas existentes se mantienen: `actividadEntregableRoutes.js` para actividades y `entregableRoutes.js` para archivos de entregas. Cualquier endpoint nuevo debe montarse bajo `/api` y reutilizar `verificarToken`.
* La fórmula institucional vigente se conserva sin cambios: `N_D = N_B × (F_C / 100)`, donde `N_B` está en escala 0 a 5 y `F_C` en escala 0 a 100.
* El backend está escrito en JavaScript ES Modules. La validación de compilación aplica al build de Vite y a las pruebas de Node; no se debe introducir TypeScript sin una decisión separada.

---

## 📁 2. ESTRUCTURA DE ARCHIVOS A INTERVENIR

```text
backend/
├── prisma/
│   └── schema.prisma                        # Modelos Prisma (Entrega, ArchivoEntrega, Repositorio, etc.)
├── src/
│   ├── controllers/
│   │   ├── actividadEntregableController.js # Controladores de actividades y entregas
│   │   ├── evaluacionController.js          # Controladores de calificación y desglose
│   │   └── planeController.js               # Controladores de sincronización con Plane
│   ├── services/
│   │   ├── actividadEntregableService.js    # Lógica de snapshot de criterios y consultas
│   │   ├── evaluacionService.js             # Lógica de notas base y definitivas
│   │   └── planeService.js                  # Peticiones HTTP a la API de Plane
│   ├── routes/
│   │   ├── actividadEntregableRoutes.js     # Actividades y asignaciones
│   │   ├── entregableRoutes.js              # Archivos y entregas existentes
│   │   └── planeRoutes.js                   # Endpoints del tablero ágil
│   └── middleware/
│       └── uploadMiddleware.js              # Validación MIME, tamaño y almacenamiento
frontend/
└── src/
    ├── components/
    │   ├── MatrizCriteriosModal.jsx         # Visor de rúbrica y niveles (0 a 5) para estudiante
    │   └── TableroKanban.jsx                # Tablero visual de tareas conectado a Plane
    ├── pages/
    │   ├── Entregables.jsx                  # Gestión de entregas (Vista Estudiante y Docente)
    │   └── EvaluacionProyecto.jsx           # Panel de calificación por criterios
    └── context/
        └── AppContext.jsx                   # Estado global y sincronización con API
```

---

## 🎯 3. ESPECIFICACIÓN POR MÓDULOS

---

### 🔹 MÓDULO 1: REVISIÓN DOCENTE DE ENTREGAS (ARCHIVOS + DESCARGA + ENLACE GIT)

#### 1.1 Requerimiento
Cuando el docente entra a revisar las entregas de una actividad:
1. Debe ver la lista de archivos subidos por cada equipo con:
   * Nombre original del archivo.
   * Extensión con icono diferenciado (PDF, ZIP, DOCX, etc.).
   * Tamaño en KB/MB.
   * Botón `[ 📥 Descargar ]` que descargue el archivo directamente.
2. Debe ver el botón directo `[ 🐙 Repositorio Git ]` si el equipo tiene enlazado su GitHub/GitLab, abriendo la URL en una nueva pestaña. Si no tiene repo enlazado, mostrar badge `⚠️ Sin repositorio`.

#### 1.2 Backend — Consulta enriquecida (`actividadEntregableService.js`)
Asegurar que la consulta de la actividad incluya el repositorio del proyecto y los archivos de cada entrega:

```javascript
// backend/src/services/actividadEntregableService.js
const incluirActividadCompleta = {
  docente: { select: { id_usuario: true, nombre: true } },
  rubrica_docente: { select: { id_rubrica: true, nombre: true, tipo: true } },
  rubrica_coevaluacion: { select: { id_rubrica: true, nombre: true, tipo: true, criterios: { where: { es_hoja: true }, orderBy: { orden: 'asc' } } } },
  proyectos: {
    include: {
      proyecto: {
        select: {
          id_proyecto: true,
          titulo: true,
          id_docente: true,
          repositorio: { select: { url: true, es_privado: true, origen: true } },
          integrantes: { select: { id_usuario: true, usuario: { select: { nombre: true, correo: true } } } }
        }
      },
      entrega: {
        include: {
          participantes: true,
          archivos: {
            select: {
              id_archivo_entrega: true,
              nombre: true,
              ruta: true,
              tamano: true,
              extension: true,
              fecha_subida: true
            }
          },
          evaluacion: true,
          coevaluaciones: { include: { evaluado: { select: { id_usuario: true, nombre: true } } } },
          resultados_coevaluacion: { include: { usuario: { select: { id_usuario: true, nombre: true } } } }
        }
      }
    }
  }
};
```

#### 1.3 Backend — Middleware de Seguridad y Descarga de Archivos (`uploadMiddleware.js`)
* Los archivos nuevos se guardan en `uploads/entregas/`. Los archivos existentes en `uploads/` deben continuar siendo accesibles durante la transición.
* **Límite de tamaño para archivos nuevos:** 25 MB (`limits: { fileSize: 25 * 1024 * 1024 }`).
* **Tipos permitidos:**
  ```javascript
  const TIPOS_PERMITIDOS = [
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  ```
* La validación debe comprobar MIME y extensión. Los formatos permitidos son únicamente PDF, ZIP, DOCX y PPTX.
* `ArchivoEntrega.ruta` debe guardar una ruta relativa, nunca una ruta absoluta del sistema.
* La descarga no debe depender de `express.static`. Debe existir un endpoint autenticado, por ejemplo `GET /api/entregas/:idEntrega/archivos/:idArchivo/descarga`, que compruebe permisos y use `res.download` o una respuesta equivalente.
* Si se mantiene el servicio estático durante la transición, no debe usarse para archivos nuevos ni considerarse un mecanismo de autorización.

#### 1.4 Frontend — Tarjeta de Evidencias en `Entregables.jsx`
Para cada entrega revisada por el docente:

```jsx
{/* Sección de Repositorio Git */}
<div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
  <span className="text-xs font-bold text-neutral-700">Repositorio del Proyecto:</span>
  {asignacion.proyecto.repositorio?.url ? (
    <a
      href={asignacion.proyecto.repositorio.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm"
    >
      <Github className="w-3.5 h-3.5" />
      Ver Repositorio Git ↗
    </a>
  ) : (
    <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-1 rounded-md font-semibold border border-amber-200">
      ⚠️ Sin repositorio enlazado
    </span>
  )}
</div>

{/* Lista de Archivos Adjuntos */}
<div className="space-y-2 mt-3">
  <p className="text-xs font-extrabold text-neutral-600 uppercase tracking-wider">Archivos entregados ({entrega.archivos?.length || 0}):</p>
  {entrega.archivos?.map((archivo) => (
    <div key={archivo.id_archivo_entrega} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 transition-all">
      <div className="flex items-center gap-2.5 min-w-0">
        <FileText className="w-4 h-4 text-[#C8102E] shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-neutral-800 truncate">{archivo.nombre}</p>
          <p className="text-[10px] text-neutral-400">{(archivo.tamano / 1024 / 1024).toFixed(2)} MB · {new Date(archivo.fecha_subida).toLocaleString('es-CO')}</p>
        </div>
      </div>
      <a
        href="#"
        onClick={(event) => descargarArchivo(event, entrega.id_entrega, archivo)}
        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-all shrink-0"
      >
        Descargar
      </a>
    </div>
  ))}
</div>
```

---

### 🔹 MÓDULO 2: VISOR DE MATRIZ DE DESEMPEÑO (0 AL 5) PARA ESTUDIANTES

#### 2.1 Requerimiento
En la vista de cada actividad (`Entregables.jsx`), el estudiante debe tener un botón `[ 👁️ Ver Criterios y Matriz de Calificación ]`.
Al pulsarlo, se despliega una ventana modal o acordeón que muestra:
1. Cada criterio docente asignado con su peso % y descripción.
2. La **Matriz de Niveles (0 al 5)** con su texto descriptivo cualitativo (qué debe tener el trabajo para sacar 5, 4, 3, 2, 1 o 0).
3. Si la entrega es grupal, la tabla de **Criterios de Coevaluación** (5 criterios de 20% c/u con escala 0-100%).

#### 2.2 Componente `MatrizCriteriosModal.jsx` (Frontend)

```jsx
import React from 'react';
import { Award, CheckCircle2, Users, X, Info } from 'lucide-react';
import { Button } from './UIComponents';

export const MatrizCriteriosModal = ({ actividad, onClose }) => {
  if (!actividad) return null;

  const criterios = Array.isArray(actividad.criterios_snapshot)
    ? actividad.criterios_snapshot.filter((c) => c.seleccionado !== false && c.es_hoja)
    : [];

  const coevalCriterios = actividad.rubrica_coevaluacion?.criterios || [
    { id: 1, nombre: 'Cumplimiento de tareas asignadas', peso: 20 },
    { id: 2, nombre: 'Calidad técnica de los aportes', peso: 20 },
    { id: 3, nombre: 'Puntualidad en los compromisos del sprint', peso: 20 },
    { id: 4, nombre: 'Comunicación asertiva y proactividad', peso: 20 },
    { id: 5, nombre: 'Participación en reuniones y sincronizaciones', peso: 20 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-neutral-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#1A1A1A] to-[#2A2020] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#C9A84C]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black">{actividad.nombre}</h2>
              <p className="text-xs text-neutral-300">Guía de Evaluación y Matriz de Desempeño</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Criterios Docente */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C8102E]" />
              <h3 className="font-extrabold text-sm text-neutral-800 uppercase tracking-wider">
                Criterios de Evaluación Docente ({criterios.length} criterios)
              </h3>
            </div>

            {criterios.map((criterio) => (
              <div key={criterio.id_criterio} className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-neutral-900">{criterio.nombre}</h4>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#C8102E]/10 text-[#C8102E]">
                    Ponderación: {criterio.peso}%
                  </span>
                </div>
                {criterio.descripcion && (
                  <p className="text-xs text-neutral-500 leading-relaxed">{criterio.descripcion}</p>
                )}

                {/* Tabla de Niveles (0 al 5) */}
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-left text-xs bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    <thead className="bg-neutral-100 text-neutral-600 font-bold border-b border-neutral-200">
                      <tr>
                        <th className="py-2.5 px-3 w-16 text-center">Nivel</th>
                        <th className="py-2.5 px-3 w-20 text-center">Puntos</th>
                        <th className="py-2.5 px-4">Descripción Cualitativa (Requisitos)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {(criterio.niveles || []).sort((a, b) => b.nivel - a.nivel).map((nivel) => (
                        <tr key={nivel.nivel} className="hover:bg-neutral-50 transition-colors">
                          <td className="py-2.5 px-3 text-center font-bold text-neutral-800">{nivel.nivel}</td>
                          <td className="py-2.5 px-3 text-center font-extrabold text-[#C8102E]">{Number(nivel.puntos).toFixed(1)}</td>
                          <td className="py-2.5 px-4 text-neutral-600 leading-relaxed">
                            {nivel.descripcion || 'Cumple con los requisitos correspondientes a este nivel.'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Guía de Coevaluación (Si es grupal) */}
          {actividad.tipo === 'GRUPAL' && actividad.coevaluacion_activa && (
            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Users className="w-4 h-4 text-amber-700" />
                <span>Matriz de Coevaluación entre Compañeros de Equipo</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Tus compañeros de equipo valorarán tu desempeño en estos 5 aspectos con una escala de 0 a 100 puntos:
              </p>
              <div className="grid sm:grid-cols-2 gap-2 mt-2">
                {coevalCriterios.map((c, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl border border-amber-100 text-xs">
                    <p className="font-bold text-neutral-800">{i + 1}. {c.nombre}</p>
                    <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Peso relativo: 20%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end shrink-0">
          <Button variant="secondary" onClick={onClose}>Entendido, cerrar</Button>
        </div>
      </div>
    </div>
  );
};
```

---

### 🔹 MÓDULO 3: CICLO DE CALIFICACIÓN & DESGLOSE TRANSPARENTE

#### 3.1 Lógica Matemática
* **Nota Base Docente ($N_B$):** Calculada por el docente de 0.0 a 5.0 según la rúbrica.
* **Factor de Coevaluación ($F_C$):** Promedio de coevaluación del equipo (0.0 a 1.0).
* **Nota Definitiva ($N_D$):** Se conserva la fórmula vigente del sistema:
  $$N_D = N_B \times \frac{F_C}{100}$$
  donde $N_B$ es la nota base docente en escala 0.0 a 5.0 y $F_C$ es el porcentaje de coevaluación en escala 0 a 100.

#### 3.2 Visualización en el Frontend para el Estudiante (`Entregables.jsx`)
```jsx
{/* Estado Provisional vs Definitivo */}
{entrega.evaluacion ? (
  <div className="p-4 rounded-2xl bg-white border border-neutral-200 space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-neutral-500">Nota Base Docente:</span>
      <span className="text-sm font-black text-neutral-800">{Number(entrega.evaluacion.nota_final).toFixed(2)} / 5.0</span>
    </div>

    {entrega.coevaluacion_activa && (
      <>
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500">Desempeño Coevaluación:</span>
          <span className="font-bold text-emerald-700">
            {propiosResultado ? `${Number(propiosResultado.total_coevaluacion).toFixed(1)}%` : '⏳ Pendiente'}
          </span>
        </div>
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-xs font-extrabold text-neutral-900 uppercase">Nota Final Individual:</span>
          <span className="text-base font-black text-[#C8102E]">
            {propiosResultado?.nota_final ? `${Number(propiosResultado.nota_final).toFixed(2)} / 5.0` : '⚠️ Provisional'}
          </span>
        </div>
      </>
    )}
  </div>
) : (
  <span className="text-xs text-neutral-400 italic">Sin calificar por el docente</span>
)}
```

---

### 🔹 MÓDULO 4: TABLERO KANBAN ÁGIL CONECTADO A PLANE CLOUD

#### 4.1 Backend (`planeService.js` / `planeRoutes.js`)
Garantizar las rutas del tablero:
* `GET /api/plane/proyectos/:idProyecto/tablero`: Devuelve estados y tareas del proyecto en Plane.
* `PATCH /api/plane/proyectos/:idProyecto/tareas/:idIssue/estado`: Actualiza el estado de una tarea al moverla de columna.

La creación o sincronización con Plane debe ser tolerante a fallos: si Plane no responde, el proyecto local debe conservarse y `id_plane_proyecto` debe quedar nulo o sin cambios. El error de Plane debe registrarse sin bloquear la operación principal.

```javascript
// backend/src/controllers/planeController.js
export const obtenerTableroCompleto = async (req, res) => {
  try {
    const { id_proyecto } = req.params;
    const proyecto = await prisma.proyecto.findUnique({ where: { id_proyecto: Number(id_proyecto) } });
    if (!proyecto?.id_plane_proyecto) {
      return res.status(404).json({ error: 'El proyecto no está sincronizado con Plane' });
    }
    const [estados, tareas] = await Promise.all([
      obtenerEstadosPlane(proyecto.id_plane_proyecto),
      obtenerTareasPlane(proyecto.id_plane_proyecto)
    ]);
    res.json({ estados, tareas });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};
```

#### 4.2 Frontend (`TableroKanban.jsx`)
Renderizar 3 o 4 columnas estándar (*Backlog, Por Hacer, En Progreso, Completado*) permitiendo:
* Visualizar responsables de cada tarea.
* Cambiar de estado con un selector rápido o drag & drop.
* Botón directo: `[ 🚀 Abrir en Plane Workspace ]` con enlace a `https://app.plane.so/upb-integradores/projects/${id_plane}/issues`.

---

## 🔒 4. CHECKLIST DE CALIDAD Y SEGURIDAD

- [x] **No hardcodear URLs:** Todas las llamadas al backend deben usar la constante dinámica `/api`.
- [x] **Saneamiento de Entradas:** Todas las mutaciones (`POST`, `PUT`, `PATCH`) deben validarse con Zod.
- [x] **Manejo de Errores Silencioso en Plane:** Si Plane no responde, la creación de entregables o proyectos en la BD de la UPB **no debe fallar ni bloquear al usuario**.
- [x] **Permisos por Rol:**
  * Estudiante: solo consulta criterios, sube archivos y coevalúa a sus compañeros.
  * Docente: crea entregables, descarga archivos de cualquier equipo y califica notas base.
- [x] **Compatibilidad en Producción:** Todo el código debe compilar limpiamente con `npm run build` sin errores de TypeScript/Vite.

---

## ✅ 5. ORDEN DE IMPLEMENTACIÓN Y CRITERIOS DE ACEPTACIÓN

1. **Contratos y seguridad de archivos:** ruta relativa, límite de 25 MB, validación MIME/extensión, descarga autenticada y pruebas de permisos.
2. **Consulta docente:** incluir repositorio, integrantes y archivos sin exponer rutas físicas del servidor.
3. **Matriz para estudiantes:** usar `criterios_snapshot` como fuente histórica; no consultar una rúbrica mutable para reconstruir una actividad publicada.
4. **Calificación:** conservar `N_D = N_B × (F_C / 100)` y probar los casos `F_C = 0`, `F_C = 50` y `F_C = 100`.
5. **Plane:** implementar tablero y cambio de estado con validación Zod y tolerancia a fallos.
6. **Frontend:** integrar los componentes en `Entregables.jsx` y usar la constante de API existente, incluyendo el token cuando la descarga no sea una navegación pública.

La implementación se considera aceptada cuando las pruebas cubren permisos de estudiante/docente, archivos antiguos y nuevos, entrega individual y grupal, coevaluación completa e incompleta, fallo de Plane y build de frontend.
