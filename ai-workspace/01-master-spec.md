# SaaS-O-Matic - Master Specifications

## 1. Arquitectura General
- **Backend:** Node.js con Express.
- **Base de Datos:** SQLite[cite: 1].
- **Frontend:** Angular.

## 2. Entidades de Base de Datos
- **customers**: `id`, `company_name`, `tax_id` (DNI/NIF/CIF), `email`, `country`, `plan_type`[cite: 1].
- **simulations**: `id`, `customer_id`, `active_users`, `storage_gb`, `api_calls`, `calculated_cost`[cite: 1].

## 3. Endpoints del Backend
- `POST /customers`: Registra un cliente. Si el país es España, debe validar obligatoriamente que el DNI/NIF/CIF es verdadero con el algoritmo oficial[cite: 1].
- `POST /simulations`: Calcula el coste usando facturación por tramos (Tiered Pricing) y suma el impuesto del país[cite: 1].
  - Tramo 1 (0-10 usuarios): 10 € / usuario[cite: 1].
  - Tramo 2 (11-50 usuarios): 8 € / usuario[cite: 1].
  - Tramo 3 (>50 usuarios): 5 € / usuario[cite: 1].

## 4. Frontend
- Dashboard comercial con buscador, tarjetas de clientes y formulario de simulación interactiva[cite: 1].
- Debe consumir una API pública de tipos de cambio (ej. open.er-api.com) para mostrar los costes convertidos en tiempo real (EUR, USD, GBP, etc.)[cite: 1].
