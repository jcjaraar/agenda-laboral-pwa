#!/bin/bash
echo "🔄 Sincronizando proyecto..."

# Guardar cambios locales temporales
git stash

# Obtener últimos cambios
git pull origin main

# Restaurar cambios locales (si había)
git stash pop

# Reinstalar dependencias si package.json cambió
if git diff HEAD@{1} --name-only | grep -q "package.json"; then
  echo "📦 package.json modificado, reinstalando dependencias..."
  npm install
fi

echo "✅ Sincronización completada"