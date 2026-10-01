# SaaS-O-Matic - Panel Comercial 🚀

Este repositorio contiene la solución completa a la prueba técnica para el desarrollo del dashboard comercial SaaS-O-Matic. El proyecto está estructurado de forma modular con un Backend seguro (Node.js + SQLite) y un Frontend interactivo y responsive (Angular).

## 📋 Requisitos Previos
Para levantar este proyecto en tu entorno local, asegúrate de tener instalado:
* **Node.js** (v18 o superior recomendado)
* **Angular CLI** (Si no lo tienes, instálalo globalmente con `npm install -g @angular/cli`)

## 🛠️ Instrucciones de Despliegue Local

El proyecto está diseñado para ejecutarse sin fricciones abriendo dos terminales separadas.

### 1. Levantar el Backend (API REST)
El backend gestiona la base de datos relacional, valida algorítmicamente los identificadores fiscales (DNI/NIE/CIF españoles) y calcula el precio por tramos (Tiered Pricing) centralizando la lógica de negocio por seguridad.

1. Abre una terminal y navega a la carpeta del backend:
   ```bash
   cd backend

 Instala las dependencias necesarias (Express, SQLite3, CORS):

Bash
npm install
Inicia el servidor:

Bash
node server.js
Nota: La base de datos database.sqlite se inicializa automáticamente. El servidor estará escuchando en http://localhost:3000.

2. Levantar el Frontend (Dashboard Angular)
El frontend consume la API local y se integra con la API pública de tipos de cambio (open.er-api.com) para ofrecer un panel de simulación de costes dinámico.

Abre una nueva terminal y navega a la carpeta del frontend:

Bash
cd frontend
Instala las dependencias del proyecto Angular:

Bash
npm install
Inicia el servidor de desarrollo:

Bash
ng serve
Abre tu navegador y accede a http://localhost:4200. La interfaz gráfica está optimizada para escritorio y dispositivos móviles mediante CSS Grid.