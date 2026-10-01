# 05 - Definición de la Arquitectura y Directrices de IA

## 1. Estructura de la Base de Datos
Para este MVP se optó por **SQLite** por su agilidad y portabilidad. La estructura relacional se diseñó para ser ligera pero escalable:
*   **Tabla `customers`**: Actúa como entidad principal (Master). Almacena los datos fiscales, validando que el `tax_id` sea único para evitar duplicidades de clientes.
*   **Tabla `simulations`**: Entidad dependiente (Relación 1:N con `customers`). Almacena los metadatos de consumo (`active_users`, `storage_gb`, `api_calls`) y el coste ya calculado por el backend (`calculated_cost`).
*   **Decisión clave:** No guardar el coste de los tramos en duro en la base de datos de clientes, sino calcularlo dinámicamente o auditarlo en el endpoint al momento de crear la simulación, manteniendo el historial inmutable.

## 2. Organización de Carpetas y Modularidad
El proyecto está dividido estrictamente en dos dominios (`/backend` y `/frontend`), evitando el acoplamiento:

**Frontend (Angular):**
Se estructuró basándose en la separación de responsabilidades (Separation of Concerns):
*   `/components`: Componentes visuales aislados (`search`, `customer-card`, `simulation-form`). 
*   `/services`: Capa de datos aislada del UI (`api.service` para Node.js y llamadas fetch nativas para la API externa de divisas).
*   **Directriz a la IA:** Se especificó el uso estricto de **Angular Standalone Components**. Esto se hizo para evitar el uso de un archivo `app.module.ts` masivo y desorganizado, permitiendo que cada componente importe solo los módulos que necesita (`CommonModule`, `FormsModule`).

**Backend (Node.js):**
*   Directorio `/database` para encapsular la inicialización de SQLite (`db.js` / `database.sqlite`).
*   Archivo principal `server.js` que actúa como punto de entrada de la API REST.
*   **Directriz a la IA:** Mantener los endpoints limpios. En lugar de delegar todo al framework, se le pidió a la IA que escribiera las funciones core (como la validación algorítmica del DNI) como funciones puras e independientes antes de las rutas de Express.

## 3. Directrices y Prevención de "Código Espagueti"
Para evitar que los LLMs generasen archivos masivos e inmanejables, se aplicaron estas reglas de *Prompt Engineering*:
1.  **Generación Iterativa (Step-by-Step):** No se le pidió a la IA "construye un SaaS". Se crearon prompts separados para inicializar el backend (`02-prompt-backend-init.md`), y luego para la arquitectura frontend (`03-prompt-frontend-angular.md`).
2.  **Restricciones de Contexto:** Se le limitó explícitamente a utilizar tecnologías nativas y ligeras cuando fuera posible (ej. usar `fetch` nativo para la API de divisas en lugar de instalar librerías pesadas de terceros).
3.  **Seguridad por Diseño (Shift-Left Security):** Se instruyó a la IA para que desconfiara de los datos del cliente. Se le dio la directriz explícita de recalcular los Tiered Pricing en el backend ignorando las proyecciones visuales del frontend.