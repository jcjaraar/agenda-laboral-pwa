// src/services/database.js
import { openDB } from 'idb';

class AgendaDatabase {
  constructor() {
    this.dbName = 'AgendaTesisDB';
    this.version = 1;
    this.dbPromise = this.initDB();
  }

  async initDB() {
    return openDB(this.dbName, this.version, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`Actualizando DB de ${oldVersion} a ${newVersion}`);

        // Crear ObjectStore para Trabajos (similar a tabla)
        if (!db.objectStoreNames.contains('trabajos')) {
          const trabajoStore = db.createObjectStore('trabajos', {
            keyPath: 'id',
            autoIncrement: true
          });
          
          // Índices (similar a índices en FoxPro)
          trabajoStore.createIndex('porNombre', 'nombre');
          trabajoStore.createIndex('porEstado', 'estado');
          trabajoStore.createIndex('porFechaInicio', 'fechaInicio');
        }

        // Crear ObjectStore para Tareas
        if (!db.objectStoreNames.contains('tareas')) {
          const tareaStore = db.createObjectStore('tareas', {
            keyPath: 'id',
            autoIncrement: true
          });
          
          tareaStore.createIndex('porTrabajoId', 'trabajoId');
          tareaStore.createIndex('porFecha', 'fecha');
          tareaStore.createIndex('porPrioridad', 'prioridad');
          tareaStore.createIndex('porCompletada', 'completada');
        }

        // Crear ObjectStore para Configuración
        if (!db.objectStoreNames.contains('configuracion')) {
          db.createObjectStore('configuracion', {
            keyPath: 'clave'
          });
        }
      }
    });
  }

  // ========== CRUD TRABAJOS ==========
  async agregarTrabajo(trabajo) {
    const db = await this.dbPromise;
    return db.add('trabajos', trabajo);
  }

  async obtenerTodosTrabajos() {
    const db = await this.dbPromise;
    return db.getAll('trabajos');
  }

  async obtenerTrabajoPorId(id) {
    const db = await this.dbPromise;
    return db.get('trabajos', id);
  }

  async actualizarTrabajo(id, cambios) {
    const db = await this.dbPromise;
    const trabajo = await db.get('trabajos', id);
    const actualizado = { ...trabajo, ...cambios };
    return db.put('trabajos', actualizado);
  }

  async eliminarTrabajo(id) {
    const db = await this.dbPromise;
    return db.delete('trabajos', id);
  }

  // ========== CRUD TAREAS ==========
  async agregarTarea(tarea) {
    const db = await this.dbPromise;
    return db.add('tareas', tarea);
  }

  async obtenerTareasPorTrabajo(trabajoId) {
    const db = await this.dbPromise;
    const index = db.transaction('tareas').store.index('porTrabajoId');
    return index.getAll(trabajoId);
  }

  async obtenerTodasTareas() {
    const db = await this.dbPromise;
    return db.getAll('tareas');
  }

  async obtenerTareaPorId(id) {
    const db = await this.dbPromise;
    return db.get('tareas', id);
  }

  async actualizarTarea(id, cambios) {
    const db = await this.dbPromise;
    const tarea = await db.get('tareas', id);
    const actualizado = { ...tarea, ...cambios };
    return db.put('tareas', actualizado);
  }

  async eliminarTarea(id) {
    const db = await this.dbPromise;
    return db.delete('tareas', id);
  }

  // ========== MÉTODOS ESPECIALES ==========
  async obtenerTareasPendientes() {
    const db = await this.dbPromise;
    const index = db.transaction('tareas').store.index('porCompletada');
    return index.getAll(false); // false = no completadas
  }

  async obtenerTareasPorPrioridad(prioridad) {
    const db = await this.dbPromise;
    const index = db.transaction('tareas').store.index('porPrioridad');
    return index.getAll(prioridad);
  }

  async contarTareasPorTrabajo(trabajoId) {
    const tareas = await this.obtenerTareasPorTrabajo(trabajoId);
    return {
      total: tareas.length,
      completadas: tareas.filter(t => t.completada).length,
      pendientes: tareas.filter(t => !t.completada).length
    };
  }

  // ========== CONFIGURACIÓN ==========
  async guardarConfiguracion(clave, valor) {
    const db = await this.dbPromise;
    return db.put('configuracion', { clave, valor });
  }

  async obtenerConfiguracion(clave) {
    const db = await this.dbPromise;
    const config = await db.get('configuracion', clave);
    return config ? config.valor : null;
  }

  // ========== MIGRACIÓN/EXPORTACIÓN ==========
  async exportarDatos() {
    const db = await this.dbPromise;
    const trabajos = await this.obtenerTodosTrabajos();
    const tareas = await this.obtenerTodasTareas();
    
    return {
      version: this.version,
      exportadoEn: new Date().toISOString(),
      trabajos,
      tareas
    };
  }

  async importarDatos(datos) {
    const db = await this.dbPromise;
    const tx = db.transaction(['trabajos', 'tareas'], 'readwrite');
    
    // Limpiar datos existentes
    await tx.objectStore('trabajos').clear();
    await tx.objectStore('tareas').clear();
    
    // Importar nuevos datos
    for (const trabajo of datos.trabajos) {
      await tx.objectStore('trabajos').add(trabajo);
    }
    
    for (const tarea of datos.tareas) {
      await tx.objectStore('tareas').add(tarea);
    }
    
    await tx.done;
  }
}

// Patrón Singleton (como en Java)
const database = new AgendaDatabase();
export default database;