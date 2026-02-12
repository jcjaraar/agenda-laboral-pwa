# Documentaci贸n del Proyecto


## 馃殌 Configuraci贸n Multi-equipo

El proyecto incluye documentaci贸n profesional para:

- **Tesis:** Configuraci贸n detallada del entorno (`docs/tesis/anexos/`)
- **Portfolio:** Gu铆a r谩pida para reclutadores (`docs/portfolio/guias/`)
- **Desarrollo:** Registro de problemas y soluciones (`docs/desarrollo/sprints/`)
- **Presentaci贸n:** Gui贸n para demos en vivo (`docs/presentacion/`)

**Verificaci贸n r谩pida:** `node scripts/verify-env.js`

# ?? Agenda Laboral PWA - v2.0

**Estado:** ? Estable | **última actualización:** Febrero 2026

![Version](https://img.shields.io/badge/version-2.0-blue)
![PWA](https://img.shields.io/badge/PWA-?-brightgreen)
![IndexedDB](https://img.shields.io/badge/IndexedDB-?-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ?? **Novedades en v2.0**

| Feature | Estado | Descripción |
|---------|--------|-------------|
| ? IndexedDB | `Completado` | Persistencia local con idb |
| ? Backup automático | `Completado` | Cada 24h con retención 7 días |
| ? Dashboard | `Completado` | Estadísticas en tiempo real |
| ? Debug global | `Completado` | `window.dbDebug` para desarrollo |
| ? CRUD Tareas | `Completado` | Sin errores de índice |
| ? Service Worker | `Completado` | Registrado y activo |
| ? Vista Semanal | `En progreso` | Horizonte 3 meses |
| ? Gemini API | `Pendiente` | Integración con IA |

---

## ?? **Capturas de Pantalla**

| Vista Principal | Dashboard | Backup |
|----------------|-----------|--------|
| ![App](docs/portfolio/screenshots/version-2.0/01-app-principal.png) | ![Dashboard](docs/portfolio/screenshots/version-2.0/02-dashboard.png) | ![Backup](docs/portfolio/screenshots/version-2.0/04-backup.png) |

| IndexedDB | Service Worker | Lighthouse |
|-----------|---------------|------------|
| ![IndexedDB](docs/portfolio/screenshots/version-2.0/05-indexeddb.png) | ![SW](docs/portfolio/screenshots/version-2.0/06-service-worker.png) | ![Lighthouse](docs/portfolio/screenshots/version-2.0/07-lighthouse.png) |

---

## ?? **Demo en Vivo**

?? **GitHub Pages:** [https://[tu-usuario].github.io/agenda-laboral-pwa](https://[tu-usuario].github.io/agenda-laboral-pwa)

```bash
# Clonar y probar localmente
git clone https://github.com/[tu-usuario]/agenda-laboral-pwa.git
cd agenda-laboral-pwa
npm install
npm start


?? Debug Mode

// En consola del navegador (desarrollo)
await dbDebug.stats()     // Estadísticas completas
await dbDebug.tareas()    // Ver todas las tareas
await dbDebug.pendientes() // Tareas pendientes
await dbDebug.clear()     // Resetear base de datos


?? Documentación


?? Documentación técnica

?? Portfolio profesional

?? Registro de desarrollo



????? Autor

Tu Nombre - GitHub | LinkedIn

Proyecto de tesis - [Nombre de la carrera] - [Universidad]


---

### **2.2 Crear/Actualizar `CHANGELOG.md`**

```markdown
# ?? Historial de Cambios

## [2.0.0] - 2026-02-11

### ? A?adido
- Sistema completo de base de datos con IndexedDB + idb
- Backup automático cada 24 horas con retención de 7 días
- Panel de administración con estadísticas en tiempo real
- Debug global expuesto (`window.databaseService`, `window.dbDebug`)
- Dashboard con métricas de trabajos y tareas
- Service Worker registrado y funcionando

### ?? Corregido
- Error de índice en `obtenerTareasPendientes()` (false → filter)
- Inconsistencias en actualización de estado local
- Problemas de sincronización entre IndexedDB y React

### ?? Documentación
- Estructura completa de capturas de pantalla
- README actualizado con badges y tablas
- Guía de debug para desarrolladores

## [1.0.0] - 2026-01-15
- Versión inicial con React y componentes básicos


