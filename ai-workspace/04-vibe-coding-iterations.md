# 04 - Proceso de Vibe Coding y Control de Calidad

## Introducción
Este documento detalla el desarrollo iterativo, el troubleshooting y la colaboración bidireccional con la IA durante la construcción de SaaS-O-Matic. El enfoque principal consistió en no aceptar la primera respuesta generada si no cumplía con los estándares de seguridad y rendimiento, iterando hasta conseguir una arquitectura sólida.

## Iteración 1: Refactorización de la Lógica de Negocio (Seguridad)
*   **Contexto:** En la primera versión del sistema, el cálculo de la facturación por tramos (Tiered Pricing) se diseñó íntegramente en el frontend para ofrecer una proyección dinámica al usuario mientras movía el slider.
*   **Problema detectado:** Delegar la lógica de negocio y los precios exclusivamente al cliente expone la API a manipulaciones críticas (ej. un usuario malintencionado podría enviar un `calculated_cost` manipulado de 0€ al endpoint).
*   **Decisión y Acción:** Se instruyó a la IA mediante *prompting* iterativo para reescribir el endpoint `POST /simulations`. El frontend pasó a enviar únicamente los datos crudos (`active_users`, `currency`), mientras que el backend asumió la responsabilidad de calcular los tramos (10€, 8€, 5€), aplicar el IVA del 21% verificando el país en base de datos y auditar el precio final antes de guardarlo en SQLite.

## Iteración 2: El "Poltergeist" de Angular y Zone.js
*   **Contexto:** Durante el desarrollo del formulario de simulación interactivo (`<app-simulation-form>`), nos encontramos con un fallo de sincronización grave. Al deslizar el input de tipo `range`, los datos se guardaban correctamente en el backend, pero la vista del navegador quedaba completamente congelada mostrando "0 usuarios" y "0.00 EUR".
*   **Problema detectado:** El motor de detección de cambios de Angular (*Zone.js*) se saturaba. La combinación de los eventos de entrada continua del slider, los bloqueos condicionales (`[disabled]`) y las interpolaciones clásicas (`{{ }}`) provocaban que Angular desconectara la vista del modelo para evitar bloqueos del navegador.
*   **Decisión y Acción (Bypass de Zone.js):** En lugar de forzar a Angular con `ChangeDetectorRef`, decidimos aplicar manipulación directa del DOM ("Fuerza Bruta"). Se reestructuró el componente eliminando las llaves reactivas y utilizando decoradores `@ViewChild` para inyectar los valores recalculados directamente en los nodos HTML mediante `nativeElement.innerText`. El resultado fue una simulación a 60 FPS sin bloqueos.

## Iteración 3: Refinamiento del Layout (CSS Grid vs Flexbox)
*   **Contexto:** El diseño inicial de las tarjetas de cliente y simulación utilizaba Flexbox. 
*   **Problema detectado:** En pantallas pequeñas y medianas, los elementos del buscador y las tarjetas inferiores generaban saltos de línea asimétricos e impredecibles, lo cual no cumplía con el estándar "responsive" exigido.
*   **Decisión y Acción:** Se solicitó a la IA refactorizar la hoja de estilos global (`app.css` y `search.css`) migrando la arquitectura a **CSS Grid**. Se implementaron Media Queries estrictas (`@media max-width: 768px`) que fuerzan un `flex-direction: column` unificado, asegurando que el Dashboard se apile en una sola columna limpia en dispositivos móviles.