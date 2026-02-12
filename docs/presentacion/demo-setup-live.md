# 🎤 Demo en Vivo: Setup Multi-equipo

**Duración:** 5 minutos  
**Audiencia:** Tribunal de tesis / Reclutadores técnicos

---

## 🎯 Objetivo de la Demo

Demostrar que el proyecto es **profesional, portable y bien documentado**.

---

## ⏱️ Guión de 5 minutos

### 0:00 - 1:00 | Introducción

"Para mi tesis, no solo desarrollé la aplicación,
sino también todo el ecosistema de desarrollo.

Voy a demostrar cómo en 5 minutos puedo tener
el proyecto funcionando en CUALQUIER equipo con Windows."


### 1:00 - 3:00 | Setup Rápido (Pantalla compartida)
```bash
# 1. Abrir terminal NUEVA
git --version
node --version
npm --version

# 2. Clonar
git clone https://github.com/TU-USUARIO/agenda-laboral-pwa
cd agenda-laboral-pwa

# 3. Instalar
npm install

# 4. Ejecutar
npm start

3:00 - 4:00 | Verificación

# 1. Mostrar navegador en localhost:3000
# 2. F12 → Application → IndexedDB (datos persistentes)
# 3. F12 → Application → Service Workers (PWA)
# 4. Click en "Administración y Backup"

4:00 - 5:00 | Documentación

"Todo esto está documentado profesionalmente:

- Tesis: docs/tesis/anexos/
- Portfolio: docs/portfolio/guias/
- Desarrollo: docs/desarrollo/sprints/

Y disponible en GitHub para cualquier evaluador."


💡 Tips para la Exposición
✅ Preparar el escenario: Tener VS Code y terminal abiertos
✅ Usar pantalla completa: Evitar distracciones
✅ Compartir audio: Explicar mientras se ejecuta
✅ Tener backup: Video grabado por si falla internet

❌ No asumir conocimiento: Explicar cada comando
❌ No apurarse: Mejor mostrar menos y bien
❌ No improvisar: Seguir el guión

🚨 Plan de Contingencia
Problema	Solución
Sin internet	Demo grabada localmente
Error en comando	Mostrar documentación impresa
Tiempo justo	Enfocar en lo más importante


---

## **🚀 ACCIÓN INMEDIATA: Script para generar todo automáticamente**

Crear `scripts/generate-setup-docs.js`:

```javascript
// scripts/generate-setup-docs.js
const fs = require('fs');
const path = require('path');

console.log('📄 Generando documentación de setup...');

const docs = [
  {
    path: 'docs/tesis/anexos/anexo-configuracion-entorno.md',
    content: `# Anexo Técnico: Configuración del Entorno de Desarrollo Multi-equipo\n\n...` // El contenido completo de arriba
  },
  {
    path: 'docs/portfolio/guias/setup-desarrollador.md',
    content: `# 🚀 Setup Rápido: Agenda Laboral PWA\n\n...` // El contenido completo de arriba
  },
  {
    path: 'docs/desarrollo/sprints/sprint-setup-multiequipo.md',
    content: `# Sprint: Configuración Multi-equipo\n\n...` // El contenido completo de arriba
  },
  {
    path: 'docs/presentacion/demo-setup-live.md',
    content: `# 🎤 Demo en Vivo: Setup Multi-equipo\n\n...` // El contenido completo de arriba
  }
];

docs.forEach(doc => {
  const fullPath = path.join(process.cwd(), doc.path);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, doc.content);
  console.log(`✅ Creado: ${doc.path}`);
});

console.log('\n🎉 Documentación de setup generada!');
console.log('📁 Revisa la carpeta docs/ para ver todos los archivos.');


Ejecutar:

node scripts/generate-setup-docs.js

