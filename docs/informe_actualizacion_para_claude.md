# Contexto maestro autónomo para generar el informe final

## Propósito

Generar desde cero el informe final del proyecto integrador en formato IEEE usando toda la información académica, funcional y técnica incluida en este archivo. Este Markdown es autónomo: Claude no necesita recibir otro informe, documento Word ni archivo adicional para redactar la versión final.

Este documento sirve como contexto técnico y como instrucciones para generar la nueva versión del informe. La fecha de referencia del estado actual es **14 de octubre de 2026**.

## Regla de entrada única

Este archivo Markdown será el **único archivo que se entregará a Claude**. Claude no recibirá el informe V2 en Word, capturas, anexos, archivos `.env` ni otros documentos. Por tanto:

1. No debe solicitar documentos adicionales para comenzar.
2. Debe usar como fuente principal todo el contenido de este Markdown.
3. Debe conservar el contenido histórico y académico incluido aquí, aunque esté marcado como línea base, V2 o documentación previa.
4. Debe incorporar las actualizaciones técnicas incluidas aquí sin borrar funcionalidades, objetivos, resultados, tablas o limitaciones anteriores.
5. Cuando un dato esté marcado como `[por confirmar]`, `[pendiente]` o `[referencia por verificar]`, debe conservar esa marca y no inventar el valor.
6. Si no puede generar directamente un archivo binario Word, debe entregar el Markdown final y un script reproducible para crear el `.docx`; no debe detenerse solicitando otro archivo.
7. El informe final debe construirse únicamente con la información contenida en este documento y no debe afirmar que se verificó un archivo que Claude no recibió.

## Instrucción principal para Claude

Genera el informe final completo en Markdown, con redacción académica y estructura compatible con un artículo IEEE. Usa la información de este documento como fuente única. Conserva todo el contenido académico, funcional y metodológico incluido aquí; agrega los cambios recientes de arquitectura, integraciones, pruebas, interfaz, aplicación móvil y limitaciones. No atribuyas al repositorio una verificación que no puedas realizar a partir del contenido recibido.

No incluyas contraseñas, tokens, claves privadas, API keys, secretos JWT, credenciales de base de datos ni valores reales del archivo `.env`. Cuando sea necesario describir configuración, usa variables de entorno, valores enmascarados o ejemplos ficticios.

No afirmes que una funcionalidad está terminada solamente porque aparece en el plan o en un diagrama. Diferencia claramente entre:

- Implementado y conectado a la API.
- Implementado parcialmente.
- Documentado o preparado, pero no validado completamente.
- Pendiente o fuera del alcance actual.

## Identificación del proyecto

- **Título sugerido:** Plataforma centralizada para la gestión, seguimiento, evaluación y visualización de proyectos integradores.
- **Programa:** Ingeniería de Sistemas e Informática, UPB Seccional Bucaramanga.
- **Curso:** Proyecto Integrador III.
- **Integrantes:** Caren Julieth Diaz Calderón y Juan Sebastian Hernández Remolina.
- **Periodo:** 2026.
- **Tipo de solución:** Plataforma web responsive con aplicación móvil Flutter y API REST.
- **Repositorio:** `Caren3249p/Proyectos-integradores`.

## Problema y motivación

La plataforma busca resolver la dispersión de información relacionada con los proyectos integradores: fichas de proyecto, integrantes, backlog, evidencias, versiones, repositorios, evaluaciones docentes y coevaluaciones. La solución centraliza estos procesos y permite que estudiantes, docentes y administradores trabajen sobre una fuente común de información.

El sistema pretende:

1. Centralizar la información de cada proyecto.
2. Facilitar el seguimiento del backlog y del avance del proyecto.
3. Gestionar entregables y archivos de evidencia.
4. Aplicar rúbricas de evaluación docente.
5. Calcular resultados de coevaluación entre integrantes.
6. Vincular el proyecto con GitHub y Plane.
7. Ofrecer acceso desde una interfaz web y una aplicación móvil.
8. Proporcionar un canal de chat externo mediante lanzamiento SSO firmado.

## Estado técnico actual

### Backend

El backend está implementado con:

- Node.js.
- Express 4.
- Prisma ORM 5.
- PostgreSQL como base de datos prevista por el esquema.
- Zod para validación de entradas.
- JWT para autenticación de usuarios.
- `bcrypt` para hash de contraseñas.
- Multer para carga de archivos.
- `jose` para firma y manejo de JWT/SSO.
- CORS y variables de entorno mediante `dotenv`.

El punto de entrada principal es `backend/src/app.js`. La API expone, entre otros, los siguientes grupos de rutas:

- `/api/auth`: registro, inicio de sesión, perfil y conexión con GitHub.
- `/api/proyectos`: creación, consulta, actualización, integrantes, docente asignado y repositorio.
- `/api/backlog`: tareas internas del backlog.
- `/api/plane`: integración con Plane, estados, tablero y actualización del estado de tareas.
- `/api/rubricas`: creación, consulta, actualización y desactivación de rúbricas.
- `/api`: versiones, archivos, evaluaciones, entregables y coevaluaciones.
- `/api/usuarios`: administración de usuarios por parte del administrador.
- `/api/projects`: creación de repositorios de GitHub.
- `/api/integraciones`: lanzamiento de chat mediante SSO.
- `/.well-known/jwks.json`: publicación de la clave pública SSO.
- `/api/health`: verificación básica de disponibilidad.

La aplicación utiliza middleware de autenticación y control de roles. Las rutas protegidas requieren token, y ciertas operaciones están limitadas a administradores, docentes asignados o integrantes del proyecto.

### Modelo de datos

El esquema Prisma contiene entidades para:

- Usuarios.
- Proyectos.
- Tareas de backlog.
- Integrantes de proyecto.
- Versiones de proyecto.
- Archivos.
- Campos técnicos.
- Repositorios.
- Estado OAuth de GitHub.
- Rúbricas, criterios y niveles de desempeño.
- Evaluaciones.
- Entregables y actividades de entregables.
- Entregas y participantes.
- Archivos asociados a entregas.
- Coevaluaciones, criterios y resultados.
- Calificaciones por criterio.

El esquema aplica relaciones e integridad referencial mediante Prisma. La cifra de 23 modelos principales es la cifra documentada por el equipo; Claude debe contrastarla con `backend/prisma/schema.prisma` y explicar cualquier diferencia sin eliminar la información histórica.

### Frontend web

El frontend utiliza:

- React 18.
- Vite.
- Tailwind CSS.
- `lucide-react` para iconografía.
- `fetch` encapsulado en `frontend/src/services/api.js`.
- Estado global mediante `AppContext`.
- Persistencia local del token y ciertos datos de interfaz mediante `localStorage`.

Las vistas principales actuales incluyen:

- Autenticación.
- Dashboard del estudiante.
- Dashboard del docente.
- Dashboard del administrador.
- Ficha del proyecto.
- Tablero Kanban.
- Gestión de rúbricas.
- Evaluación de proyectos.
- Entregables.
- Coevaluación.

La navegación se adapta al rol:

- **Estudiante:** mi proyecto, ficha y entregas, backlog/Kanban, actas, entregables/co evaluación y chat.
- **Docente:** panel docente, gestión de rúbricas, evaluación, entregables/co evaluación, explorador de fichas y chat.
- **Administrador:** panel de control, explorador global y chat.

La interfaz conserva la identidad visual basada en la UPB, con diseño responsive, tarjetas, navegación lateral, indicadores de estado y notificaciones.

### Aplicación móvil

Existe una aplicación Flutter en `mobile/`. Su estructura actual contempla:

- Inicio de sesión.
- Restauración de sesión.
- Inicio y navegación por rol.
- Consulta de proyectos.
- Detalle de proyecto.
- Creación de proyectos.
- Proyectos sin asesor.
- Backlog.
- Versiones de proyecto.
- Cliente HTTP y servicios separados.
- Modelos para usuario, proyecto, tareas y versiones.
- Tema visual institucional.

La aplicación móvil debe describirse como una aplicación en desarrollo integrada con la API, evitando afirmar paridad total con todas las funciones del frontend web si no se ha demostrado mediante pruebas funcionales.

## Evolución completa del proyecto y funcionalidades incorporadas

### 1. Tablero Kanban conectado con Plane

Se añadió una vista web dedicada al tablero Kanban:

- Consulta estados y tareas del proyecto desde Plane.
- Agrupa tareas en Backlog, Por Hacer, En Progreso y Hecho.
- Normaliza distintos nombres de estado.
- Calcula y muestra el porcentaje de avance.
- Permite sincronizar manualmente.
- Permite actualizar el estado de una tarea.
- Permite abrir el workspace de Plane.
- Muestra el número de tareas completadas y el total.

En el backend se añadieron endpoints para:

- Obtener el tablero de un proyecto.
- Obtener tareas y estados desde Plane.
- Actualizar el estado de una tarea.
- Recalcular y persistir el porcentaje de avance del proyecto.

El acceso se valida para que el docente sea el asignado al proyecto, mientras que las reglas generales de autenticación se mantienen mediante token.

### 2. Integración de chat con SSO

Se incorporó una integración con un servicio de chat externo:

- El frontend dispone de una acción de chat en los menús por rol.
- El backend crea un lanzamiento firmado con JWT.
- El token contiene identidad, correo, rol, URL de retorno y, opcionalmente, un destino de proyecto.
- El token tiene una vigencia corta.
- El destino de proyecto se valida contra la pertenencia o autorización del usuario.
- El backend publica un JWKS para que el servicio externo pueda verificar la firma.
- La clave privada se obtiene exclusivamente desde variables de entorno.

La integración debe explicarse como un mecanismo SSO entre la plataforma y el servicio de chat, no como un chat implementado internamente dentro de este repositorio.

### 3. Configuración de SSO y variables de entorno

Se amplió el archivo de ejemplo `backend/.env.example` con variables para:

- Identificador de clave SSO.
- Emisor y audiencia del token.
- URL del servicio de chat.
- URL de retorno.
- Clave privada SSO o su representación Base64.
- Configuración de Plane y GitHub.

El informe debe indicar que los secretos se gestionan por variables de entorno y no deben incluirse en el repositorio ni en el documento académico.

### 4. Mejoras de la ficha del proyecto y navegación

La ficha del proyecto ahora se relaciona con el tablero y permite acceder al backlog conectado. La navegación muestra el acceso a Kanban y chat de acuerdo con el rol. También se conservaron las funciones de ficha, entregables, repositorio y seguimiento implementadas previamente.

### 5. Integración con GitHub

El sistema conserva funcionalidades para:

- Consultar organizaciones y repositorios.
- Vincular un repositorio a un proyecto.
- Desvincularlo.
- Crear un repositorio desde la plataforma.
- Mantener el estado OAuth y proteger el token de GitHub mediante cifrado configurado por entorno.

Describir esta integración como enlace y gestión auxiliar de repositorios, sin afirmar que el sistema reemplaza GitHub.

### 6. Entregables, rúbricas y coevaluación

El sistema actual contempla:

- Creación y publicación de actividades de entrega.
- Asignación de actividades a proyectos.
- Entregas individuales o grupales.
- Carga y descarga de archivos.
- Rúbricas jerárquicas con criterios y niveles.
- Evaluaciones docentes con retroalimentación.
- Coevaluaciones entre estudiantes.
- Cálculo de resultados de coevaluación.
- Estados de evaluación y posibilidad de cerrar o reabrir cuando corresponda.

Las validaciones de negocio incluyen pesos de rúbrica, niveles permitidos, tipos de actividad, estados de backlog y longitud mínima de retroalimentación.

## Seguridad y privacidad

El informe debe incluir una sección de seguridad con estas medidas:

- Autenticación mediante JWT.
- Hash de contraseñas con `bcrypt`.
- Autorización por rol.
- Verificación de pertenencia o asignación antes de consultar proyectos sensibles.
- Validación de entrada mediante Zod.
- Política de formatos y tamaño de archivos.
- Cifrado de credenciales OAuth de GitHub mediante clave de entorno.
- SSO firmado con RS256 y publicación de clave pública por JWKS.
- Expiración corta de los tokens de lanzamiento de chat.
- No exposición de secretos en frontend ni en documentación.

También debe incluirse como recomendación de despliegue:

- Regenerar cualquier secreto que haya sido expuesto durante el desarrollo.
- Usar secretos del proveedor de despliegue.
- No subir `backend/.env`.
- Cambiar el usuario y contraseña administrativa por defecto antes de producción.
- Configurar HTTPS y restricciones CORS para producción.

## Pruebas y validación actual

### Backend

Comando ejecutado:

```bash
cd backend
npm test
```

Resultado actual:

- 16 pruebas ejecutadas.
- 15 aprobadas.
- 1 fallida.

La prueba fallida es `rechaza una evaluacion sin retroalimentacion suficiente`. La validación funcional sí rechaza una retroalimentación menor de 20 caracteres, pero la aserción espera el texto `>=20 characters|20 caracteres` y Zod devuelve `String must contain at least 20 character(s)`. Debe corregirse la aserción o uniformarse el mensaje antes de presentar el informe como una suite completamente aprobada.

Las pruebas cubren contratos de negocio, cálculo de coevaluación y política de archivos.

### Frontend

Comando ejecutado:

```bash
cd frontend
npm run build
```

Resultado:

- Compilación Vite exitosa.
- 1609 módulos transformados.
- Build de producción generado correctamente.

### Interpretación para el informe

Es válido afirmar que el frontend compila y que existe una suite de pruebas automatizadas de backend. No es válido afirmar que todas las pruebas pasan hasta corregir la única aserción fallida y volver a ejecutar la suite.

## Arquitectura que debe reflejar el informe

La arquitectura lógica debe presentar:

1. Usuarios: estudiante, docente y administrador.
2. Aplicación web React/Vite/Tailwind.
3. Aplicación móvil Flutter.
4. API REST Node.js/Express.
5. Capa de servicios y controladores.
6. Validación Zod y middleware de autenticación/autorización.
7. Prisma ORM.
8. PostgreSQL.
9. Almacenamiento local de archivos durante el desarrollo.
10. Plane como sistema externo de backlog.
11. GitHub como sistema externo de repositorios.
12. Servicio externo de chat integrado mediante SSO/JWKS.

Los diagramas existentes en `diagrams/` deben actualizarse si todavía no representan Flutter, el tablero Plane, la integración SSO/chat o el flujo de actualización de estados.

## Requisitos y alcance actualizado

### Incluido

- Autenticación y roles.
- Gestión de proyectos.
- Integrantes y docente asignado.
- Ficha del proyecto.
- Campos técnicos.
- Repositorio GitHub.
- Backlog y tablero Kanban.
- Integración Plane.
- Versiones.
- Entregables y archivos.
- Rúbricas.
- Evaluación docente.
- Coevaluación.
- Paneles diferenciados por rol.
- Aplicación móvil en desarrollo.
- Integración SSO con chat externo.

### Parcial o sujeto a validación adicional

- Paridad funcional completa entre web y móvil.
- Despliegue productivo en nube.
- Almacenamiento permanente de archivos fuera del sistema de archivos local.
- Validación completa de integración real con GitHub, Plane y chat en un entorno de producción.
- Pruebas end-to-end de todos los flujos.

### Fuera del alcance o no demostrado

- No declarar como implementadas funcionalidades que solo aparezcan en el plan, diagramas o backlog.
- No presentar el chat externo como módulo desarrollado completamente dentro de la plataforma.
- No presentar la aplicación móvil como una copia completa de la aplicación web sin pruebas de paridad.
- No incluir credenciales reales.

## Estructura solicitada para el informe IEEE

Generar el informe con esta estructura:

1. Título, autores y afiliación.
2. Resumen.
3. Palabras clave.
4. Introducción.
5. Planteamiento del problema.
6. Justificación.
7. Objetivos general y específicos.
8. Estado del arte y antecedentes.
9. Metodología de desarrollo.
10. Requisitos funcionales y no funcionales.
11. Diseño de la solución.
12. Arquitectura del sistema.
13. Modelo de datos.
14. Implementación backend.
15. Implementación frontend web.
16. Implementación móvil.
17. Integraciones con Plane, GitHub y chat.
18. Seguridad y privacidad.
19. Pruebas y resultados.
20. Discusión y limitaciones.
21. Conclusiones.
22. Trabajo futuro.
23. Referencias.
24. Anexos.

En cada sección, conserva trazabilidad con los requisitos, módulos, endpoints, pruebas y diagramas. Incluye tablas cuando ayuden a presentar roles, requisitos, tecnologías, endpoints, casos de prueba y riesgos.

## Archivos de referencia del repositorio

- `03_Plan_Integrado_Gestion.md`: plan, alcance, objetivos, entregables y competencias.
- `backend/prisma/schema.prisma`: modelo de datos.
- `backend/src/app.js`: composición de la API y rutas principales.
- `backend/src/routes/`: endpoints por módulo.
- `backend/src/services/`: lógica de negocio e integraciones.
- `backend/src/middleware/`: autenticación y cargas.
- `backend/src/utils/`: validaciones, cifrado y políticas de archivos.
- `backend/test/`: pruebas automatizadas.
- `frontend/src/`: aplicación web React.
- `mobile/lib/`: aplicación Flutter.
- `diagrams/`: diagramas de arquitectura, componentes, secuencias, estados y despliegue.

## Entregable esperado de Claude

Devuelve:

1. El informe completo en Markdown.
2. Una lista breve de cambios realizados entre la línea base académica y el estado actual.
3. Una lista de afirmaciones que requieren evidencia o validación adicional.
4. Una lista de pendientes técnicos que no deben ocultarse en el informe.
5. Referencias a los archivos del repositorio usados como evidencia.

## Contenido académico y técnico completo que debe conservarse

Todo el contenido de esta sección ya está incorporado en este Markdown. Claude no debe solicitar ni depender de un archivo Word externo.

### Título y autores

- **Título:** Plataforma centralizada para la gestión, calificación y visualización de proyectos integradores.
- **Autora:** Caren Julieth Díaz Calderón.
- **Autor:** Juan Sebastián Hernández Remolina.
- **Afiliación:** Facultad de Ingeniería de Sistemas e Informática, Universidad Pontificia Bolivariana, Bucaramanga, Colombia.
- Los correos institucionales deben conservarse únicamente si el equipo confirma que son correctos. Si no se confirma, utilizar marcadores `[correo institucional de Caren]` y `[correo institucional de Juan]`.

### Resumen actualizado

El resumen debe presentar la plataforma como una solución web/móvil centralizada para la gestión, calificación y visualización de proyectos integradores. Debe mencionar la arquitectura React, Vite, Node.js, Express, Prisma, PostgreSQL y Flutter; el modelo de datos con 23 modelos principales; las rúbricas jerárquicas multinivel; el cálculo Bottom-Up; los entregables individuales y grupales; la coevaluación; Plane; GitHub OAuth; la integración SSO con chat externo añadida posteriormente; la metodología Kanban de 17 semanas; y las limitaciones frente a un despliegue productivo permanente.

No presentar el proyecto como un sistema productivo institucional ya desplegado. La formulación correcta es **prototipo funcional multiplataforma con integraciones externas y deuda técnica identificada**.

### Palabras clave

Conservar o ajustar las siguientes palabras clave:

`Proyectos Integradores, Rúbrica Ponderada, Control de Versiones, Backlog Centralizado, Coevaluación, GitHub OAuth, IEEE 29148, ISO/IEC 25010, Kanban, Flutter, SSO.`

No incluir `DevTunnels` como capacidad productiva; puede mencionarse como mecanismo temporal de pruebas o exposición local si existe evidencia.

### Problema y encuesta

La documentación base registra una encuesta aplicada a **n = 4 docentes** del programa. Estos datos pueden utilizarse como evidencia de motivación, pero deben presentarse como una muestra exploratoria y no como una generalización estadística:

| Hallazgo                                                         |       Resultado |
| ---------------------------------------------------------------- | --------------: |
| Dificultad para controlar versiones                              | Promedio 4,25/5 |
| Importancia de consultar el backlog sin solicitarlo aparte       |      5/5; 100 % |
| Importancia del acceso móvil                                    |  Promedio 4,5/5 |
| Docentes que exigen alojamiento en infraestructura institucional |           100 % |

El informe puede conservar las observaciones cualitativas anonimizadas:

- D2: no siempre se presenta la versión final y pueden mostrarse versiones con fallas que ya se habían corregido.
- D4: no existe un repositorio central.

No revelar nombres, correos ni información identificable de los docentes encuestados. Incluir la encuesta completa como anexo únicamente si el equipo tiene autorización para hacerlo.

### Pregunta problema

Conservar la pregunta:

> ¿Cómo diseñar e implementar una plataforma web centralizada que permita planificar, organizar, calificar y visualizar los proyectos integradores, integrando tanto el repositorio de resultados como las herramientas de gestión?

### Objetivo general

Conservar el siguiente objetivo general:

> Diseñar una plataforma web centralizada para la planificación —backlog, tablero de tareas y seguimiento—, organización, calificación —por pares y por docentes— y visualización de los proyectos integradores del programa de Ingeniería de Sistemas e Informática de la UPB, integrando en un solo sitio las herramientas de gestión de proyecto y el repositorio de resultados.

### Objetivos específicos

Conservar y alinear con la implementación los siguientes objetivos:

- **OE1:** Especificar los requisitos funcionales y no funcionales, diferenciando las necesidades de estudiantes y docentes/evaluadores.
- **OE2:** Diseñar la arquitectura, el modelo de datos y las interfaces de gestión, catálogo, calificación y backlog.
- **OE3:** Implementar planificación y seguimiento mediante backlog, tablero ágil y actas, integrado con la evaluación docente.
- **OE4:** Implementar catálogo, repositorio y visualización de proyectos, aclarando qué parte está implementada y qué parte es parcial.
- **OE5:** Validar el prototipo mediante pruebas funcionales y evaluación con usuarios reales; distinguir las pruebas existentes de las que aún faltan.
- **OE6:** Documentar resultados y delimitar analítica, anti-duplicación y otras capacidades futuras.

### Estado del arte

La versión final puede conservar las siguientes líneas de investigación, siempre que Claude verifique y normalice las referencias bibliográficas:

1. Repositorios académicos centralizados y DSpace.
2. Evaluación entre pares y rúbricas estructuradas.
3. Plataformas colaborativas para proyectos estudiantiles.
4. Integración de herramientas de gestión académica.
5. Gestión ágil mediante Scrum y Kanban.
6. Control de versiones distribuido con Git y GitHub.

No inventar DOI, autores, páginas, años o enlaces. Si una referencia no puede verificarse, marcarla como `[referencia por verificar]` y no fabricar datos bibliográficos.

### Requisitos funcionales y no funcionales

El informe final debe conservar la matriz de requisitos documentada y actualizar el estado de cada requisito con evidencia del repositorio. Como mínimo debe reflejar:

- Autenticación y autorización por roles.
- Gestión de usuarios, proyectos e integrantes.
- Ficha técnica del proyecto.
- Versionado inmutable y archivos.
- Integración con GitHub.
- Backlog y tablero Kanban.
- Integración con Plane.
- Rúbricas jerárquicas.
- Evaluación docente.
- Entregables individuales y grupales.
- Coevaluación.
- Catálogo y visualización.
- Aplicación móvil.
- Integración SSO con chat externo.

La especificación documenta RF-08 como retroalimentación mínima de 20 caracteres. Esta regla sí está implementada mediante Zod, pero la suite actual tiene una aserción que espera un mensaje diferente; informar ambas cosas por separado.

La política objetivo de contraseña es: mínimo ocho caracteres, una mayúscula y un número. La implementación actual debe considerarse una desviación pendiente si todavía solo exige seis caracteres. El informe debe utilizar la siguiente redacción:

> La especificación establece una política de ocho caracteres, una letra mayúscula y un número; sin embargo, la implementación prototipo actualmente no demuestra el cumplimiento completo de dicha política. Esta diferencia se registra como deuda técnica de seguridad y debe resolverse antes de un despliegue productivo.

No afirmar que la política de contraseña está completa sin verificar `backend/src/utils/validators.js` y sus pruebas.

### Metodología, planificación y esfuerzo

Conservar:

- Metodología de flujo continuo basada en Kanban.
- Duración planificada de 17 semanas.
- Equipo de dos desarrolladores.
- Capacidad efectiva reportada: 240 horas-persona.
- EDT con categorías reportadas por el equipo:
  - Gestión: 100 h.
  - UX/UI: 60 h.
  - Desarrollo Full-Stack: 360 h.
  - QA: 80 h.
  - Infraestructura: 40 h.
- Valorización referencial de mercado: `$49.690.000 COP`.
- Costo real ejecutado reportado: `$0 COP`, por uso de herramientas de código abierto y planes gratuitos o temporales.

Claude debe resolver la aparente diferencia entre las 240 horas-persona de capacidad y las horas agregadas de la EDT. Presentar las horas de la EDT como estimación de esfuerzo o valorización planificada, y las 240 horas como capacidad efectiva reportada, explicando la diferencia en una nota metodológica. No ocultar la inconsistencia ni sumar ambas cifras como si fueran la misma métrica.

### Hitos y estado de ejecución

Usar esta matriz como punto de partida, pero actualizarla con la evidencia del repositorio:

| Fase                            | Hito                                             | Estado actualizado                                              |
| ------------------------------- | ------------------------------------------------ | --------------------------------------------------------------- |
| Semanas 1–3                    | ERS, 18 RF, 11 RNF y modelo inicial              | Completado/documentado                                          |
| Semanas 4–8                    | JWT, ficha y versionado inmutable                | Implementado                                                    |
| Semanas 9–14                   | Rúbrica jerárquica, Bottom-Up y Plane          | Implementado; Plane debe validarse en entorno real              |
| Semanas 9–14                   | Entregables, evaluación docente y coevaluación | Implementado funcionalmente                                     |
| Semanas 9–14                   | OAuth con GitHub                                 | Implementado funcionalmente; requiere credenciales de entorno   |
| Semanas 15–17                  | Pruebas multiplataforma y documentación         | Parcial; distinguir build, pruebas unitarias y pruebas manuales |
| Alcance Could                   | Anti-duplicación y notificaciones               | Aplazado a backlog futuro                                       |
| Infraestructura                 | Despliegue productivo permanente                 | No alcanzado; deuda técnica                                    |
| Pruebas automatizadas completas | Cobertura integral                               | Pendiente; actualmente 15/16 pruebas de backend pasan           |

### Modelo de datos y decisiones técnicas

Conservar la afirmación de que el esquema Prisma tiene **23 modelos principales**, pero verificarla contra `backend/prisma/schema.prisma` antes de publicar. Explicar como decisiones relevantes:

- `VersionProyecto` representa entregas versionadas e inmutables.
- `CriterioRubrica` utiliza una relación autorreferenciada mediante `id_padre` e `hijos`.
- La rúbrica admite árboles de múltiples niveles.
- Los pesos de hermanos deben sumar 100 %, con tolerancia de 0,01 cuando corresponda.
- Los niveles de desempeño de hojas usan la escala 0–5 para evaluación docente.
- El modelo permite actividades, entregas individuales y grupales, archivos y coevaluaciones.
- Prisma aplica relaciones e integridad referencial, incluyendo eliminaciones en cascada donde estén definidas.

### Algoritmos que deben explicarse

#### Validación de pesos

El sistema agrupa criterios hermanos por `id_padre`, suma sus pesos y rechaza la rúbrica si el total no es 100 % dentro de la tolerancia definida. Incluir pseudocódigo claro y no copiar fragmentos defectuosos del Word.

#### Cálculo Bottom-Up

El algoritmo:

1. Recupera la rúbrica y sus criterios.
2. Construye una representación de nodos en memoria.
3. Toma las calificaciones de los nodos hoja.
4. Recorre recursivamente los hijos.
5. Pondera cada hijo por su peso.
6. Propaga el resultado hacia el nodo padre.
7. Persiste la calificación y la retroalimentación después de validar la entrada.

#### Coevaluación

La documentación del proyecto reporta cinco criterios de coevaluación con pesos de 20 % y una curva de raíz cuadrada aplicada a la calificación base. Mantener esta descripción únicamente como implementación respaldada por `backend/src/services/coevaluacionCalculator.js` y sus pruebas.

### Persistencia y transacciones

Conservar la siguiente explicación técnica, actualizándola si el código difiere:

- Las rúbricas utilizan transacciones para crear o reemplazar el árbol de criterios.
- La actualización de evaluaciones utiliza transacción para reemplazar calificaciones y actualizar la evaluación.
- La creación de un proyecto utiliza escrituras anidadas de Prisma.
- La sincronización posterior con Plane es una operación externa independiente y un fallo de Plane no necesariamente revierte el registro local.

No afirmar atomicidad distribuida entre PostgreSQL y Plane.

### Manejo de errores

Documentar que Express tiene middleware global de errores, pero que el manejo no necesariamente está completamente centralizado: algunos controladores responden localmente y otros delegan mediante `next(error)`. Las excepciones de Prisma pueden no tener un mapeo específico. Esto debe aparecer como limitación técnica, no ocultarse.

### Seguridad y autorización

La línea base del proyecto identifica una deuda técnica importante que debe conservarse:

- Autenticación perimetral mediante JWT.
- Autorización por rol.
- Restricciones de modificación por pertenencia o docente asignado en varios flujos.
- Algunas lecturas requieren revisar autorización a nivel de objeto, especialmente:
  - `GET /api/proyectos/:id`.
  - Consultas de backlog.
  - Consultas de Plane.
  - `GET /api/rubricas/:id`.

La versión final debe decir que estas rutas requieren revisión antes de producción si el código actual no demuestra control de pertenencia equivalente. No presentar el sistema como completamente seguro ni como auditado formalmente.

## Instrucciones específicas para generar el documento Word

Claude debe producir un archivo `.docx` final, no solamente texto Markdown. Si Claude no puede adjuntar o generar binarios directamente, debe:

1. Entregar el informe completo en Markdown.
2. Entregar un script reproducible para convertirlo a `.docx`, preferiblemente con Pandoc o `python-docx`.
3. Incluir instrucciones exactas de ejecución en Windows.
4. Mantener tablas, títulos, numeración, referencias, pseudocódigo, ecuaciones y pies de figura.

El archivo Word debe llamarse:

`Informe_Plataforma_Proyectos_Integradores_V3.docx`

Debe conservar una presentación académica compatible con IEEE:

- Título centrado.
- Autores y afiliación.
- Resumen y palabras clave.
- Secciones numeradas.
- Tablas con título y numeración.
- Figuras y diagramas con pie.
- Código y pseudocódigo con formato monoespaciado.
- Referencias numeradas en orden de aparición.
- Anexos claramente separados.
- Márgenes, tipografía, interlineado y columnas de dos secciones ajustados a la plantilla exigida por la asignatura, si esta fue proporcionada.

No convertir automáticamente el Markdown a Word sin revisar:

- Saltos de página.
- Tablas partidas entre páginas.
- Encabezados huérfanos.
- Referencias incompletas.
- Figuras ilegibles.
- Diagramas Mermaid o PlantUML no renderizados.
- Caracteres dañados.
- Numeración de secciones y tablas.

## Anexos que debe preparar Claude

Solicitar o generar una sección de anexos con:

1. Matriz de requisitos funcionales y no funcionales.
2. Matriz de trazabilidad objetivo–requisito–módulo–prueba.
3. Casos de uso.
4. Arquitectura C4 actualizada.
5. Diagrama de componentes.
6. Diagrama entidad-relación actualizado.
7. Diagrama de secuencia de evaluación.
8. Diagrama de secuencia de integración con Plane.
9. Diagrama del flujo SSO con chat y JWKS.
10. Capturas de la interfaz web.
11. Capturas de la aplicación móvil.
12. Resultados de pruebas.
13. Plan de riesgos y deuda técnica.
14. Encuesta anonimizada, si existe autorización.

Las imágenes deben generarse o incluirse con resolución legible. Si no es posible generar una imagen, incluir el código fuente del diagrama y marcar el anexo como pendiente de renderizar.

## Restricciones de seguridad para el documento final

El archivo final y sus anexos no deben contener:

- La contraseña de PostgreSQL.
- `DATABASE_URL` real.
- `JWT_SECRET`.
- `PLANE_API_KEY`.
- `GITHUB_CLIENT_SECRET`.
- Tokens de GitHub.
- Claves privadas SSO.
- Claves de cifrado.
- Datos personales innecesarios.

Usar textos como:

`DATABASE_URL=postgresql://usuario:***@host:5432/base`

y:

`PLANE_API_KEY=[configurada como secreto de entorno]`

## Prompt final para copiar a Claude

> Recibirás únicamente el contenido de `docs/informe_actualizacion_para_claude.md`; no recibirás el informe V2 en Word ni otros archivos. Usa este Markdown como fuente única y contiene todo el contexto histórico y actualizado. Genera desde cero la versión final V3 del informe académico en español, con estructura y redacción compatibles con IEEE. No solicites archivos adicionales. Usa el estado técnico documentado aquí para describir backend, frontend, aplicación móvil, esquema Prisma, pruebas, diagramas y cambios recientes. Integra específicamente el tablero Kanban conectado con Plane, el cálculo y persistencia del porcentaje de avance, la integración GitHub OAuth, la evaluación docente, la coevaluación, los entregables individuales y grupales, y el lanzamiento SSO firmado para el servicio de chat con JWKS. Diferencia lo implementado, lo parcial, lo pendiente y la deuda técnica. No inventes endpoints, resultados, referencias bibliográficas, capturas, usuarios, despliegues ni pruebas. No incluyas secretos ni credenciales del `.env`.
>
> Conserva la encuesta exploratoria a cuatro docentes, los objetivos OE1–OE6, la metodología Kanban de 17 semanas, la EDT, la capacidad de 240 horas-persona, la valorización referencial de $49.690.000 COP, los 23 modelos Prisma, la validación de pesos de rúbrica, el cálculo Bottom-Up, la coevaluación con cinco criterios de 20 %, y las limitaciones de despliegue, autorización por pertenencia y política de contraseñas. Verifica cada afirmación contra el código actual y marca cualquier discrepancia sin eliminar contenido.
>
> Registra honestamente que el frontend compila, mientras que las pruebas actuales del backend tienen 15 aprobadas y 1 falla de aserción textual relacionada con el mensaje de retroalimentación mínima. No declares la suite completamente aprobada hasta que esa prueba sea corregida y ejecutada nuevamente.
>
> Entrega tres productos: (1) el informe completo final en Markdown; (2) el archivo Word `Informe_Plataforma_Proyectos_Integradores_V3.docx`, o un script reproducible para generarlo si no puedes adjuntar binarios; y (3) una lista de cambios, evidencias, pendientes y riesgos. El Word debe conservar tablas, diagramas, pseudocódigo, referencias y anexos, y debe revisarse visualmente antes de considerarlo terminado.

---

# Borrador integral del informe final

La siguiente sección contiene el contenido base que debe aparecer en el informe final. Claude puede mejorar la redacción académica y la diagramación, pero no debe eliminar información ni sustituir hechos por afirmaciones no verificadas.

## Portada y datos de identificación

**Plataforma centralizada para la gestión, calificación y visualización de proyectos integradores**

**Caren Julieth Díaz Calderón**
Facultad de Ingeniería de Sistemas e Informática
Universidad Pontificia Bolivariana
Bucaramanga, Colombia
[correo institucional por confirmar]

**Juan Sebastián Hernández Remolina**
Facultad de Ingeniería de Sistemas e Informática
Universidad Pontificia Bolivariana
Bucaramanga, Colombia
[correo institucional por confirmar]

**Curso:** Proyecto Integrador III
**Periodo:** 2026
**Versión del informe:** V3
**Fecha:** octubre de 2026

## Resumen

Este trabajo presenta el diseño y desarrollo de una plataforma web y móvil para centralizar la gestión, el seguimiento, la evaluación y la visualización de proyectos integradores del programa de Ingeniería de Sistemas e Informática de la Universidad Pontificia Bolivariana, seccional Bucaramanga. La propuesta surge ante la dispersión de información entre herramientas de almacenamiento, comunicación, control de versiones y seguimiento de tareas, situación que dificulta identificar la versión vigente de un proyecto y consultar su avance sin intervención manual del docente.

La solución está compuesta por una aplicación web desarrollada con React, Vite y Tailwind CSS, una aplicación móvil en Flutter y una API REST implementada con Node.js y Express. La persistencia utiliza PostgreSQL mediante Prisma ORM. El modelo documentado contiene 23 modelos principales relacionados con usuarios, proyectos, integrantes, versiones, archivos, rúbricas, evaluaciones, entregables, coevaluaciones, repositorios y estados de integración. El sistema incluye autenticación basada en JWT, hash de contraseñas con bcrypt, autorización por roles, versionado de entregas, carga de evidencias, rúbricas jerárquicas multinivel y cálculo automático de notas mediante un algoritmo Bottom-Up.

El prototipo integra GitHub para consultar, crear y vincular repositorios; Plane para sincronizar el backlog, los estados de las tareas y el porcentaje de avance; y un servicio externo de chat mediante un lanzamiento SSO firmado con RS256 y verificable mediante JWKS. También contempla entregables individuales y grupales, evaluación docente, coevaluación entre estudiantes y paneles diferenciados para estudiantes, docentes y administradores.

El desarrollo se organizó mediante Kanban durante un ciclo académico de 17 semanas. La validación disponible demuestra que el frontend compila correctamente y que existe una suite de pruebas de contratos de negocio en el backend. En la ejecución registrada, 15 de 16 pruebas del backend fueron aprobadas; la restante corresponde a una aserción textual que no coincide con el mensaje generado por Zod, aunque la regla de mínimo de 20 caracteres sí se aplica. El resultado debe presentarse como un prototipo funcional multiplataforma con integraciones externas y deuda técnica identificada, no como un despliegue institucional productivo completamente terminado.

**Palabras clave:** proyectos integradores, gestión académica, rúbricas, evaluación Bottom-Up, coevaluación, backlog, Kanban, GitHub OAuth, Plane, Flutter, JWT, SSO.

## I. Introducción

Los proyectos integradores constituyen un espacio de aplicación práctica en el que los estudiantes de Ingeniería de Sistemas e Informática construyen productos de software a lo largo de varios semestres. En este contexto, el equipo debe coordinar requisitos, tareas, entregas, versiones, evidencias, evaluaciones y comunicación con el docente. Cuando cada actividad se gestiona en una herramienta diferente, se dificulta conservar la trazabilidad del proyecto y verificar cuál es el estado vigente.

La plataforma propuesta centraliza la ficha del proyecto, los integrantes, el repositorio, las versiones, el backlog, los entregables y las evaluaciones. La solución no reemplaza GitHub ni Plane; los integra mediante servicios y conserva en la plataforma la información necesaria para que el docente y los estudiantes consulten el ciclo de vida académico del proyecto.

El trabajo se desarrolló con una capacidad efectiva reportada de 240 horas-persona para dos desarrolladores. La estimación de la EDT contempla categorías de gestión, UX/UI, desarrollo Full-Stack, QA e infraestructura. El costo ejecutado se reporta como cero pesos colombianos debido al uso de software de código abierto y servicios gratuitos o temporales; la valorización referencial de mercado se estimó en $49.690.000 COP.

## II. Planteamiento del problema

La gestión de los proyectos integradores se apoya frecuentemente en Teams, Drive, hojas de cálculo, chats y repositorios independientes. Esta fragmentación puede producir pérdida de versiones, archivos duplicados, entregas que no corresponden al estado actual del código, ausencia de un repositorio central y poca visibilidad del avance del equipo.

Para explorar el problema se aplicó una encuesta a cuatro docentes del programa. Los resultados fueron:

| Indicador                                                        |  Resultado |
| ---------------------------------------------------------------- | ---------: |
| Dificultad para controlar versiones                              |     4,25/5 |
| Importancia de consultar el backlog sin solicitarlo aparte       | 5/5; 100 % |
| Importancia del acceso móvil                                    |      4,5/5 |
| Docentes que exigen alojamiento en infraestructura institucional |      100 % |

Las respuestas cualitativas anonimizadas señalaron que algunos grupos no presentan la versión final o muestran errores que afirmaban haber corregido, y que no existe un repositorio central. La muestra es exploratoria y no debe interpretarse como una generalización estadística de todo el programa.

**Pregunta problema:** ¿Cómo diseñar e implementar una plataforma web centralizada que permita planificar, organizar, calificar y visualizar los proyectos integradores, integrando el repositorio de resultados con las herramientas de gestión?

## III. Justificación

La solución se justifica por cuatro razones. Primero, reduce la dispersión de información al relacionar proyecto, integrantes, versiones, evidencias, backlog y calificaciones. Segundo, mejora la trazabilidad de las entregas al conservar versiones y archivos asociados. Tercero, disminuye el trabajo manual de evaluación mediante rúbricas con pesos validados y cálculo automático. Cuarto, facilita el seguimiento docente al sincronizar el tablero de Plane y exponer el avance del proyecto.

La aplicación móvil responde a la necesidad identificada de consultar información desde dispositivos móviles. La integración con GitHub conserva el repositorio como fuente de verdad del código y evita duplicar el código fuente en la plataforma. La integración con Plane permite aprovechar un sistema especializado de gestión de tareas, mientras que la integración SSO con el chat evita solicitar nuevamente las credenciales de la plataforma.

## IV. Objetivos

### A. Objetivo general

Diseñar una plataforma web centralizada para la planificación —backlog, tablero de tareas y seguimiento—, organización, calificación por pares y por docentes, y visualización de los proyectos integradores del programa de Ingeniería de Sistemas e Informática de la UPB, integrando en un solo sitio las herramientas de gestión y el repositorio de resultados.

### B. Objetivos específicos

1. Especificar los requisitos funcionales y no funcionales, diferenciando las necesidades de estudiantes y docentes/evaluadores.
2. Diseñar la arquitectura, el modelo de datos y las interfaces de gestión, catálogo, calificación y backlog.
3. Implementar la planificación y el seguimiento mediante backlog, tablero ágil y actas, integrados con la evaluación docente.
4. Implementar el catálogo, el repositorio y la visualización de proyectos, indicando qué capacidades son completas y cuáles son parciales.
5. Validar el prototipo mediante pruebas funcionales, pruebas automatizadas y evaluación con usuarios cuando exista evidencia disponible.
6. Documentar los resultados y delimitar como trabajo futuro la analítica, la anti-duplicación, las notificaciones y el despliegue productivo permanente.

## V. Estado del arte

### A. Repositorios académicos

Los repositorios académicos centralizados, incluidos los sistemas basados en DSpace, permiten conservar proyectos y facilitar su consulta. Este enfoque sustenta la necesidad de una ficha institucional que conecte el resultado del proyecto con sus evidencias, versiones y metadatos.

### B. Evaluación entre pares

Los modelos de evaluación entre pares muestran que las rúbricas estructuradas pueden mejorar la transparencia y la participación. La plataforma aplica esta idea mediante coevaluaciones entre integrantes y mediante rúbricas docentes configurables.

### C. Colaboración en proyectos estudiantiles

Las plataformas colaborativas facilitan la comunicación y la retroalimentación continua entre estudiantes y docentes. En el prototipo, esta necesidad se atiende mediante el tablero, los entregables, la retroalimentación de evaluación y el lanzamiento hacia el servicio de chat externo.

### D. Integración de herramientas

La integración evita duplicar información y reduce discrepancias entre sistemas. La plataforma mantiene la ficha académica y utiliza APIs externas para consultar Plane y GitHub, en lugar de replicar completamente esos servicios.

### E. Kanban

Kanban es adecuado para un equipo pequeño con disponibilidad variable porque permite flujo continuo y visualización del trabajo sin imponer ciclos rígidos. El tablero del prototipo agrupa las tareas en Backlog, Por Hacer, En Progreso y Hecho.

### F. Control de versiones

Git conserva el historial distribuido y GitHub proporciona colaboración sobre los repositorios. Por ello, la plataforma registra el vínculo al repositorio y las versiones académicas, pero no pretende reemplazar el almacenamiento del código fuente.

## VI. Metodología y planificación

El proyecto se gestionó con Kanban y se organizó en 17 semanas:

| Fase            |   Semanas | Actividades principales                                    | Estado                      |
| --------------- | --------: | ---------------------------------------------------------- | --------------------------- |
| Planificación  |      1–3 | ERS, requisitos, interesados, EDT y modelo inicial         | Completada                  |
| Desarrollo I    |      4–8 | Autenticación, ficha, proyectos y versionado              | Implementada                |
| Desarrollo II   |     9–14 | Rúbricas, evaluación, entregables, coevaluación y Plane | Implementada funcionalmente |
| Cierre          |    15–17 | Pruebas, documentación y validación                      | Parcial según evidencia    |
| Mejoras futuras | Posterior | Anti-duplicación, notificaciones y analítica             | Aplazadas                   |

La EDT reporta Gestión (100 h), UX/UI (60 h), Desarrollo Full-Stack (360 h), QA (80 h) e Infraestructura (40 h). Estas cifras son una estimación de esfuerzo y no deben sumarse automáticamente con las 240 horas-persona de capacidad efectiva; representan métricas diferentes.

## VII. Requisitos del sistema

### A. Requisitos funcionales

| Código | Requisito                                            | Estado                                                      |
| ------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| RF-01   | Registrar, autenticar y administrar usuarios por rol | Implementado                                                |
| RF-02   | Crear y consultar proyectos                          | Implementado                                                |
| RF-03   | Gestionar integrantes y docente asignado             | Implementado                                                |
| RF-04   | Registrar campos técnicos de la ficha               | Implementado                                                |
| RF-05   | Vincular repositorios GitHub                         | Implementado funcionalmente                                 |
| RF-06   | Crear rúbricas ponderadas                           | Implementado                                                |
| RF-07   | Calcular evaluaciones automáticamente               | Implementado                                                |
| RF-08   | Exigir retroalimentación mínima de 20 caracteres   | Implementado; prueba textual por ajustar                    |
| RF-09   | Gestionar versiones y archivos                       | Implementado                                                |
| RF-10   | Gestionar entregables individuales y grupales        | Implementado funcionalmente                                 |
| RF-11   | Aplicar coevaluaciones                               | Implementado funcionalmente                                 |
| RF-12   | Gestionar backlog                                    | Implementado                                                |
| RF-13   | Consultar tablero Plane y actualizar estados         | Implementado; requiere validación externa                  |
| RF-14   | Moderar/publicar actividades y entregas              | Implementado funcionalmente                                 |
| RF-15   | Consultar catálogo y fichas                         | Parcial según alcance de publicación                      |
| RF-16   | Generar reportes básicos                            | Parcial; confirmar exportaciones disponibles                |
| RF-17   | Detectar duplicación de proyectos                   | Pendiente                                                   |
| RF-18   | Notificaciones avanzadas                             | Pendiente                                                   |
| RF-19   | Considerar acceso móvil y conectividad              | Parcial; aplicación Flutter en desarrollo                  |
| RF-20   | Lanzar chat externo mediante SSO                     | Implementado en backend/frontend; requiere servicio externo |

### B. Requisitos no funcionales

- Seguridad mediante JWT, bcrypt, roles y validación de entradas.
- Caducidad configurable de sesión, documentada con 30 minutos.
- Interfaz responsive.
- Persistencia relacional e integridad referencial.
- Rechazo de formatos de archivo no autorizados.
- Configuración por variables de entorno.
- Integración mediante APIs HTTP.
- Trazabilidad de versiones y entregas.
- Disponibilidad móvil parcial.
- Despliegue productivo institucional: pendiente.

## VIII. Diseño y arquitectura

La arquitectura contiene tres clientes o puntos de acceso: aplicación web React, aplicación móvil Flutter y servicio externo de chat. Ambos clientes consumen una API REST Node.js/Express. La API aplica middleware JWT, validaciones Zod, controladores, servicios de negocio y Prisma ORM. PostgreSQL almacena los datos relacionales y el sistema de archivos local gestiona temporalmente los adjuntos durante el prototipo.

Los sistemas externos son:

- **Plane:** backlog, estados, tareas y cálculo de avance.
- **GitHub:** repositorios, OAuth, consulta y creación de repositorios.
- **Chat externo:** acceso SSO mediante JWT firmado con RS256 y verificación JWKS.

El flujo SSO es:

1. El usuario autenticado pulsa Chat.
2. El frontend solicita a la API un lanzamiento.
3. El backend valida el usuario y, si existe, el proyecto destino.
4. El backend crea un JWT de corta duración.
5. El servicio externo valida el JWT mediante la clave pública JWKS.
6. El usuario ingresa al chat y conserva una URL de retorno a la plataforma.

## IX. Modelo de datos

El esquema Prisma documentado contiene 23 modelos principales. Las entidades centrales son:

| Entidad               | Responsabilidad                                       |
| --------------------- | ----------------------------------------------------- |
| Usuario               | Identidad, correo institucional, rol y autenticación |
| Proyecto              | Ficha central y relaciones académicas                |
| TareaBacklog          | Tareas internas del proyecto                          |
| IntegranteProyecto    | Relación entre usuarios y proyectos                  |
| VersionProyecto       | Entrega versionada e inmutable                        |
| Archivo               | Evidencias asociadas a una versión                   |
| CampoTecnico          | Datos técnicos de la ficha                           |
| Repositorio           | Vínculo con GitHub u otro repositorio                |
| GithubOAuthState      | Estado temporal del flujo OAuth                       |
| Rubrica               | Cabecera de una rúbrica                              |
| CriterioRubrica       | Árbol jerárquico de criterios                       |
| NivelDesempeno        | Niveles de 0 a 5                                      |
| Evaluacion            | Nota, estado y retroalimentación                     |
| Entregable            | Actividad o entrega académica                        |
| ActividadEntregable   | Configuración de la actividad                        |
| ActividadProyecto     | Asignación de actividades a proyectos                |
| Entrega               | Evidencia enviada por un estudiante o grupo           |
| EntregaParticipante   | Participantes de una entrega                          |
| ArchivoEntrega        | Archivo asociado a una entrega                        |
| Coevaluacion          | Evaluación de un integrante a otro                   |
| CoevaluacionCriterio  | Detalle de criterios coevaluados                      |
| ResultadoCoevaluacion | Consolidado de resultados                             |
| CalificacionCriterio  | Calificación individual de criterio                  |

`CriterioRubrica` utiliza `id_padre` y `hijos` para representar árboles multinivel. `VersionProyecto` permite conservar entregas sucesivas y marcar una versión final. Prisma aplica relaciones e integridad referencial y las migraciones incluyen índices de soporte para la jerarquía.

## X. Implementación del backend

El backend se divide en rutas, controladores, servicios, middleware, configuración y utilidades. Las rutas principales son autenticación, proyectos, usuarios, backlog, Plane, GitHub, versiones, archivos, rúbricas, evaluaciones, entregables, coevaluaciones y chat.

La API valida entradas con Zod. El middleware JWT protege las rutas de negocio. Las operaciones mutables comprueban roles, pertenencia o asignación docente en los casos implementados. El middleware global de errores transforma algunos errores con estado HTTP y las excepciones Zod; sin embargo, existe manejo distribuido y algunas excepciones de Prisma no tienen mapeo específico.

### A. Validación de rúbricas

Los criterios hermanos se agrupan por padre y sus pesos deben sumar 100 %, con tolerancia de 0,01. La operación de creación y actualización persiste el árbol mediante transacciones cuando intervienen múltiples entidades.

### B. Cálculo Bottom-Up

El cálculo recupera el árbol, construye un mapa en memoria, toma las notas de las hojas y propaga los valores hacia los padres:

```text
calcularNota(nodo):
    si nodo es hoja:
        retornar nota de la hoja
    acumulado = 0
    para cada hijo:
        acumulado += calcularNota(hijo) * hijo.peso / 100
    retornar acumulado
```

### C. Coevaluación

La coevaluación aplica cinco criterios de 20 % cada uno y utiliza la curva de raíz cuadrada documentada por el proyecto. Las pruebas verifican conversiones, límites, coevaluaciones incompletas y cálculo de la nota definitiva.

### D. Integración Plane

Plane se utiliza como sistema externo. El backend consulta estados y tareas, actualiza el estado de una tarea y calcula el porcentaje de avance con base en tareas completadas. El porcentaje se persiste en el proyecto local. Si Plane no está disponible, la persistencia local y la sincronización externa no constituyen una transacción distribuida.

## XI. Implementación del frontend web

La interfaz React dispone de autenticación, dashboards por rol, ficha de proyecto, gestión de rúbricas, evaluación, entregables, coevaluación y tablero Kanban. `AppContext` centraliza usuario, proyecto seleccionado, tareas, notificaciones y operaciones API. `api.js` encapsula las solicitudes HTTP y el token se conserva en `localStorage`.

El tablero Kanban:

- Consulta el proyecto seleccionado.
- Sincroniza tareas con Plane.
- Agrupa estados.
- Muestra progreso.
- Actualiza estados.
- Enlaza el workspace externo.

La navegación separa las opciones de estudiante, docente y administrador. La interfaz usa componentes reutilizables, Tailwind CSS e iconos Lucide.

## XII. Implementación móvil

La aplicación Flutter incluye `ApiClient`, servicios de autenticación, proyectos, versiones y backlog; modelos de usuario, proyecto, tarea y versión; gestión de sesión mediante Provider; pantallas de login, inicio, detalle, creación de proyecto, proyectos sin asesor y dashboard docente; además de tema visual UPB.

La aplicación móvil se considera en desarrollo. El informe no debe afirmar que todas las funciones web están disponibles en Flutter ni que existe paridad completa sin pruebas funcionales específicas.

## XIII. Seguridad, privacidad y control de acceso

Las medidas implementadas o previstas son:

- JWT para autenticación.
- bcrypt para contraseñas.
- Roles estudiante, docente y administrador.
- Validación del dominio institucional.
- Zod para datos de entrada.
- Restricción de formatos y tamaños de archivos.
- Cifrado de tokens OAuth de GitHub.
- SSO RS256 con expiración corta.
- Clave pública publicada por JWKS.
- Variables de entorno para secretos.

Persisten riesgos que deben declararse:

- Algunas rutas de lectura pueden requerir autorización por pertenencia a nivel de objeto.
- La política objetivo de ocho caracteres, mayúscula y número debe comprobarse contra la implementación.
- El administrador por defecto debe cambiarse antes de producción.
- El almacenamiento local de archivos no equivale a almacenamiento productivo durable.
- Las credenciales expuestas durante desarrollo deben revocarse y regenerarse.

## XIV. Pruebas y resultados

### A. Pruebas del backend

La ejecución `npm test` en `backend` produjo:

| Resultado          | Cantidad |
| ------------------ | -------: |
| Pruebas ejecutadas |       16 |
| Aprobadas          |       15 |
| Fallidas           |        1 |

La prueba fallida verifica la retroalimentación mínima. La regla de Zod rechaza correctamente una cadena menor de 20 caracteres, pero el test busca el texto `>=20 characters|20 caracteres` y recibe `String must contain at least 20 character(s)`. Se trata de una discrepancia de mensaje/aserción que debe corregirse y volver a ejecutar.

Las pruebas cubren contratos de actividades, rúbricas, estados del backlog, cálculo de coevaluación, evaluación, formatos de archivo y límites de puntuación.

### B. Build frontend

La ejecución `npm run build` en `frontend` fue exitosa con Vite. El build transformó 1609 módulos y generó los archivos de producción.

### C. Validación móvil

La documentación histórica reporta `flutter test` como correcto; Claude debe verificar si esa ejecución corresponde al estado actual y no presentarla como resultado reciente si no existe evidencia reproducible.

## XV. Resultados, discusión y limitaciones

El prototipo demuestra la viabilidad de centralizar proyectos, versiones, evidencias, evaluación y seguimiento. La rúbrica jerárquica y el algoritmo Bottom-Up trasladan al software reglas académicas que antes podían calcularse manualmente. Plane y GitHub permiten conservar herramientas especializadas sin duplicar completamente sus funciones.

Las principales limitaciones son la ausencia de despliegue institucional permanente, la cobertura incompleta de pruebas automatizadas, la necesidad de fortalecer la autorización de algunas lecturas, la integración externa dependiente de variables de entorno y la paridad móvil todavía parcial. Anti-duplicación, notificaciones avanzadas y analítica quedan como trabajo futuro.

## XVI. Conclusiones

1. Se diseñó y desarrolló un prototipo multiplataforma para centralizar la gestión de proyectos integradores.
2. La arquitectura separa clientes, API, servicios, persistencia e integraciones externas.
3. El modelo relacional permite representar proyectos, versiones, evidencias, entregables, rúbricas y coevaluaciones.
4. La validación de pesos y el cálculo Bottom-Up automatizan reglas de evaluación.
5. La integración con Plane proporciona visualización del backlog y avance.
6. GitHub conserva el repositorio de código y la plataforma registra su relación académica.
7. El SSO con chat externo amplía la colaboración sin duplicar credenciales.
8. Las pruebas muestran avances verificables, pero todavía existe una prueba por ajustar y cobertura pendiente.
9. El sistema debe considerarse un prototipo funcional con deuda técnica, no un producto institucional listo para producción.

## XVII. Trabajo futuro

- Corregir la prueba de retroalimentación y ampliar la cobertura.
- Completar política de contraseñas.
- Fortalecer autorización a nivel de objeto para todas las lecturas.
- Implementar notificaciones.
- Investigar detección de proyectos duplicados.
- Incorporar analítica de avance y desempeño.
- Migrar archivos a almacenamiento duradero.
- Completar la paridad de funciones en Flutter.
- Automatizar pruebas end-to-end.
- Validar despliegue institucional con HTTPS, CORS restringido y gestión segura de secretos.

## XVIII. Referencias

Claude debe conservar las referencias verificables del material académico y completar la bibliografía solo con fuentes comprobadas. Como mínimo, revisar:

1. PMBOK y fundamentos de EDT.
2. Scrum Guide de Schwaber y Sutherland.
3. Kanban y gestión de flujo continuo.
4. Git, GitHub y control de versiones distribuido.
5. PostgreSQL.
6. Prisma ORM.
7. Node.js y Express.
8. React, Vite y Flutter.
9. DSpace y repositorios académicos.
10. IEEE 29148.
11. ISO/IEC 25010.
12. JWT, OAuth 2.0, JOSE y JWKS.

No completar datos bibliográficos por intuición. Las fuentes no verificadas deben aparecer como pendientes de confirmación.

## XIX. Anexos completos

### Anexo A. Matriz de trazabilidad

La matriz debe relacionar cada objetivo con requisitos, módulos, archivos del repositorio y pruebas. Incluir columnas: objetivo, requisito, módulo, endpoint o componente, evidencia, prueba y estado.

### Anexo B. Diagramas

Actualizar los diagramas existentes para incluir:

- Cliente web.
- Cliente móvil Flutter.
- API REST.
- Prisma y PostgreSQL.
- Almacenamiento de archivos.
- Plane.
- GitHub.
- Servicio de chat.
- Flujo SSO y JWKS.

### Anexo C. Casos de prueba

Incluir los 16 casos ejecutados, su resultado, entrada, salida esperada, salida observada y estado de corrección.

### Anexo D. Seguridad

Incluir una tabla de riesgos con vulnerabilidad, impacto, probabilidad, evidencia y mitigación. No incluir valores reales del `.env`.

### Anexo E. Capturas

Incluir capturas de login, dashboard estudiante, dashboard docente, dashboard administrador, ficha, Kanban, rúbricas, evaluación, entregables, coevaluación, aplicación móvil y flujo de chat. Si alguna captura no existe, marcarla como pendiente y no inventarla.
