# Guía definitiva para GitHub Pages (sin sufrimiento)

**Autor:** Julio Jara  
**Basado en:** 14 horas de prueba y error real  
**Tags:** `gh-pages` `deploy` `react` `pwa`

---

## ⚠️ Regla de oro (nunca olvidar)

| Branch | Contiene | Se puede hacer build |
|--------|----------|----------------------|
| ✅ `main` | Código fuente + package.json | ✅ SÍ |
| ❌ `gh-pages` | Solo archivos estáticos (index.html, static/) | ❌ NO |

**El build SIEMPRE se hace en `main`, luego se copia a `gh-pages`.**

---

## 🚀 Pasos correctos (funcionan siempre)

```bash
# 1. Ir a main
git checkout main

# 2. Construir la app
npm run build

# 3. Verificar que el build es válido
ls -la build/
# Debe mostrar: index.html, static/, asset-manifest.json, etc.

# 4. Crear branch gh-pages limpio
git checkout --orphan gh-pages

# 5. Limpiar todo (solo con git, nunca rm -rf * .*)
git rm -rf .

# 6. Copiar el build
cp -r ../build/* .

# 7. Archivos especiales para SPA
echo "/* /agenda-laboral-pwa/index.html 200" > _redirects
touch .nojekyll

# 8. Verificar estructura correcta
ls -la
# ✅ DEBE VER: index.html, static/, _redirects, .nojekyll
# ❌ NO DEBE VER: build/, node_modules/, package.json, src/

# 9. Commit y push
git add .
git commit -m "Deploy vX.X.X"
git push origin gh-pages --force

# 10. Volver a main
git checkout main