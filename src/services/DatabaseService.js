import { openDB } from "idb";
import pako from "pako";
import { format } from "date-fns";

class DatabaseService {
  constructor() {
    this.dbName = "AgendaLaboralDB";
    this.version = 2; // Incrementar cuando cambie esquema
    this.db = null;
    this.backupInterval = null;

    // Configuración de backup
    this.backupConfig = {
      autoBackup: true,
      backupIntervalHours: 24, // Cada 24 horas
      keepBackupDays: 7, // Mantener últimos 7 días
      compressBackups: true,
      encryptBackups: false, // Activar si agregas seguridad
    };
  }

  // ========== INICIALIZACIÓN ==========
  async init() {
    try {
      this.db = await this.initDB();
      await this.migrateIfNeeded();
      await this.setupChangeTracking();

      if (this.backupConfig.autoBackup) {
        this.startAutoBackup();
      }

      console.log("✅ DatabaseService inicializado");
      return this;
    } catch (error) {
      console.error("❌ Error inicializando DatabaseService:", error);
      throw error;
    }
  }

  async initDB() {
    return openDB(this.dbName, this.version, {
      upgrade: (db, oldVersion, newVersion, transaction) => {
        console.log(`🔄 Actualizando DB de v${oldVersion} a v${newVersion}`);

        // ========== ESQUEMA PRINCIPAL ==========

        // Trabajos
        if (!db.objectStoreNames.contains("trabajos")) {
          const trabajoStore = db.createObjectStore("trabajos", {
            keyPath: "id",
            autoIncrement: true,
          });

          // Índices para búsquedas rápidas
          trabajoStore.createIndex("porNombre", "nombre");
          trabajoStore.createIndex("porCliente", "cliente");
          trabajoStore.createIndex("porEstado", "estado");
          trabajoStore.createIndex("porFechaCreacion", "fechaCreacion");
          trabajoStore.createIndex(
            "porFechaActualizacion",
            "fechaActualizacion",
          );
        }

        // Tareas
        if (!db.objectStoreNames.contains("tareas")) {
          const tareaStore = db.createObjectStore("tareas", {
            keyPath: "id",
            autoIncrement: true,
          });

          tareaStore.createIndex("porTrabajoId", "trabajoId");
          tareaStore.createIndex(
            "porFechaPlanificada",
            "planificacion.fechaPlanificada",
          );
          tareaStore.createIndex("porEstado", "estado");
          tareaStore.createIndex("porPrioridad", "prioridad");
          tareaStore.createIndex("porCompletada", "completada");
          tareaStore.createIndex("porFechaCreacion", "fechaCreacion");
        }

        // ========== SISTEMA DE AUDITORÍA ==========

        // Audit Trail (historial de cambios)
        if (!db.objectStoreNames.contains("audit_trail")) {
          const auditStore = db.createObjectStore("audit_trail", {
            keyPath: "id",
            autoIncrement: true,
          });

          auditStore.createIndex("porFecha", "timestamp");
          auditStore.createIndex("porOperacion", "operation");
          auditStore.createIndex("porTabla", "table");
          auditStore.createIndex("porUsuario", "userId");
        }

        // Backups locales (cache de últimos backups)
        if (!db.objectStoreNames.contains("backups_local")) {
          const backupStore = db.createObjectStore("backups_local", {
            keyPath: "id",
            autoIncrement: true,
          });

          backupStore.createIndex("porFecha", "fecha");
          backupStore.createIndex("porTipo", "tipo");
        }

        // Configuración
        if (!db.objectStoreNames.contains("configuracion")) {
          db.createObjectStore("configuracion", { keyPath: "key" });
        }

        // Estadísticas (para dashboard)
        if (!db.objectStoreNames.contains("estadisticas")) {
          const statsStore = db.createObjectStore("estadisticas", {
            keyPath: "id",
            autoIncrement: true,
          });

          statsStore.createIndex("porFecha", "fecha");
          statsStore.createIndex("porTipo", "tipo");
        }
      },
    });
  }

  // ========== MIGRACIONES ==========
  async migrateIfNeeded() {
    // Aquí irían migraciones cuando cambie el esquema
    // Ej: v1 → v2, v2 → v3, etc.

    // Por ahora, solo log
    console.log("✅ Migraciones aplicadas (si hubiera)");
  }

  // ========== AUDIT TRAIL ==========
  async setupChangeTracking() {
    // Se llama después de cada operación CRUD
    console.log("✅ Sistema de auditoría configurado");
  }

  async logAudit(operation, table, recordId, oldValue, newValue) {
    try {
      await this.db.add("audit_trail", {
        operation,
        table,
        recordId,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        appVersion: "1.0.0",
      });
    } catch (error) {
      console.warn("⚠️ Error registrando auditoría:", error);
    }
  }

  // ========== CRUD TRABAJOS ==========
  async crearTrabajo(trabajoData) {
    const trabajo = {
      ...trabajoData,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    };

    const id = await this.db.add("trabajos", trabajo);

    await this.logAudit("CREAR", "trabajos", id, null, trabajo);
    await this.updateEstadisticas();

    return { ...trabajo, id };
  }

  async obtenerTrabajo(id) {
    return this.db.get("trabajos", id);
  }

  async obtenerTodosTrabajos(filtros = {}) {
    let trabajos = await this.db.getAll("trabajos");

    // Aplicar filtros
    if (filtros.estado) {
      trabajos = trabajos.filter((t) => t.estado === filtros.estado);
    }

    if (filtros.cliente) {
      trabajos = trabajos.filter((t) =>
        t.cliente.toLowerCase().includes(filtros.cliente.toLowerCase()),
      );
    }

    return trabajos;
  }

  async actualizarTrabajo(id, cambios) {
    const trabajo = await this.obtenerTrabajo(id);
    const oldValue = { ...trabajo };

    const trabajoActualizado = {
      ...trabajo,
      ...cambios,
      fechaActualizacion: new Date().toISOString(),
    };

    await this.db.put("trabajos", trabajoActualizado);

    await this.logAudit(
      "ACTUALIZAR",
      "trabajos",
      id,
      oldValue,
      trabajoActualizado,
    );
    await this.updateEstadisticas();

    return trabajoActualizado;
  }

  async eliminarTrabajo(id) {
    const trabajo = await this.obtenerTrabajo(id);

    // Primero eliminar tareas asociadas
    const tareasAsociadas = await this.obtenerTareasPorTrabajo(id);
    for (const tarea of tareasAsociadas) {
      await this.db.delete("tareas", tarea.id);
      await this.logAudit("ELIMINAR", "tareas", tarea.id, tarea, null);
    }

    // Luego eliminar trabajo
    await this.db.delete("trabajos", id);

    await this.logAudit("ELIMINAR", "trabajos", id, trabajo, null);
    await this.updateEstadisticas();

    return true;
  }

  async obtenerTodasTareas() {
    const db = await this.db;
    return db.getAll("tareas");
  }

  async eliminarTarea(id) {
    const db = await this.db;
    const tarea = await this.obtenerTareaPorId(id);
    await db.delete("tareas", id);
    await this.logAudit("ELIMINAR", "tareas", id, tarea, null);
    await this.updateEstadisticas();
    return true;
  }

  async obtenerTareaPorId(id) {
    const db = await this.db;
    return db.get("tareas", id);
  }

  async actualizarTarea(id, cambios) {
    const db = await this.db;
    const tarea = await this.obtenerTareaPorId(id);
    const oldValue = { ...tarea };

    // Manejar actualizaciones anidadas (ej: 'planificacion.fechaRealizada')
    const tareaActualizada = { ...tarea };

    Object.keys(cambios).forEach((key) => {
      if (key.includes(".")) {
        const [parent, child] = key.split(".");
        if (!tareaActualizada[parent]) tareaActualizada[parent] = {};
        tareaActualizada[parent][child] = cambios[key];
      } else {
        tareaActualizada[key] = cambios[key];
      }
    });

    tareaActualizada.fechaActualizacion = new Date().toISOString();

    await db.put("tareas", tareaActualizada);
    await this.logAudit("ACTUALIZAR", "tareas", id, oldValue, tareaActualizada);
    await this.updateEstadisticas();

    return tareaActualizada;
  }

  // ========== CRUD TAREAS ==========
  async crearTarea(tareaData) {
    // Asegurar que completada sea boolean
    const tarea = {
      ...tareaData,
      completada: tareaData.completada || false,
      estado: tareaData.estado || "pendiente",
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    };

    const id = await this.db.add("tareas", tarea);

    await this.logAudit("CREAR", "tareas", id, null, tarea);
    await this.updateEstadisticas();

    return { ...tarea, id };
  }

  async obtenerTareasPorTrabajo(trabajoId, filtros = {}) {
    const db = await this.db;
    const index = db.transaction("tareas").store.index("porTrabajoId");
    let tareas = await index.getAll(trabajoId);

    // Aplicar filtros adicionales (en memoria, no en índice)
    if (filtros.estado) {
      tareas = tareas.filter((t) => t.estado === filtros.estado);
    }

    if (filtros.completada !== undefined) {
      tareas = tareas.filter((t) => t.completada === filtros.completada);
    }

    return tareas;
  }

  async obtenerTareasDelDia(fecha) {
    const db = await this.db;
    // No es índice, es filtro en memoria porque fechaPlanificada está anidada
    const tareas = await db.getAll("tareas");
    return tareas.filter((t) => t.planificacion?.fechaPlanificada === fecha);
  }

  // ✅ CORREGIDO - NO usa índice getAll con boolean
  async obtenerTareasPendientes() {
    const db = await this.db;
    const tareas = await db.getAll("tareas");
    return tareas.filter((t) => t.completada === false);
  }

  // ✅ NUEVO MÉTODO ÚTIL
  async obtenerTareasCompletadas() {
    const db = await this.db;
    const tareas = await db.getAll("tareas");
    return tareas.filter((t) => t.completada === true);
  }

  // ✅ CORREGIDO - getAll simple
  async obtenerTodasTareas() {
    const db = await this.db;
    return db.getAll("tareas");
  }

  async obtenerTareaPorId(id) {
    const db = await this.db;
    return db.get("tareas", id);
  }

  async actualizarTarea(id, cambios) {
    const db = await this.db;
    const tarea = await this.obtenerTareaPorId(id);
    const oldValue = { ...tarea };

    // Manejar actualizaciones anidadas
    const tareaActualizada = { ...tarea };

    Object.keys(cambios).forEach((key) => {
      if (key.includes(".")) {
        const [parent, child] = key.split(".");
        if (!tareaActualizada[parent]) tareaActualizada[parent] = {};
        tareaActualizada[parent][child] = cambios[key];
      } else {
        tareaActualizada[key] = cambios[key];
      }
    });

    tareaActualizada.fechaActualizacion = new Date().toISOString();

    await db.put("tareas", tareaActualizada);
    await this.logAudit("ACTUALIZAR", "tareas", id, oldValue, tareaActualizada);
    await this.updateEstadisticas();

    return tareaActualizada;
  }

  async eliminarTarea(id) {
    const db = await this.db;
    const tarea = await this.obtenerTareaPorId(id);
    await db.delete("tareas", id);
    await this.logAudit("ELIMINAR", "tareas", id, tarea, null);
    await this.updateEstadisticas();
    return true;
  }

  // ========== UPDATE ESTADÍSTICAS CORREGIDO ==========
  async updateEstadisticas() {
    const db = await this.db;
    const hoy = format(new Date(), "yyyy-MM-dd");

    const tareas = await db.getAll("tareas");
    const tareasPendientes = tareas.filter((t) => t.completada === false);
    const tareasHoy = tareas.filter(
      (t) => t.planificacion?.fechaPlanificada === hoy,
    );

    const estadisticas = {
      fecha: hoy,
      tipo: "diario",
      trabajosActivos: (await this.obtenerTodosTrabajos({ estado: "activo" }))
        .length,
      trabajosTotal: (await db.getAll("trabajos")).length,
      tareasPendientes: tareasPendientes.length,
      tareasTotal: tareas.length,
      tareasCompletadasHoy: tareasHoy.filter((t) => t.completada === true)
        .length,
      ingresosEstimadosHoy: await this.calcularIngresosHoy(),
      timestamp: new Date().toISOString(),
    };

    await db.add("estadisticas", estadisticas);
  }

  // ========== BACKUP SYSTEM ==========

  async generarBackup() {
    try {
      console.log("🔄 Generando backup...");

      const backupData = {
        version: this.version,
        exportadoEn: new Date().toISOString(),
        schemaVersion: "1.0",
        datos: {
          trabajos: await this.db.getAll("trabajos"),
          tareas: await this.db.getAll("tareas"),
          configuracion: await this.db.getAll("configuracion"),
          estadisticas: await this.db.getAllFromIndex(
            "estadisticas",
            "porFecha",
          ),
        },
        metadata: {
          totalTrabajos: (await this.db.getAll("trabajos")).length,
          totalTareas: (await this.db.getAll("tareas")).length,
          ultimaAuditoria: await this.getUltimaAuditoria(),
          dispositivo: navigator.userAgent,
          espacioDisponible: await this.estimateSpace(),
        },
      };

      // Comprimir si está configurado
      let backupFinal = backupData;
      if (this.backupConfig.compressBackups) {
        const compressed = pako.deflate(JSON.stringify(backupData));
        backupFinal = {
          compressed: true,
          data: Array.from(compressed), // Convertir Uint8Array a Array para JSON
        };
      }

      // Guardar backup localmente (cache)
      await this.guardarBackupLocal(backupFinal);

      // Intentar subir a Google Drive si está configurado
      await this.subirBackupCloud(backupFinal);

      console.log("✅ Backup generado exitosamente");
      return backupFinal;
    } catch (error) {
      console.error("❌ Error generando backup:", error);
      throw error;
    }
  }

  async guardarBackupLocal(backupData) {
    const backupLocal = {
      fecha: new Date().toISOString(),
      tipo: "auto",
      data: backupData,
      tamaño: JSON.stringify(backupData).length,
    };

    await this.db.add("backups_local", backupLocal);

    // Limpiar backups antiguos (mantener solo últimos 5)
    const todosBackups = await this.db.getAllFromIndex(
      "backups_local",
      "porFecha",
    );
    if (todosBackups.length > 5) {
      const backupsAEliminar = todosBackups.slice(0, todosBackups.length - 5);
      for (const backup of backupsAEliminar) {
        await this.db.delete("backups_local", backup.id);
      }
    }
  }

  async subirBackupCloud(backupData) {
    // Esto es un placeholder - implementación real necesitaría OAuth
    console.log("☁️  Intentando subir backup a la nube...");

    try {
      console.log("☁️  Simulando subida a Google Drive...");
      // TODO: Implementar Google Drive API aquí
      // Por ahora, solo simulamos éxito
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simular delay
      console.log("✅ Backup simulado a la nube");
      return true;
    } catch (error) {
      console.warn(
        "⚠️ No se pudo subir a la nube, guardando solo local:",
        error,
      );
      return false;
    }
  }

  async restoreBackup(backupData) {
    try {
      console.log("🔄 Restaurando backup...");

      let datos;

      // Descomprimir si está comprimido
      if (backupData.compressed) {
        const uint8Array = new Uint8Array(backupData.data);
        const decompressed = pako.inflate(uint8Array, { to: "string" });
        datos = JSON.parse(decompressed);
      } else {
        datos = backupData;
      }

      // Validar estructura
      if (!datos.datos || !datos.datos.trabajos || !datos.datos.tareas) {
        throw new Error("Backup con estructura inválida");
      }

      // Limpiar datos existentes
      await this.limpiarBaseDatos();

      // Restaurar datos
      const transaction = this.db.transaction(
        ["trabajos", "tareas", "configuracion", "estadisticas"],
        "readwrite",
      );

      // Trabajos
      for (const trabajo of datos.datos.trabajos) {
        await transaction.objectStore("trabajos").add(trabajo);
      }

      // Tareas
      for (const tarea of datos.datos.tareas) {
        await transaction.objectStore("tareas").add(tarea);
      }

      // Configuración
      if (datos.datos.configuracion) {
        for (const config of datos.datos.configuracion) {
          await transaction.objectStore("configuracion").add(config);
        }
      }

      // Estadísticas
      if (datos.datos.estadisticas) {
        for (const stat of datos.datos.estadisticas) {
          await transaction.objectStore("estadisticas").add(stat);
        }
      }

      await transaction.done;

      console.log("✅ Backup restaurado exitosamente");
      return true;
    } catch (error) {
      console.error("❌ Error restaurando backup:", error);
      throw error;
    }
  }

  async limpiarBaseDatos() {
    const stores = [
      "trabajos",
      "tareas",
      "configuracion",
      "estadisticas",
      "audit_trail",
    ];

    for (const storeName of stores) {
      try {
        await this.db.clear(storeName);
      } catch (error) {
        console.warn(`⚠️ No se pudo limpiar ${storeName}:`, error);
      }
    }
  }

  // ========== AUTO BACKUP SCHEDULER ==========

  startAutoBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    // Programar primer backup inmediato
    setTimeout(() => this.generarBackup(), 5000);

    // Programar backups periódicos
    const intervalMs = this.backupConfig.backupIntervalHours * 60 * 60 * 1000;
    this.backupInterval = setInterval(() => {
      this.generarBackup();
    }, intervalMs);

    console.log(
      `🔄 Auto-backup programado cada ${this.backupConfig.backupIntervalHours} horas`,
    );
  }

  stopAutoBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      console.log("⏹️ Auto-backup detenido");
    }
  }

  // ========== ESTADÍSTICAS ==========

  async updateEstadisticas() {
    const hoy = format(new Date(), "yyyy-MM-dd");

    const estadisticas = {
      fecha: hoy,
      tipo: "diario",
      trabajosActivos: (await this.obtenerTodosTrabajos({ estado: "activo" }))
        .length,
      trabajosTotal: (await this.db.getAll("trabajos")).length,
      tareasPendientes: (await this.obtenerTareasPendientes()).length,
      tareasTotal: (await this.db.getAll("tareas")).length,
      tareasCompletadasHoy: await this.contarTareasCompletadasHoy(),
      ingresosEstimadosHoy: await this.calcularIngresosHoy(),
      timestamp: new Date().toISOString(),
    };

    await this.db.add("estadisticas", estadisticas);
  }

  async contarTareasCompletadasHoy() {
    const hoy = format(new Date(), "yyyy-MM-dd");
    const tareasHoy = await this.obtenerTareasDelDia(hoy);
    // completada es boolean, no necesitas índice aquí
    return tareasHoy.filter((t) => t.completada === true).length;
  }

  async calcularIngresosHoy() {
    // Implementación simplificada
    const hoy = format(new Date(), "yyyy-MM-dd");
    const tareasHoy = await this.obtenerTareasDelDia(hoy);

    let total = 0;
    for (const tarea of tareasHoy) {
      if (tarea.costo && tarea.costo.valor) {
        total += tarea.costo.valor;
      }
    }

    return total;
  }

  // ========== UTILIDADES ==========

  async estimateSpace() {
    const trabajos = await this.db.getAll("trabajos");
    const tareas = await this.db.getAll("tareas");

    const sizeBytes = JSON.stringify([...trabajos, ...tareas]).length;

    if (sizeBytes < 1024) return `${sizeBytes} B`;
    if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(2)} KB`;
    return `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  async getUltimaAuditoria() {
    const auditEntries = await this.db.getAllFromIndex(
      "audit_trail",
      "porFecha",
    );
    if (auditEntries.length === 0) return null;

    return auditEntries[auditEntries.length - 1].timestamp;
  }

  async getDatabaseStats() {
    return {
      trabajos: {
        total: (await this.db.getAll("trabajos")).length,
        porEstado: await this.contarPorEstado("trabajos"),
      },
      tareas: {
        total: (await this.db.getAll("tareas")).length,
        porEstado: await this.contarPorEstado("tareas"),
        porPrioridad: await this.contarPorPrioridad(),
      },
      auditoria: {
        total: (await this.db.getAll("audit_trail")).length,
        ultima: await this.getUltimaAuditoria(),
      },
      espacio: await this.estimateSpace(),
      backups: {
        locales: (await this.db.getAll("backups_local")).length,
        ultimo: await this.getUltimoBackup(),
      },
    };
  }

  async contarPorEstado(storeName) {
    const items = await this.db.getAll(storeName);
    return items.reduce((acc, item) => {
      acc[item.estado] = (acc[item.estado] || 0) + 1;
      return acc;
    }, {});
  }

  async contarPorPrioridad() {
    const tareas = await this.db.getAll("tareas");
    return tareas.reduce((acc, tarea) => {
      acc[tarea.prioridad] = (acc[tarea.prioridad] || 0) + 1;
      return acc;
    }, {});
  }

  async getUltimoBackup() {
    const backups = await this.db.getAllFromIndex("backups_local", "porFecha");
    if (backups.length === 0) return null;
    return backups[backups.length - 1];
  }

  // ========== EXPORT/IMPORT ==========

  async exportToJSON() {
    const backup = await this.generarBackup();

    // Crear blob para descarga
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agenda-backup-${format(new Date(), "yyyy-MM-dd-HHmm")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return backup;
  }

  async importFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target.result);
          await this.restoreBackup(backupData);
          resolve(true);
        } catch (error) {
          reject(new Error(`Error parseando backup: ${error.message}`));
        }
      };

      reader.onerror = () => reject(new Error("Error leyendo archivo"));
      reader.readAsText(file);
    });
  }
}

// Singleton instance
const databaseService = new DatabaseService();
export default databaseService;
