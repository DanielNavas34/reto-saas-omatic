**Contexto:** Eres un desarrollador Senior Frontend experto en Angular y TailwindCSS/Bootstrap. El backend en Node.js ya está corriendo en http://localhost:3000.

**Tarea:** Diseña la arquitectura del frontend para "SaaS-O-Matic".
Necesito que me generes el código para los siguientes componentes y servicios:

1. **Servicios (Services):**
   - `api.service.ts`: Para conectar con nuestro backend (`POST /customers` y `POST /simulations`).
   - `currency.service.ts`: Para conectar con la API pública `https://open.er-api.com/v6/latest/EUR` y obtener los tipos de cambio dinámicos[cite: 1].

2. **Componentes (Vistas obligatorias)[cite: 1]:**
   - **Dashboard/Buscador (`search.component`):** Un input para buscar clientes por nombre de empresa o identificador fiscal.
   - **Tarjetas de Cliente (`customer-card.component`):** Diseño responsive que muestre los datos del cliente y un historial con sus simulaciones.
   - **Formulario de Simulación (`simulation-form.component`):** Un formulario interactivo con un slider para ajustar el número de usuarios. Debe mostrar el coste proyectado en tiempo real, permitiendo al usuario cambiar la divisa (EUR, USD, GBP) usando los datos del `currency.service`.

**Restricciones:** El diseño debe ser limpio, corporativo y manejar los estados de carga y error (ej. si falla la API de divisas).