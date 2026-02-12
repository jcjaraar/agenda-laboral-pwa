# Sprint 2: Base de Datos y Backup Automático

**Período:** 2026-02-01 → 2026-02-11  
**Estado:** ✅ COMPLETADO  
**Versión:** 2.0.0  

---

## 🎯 Objetivos Cumplidos

| Objetivo | Estado | Evidencia |
|----------|--------|-----------|
| Implementar IndexedDB con idb | ✅ | [Screenshot](screenshots/05-indexeddb.png) |
| Sistema de backup automático | ✅ | [Screenshot](screenshots/04-backup.png) |
| Panel de administración | ✅ | [Screenshot](screenshots/02-dashboard.png) |
| Debug global | ✅ | `window.dbDebug` |
| Corregir errores de índice | ✅ | [Commit](https://github.com/...) |

---

## 📊 Métricas del Sprint
✅ Tasa de éxito: 100% (4/4 objetivos)
🐛 Bugs resueltos: 3
📸 Capturas documentadas: 7
📝 Archivos modificados: 12


---

## 🧠 Decisiones Técnicas

### 1. Uso de `filter()` en lugar de índice para booleanos
**Problema:** IndexedDB no acepta `false` como key en `getAll()`
**Solución:** Obtener todos y filtrar en memoria
**Ventaja:** Simple, confiable, sin errores
**Trade-off:** Menos eficiente con >10k registros (no aplica)

### 2. Exposición global para debugging
**Problema:** databaseService no accesible en consola
**Solución:** `window.databaseService = databaseService` en desarrollo
**Ventaja:** Debugging instantáneo sin modificar código

---

## 📝 Lecciones Aprendidas

1. **Siempre testear índices con valores reales** antes de implementar
2. **El estado local debe actualizarse de forma inmutable** (`prev => [...prev]`)
3. **Documentar errores** aunque se resuelvan rápido (valen para la tesis)
4. **Mantener `dbDebug` siempre actualizado** para el próximo desarrollador

---

## 🔄 Próximos Pasos (Sprint 3)

- [ ] Componente Trabajo mejorado (contacto, ubicación)
- [ ] Vista Semanal (horizonte 3 meses)
- [ ] Integración con Gemini API (IA)
- [ ] Tests automatizados

