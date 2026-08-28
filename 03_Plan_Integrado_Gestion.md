# Plan Integrado de Gestión del Proyecto

**Programa:** Ingeniería de Sistemas e Informática — UPB Seccional Bucaramanga
**Curso:** Proyecto Integrador III — 2026-20
**Docente:** MSc. Lenin Javier Serrano Gil
**Proyecto:** Plataforma centralizada para la gestión, calificación y visualización de proyectos integradores
**Integrantes:** Caren Julieth Diaz Calderon · Juan Sebastian Hernandez Remolina
**Fecha:** [fecha de entrega]
**Versión:** 2.0

---

## 1. Introducción

### 1.1 Resumen ejecutivo

El presente documento constituye el Plan Integrado de Gestión del Proyecto para el desarrollo de una **aplicación para dispositivos móviles** (web responsive / híbrida) que permita la gestión, calificación y visualización de los proyectos integradores del programa de Ingeniería de Sistemas e Informática de la UPB Seccional Bucaramanga.

El proyecto se desarrolla a lo largo de las **17 semanas** del semestre académico (julio – noviembre de 2026), siguiendo el cronograma oficial del curso Proyecto Integrador III. El equipo está compuesto por **2 desarrolladores** que disponen de **15 horas semanales cada uno**, lo que arroja una capacidad total de **240 horas-persona** distribuidas en el semestre.

La solución se desplegará en infraestructura gratuita (Render/Railway) y utilizará tecnologías de código abierto, con un costo ejecutado de **$0 COP** y una valorización de mercado referencial de **$49.690.000 COP**.

El alcance del proyecto cubre los requisitos funcionales clasificados como **Must** (RF-01 a RF-09, RF-12, RF-13, RF-19) y los **Should** estructurales (RF-14, RF-15, RF-16 simplificado). Los requisitos **Could** (RF-11, RF-17, RF-18) quedan fuera del alcance para este semestre y se documentan como mejoras futuras en el backlog del producto. El proyecto está alineado con las competencias definidas en el sílabo del curso (Investigación e Innovación, Ingeniería de Software, Infraestructura Tecnológica, Seguridad de la Información, Creatividad e Innovación).

### 1.2 Objetivos y alcance

**Objetivos estratégicos del proyecto:**
1. Centralizar la gestión de fichas de proyecto, archivos/evidencias y vínculo de control de versiones en una sola plataforma.
2. Dar visibilidad en tiempo real del backlog/tablero Kanban de cada grupo al docente.
3. Implementar un módulo de evaluación docente con rúbrica ponderada y cálculo automático de nota.
4. Integrar el repositorio de código de cada proyecto a su ficha.
5. Garantizar acceso móvil funcional a las funciones núcleo (backlog, ficha, rúbrica).
6. Documentar los sensores y requisitos de conectividad necesarios para la aplicación móvil (RF-19).
7. Entregar un informe final en formato IEEE con todos los anexos requeridos por el sílabo.

**Alcance funcional (según EDT):**
- Módulo de Usuarios y Acceso (RF-01)
- Módulo de Gestión de Proyectos (RF-02, RF-03, RF-04, RF-05)
- Módulo de Backlog Centralizado (RF-12, RF-13)
- Módulo de Evaluación Docente (RF-06, RF-07, RF-08, RF-09)
- Módulo de Moderación y Publicación (RF-14)
- Módulo de Catálogo (RF-15)
- Módulo de Reportes Básicos (RF-16, simplificado a CSV)
- Consideración de sensores y conectividad (RF-19)

### 1.3 Entregables clave (según sílabo del curso)

| # | Entregable | Semana | Responsable |
|---|------------|--------|-------------|
| 1 | Revisión de la literatura | 1 | Ambos |
| 2 | Project Charter, ERS, Registro de Interesados | 2 | Ambos |
| 3 | EDT, Plan Integrado, Backlog Priorizado | 3 | Ambos |
| 4 | Módulos funcionales (Sprints 1-4) | 4-7 | Ambos |
| 5 | Producto v1.0 + Informe v1.0 + Anexos | 8 | Ambos |
| 6 | Producto v2.0 + Informe v2.0 + Anexos | 11 | Ambos |
| 7 | Producto final 100% + Informe v3.0 + Validación técnica | 14 | Ambos |
| 8 | Pre-sustentación (presentación, póster, video) | 15 | Ambos |
| 9 | Sustentación (Jornada de Socialización) | 16 | Ambos |
| 10 | Retrospectiva final | 17 | Ambos |

### 1.4 Alineación con las competencias del curso

El presente proyecto se alinea con las competencias definidas en el sílabo de Proyecto Integrador III, de la siguiente manera:

| Competencia | Criterio | Cómo se aborda en el proyecto |
|-------------|----------|-------------------------------|
| **Investigación e Innovación** | 1.2: Diseño y desarrollo detallado de una nueva aplicación | Se diseña y desarrolla una plataforma web/móvil centralizada para la gestión de proyectos integradores. |
| **Ingeniería de Software** | 2.1: Planteo soluciones a problemas cumpliendo las etapas del ciclo de vida del software | Se sigue un ciclo de vida completo: análisis de requerimientos, diseño, desarrollo, pruebas y despliegue. |
| **Ingeniería de Software** | 2.2: Diseño con criterios de calidad, seguridad y buenas prácticas | Se aplican estándares de codificación, pruebas unitarias y gestión de configuración con Docker. |
| **Ingeniería de Software** | 2.3: Desarrollo aplicando metodologías y herramientas de productividad | Se utiliza Kanban, Git, Jira y entornos de desarrollo modernos. |
| **Ingeniería de Software** | 2.4: Análisis de recursos informáticos requeridos | Se estima el esfuerzo (240 horas-persona) y se seleccionan herramientas gratuitas (Render, PostgreSQL). |
| **Infraestructura Tecnológica** | 3.1: Aplicación de lineamientos OSI/TCP/IP | La plataforma se despliega en la nube considerando disponibilidad y seguridad de red. |
| **Infraestructura Tecnológica** | 3.2: Implementación de infraestructura de redes | Se utiliza infraestructura en la nube con acceso desde dispositivos móviles. |
| **Seguridad de la Información** | 4.1: Empleo de técnicas de aseguramiento de la información | Se implementa hash de contraseñas, auditoría de calificaciones y cumplimiento de la Ley 1581. |
| **Creatividad e Innovación** | 5.1: Indagación de fuentes para generación de ideas | La solución se basa en una encuesta real a docentes que evidencia la necesidad. |

---

## 2. Organización del proyecto

### 2.1 Roles y responsabilidades

| Rol | Responsable | Responsabilidades principales |
|---|---|---|
| Patrocinador académico / evaluador | MSc. Lenin Javier Serrano Gil | Aprueba alcance y cambios mayores; evalúa entregables semanales y finales |
| Gerente de proyecto / Product Owner | Ambos | Prioriza backlog, gestiona relación con docentes validadores, consolida informes de avance |
| Líder técnico / Scrum lead | Ambos | Define arquitectura, coordina control de versiones y despliegue, gestiona riesgos técnicos |
| Equipo de desarrollo | Ambos | Construcción, pruebas e integración de todos los módulos según el plan de recursos por sprint |

### 2.2 Estructura del equipo

El equipo está compuesto por 2 desarrolladores Full-Stack que actúan como responsables de todas las fases del ciclo de vida del software: análisis, diseño, codificación, pruebas y despliegue. La distribución de tareas se realiza por semana y se documenta en el tablero Kanban interno.

### 2.3 Matriz RACI simplificada

| Actividad | Equipo de Desarrollo | Docente (Sponsor) |
|-----------|----------------------|-------------------|
| Definición de alcance | R | A |
| Priorización de backlog | R | A |
| Desarrollo de código | R | I |
| Pruebas unitarias | R | I |
| Despliegue | R | I |
| Validación con usuarios | R | A |
| Gestión de riesgos | R | A |
| Cambios de alcance | R | A |
| Informe final (IEEE) | R | I |

*R = Responsable, A = Aprobador, I = Informado.*

---

## 3. Procesos de gestión

### 3.1 Gestión de alcance

**Definición del alcance:** El alcance del proyecto está definido por la Estructura de Descomposición del Trabajo (EDT), la Especificación de Requisitos de Software (ERS) y el Project Charter. Cualquier trabajo no contemplado en estos documentos se considera fuera de alcance.

**Control de cambios:**
- **Cambios menores** (ajustes en criterios de aceptación, correcciones de bugs): el equipo de desarrollo puede aprobarlos.
- **Cambios mayores** (agregar o eliminar un módulo funcional, modificar el cronograma base): requieren aprobación explícita del docente (sponsor) mediante una solicitud formal.
- Todo cambio aprobado debe reflejarse en una nueva versión del EDT y del backlog.

**Validación del alcance:**
- Al final de cada semana, se realiza una demo funcional donde se verifican los criterios de aceptación de las historias completadas.
- En las Semanas 8, 11 y 14, se realizan validaciones formales con los docentes, según lo exige el sílabo.

### 3.2 Gestión de tiempo

**Cronograma base (17 semanas, según sílabo del curso):**

| Semana | Fechas estimadas | Hito | Entregable principal | Responsable |
|--------|------------------|------|----------------------|-------------|
| 1 | 7 – 13 jul 2026 | Definición del proyecto | Revisión de la literatura + Acta de seguimiento | Ambos |
| 2 | 14 – 20 jul 2026 | Declaración del alcance | Project Charter, ERS, Registro de Interesados | Ambos |
| 3 | 21 – 27 jul 2026 | Planificación | EDT, Plan Integrado, Backlog Priorizado | Ambos |
| 4-7 | 28 jul – 24 ago 2026 | Diseño y desarrollo (Sprint 1-4) | Módulos funcionales + Acta de seguimiento | Ambos |
| 8 | 25 – 31 ago 2026 | Análisis de resultados 1 | Producto v1.0 + Informe v1.0 + Anexos | Ambos |
| 9-10 | 1 – 14 sep 2026 | Diseño y desarrollo (Sprint 5-6) | Avance de producto + Acta de seguimiento | Ambos |
| 11 | 15 – 21 sep 2026 | Análisis de resultados 2 | Producto v2.0 + Informe v2.0 + Anexos | Ambos |
| 12-13 | 22 sep – 5 oct 2026 | Diseño y desarrollo (Sprint 7-8) | Avance de producto + Acta de seguimiento | Ambos |
| 14 | 6 – 12 oct 2026 | Análisis de resultados 3 | Producto final 100% + Informe v3.0 + Validación técnica | Ambos |
| 15 | 13 – 19 oct 2026 | Pre-sustentación | Presentación v2.0, póster, video, material de divulgación | Ambos |
| 16 | 20 – 22 oct 2026 | Sustentación | Jornada de Socialización — Auditorio Juan Pablo II | Ambos |
| 17 | 27 oct – 2 nov 2026 | Cierre del curso | Retrospectiva final | Ambos |

**Seguimiento del cronograma:**
- Cada semana se elabora un acta de seguimiento que registra el avance real frente al planificado.
- Las desviaciones superiores a 2 días deben ser comunicadas de inmediato al docente y se debe presentar un plan de recuperación.

### 3.3 Gestión de costos

**Presupuesto ejecutado:** $0 COP (infraestructura gratuita, recurso humano no devenga salario).

**Valorización de mercado referencial:** $49.690.000 COP, calculado con base en:

| Rubro | Estimación |
|-------|------------|
| Recurso humano (640h, todos los roles) | $40.400.000 COP |
| Infraestructura y herramientas (6 meses) | $5.250.000 COP |
| Contingencia (10 % sobre recurso humano) | $4.040.000 COP |
| **Total** | **$49.690.000 COP** |

**Seguimiento de costos:**
- Aunque no se ejecuta presupuesto real, se lleva un registro de horas invertidas por categoría (desarrollo, gestión, QA) para comparar con la EDT y asegurar que el esfuerzo no supere las 240 horas planificadas.
- Si se detecta una desviación significativa (>10% de horas adicionales), se evalúa la necesidad de ajustar el alcance.

### 3.4 Gestión de calidad

**Estándares de codificación:**
- **Frontend:** ESLint + Prettier (JavaScript/TypeScript) para mantener un estilo consistente y detectar errores potenciales.
- **Backend:** PEP8 (Python) o estándar equivalente según el lenguaje elegido.
- **Documentación:** Todo código debe incluir comentarios para funciones complejas y documentación en el repositorio (README.md).

**Pruebas:**
- **Pruebas unitarias:** Se exige cobertura mínima del 70% sobre la lógica de negocio crítica (cálculo de rúbricas, transiciones de estado del proyecto).
- **Pruebas de integración:** Se realizan al final de cada semana para validar que los módulos interactúan correctamente.
- **Pruebas de aceptación:** Cada historia de usuario se verifica contra sus criterios de aceptación antes de darla por terminada.
- **Validación técnica:** En la Semana 14, se verifica que el producto cumpla con los requerimientos técnicos y estándares de calidad definidos (exigido por el sílabo).

**Revisiones de código:**
- Todo código debe ser revisado por el otro integrante del equipo antes de fusionarse a la rama `develop`.
- La revisión verifica: cumplimiento de estándares, legibilidad, coherencia con la arquitectura y ausencia de errores evidentes.

**Definición de "Hecho" (DoD - Definition of Done):**
Para que una historia de usuario se considere terminada, debe cumplir:
1. Código implementado y revisado por pares.
2. Pruebas unitarias pasan y cubren al menos la funcionalidad principal.
3. Criterios de aceptación verificados en entorno de pruebas.
4. Documentación actualizada (README, comentarios en código).
5. Sin bugs críticos o bloqueantes identificados.

### 3.5 Gestión de riesgos

**Riesgos identificados y mitigaciones:**

| ID | Riesgo | Impacto | Mitigación |
|----|--------|---------|------------|
| R-01 | Pérdida de información por falta de repositorio centralizado durante el desarrollo | Alto | Uso de Git y GitHub desde el inicio; commits diarios; copias de seguridad locales. |
| R-02 | Disponibilidad de tiempo de los integrantes menor a la planeada | Alto | Seguimiento semanal de horas invertidas; si se detecta desviación, priorizar Must sobre Should. |
| R-03 | Restricciones de alojamiento institucional no definidas a tiempo | Medio | Plan de contingencia: uso de Render/Railway free-tier mientras se obtiene la autorización de TI. |
| R-04 | Ampliación no controlada del alcance durante el desarrollo | Alto | Control de cambios riguroso; solo el docente (sponsor) puede aprobar cambios mayores. |

**Seguimiento de riesgos:**
- Los riesgos se revisan en cada acta de seguimiento semanal.
- Se actualiza el estado de cada riesgo (probabilidad, impacto, mitigación aplicada) en el registro de riesgos del Plan Integrado.

### 3.6 Gestión de comunicaciones

| Interesado | Canal | Frecuencia | Contenido |
|------------|-------|------------|-----------|
| Docente director del curso | Acta de seguimiento + reunión de clase | Semanal | (a) tabla de avance frente al cronograma base, (b) riesgos activos, (c) decisiones tomadas |
| Docentes validadores | Convocatoria por correo electrónico | Semanas 8, 11, 14 | Enlace de acceso al prototipo y formulario estructurado para la recolección de retroalimentación |
| Equipo de desarrollo | Tablero Kanban interno (Jira) | Continua | Estado de tareas, asignaciones y avance por historia de usuario |

### 3.7 Gestión de configuración

**Control de versiones:**
- **Plataforma:** Git + GitHub.
- **Ramas:**
  - `main`: código estable, solo recibe fusiones desde `develop` después de pruebas.
  - `develop`: integración de todas las funcionalidades.
  - `feature/*`: ramas por historia de usuario o paquete de trabajo.
  - `hotfix/*`: correcciones urgentes sobre `main`.

**Empaquetado y despliegue:**
- **Empaquetado:** Docker (Dockerfile y docker-compose) para garantizar consistencia entre entornos.
- **Entornos:**
  - Desarrollo: local con Docker.
  - Pruebas: entorno de staging (Render/Railway).
  - Producción: servidor institucional (una vez aprobado) o Render/Railway (plan de contingencia).

**Criterios para promoción a producción:**
1. Todas las pruebas unitarias e integración pasan.
2. Validación con docentes completada y retroalimentación incorporada.
3. Documentación actualizada y lista para entregar.

---

## 4. Proceso técnico

### 4.1 Metodología de desarrollo

Se utiliza **Kanban** como marco de trabajo para la gestión del flujo de trabajo. Esta metodología se caracteriza por:

- **Flujo continuo:** No hay sprints ni iteraciones fijas. El equipo trabaja de manera continua, sacando tareas del backlog según su capacidad y prioridad.
- **Tablero visual:** El equipo utiliza un tablero Kanban en Jira con las columnas: *"Por hacer"*, *"En progreso"*, *"En revisión"*, *"Hecho"*.
- **Límite de trabajo en progreso (WIP):** Se establece un límite máximo de **2 tareas simultáneas por persona** para evitar la sobrecarga y mantener el foco.
- **Reuniones de sincronización:**
  - **Reunión semanal de planificación (lunes, 15-20 min):** Se revisa el backlog, se priorizan las siguientes tareas y se asignan responsables.
  - **Reunión semanal de revisión (viernes, 15 min):** Se revisa el avance de la semana, se actualiza el tablero y se identifican bloqueos.
  - **Daily stand-up (opcional, 5 min):** Se realiza de forma asíncrona vía chat (WhatsApp o Telegram) para reportar avances y bloqueos.

**Ciclo de vida del desarrollo:**
1. **Planificación semanal:** Selección de tareas a realizar en la semana.
2. **Diseño:** Definición de arquitectura y modelo de datos para las tareas seleccionadas.
3. **Codificación:** Implementación siguiendo estándares de codificación.
4. **Pruebas:** Pruebas unitarias y de integración.
5. **Revisión de código:** Revisión por el otro integrante del equipo.
6. **Despliegue:** Despliegue en entorno de pruebas y verificación de criterios de aceptación.
7. **Entrega:** Se marca como "Hecho" en el tablero Kanban y se fusiona a `develop`.

### 4.2 Herramientas y tecnologías

| Categoría | Herramienta / Tecnología | Propósito |
|-----------|---------------------------|-----------|
| Control de versiones | Git + GitHub | Gestión de código fuente y colaboración |
| Gestión de proyecto (Kanban) | Jira | Tablero Kanban, backlog, seguimiento de tareas |
| Desarrollo | Visual Studio Code o equivalente | Entorno de desarrollo integrado |
| Frameworks | [pendiente de definir] | Frontend y backend (selección final en Semana 1) |
| Base de datos | PostgreSQL (free-tier) | Almacenamiento de datos |
| Contenedores | Docker + docker-compose | Portabilidad y consistencia de entornos |
| Despliegue | Render / Railway (free-tier) | Alojamiento en la nube (plan de contingencia) |
| Pruebas | Jest / PyTest (según lenguaje) | Pruebas unitarias y de integración |

### 4.3 Consideraciones de sensores y conectividad para dispositivos móviles

Según lo exige el sílabo del curso (sección 5: "Consideraciones"), se ha documentado lo siguiente:

**Sensores del dispositivo móvil requeridos:**

| Sensor | Requerido | Propósito |
|--------|-----------|-----------|
| GPS | No | La plataforma no requiere geolocalización |
| Acelerómetro | No | No aplica |
| Cámara | Opcional | Podría usarse para cargar fotografías de evidencias |
| Micrófono | No | No aplica |
| Pantalla táctil | Sí | Interacción principal con la interfaz |
| Conectividad WiFi | Sí | Acceso a la plataforma desde entornos institucionales |
| Conectividad 4G/5G | Sí | Acceso a la plataforma desde dispositivos móviles fuera de la institución |
| Bluetooth | No | No aplica |

**Requisitos de conectividad:**

| Requisito | Descripción |
|-----------|-------------|
| WiFi | La plataforma debe ser accesible desde la red WiFi institucional de la UPB. |
| 4G/5G | La plataforma debe ser accesible desde redes móviles (4G/5G) con tiempos de carga inferiores a 3 segundos para el tablero Kanban (RNF-07). |
| Estabilidad | La plataforma debe manejar desconexiones de red de forma elegante (mensajes de error, reintentos automáticos). |

**Entorno real de uso:**

| Entorno | Descripción |
|---------|-------------|
| Institucional (UPB) | Estudiantes y docentes acceden desde sus dispositivos móviles dentro de las instalaciones de la UPB, utilizando la red WiFi institucional. |
| Externo | Estudiantes y docentes acceden desde sus dispositivos móviles fuera de la UPB, utilizando redes 4G/5G o WiFi doméstica. |
| Condiciones | La plataforma debe ser usable en condiciones de luz variable (interiores y exteriores) y con pantallas de diferentes tamaños (360×800 px en adelante). |

---

## 5. Cronograma y presupuesto detallado

### 5.1 Cronograma de hitos (17 semanas)

| Semana | Fechas | Hito | Entregable |
|--------|--------|------|------------|
| 1 | 7 – 13 jul | Definición del proyecto | Revisión de la literatura + Acta |
| 2 | 14 – 20 jul | Declaración del alcance | Project Charter, ERS, Registro de Interesados |
| 3 | 21 – 27 jul | Planificación | EDT, Plan Integrado, Backlog |
| 4-7 | 28 jul – 24 ago | Diseño y desarrollo | Módulos funcionales (Sprints 1-4) |
| 8 | 25 – 31 ago | Análisis de resultados 1 | Producto v1.0 + Informe v1.0 + Anexos |
| 9-10 | 1 – 14 sep | Diseño y desarrollo | Avance de producto (Sprints 5-6) |
| 11 | 15 – 21 sep | Análisis de resultados 2 | Producto v2.0 + Informe v2.0 + Anexos |
| 12-13 | 22 sep – 5 oct | Diseño y desarrollo | Avance de producto (Sprints 7-8) |
| 14 | 6 – 12 oct | Análisis de resultados 3 | Producto final 100% + Informe v3.0 + Validación técnica |
| 15 | 13 – 19 oct | Pre-sustentación | Presentación, póster, video, material de divulgación |
| 16 | 20 – 22 oct | Sustentación | Jornada de Socialización — Auditorio Juan Pablo II |
| 17 | 27 oct – 2 nov | Cierre del curso | Retrospectiva final |

### 5.2 Presupuesto detallado (esfuerzo por fase)

| Fase | Horas-persona | % del total | Costo de mercado (COP) |
|------|---------------|-------------|------------------------|
| Gestión del Proyecto | 13 | 5,4 % | $942.500 |
| Diseño de Experiencia de Usuario | 10 | 4,2 % | $725.000 |
| Producto de Software — Módulos Funcionales | 130 | 54,1 % | $9.425.000 |
| Aseguramiento de Calidad | 28 | 11,7 % | $2.030.000 |
| Despliegue e Infraestructura | 29 | 12,1 % | $2.102.500 |
| **Total planificado** | **210** | **87,5 %** | **$15.225.000** |
| Margen de contingencia (12,5 %) | 30 | 12,5 % | $2.175.000 |
| **Capacidad total** | **240** | **100 %** | **$17.400.000** |

*Nota: el costo de mercado se calcula con tarifa de $72.500 COP/hora (base: $8.000.000 COP/mes con factor prestacional del 45%).*

### 5.3 Desglose de esfuerzo por semana (horas)

| Semana | Actividad principal | Horas estimadas | Responsable |
|--------|---------------------|-----------------|-------------|
| 1 | Revisión de la literatura y definición | 8 | Ambos |
| 2 | Project Charter, ERS, Stakeholders | 16 | Ambos |
| 3 | EDT, Plan Integrado, Backlog | 16 | Ambos |
| 4 | Módulo Usuarios y Acceso | 18 | Ambos |
| 5 | Módulo Gestión de Proyectos | 18 | Ambos |
| 6 | Módulo Gestión de Proyectos (continuación) | 18 | Ambos |
| 7 | Módulo Backlog Centralizado | 18 | Ambos |
| 8 | Integración v1.0 + Informe v1.0 | 20 | Ambos |
| 9 | Módulo Evaluación Docente | 18 | Ambos |
| 10 | Módulo Evaluación Docente (continuación) | 18 | Ambos |
| 11 | Integración v2.0 + Informe v2.0 | 20 | Ambos |
| 12 | Módulo Moderación + Catálogo | 18 | Ambos |
| 13 | Módulo Reportes + ajustes | 18 | Ambos |
| 14 | Integración final + Informe v3.0 + Validación | 20 | Ambos |
| 15 | Pre-sustentación (materiales) | 12 | Ambos |
| 16 | Sustentación | 8 | Ambos |
| 17 | Retrospectiva final | 4 | Ambos |
| **Total** | **17 semanas** | **210** | |

---

## 6. Informe final en formato IEEE

El informe final del proyecto debe seguir el formato IEEE disponible en: https://www.ieee.org/conferences/publishing/templates.html

**Estructura obligatoria del informe:**

1. **Título**
2. **Introducción**
3. **Estado del arte y marco conceptual**
4. **Objetivos** (general y específicos)
5. **Metodología** (ABP/ABPy, Kanban, herramientas)
6. **Resultados del producto y del proyecto** (según cada componente del integrador)
7. **Reporte de avance del cronograma** (coherente con las actas de seguimiento)
8. **Discusión**
9. **Conclusiones**
10. **Trabajo futuro**
11. **Agradecimientos**
12. **Referencias bibliográficas** (actualizadas, relevantes, académicas o de fuentes notables)

**Anexos obligatorios:**

- Diseños (modelos de infraestructura, estructura, comportamiento, datos)
- Tablas y evidencias
- Especificación de Requerimientos (ERS)
- Documentos de diseño y ejecución de pruebas
- Código fuente debidamente documentado
- Product Backlog
- Actas de seguimiento
- Manual de usuario
- Política de seguridad
- Procedimiento de recuperación del sistema
- (Si aplica) Actas de aprobación del cliente y documentación de propiedad intelectual