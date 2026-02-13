# 📋 Historial de Cambios

Todos los cambios notables de este proyecto serán documentados en este archivo.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] - 2026-02-13

### ✅ Añadido
- Dashboard profesional con calendario mensual interactivo
- Vista de tareas por día (clic en fecha del calendario)
- Colores únicos y consistentes para cada trabajo
- Badges circulares con inicial del trabajo
- Vista "Próximas 10 tareas" (reemplaza vista fija de 7 días)
- Datos de prueba completos: 3 trabajos, 11 tareas distribuidas en 7 días
- Panel de depuración con botones para desarrolladores

### 🐛 Corregido
- Desfase de fechas en calendario (problema de zona horaria UTC/local)
- Títulos de días incorrectos al seleccionar una fecha
- Stats en columna ahora son desplegable horizontal

### 🎨 Mejorado
- Dashboard más limpio y ordenado
- Simulador de IA ahora crea tareas en trabajos aleatorios
- Código fuente reorganizado y documentado

---

## [2.0.0] - 2026-02-11

### ✅ Añadido
- Sistema completo de base de datos con IndexedDB + idb
- Backup automático cada 24 horas con retención de 7 días
- Debug global (`window.databaseService`, `window.dbDebug`)
- Service Worker registrado y funcionando
- GitHub Pages desplegado

### 🐛 Corregido
- Error de índice en `obtenerTareasPendientes()`
- Inconsistencias en actualización de estado local

---

## [1.0.0] - 2026-01-15

### ✅ Añadido
- Versión inicial con React
- Componente Tarea
- CRUD básico de tareas