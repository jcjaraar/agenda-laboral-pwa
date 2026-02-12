// scripts/verify-env.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REQUIRED_NODE_VERSION = '18.20.2';
const REQUIRED_NPM_VERSION = '9.6.7';
const REQUIRED_DEPENDENCIES = ['react', 'idb', 'date-fns', 'pako'];

console.log('🔍 Verificando entorno de desarrollo...\n');

// 1. Verificar Node.js
const nodeVersion = execSync('node --version').toString().trim();
console.log(`📦 Node.js: ${nodeVersion}`);
if (!nodeVersion.includes(REQUIRED_NODE_VERSION)) {
  console.warn(`⚠️  Versión recomendada: ${REQUIRED_NODE_VERSION}`);
}

// 2. Verificar npm
const npmVersion = execSync('npm --version').toString().trim();
console.log(`📦 npm: ${npmVersion}`);

// 3. Verificar dependencias
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

console.log('\n📚 Dependencias:');
REQUIRED_DEPENDENCIES.forEach(dep => {
  const installed = dependencies[dep] ? '✅' : '❌';
  console.log(`   ${installed} ${dep}: ${dependencies[dep] || 'no instalada'}`);
});

// 4. Verificar estructura
const requiredDirs = ['src', 'public', 'docs'];
const requiredFiles = ['src/App.js', 'src/index.js', 'package.json'];

console.log('\n📁 Estructura:');
requiredDirs.forEach(dir => {
  const exists = fs.existsSync(dir) ? '✅' : '❌';
  console.log(`   ${exists} ${dir}/`);
});

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file) ? '✅' : '❌';
  console.log(`   ${exists} ${file}`);
});

console.log('\n✅ Verificación completada');

