# Datos para generar la presentación del proyecto

## Instrucción principal para Claude

Genera una presentación académica y profesional sobre el proyecto descrito en este documento. Usa únicamente la información proporcionada aquí y no inventes cifras, resultados, porcentajes, usuarios de prueba, funcionalidades terminadas ni tecnologías que no aparezcan en el contenido.

La presentación debe ser clara para una sustentación universitaria del curso Proyecto Integrador III. Debe combinar texto breve para las diapositivas con notas del presentador más completas.

### Reglas de presentación

- Usar entre 14 y 16 diapositivas.
- Mantener poco texto visible por diapositiva.
- Incluir notas del presentador para explicar cada diapositiva.
- Incluir diagramas y capturas de la aplicación cuando sea posible.
- Diferenciar siempre entre implementado, parcial, documentado y pendiente.
- No mostrar contraseñas, tokens, API keys, claves privadas, credenciales ni valores reales de archivos `.env`.
- No afirmar que una funcionalidad está terminada solo porque aparece en un plan o diagrama.
- No presentar el túnel local como infraestructura productiva.
- Mantener el idioma español.
- Usar una identidad visual institucional sobria, con colores asociados a la UPB.

---

## 1. Identificación del proyecto

**Título sugerido:**

> Plataforma centralizada para la gestión, seguimiento, evaluación y visualización de proyectos integradores

**Programa:** Ingeniería de Sistemas e Informática  
**Institución:** Universidad Pontificia Bolivariana, Seccional Bucaramanga  
**Curso:** Proyecto Integrador III  
**Periodo:** 2026  
**Integrantes:** Caren Julieth Diaz Calderón y Juan Sebastian Hernández Remolina  
**Docente:** MSc. Lenin Javier Serrano Gil  
**Repositorio:** `Caren3249p/Proyectos-integradores`

**Tipo de solución:**

- Plataforma web responsive.
- Aplicación móvil Flutter.
- API REST.
- Integración con servicios externos.

---

## 2. Problema

La información de los proyectos integradores se encuentra distribuida en diferentes medios y herramientas:

- Fichas de proyecto.
- Integrantes y docentes asesores.
- Archivos y evidencias.
- Versiones de entrega.
- Backlog y tableros Kanban.
- Repositorios de código.
- Evaluaciones docentes.
- Entregables y entregas.
- Coevaluaciones.

Esta dispersión dificulta:

- Consultar el estado real de un proyecto.
- Hacer seguimiento al avance.
- Organizar las evidencias.
- Mantener trazabilidad de las entregas.
- Aplicar evaluaciones uniformes.
- Consolidar la información para estudiantes y docentes.

### Mensaje para la diapositiva

> La información académica, técnica y evaluativa de los proyectos integradores está fragmentada en múltiples herramientas, lo que dificulta el seguimiento y la evaluación.

### Guion oral

> El proyecto surge para resolver la dispersión de información asociada a los proyectos integradores. Estudiantes y docentes necesitan consultar en un mismo lugar la ficha del proyecto, sus integrantes, las evidencias, el backlog, el repositorio y los resultados de evaluación.

---

## 3. Justificación

La solución es importante porque permite:

- Centralizar la información del proyecto.
- Mejorar el seguimiento académico.
- Gestionar entregas y evidencias.
- Estandarizar la evaluación mediante rúbricas.
- Automatizar el cálculo de notas.
- Facilitar la coevaluación entre integrantes.
- Integrar GitHub y Plane.
- Ofrecer acceso web y móvil.

### Mensaje central

> Una única plataforma mejora la trazabilidad, el seguimiento y la evaluación de los proyectos integradores.

---

## 4. Objetivo general y objetivos específicos

### Objetivo general

> Desarrollar una plataforma web responsive con aplicación móvil que centralice la gestión, seguimiento, evaluación y visualización de los proyectos integradores.

### Objetivos específicos

1. Centralizar la gestión de fichas de proyecto, integrantes, docentes y evidencias.
2. Permitir la gestión de versiones y archivos de entrega.
3. Dar visibilidad al backlog y al avance de cada proyecto.
4. Implementar rúbricas jerárquicas para la evaluación docente.
5. Calcular automáticamente las notas ponderadas.
6. Gestionar entregables, entregas y coevaluaciones.
7. Vincular cada proyecto con un repositorio de código.
8. Integrar servicios externos como GitHub y Plane.
9. Proporcionar acceso desde dispositivos móviles.
10. Aplicar autenticación, autorización y validación de datos.

---

## 5. Alcance y requisitos

### Módulos contemplados

- Usuarios y acceso.
- Gestión de proyectos.
- Integrantes y docentes asesores.
- Versiones y archivos.
- Backlog centralizado.
- Integración con Plane.
- Repositorios de GitHub.
- Rúbricas jerárquicas.
- Evaluación docente.
- Entregables y entregas.
- Coevaluación.
- Catálogo y publicación.
- Reportes básicos.
- Integraciones externas y chat mediante SSO.

### Priorización documentada

- **Must:** RF-01 a RF-09, RF-12, RF-13 y RF-19.
- **Should:** RF-14, RF-15 y RF-16 simplificado.
- **Could/futuro:** RF-11, RF-17 y RF-18.

### Nota de honestidad

La presentación debe confirmar el estado real de cada módulo antes de etiquetarlo como terminado. Las categorías de prioridad del plan no equivalen por sí solas a funcionalidades implementadas.

---

## 6. Usuarios y roles

### Estudiante

- Inicia sesión.
- Consulta y gestiona su proyecto.
- Consulta el backlog y el tablero Kanban.
- Gestiona versiones.
- Sube evidencias.
- Consulta entregables.
- Realiza entregas.
- Participa en coevaluaciones.
- Consulta el repositorio y el chat cuando estén disponibles.

### Docente

- Inicia sesión.
- Consulta proyectos asignados.
- Consulta el backlog y el avance.
- Crea y gestiona rúbricas.
- Evalúa proyectos y entregas.
- Gestiona entregables.
- Consulta coevaluaciones.
- Utiliza el explorador de fichas y el chat cuando estén disponibles.

### Administrador

- Gestiona usuarios.
- Consulta el catálogo global.
- Modera o publica proyectos según los permisos implementados.
- Consulta información general de la plataforma.

---

## 7. Organización y metodología

**Equipo:** 2 desarrolladores Full-Stack.  
**Duración planificada:** 17 semanas, entre julio y noviembre de 2026.  
**Dedicación estimada:** 15 horas semanales por integrante.  
**Capacidad planificada:** 240 horas-persona.  
**Metodología de trabajo:** backlog priorizado, Kanban, sprints y entregables parciales.  
**Control de versiones:** Git.  
**Gestión de tareas:** tablero Kanban y herramientas de seguimiento.  

### Entregables planificados

| Entregable | Semana |
|---|---:|
| Revisión de literatura | 1 |
| Project Charter, ERS y registro de interesados | 2 |
| EDT, plan integrado y backlog priorizado | 3 |
| Módulos funcionales, sprints 1 a 4 | 4-7 |
| Producto e informe v1.0 | 8 |
| Producto e informe v2.0 | 11 |
| Producto final, informe v3.0 y validación técnica | 14 |
| Pre-sustentación | 15 |
| Sustentación | 16 |
| Retrospectiva final | 17 |

### Competencias abordadas

- Investigación e innovación.
- Ingeniería de software.
- Infraestructura tecnológica.
- Seguridad de la información.
- Creatividad e innovación.

---

## 8. Arquitectura tecnológica

### Frontend web

- React 18.
- Vite.
- Tailwind CSS.
- `lucide-react`.
- `fetch` encapsulado en servicios.
- `AppContext` para estado global.
- `localStorage` para persistencia local del token y datos de interfaz.

### Backend

- Node.js.
- Express 4.
- Prisma ORM 5.
- Zod.
- JWT.
- bcrypt.
- Multer.
- jose para firma y manejo de JWT/SSO.
- CORS.
- dotenv y variables de entorno.

### Persistencia y archivos

- PostgreSQL previsto por el esquema Prisma.
- Sistema de archivos para evidencias.
- Carpeta de cargas: `/uploads`.

### Aplicación móvil

- Flutter.
- Inicio y restauración de sesión.
- Navegación por rol.
- Consulta y creación de proyectos.
- Detalle de proyecto.
- Backlog.
- Versiones de proyecto.
- Cliente HTTP.
- Servicios separados.
- Modelos para usuarios, proyectos, tareas y versiones.

### Integraciones

- Plane para backlog y tareas.
- GitHub para repositorios y conexión OAuth.
- Chat externo mediante lanzamiento SSO firmado.

### Arquitectura resumida

```text
Navegador web / Aplicación móvil
              ↓
           API REST
              ↓
       Servicios de negocio
          ↓          ↓
      Prisma      Sistema de archivos
          ↓
      PostgreSQL
```

---

## 9. Diagramas que deben incluirse

### Casos de uso

Archivo: [`casos_uso.mmd`](../diagrams/casos_uso.mmd)

Muestra los actores y sus funciones:

- Administrador.
- Estudiante.
- Docente.
- Acceso.
- Gestión de proyectos.
- Entregas y evaluación.
- Administración.

### Despliegue

Archivo: [`despliegue_tunnels.mmd`](../diagrams/despliegue_tunnels.mmd)

Explica:

- Dispositivo del usuario.
- Navegador.
- Túnel HTTPS público.
- Frontend React/Vite en el puerto 3312.
- Backend Node.js/Express en el puerto 3000.
- PostgreSQL en el puerto 5432.
- Almacenamiento local `/uploads`.

El túnel debe presentarse como mecanismo de desarrollo, no como despliegue productivo.

### Clases y servicios

Archivo: [`clases_servicios.mmd`](../diagrams/clases_servicios.mmd)

Entidades principales:

- Usuario.
- Proyecto.
- IntegranteProyecto.
- VersionProyecto.
- Archivo.
- Rubrica.
- CriterioRubrica.
- Evaluacion.
- CalificacionCriterio.

Servicios principales:

- ProyectoService.
- RubricaService.
- EvaluacionService.
- PlaneService.

### Estados de versión

Archivo: [`estados_version.mmd`](../diagrams/estados_version.mmd)

Flujo:

```text
Abierta
  ↓
Sin archivos ↔ Con archivos
  ↓
Finalizada
  ↓
Solo lectura
```

### Secuencia de evaluación

Archivo: [`secuencia_evaluacion.mmd`](../diagrams/secuencia_evaluacion.mmd)

Flujo:

1. El docente envía `POST /api/proyectos/{id}/evaluaciones`.
2. El router recibe la solicitud.
3. El controlador llama al servicio.
4. Se valida el rol docente.
5. Se verifica el proyecto.
6. Se carga la rúbrica con criterios y niveles.
7. Se transforma la estructura plana en árbol.
8. Se validan los criterios hoja.
9. Se calcula la nota Bottom-Up.
10. Se guarda la evaluación mediante una transacción.
11. Se devuelve la respuesta HTTP.

---

## 10. Demostración funcional sugerida

La demostración debe durar entre 5 y 8 minutos y mostrar solo funcionalidades verificadas.

### Flujo recomendado

1. Iniciar sesión con un usuario de prueba.
2. Mostrar la navegación según el rol.
3. Mostrar la ficha del proyecto.
4. Mostrar integrantes y datos técnicos.
5. Mostrar el repositorio vinculado si está configurado.
6. Mostrar el backlog y el porcentaje de avance.
7. Crear o consultar una versión.
8. Adjuntar una evidencia de prueba.
9. Marcar la versión como final.
10. Mostrar que una versión finalizada queda protegida contra modificaciones.
11. Mostrar una rúbrica.
12. Realizar una evaluación de prueba.
13. Mostrar el cálculo de la nota final.
14. Mostrar entregables o coevaluación si están validados.

### Plan alternativo si una integración falla

Usar capturas o datos controlados previamente preparados. Explicar que la integración depende de servicios externos y distinguir la demostración preparada de una ejecución en tiempo real.

---

## 11. Evaluación docente y cálculo Bottom-Up

### Explicación

La evaluación utiliza una rúbrica jerárquica:

```text
Corte académico
└── Actividad
    └── Criterio evaluable
```

El sistema:

- Verifica que el usuario sea docente.
- Comprueba que el proyecto exista.
- Comprueba que la rúbrica exista y esté activa.
- Valida que la rúbrica pertenezca al docente.
- Convierte los criterios en un árbol.
- Verifica que se califiquen únicamente hojas evaluables.
- Verifica que todas las hojas tengan calificación.
- Calcula las notas desde las hojas hacia los padres.
- Aplica la ponderación de cada nodo.
- Redondea la nota final.
- Persiste evaluación y calificaciones en una transacción.

### Respuestas esperadas

| Situación | Respuesta |
|---|---|
| Evaluación guardada | HTTP 201 |
| Usuario sin permiso | HTTP 403 |
| Proyecto o rúbrica inexistente | HTTP 404 |
| Datos o criterios inválidos | HTTP 400 |

---

## 12. Seguridad

Presentar las siguientes medidas:

- Autenticación mediante JWT.
- Control de acceso por roles.
- Hash de contraseñas con bcrypt.
- Validación de entradas con Zod.
- Rutas protegidas mediante middleware.
- Restricción de operaciones según el usuario.
- Validación de integrantes, docentes y propietarios.
- Protección de versiones finalizadas.
- Variables de entorno para configuración sensible.
- CORS.
- Firma y validación de tokens SSO mediante `jose`.
- Publicación de clave pública SSO mediante `/.well-known/jwks.json`.

### Advertencia para las diapositivas

No mostrar información sensible del archivo `secret-key-1787321491518.csv`, `.env`, tokens, contraseñas ni API keys.

---

## 13. Pruebas y validación

Pruebas existentes en el proyecto:

- `backend/test/businessContracts.test.js`
- `backend/test/coevaluacionCalculator.test.js`
- `backend/test/filePolicy.test.js`

### Áreas de validación

- Contratos y reglas de negocio.
- Cálculo de coevaluación.
- Política de archivos.
- Cálculo de evaluaciones.
- Permisos.
- Integridad de versiones.

### Regla para mostrar resultados

Claude debe dejar espacios editables para colocar resultados reales de la ejecución de pruebas. No debe inventar:

- Porcentajes de cobertura.
- Número de pruebas exitosas.
- Tiempo de ejecución.
- Usuarios participantes.
- Métricas de rendimiento.

Si existe una prueba fallida, debe presentarse como pendiente de corrección y no ocultarse.

---

## 14. Resultados

Presentar resultados en tres categorías.

### Resultado funcional

- Centralización de la información de proyectos.
- Gestión de usuarios y roles.
- Gestión de versiones y evidencias.
- Consulta del backlog.
- Rúbricas jerárquicas.
- Evaluación con cálculo automático.
- Entregables y coevaluación según el estado real.
- Integraciones con servicios externos según su validación.

### Resultado técnico

- API REST modular.
- Separación entre rutas, controladores, servicios y persistencia.
- Modelo relacional gestionado mediante Prisma.
- Validación de entradas.
- Autenticación y autorización.
- Interfaz web responsive.
- Aplicación móvil estructurada por servicios y modelos.

### Resultado académico

- Aplicación del ciclo de vida de software.
- Uso de requisitos, EDT y backlog.
- Modelado con diagramas.
- Pruebas unitarias y funcionales.
- Consideración de seguridad.
- Documentación técnica en estructura compatible con IEEE.

---

## 15. Costos y recursos

Datos documentados en el plan:

- Costo ejecutado previsto: `$0 COP`.
- Infraestructura prevista: servicios gratuitos como Render/Railway.
- Tecnologías: herramientas de código abierto.
- Valorización referencial de mercado: `$49.690.000 COP`.
- Equipo: 2 desarrolladores.
- Capacidad estimada: 240 horas-persona.

Estos datos deben presentarse como cifras del plan y no como una auditoría financiera.

---

## 16. Limitaciones

Incluir una diapositiva honesta con las limitaciones verificadas:

- Algunas funcionalidades móviles pueden requerir validación adicional.
- Los reportes pueden estar simplificados a exportación CSV.
- El túnel HTTPS corresponde al entorno de desarrollo.
- El almacenamiento local de archivos debe fortalecerse para producción.
- Las integraciones externas dependen de disponibilidad y credenciales de terceros.
- Algunas pruebas o validaciones de usuario pueden requerir ampliación.
- Los requisitos Could quedan como mejoras futuras.

No etiquetar como limitación algo que no haya sido confirmado en el estado actual del proyecto.

---

## 17. Trabajo futuro

Posibles líneas de mejora:

- Completar y ampliar la aplicación móvil.
- Incorporar más reportes y paneles.
- Agregar notificaciones.
- Usar almacenamiento persistente en la nube.
- Fortalecer el despliegue productivo.
- Ampliar la sincronización con Plane.
- Mejorar integraciones con GitHub.
- Realizar más pruebas con docentes y estudiantes.
- Implementar requisitos Could priorizados para una siguiente versión.

---

## 18. Conclusiones

### Texto sugerido

> La plataforma desarrollada centraliza la gestión de los proyectos integradores y reúne en un mismo sistema información académica, técnica y evaluativa. La solución integra usuarios, proyectos, versiones, evidencias, backlog, rúbricas, evaluaciones y coevaluaciones, con acceso mediante una interfaz web y una aplicación móvil.
>
> El proyecto permitió aplicar conceptos de ingeniería de software, arquitectura cliente-servidor, bases de datos, seguridad, integración de servicios y pruebas. Además, la separación entre frontend, backend, servicios y persistencia facilita la evolución de la solución.
>
> Aunque existen funcionalidades que pueden ampliarse y validaciones que deben continuar, la plataforma establece una base funcional para mejorar el seguimiento, la entrega y la evaluación de los proyectos integradores.

---

## 19. Orden final de las diapositivas

1. Portada.
2. Problema.
3. Justificación.
4. Objetivos.
5. Alcance y requisitos.
6. Usuarios y roles.
7. Metodología y planificación.
8. Arquitectura tecnológica.
9. Modelo de datos y servicios.
10. Diagramas principales.
11. Demostración funcional.
12. Evaluación Bottom-Up.
13. Seguridad.
14. Pruebas y validación.
15. Resultados, limitaciones y trabajo futuro.
16. Conclusiones.

## 20. Tiempo sugerido

| Sección | Tiempo |
|---|---:|
| Problema, justificación y objetivos | 3 min |
| Alcance, usuarios y metodología | 3 min |
| Arquitectura y diagramas | 4 min |
| Demostración | 6 min |
| Evaluación, seguridad y pruebas | 3 min |
| Resultados y conclusiones | 2 min |
| **Total** | **21 min** |

## Mensaje central de la presentación

> El proyecto transforma información dispersa de los proyectos integradores en una plataforma centralizada que facilita la gestión, el seguimiento, la entrega y la evaluación, utilizando una arquitectura web/móvil modular y reglas de negocio verificables.

