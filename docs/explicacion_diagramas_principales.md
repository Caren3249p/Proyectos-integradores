# Explicación de los diagramas principales

## Introducción

En esta presentación se explican cuatro diagramas importantes de la plataforma para la gestión, entrega y evaluación de proyectos integradores.

El orden de presentación será:

1. Diagrama de despliegue.
2. Diagrama de clases y servicios.
3. Diagrama de estados de una versión.
4. Diagrama de secuencia de evaluación.

Este orden permite presentar el sistema desde su infraestructura general hasta el detalle de uno de sus procesos principales.

> El diagrama de casos de uso se presenta por separado.

---

## 1. Diagrama de despliegue

Archivo: [`despliegue_tunnels.mmd`](../diagrams/despliegue_tunnels.mmd)

### ¿Qué representa?

Este diagrama muestra dónde se ejecutan los componentes de la plataforma y cómo se comunican entre sí.

Los elementos principales son:

- Dispositivo móvil o computador del usuario.
- Navegador web.
- Túnel HTTPS público.
- Aplicación frontend desarrollada con React y Vite.
- API backend desarrollada con Node.js y Express.
- Base de datos PostgreSQL.
- Sistema de archivos para almacenar evidencias.

### Explicación para la presentación

> En primer lugar, este diagrama presenta la infraestructura de ejecución de la plataforma. El usuario accede desde un computador o dispositivo móvil mediante un navegador web. La conexión se realiza utilizando HTTPS a través de un túnel público, que permite exponer los servicios locales durante la etapa de desarrollo.
>
> La interfaz de usuario está implementada como una aplicación SPA con React y Vite, ejecutándose en el puerto 3312. Esta aplicación se comunica con la API REST del backend, desarrollada con Node.js y Express, que se ejecuta en el puerto 3000.
>
> El backend concentra la autenticación, las reglas de negocio, la gestión de proyectos, las versiones, las entregas y las evaluaciones. Para persistir la información utiliza Prisma como ORM y se conecta con PostgreSQL a través del puerto 5432.
>
> Los archivos y evidencias que suben los estudiantes se almacenan en el sistema de archivos local, dentro de la carpeta `/uploads`.

### Flujo principal

```text
Usuario
  ↓ HTTPS
Túnel público
  ↓
Frontend React
  ↓ REST API + JWT
Backend Node.js / Express
  ├── Prisma → PostgreSQL
  └── Sistema de archivos → /uploads
```

### Idea principal

El diagrama permite demostrar que la solución está organizada en capas y que cada componente tiene una responsabilidad definida:

- El frontend atiende la interacción con el usuario.
- El backend procesa las operaciones y reglas de negocio.
- PostgreSQL almacena la información estructurada.
- El sistema de archivos almacena los documentos adjuntos.

---

## 2. Diagrama de clases y servicios

Archivo: [`clases_servicios.mmd`](../diagrams/clases_servicios.mmd)

### ¿Qué representa?

Este diagrama muestra la estructura interna de la plataforma. Incluye las entidades principales del dominio, sus relaciones y los servicios encargados de aplicar las reglas de negocio.

Las entidades principales son:

- `Usuario`
- `Proyecto`
- `IntegranteProyecto`
- `VersionProyecto`
- `Archivo`
- `Rubrica`
- `CriterioRubrica`
- `Evaluacion`
- `CalificacionCriterio`

Los servicios principales son:

- `ProyectoService`
- `RubricaService`
- `EvaluacionService`
- `PlaneService`

### Explicación para la presentación

> Este diagrama representa el modelo estructural de la plataforma. En la parte central se encuentran las entidades que representan la información persistida del sistema, mientras que los servicios encapsulan las operaciones y reglas de negocio.
>
> Un usuario puede crear o asesorar varios proyectos. Cada proyecto puede tener varios integrantes, versiones, evaluaciones y tareas sincronizadas con el backlog. Las versiones permiten organizar las entregas del proyecto y cada versión puede contener varios archivos.
>
> El módulo de evaluación utiliza rúbricas compuestas por criterios. Los criterios pueden tener una relación recursiva con otros criterios hijos, lo que permite construir una estructura jerárquica con cortes académicos, actividades y criterios evaluables.
>
> Finalmente, cada evaluación almacena las calificaciones obtenidas en los criterios de la rúbrica. Los servicios se relacionan con estas entidades para validar permisos, gestionar proyectos, transformar las rúbricas y calcular las notas.

### Relaciones principales

```text
Usuario 1 ─── 0..* Proyecto
Proyecto 1 ─── 0..* VersionProyecto
VersionProyecto 1 ─── 0..* Archivo
Rubrica 1 ─── 1..* CriterioRubrica
CriterioRubrica 0..1 ─── 0..* CriterioRubrica
Proyecto 1 ─── 0..* Evaluacion
Evaluacion 1 ─── 1..* CalificacionCriterio
```

### Idea principal

La separación entre entidades y servicios permite organizar el backend de manera clara:

- Las entidades representan los datos.
- Los servicios contienen las reglas de negocio.
- Las relaciones muestran cómo se conectan los módulos.
- La estructura recursiva de los criterios permite manejar rúbricas jerárquicas.

---

## 3. Diagrama de estados de una versión

Archivo: [`estados_version.mmd`](../diagrams/estados_version.mmd)

### ¿Qué representa?

Este diagrama muestra el ciclo de vida de una versión de proyecto desde su creación hasta su finalización.

Los estados principales son:

- `Abierta`
- `SinArchivos`
- `ConArchivos`
- `Finalizada`
- `SoloLectura`

### Explicación para la presentación

> Este diagrama representa el ciclo de vida de una versión de proyecto. Cuando un estudiante crea una versión, esta comienza en estado abierta y recibe un número, por ejemplo, `v1.0`, `v2.0` o `v3.0`.
>
> Inicialmente, la versión puede encontrarse sin archivos. El estudiante puede adjuntar documentos y evidencias, por lo que la versión pasa al estado con archivos. Mientras permanezca abierta, también es posible agregar archivos adicionales o eliminar los archivos existentes.
>
> Cuando el estudiante termina de preparar la entrega, utiliza la operación para marcar la versión como finalizada. En ese momento, la versión pasa a un estado de solo lectura.
>
> Una versión finalizada puede consultarse, pero no debe modificarse. Las operaciones de creación, edición o eliminación de archivos son rechazadas. Esta regla protege la integridad de la entrega presentada.

### Flujo principal

```text
Creación de versión
        ↓
Abierta
        ↓
Sin archivos ↔ Con archivos
        ↓
Marcar como final
        ↓
Finalizada / Solo lectura
```

### Operaciones relacionadas

| Operación | Resultado |
|---|---|
| `POST /proyectos/{id}/versiones` | Crea una versión abierta |
| `POST /versiones/{id}/archivos` | Adjunta un archivo |
| Eliminación de archivos | Permite retirar archivos mientras la versión está abierta |
| `PATCH /versiones/{id}/final` | Marca la versión como finalizada |
| `GET /versiones/{id}` | Consulta una versión |

### Idea principal

El sistema diferencia claramente entre una versión en preparación y una versión entregada. Esto evita que una evidencia sea modificada después de haber sido presentada para revisión o evaluación.

---

## 4. Diagrama de secuencia de evaluación

Archivo: [`secuencia_evaluacion.mmd`](../diagrams/secuencia_evaluacion.mmd)

### ¿Qué representa?

Este diagrama muestra el flujo temporal de una evaluación docente, desde la solicitud inicial hasta el almacenamiento de la evaluación.

Los participantes son:

- Docente.
- `EvaluacionRouter`.
- `EvaluacionController`.
- `EvaluacionService`.
- Prisma y la base de datos.

### Explicación para la presentación

> Este diagrama muestra cómo se procesa una evaluación docente dentro de la plataforma. El flujo inicia cuando el docente envía una solicitud `POST` al endpoint de evaluaciones de un proyecto.
>
> La solicitud pasa por el router y el controlador, que delegan la operación al servicio de evaluación. El servicio verifica que el usuario autenticado tenga el rol de docente y que el proyecto exista.
>
> Después, se consulta la rúbrica seleccionada junto con sus criterios y niveles de desempeño. Como los criterios pueden estar almacenados de forma plana, el sistema los transforma en una estructura de árbol para poder procesarlos jerárquicamente.
>
> A continuación, se valida que solo se califiquen criterios hoja y que todos los criterios evaluables tengan una calificación. Luego se calcula la nota final utilizando un algoritmo recursivo Bottom-Up: primero se calculan las hojas, después los criterios padres y finalmente el resultado total.
>
> La evaluación y sus calificaciones se guardan dentro de una transacción. Si todas las operaciones son exitosas, el docente recibe una respuesta `201 Created`. Si ocurre un problema de permisos, validación o integridad, el sistema devuelve el error correspondiente.

### Flujo principal

```text
Docente
  ↓ POST /api/proyectos/{id}/evaluaciones
EvaluacionRouter
  ↓
EvaluacionController
  ↓
EvaluacionService
  ├── Valida el rol del usuario
  ├── Verifica el proyecto
  ├── Carga la rúbrica
  ├── Construye el árbol de criterios
  ├── Valida las hojas evaluables
  ├── Calcula la nota Bottom-Up
  └── Guarda la evaluación en una transacción
        ↓
Respuesta HTTP
```

### Validaciones importantes

El sistema verifica que:

- El usuario sea docente.
- El proyecto exista.
- La rúbrica exista y esté activa.
- La rúbrica pertenezca al docente que evalúa.
- Los criterios calificados pertenezcan a la rúbrica.
- Todos los criterios hoja tengan una calificación.
- La evaluación pueda modificarse si ya existe.

### Posibles respuestas

| Situación | Respuesta |
|---|---|
| Evaluación guardada correctamente | `201 Created` |
| Usuario sin permisos | `403 Forbidden` |
| Proyecto o rúbrica inexistente | `404 Not Found` |
| Datos o criterios inválidos | `400 Bad Request` |

### Idea principal

El diagrama demuestra que la evaluación no consiste únicamente en guardar una nota. Antes de persistirla, el sistema valida permisos, verifica la estructura de la rúbrica, calcula la nota ponderada y guarda toda la información de manera transaccional.

---

## Conclusión general

Los cuatro diagramas presentan diferentes perspectivas de la plataforma:

| Diagrama | Perspectiva |
|---|---|
| Despliegue | Dónde funciona el sistema |
| Clases y servicios | Cómo está estructurado |
| Estados de versión | Cómo cambia una entrega durante su ciclo de vida |
| Secuencia de evaluación | Cómo se ejecuta un proceso principal |

En conjunto, permiten explicar la solución desde la infraestructura hasta el comportamiento detallado de sus módulos principales.

