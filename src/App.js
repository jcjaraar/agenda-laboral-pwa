// src/App.js - VERSIÓN CORREGIDA Y OPTIMIZADA
import React, { useState, useEffect } from "react";
import "./App.css";
import databaseService from "./services/DatabaseService";
import BackupManager from "./components/backup/BackupManager";

// Componentes nuevos
import TrabajoList from "./components/trabajos/TrabajoList";
import Dashboard from "./components/dashboard/Dashboard";
import VozATarea from "./components/ia/VozATarea";
import ContactoCard from "./components/contacto/ContactoCard";
import UbicacionCard from "./components/ubicacion/UbicacionCard";
import VistaSemanal from "./components/vista/VistaSemanal";
import Tarea from "./components/Tarea";

function App() {
  // ========== ESTADOS PRINCIPALES ==========
  const [trabajos, setTrabajos] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [trabajoSeleccionado, setTrabajoSeleccionado] = useState(null);

  // Estados de UI
  const [dbInitialized, setDbInitialized] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // ========== INICIALIZACIÓN ==========
  useEffect(() => {
    inicializarApp();
  }, []);

  const inicializarApp = async () => {
    try {
      setCargando(true);
      setError(null);

      // 1. Inicializar base de datos
      await databaseService.init();
      console.log("✅ Base de datos inicializada");

      // 2. Cargar datos desde IndexedDB
      await cargarDatosDesdeDB();

      // ✅ ACÁ LO PONÉS - Cuando arranca la app, mostrás las tareas
      //await databaseService.debugQuery("todas");
      //await databaseService.debugQuery("pendientes");

      setDbInitialized(true);
    } catch (error) {
      console.error("❌ Error inicializando app:", error);
      setError("Error al conectar con la base de datos");
    } finally {
      setCargando(false);
    }
  };

  // ========== CARGA DE DATOS ==========
  const cargarDatosDesdeDB = async () => {
    try {
      // Cargar trabajos
      const trabajosDB = await databaseService.obtenerTodosTrabajos();
      console.log(`📋 ${trabajosDB.length} trabajos cargados`);

      // Cargar todas las tareas
      const tareasDB = await databaseService.obtenerTodasTareas();
      console.log(`📝 ${tareasDB.length} tareas cargadas`);

      // Actualizar estado local
      setTrabajos(trabajosDB);
      setTareas(tareasDB);

      // Si no hay datos, cargar datos de ejemplo
      if (trabajosDB.length === 0) {
        await cargarDatosEjemplo();
      }
    } catch (error) {
      console.error("❌ Error cargando datos:", error);
      throw error;
    }
  };

  // ========== DATOS DE EJEMPLO ==========
  // ========== DATOS DE PRUEBA COMPLETOS ==========
  const cargarDatosEjemplo = async () => {
    console.log("📂 Cargando datos de prueba completos...");

    // ===== 1. LIMPIAR DATOS EXISTENTES =====
    try {
      await databaseService.limpiarBaseDatos();
      console.log("🧹 Base de datos limpiada");
    } catch (error) {
      console.warn("⚠️ No se pudo limpiar, continuando...");
    }

    // ===== 2. CREAR 3 TRABAJOS CON DIFERENTES CLIENTES =====
    const trabajo1 = await databaseService.crearTrabajo({
      nombre: "Desarrollo App Tesis",
      cliente: "Universidad Nacional",
      descripcion: "Aplicación PWA con IA y backup automático",
      estado: "activo",
      contacto: {
        telefono: "1144445555",
        email: "tesis@edu.ar",
        whatsapp: "1144445555",
      },
      ubicacion: {
        direccion: "Av. Siempre Viva 123",
        coordenadas: { lat: -34.6037, lng: -58.3816 },
        transporte: { colectivos: ["15", "29", "111"], tiempoEstimado: 45 },
      },
      costo: { valorHora: 2500, moneda: "ARS" },
    });

    const trabajo2 = await databaseService.crearTrabajo({
      nombre: "Mantenimiento Red",
      cliente: "Clínica Salud Total",
      descripcion: "Actualización de servidores y backups",
      estado: "activo",
      contacto: {
        telefono: "1155556666",
        email: "sistemas@clinica.com",
        whatsapp: "1155556666",
      },
      ubicacion: {
        direccion: "Av. Corrientes 2345",
        coordenadas: { lat: -34.6033, lng: -58.3812 },
        transporte: { colectivos: ["5", "12", "60"], tiempoEstimado: 30 },
      },
      costo: { valorHora: 3200, moneda: "ARS" },
    });

    const trabajo3 = await databaseService.crearTrabajo({
      nombre: "E-commerce",
      cliente: "Tienda Don Pepe",
      descripcion: "Tienda online con carrito y pagos",
      estado: "activo",
      contacto: {
        telefono: "1166667777",
        email: "donpepe@tienda.com",
        whatsapp: "1166667777",
      },
      ubicacion: {
        direccion: "Cabildo 3456",
        coordenadas: { lat: -34.5591, lng: -58.4662 },
        transporte: { colectivos: ["57", "60", "161"], tiempoEstimado: 50 },
      },
      costo: { valorHora: 2800, moneda: "ARS" },
    });

    // ===== 3. FECHAS PARA LAS TAREAS =====
    const hoy = new Date().toISOString().split("T")[0];
    const manana = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const pasado = new Date(Date.now() + 172800000).toISOString().split("T")[0];
    const dia4 = new Date(Date.now() + 259200000).toISOString().split("T")[0];
    const dia5 = new Date(Date.now() + 345600000).toISOString().split("T")[0];
    const dia6 = new Date(Date.now() + 432000000).toISOString().split("T")[0];
    const dia7 = new Date(Date.now() + 518400000).toISOString().split("T")[0];

    // ===== 4. TAREAS PARA HOY (3 tareas, 3 trabajos) =====
    await databaseService.crearTarea({
      trabajoId: trabajo1.id,
      titulo: "Revisión de interfaz",
      descripcion: "Corregir bugs en componente Tarea",
      planificacion: {
        fechaPlanificada: hoy,
        horaPlanificada: "09:00",
        duracionPlanificada: 90,
      },
      prioridad: "alta",
      estado: "pendiente",
      completada: false,
    });

    await databaseService.crearTarea({
      trabajoId: trabajo2.id,
      titulo: "Backup diario",
      descripcion: "Verificar logs de respaldo",
      planificacion: {
        fechaPlanificada: hoy,
        horaPlanificada: "11:30",
        duracionPlanificada: 45,
      },
      prioridad: "media",
      estado: "pendiente",
      completada: false,
    });

    await databaseService.crearTarea({
      trabajoId: trabajo3.id,
      titulo: "Actualizar catálogo",
      descripcion: "Subir 50 productos nuevos",
      planificacion: {
        fechaPlanificada: hoy,
        horaPlanificada: "14:15",
        duracionPlanificada: 120,
      },
      prioridad: "alta",
      estado: "pendiente",
      completada: false,
    });

    // ===== 5. TAREAS PARA MAÑANA (2 tareas) =====
    await databaseService.crearTarea({
      trabajoId: trabajo1.id,
      titulo: "Testing de componentes",
      descripcion: "Pruebas unitarias con Jest",
      planificacion: {
        fechaPlanificada: manana,
        horaPlanificada: "10:00",
        duracionPlanificada: 180,
      },
      prioridad: "alta",
      estado: "pendiente",
      completada: false,
    });

    await databaseService.crearTarea({
      trabajoId: trabajo2.id,
      titulo: "Reunión con cliente",
      descripcion: "Presentar avances del mes",
      planificacion: {
        fechaPlanificada: manana,
        horaPlanificada: "15:30",
        duracionPlanificada: 60,
      },
      prioridad: "alta",
      estado: "pendiente",
      completada: false,
    });

    // ===== 6. TAREAS PARA PASADO (1 tarea) =====
    await databaseService.crearTarea({
      trabajoId: trabajo3.id,
      titulo: "Configurar pasarela de pagos",
      descripcion: "Integrar MercadoPago",
      planificacion: {
        fechaPlanificada: pasado,
        horaPlanificada: "09:45",
        duracionPlanificada: 240,
      },
      prioridad: "alta",
      estado: "pendiente",
      completada: false,
    });

    // ===== 7. DÍA 4 - SIN TAREAS (intencionalmente vacío) =====

    // ===== 8. DÍA 5 - DOS TAREAS DEL MISMO TRABAJO =====
    await databaseService.crearTarea({
      trabajoId: trabajo1.id,
      titulo: "Documentación técnica",
      descripcion: "Escribir manual de usuario",
      planificacion: {
        fechaPlanificada: dia5,
        horaPlanificada: "10:00",
        duracionPlanificada: 120,
      },
      prioridad: "media",
      estado: "pendiente",
      completada: false,
    });

    await databaseService.crearTarea({
      trabajoId: trabajo1.id,
      titulo: "Preparar presentación",
      descripcion: "Slides para defensa de tesis",
      planificacion: {
        fechaPlanificada: dia5,
        horaPlanificada: "14:00",
        duracionPlanificada: 90,
      },
      prioridad: "alta",
      estado: "pendiente",
      completada: false,
    });

    // ===== 9. DÍA 6 - TAREA COMPLETADA (para probar estado) =====
    await databaseService.crearTarea({
      trabajoId: trabajo2.id,
      titulo: "Mantenimiento preventivo",
      descripcion: "Limpieza de servidores",
      planificacion: {
        fechaPlanificada: dia6,
        horaPlanificada: "08:30",
        duracionPlanificada: 120,
        fechaRealizada: dia6,
        horaRealizada: "10:30",
      },
      prioridad: "media",
      estado: "realizada_cobrada",
      completada: true,
    });

    // ===== 10. DÍA 7 - TAREA CANCELADA =====
    await databaseService.crearTarea({
      trabajoId: trabajo3.id,
      titulo: "Rediseño de logo",
      descripcion: "Cliente canceló el proyecto",
      planificacion: {
        fechaPlanificada: dia7,
        horaPlanificada: "16:00",
        duracionPlanificada: 180,
      },
      prioridad: "baja",
      estado: "cancelada",
      completada: false,
    });

    // ===== 11. ALGUNAS TAREAS COMPLETADAS EN EL PASADO =====
    const semanaPasada = new Date(Date.now() - 604800000)
      .toISOString()
      .split("T")[0];

    await databaseService.crearTarea({
      trabajoId: trabajo1.id,
      titulo: "Configurar entorno",
      descripcion: "Instalar dependencias y herramientas",
      planificacion: {
        fechaPlanificada: semanaPasada,
        horaPlanificada: "09:00",
        duracionPlanificada: 120,
        fechaRealizada: semanaPasada,
        horaRealizada: "11:00",
      },
      prioridad: "alta",
      estado: "realizada_cobrada",
      completada: true,
    });

    console.log("✅ Datos de prueba completos cargados:");
    console.log(`- ${3} trabajos activos`);
    console.log(`- Total tareas: 11`);
    console.log(`  • Hoy: 3 tareas (1 por trabajo)`);
    console.log(`  • Mañana: 2 tareas`);
    console.log(`  • +2 días: 1 tarea`);
    console.log(`  • +4 días: 2 tareas (mismo trabajo)`);
    console.log(`  • +5 días: 1 tarea completada`);
    console.log(`  • +6 días: 1 tarea cancelada`);
    console.log(`  • Semana pasada: 1 tarea completada`);
  };

  // ========== CRUD TRABAJOS ==========
  const handleCrearTrabajo = async (nuevoTrabajo) => {
    try {
      setError(null);
      const trabajoCreado = await databaseService.crearTrabajo(nuevoTrabajo);

      // ACTUALIZAR ESTADO LOCAL - INMUTABLE
      setTrabajos((prev) => [...prev, trabajoCreado]);

      console.log("✅ Trabajo creado:", trabajoCreado);
      return trabajoCreado;
    } catch (error) {
      console.error("❌ Error creando trabajo:", error);
      setError("Error al crear el trabajo");
      throw error;
    }
  };

  const handleActualizarTrabajo = async (id, cambios) => {
    try {
      setError(null);
      const trabajoActualizado = await databaseService.actualizarTrabajo(
        id,
        cambios,
      );

      // ACTUALIZAR ESTADO LOCAL - INMUTABLE
      setTrabajos((prev) =>
        prev.map((t) => (t.id === id ? trabajoActualizado : t)),
      );

      console.log("✅ Trabajo actualizado:", trabajoActualizado);
      return trabajoActualizado;
    } catch (error) {
      console.error("❌ Error actualizando trabajo:", error);
      setError("Error al actualizar el trabajo");
      throw error;
    }
  };

  const handleEliminarTrabajo = async (id) => {
    if (!window.confirm("¿Eliminar este trabajo y TODAS sus tareas?")) return;

    try {
      setError(null);
      await databaseService.eliminarTrabajo(id);

      // ACTUALIZAR ESTADO LOCAL - INMUTABLE
      setTrabajos((prev) => prev.filter((t) => t.id !== id));
      setTareas((prev) => prev.filter((t) => t.trabajoId !== id));

      if (trabajoSeleccionado === id) {
        setTrabajoSeleccionado(null);
      }

      console.log("✅ Trabajo eliminado:", id);
    } catch (error) {
      console.error("❌ Error eliminando trabajo:", error);
      setError("Error al eliminar el trabajo");
    }
  };

  // ========== CRUD TAREAS ==========
  const handleCrearTarea = async (nuevaTarea) => {
    try {
      setError(null);

      // Asegurar estructura correcta
      const tareaCompleta = {
        ...nuevaTarea,
        trabajoId: nuevaTarea.trabajoId || trabajoSeleccionado || 1,
        planificacion: nuevaTarea.planificacion || {
          fechaPlanificada: new Date().toISOString().split("T")[0],
          horaPlanificada: "09:00",
          duracionPlanificada: 60,
        },
        estado: nuevaTarea.estado || "pendiente",
        completada: nuevaTarea.completada || false,
        prioridad: nuevaTarea.prioridad || "media",
        fechaCreacion: new Date().toISOString(),
      };

      console.log("📝 Creando tarea:", tareaCompleta);

      const tareaCreada = await databaseService.crearTarea(tareaCompleta);
      console.log("✅ Tarea creada en DB:", tareaCreada);

      // ✅ Y mostramos TODAS las tareas para ver el estado actual
      //await databaseService.debugQuery("todas");

      // ACTUALIZAR ESTADO LOCAL - INMUTABLE
      setTareas((prev) => {
        const nuevasTareas = [...prev, tareaCreada];
        console.log(`📊 Estado actualizado: ${nuevasTareas.length} tareas`);
        return nuevasTareas;
      });

      return tareaCreada;
    } catch (error) {
      console.error("❌ Error detallado creando tarea:", error);
      setError(`Error al guardar la tarea: ${error.message}`);
      throw error;
    }
  };

  const handleActualizarTarea = async (id, cambios) => {
    try {
      setError(null);
      const tareaActualizada = await databaseService.actualizarTarea(
        id,
        cambios,
      );

      // ACTUALIZAR ESTADO LOCAL - INMUTABLE
      setTareas((prev) =>
        prev.map((t) => (t.id === id ? tareaActualizada : t)),
      );

      console.log("✅ Tarea actualizada:", tareaActualizada);
      return tareaActualizada;
    } catch (error) {
      console.error("❌ Error actualizando tarea:", error);
      setError("Error al actualizar la tarea");
      throw error;
    }
  };

  const handleEliminarTarea = async (id) => {
    if (!window.confirm("¿Eliminar esta tarea?")) return;

    try {
      setError(null);
      await databaseService.eliminarTarea(id);

      // ACTUALIZAR ESTADO LOCAL - INMUTABLE
      setTareas((prev) => prev.filter((t) => t.id !== id));

      console.log("✅ Tarea eliminada:", id);
    } catch (error) {
      console.error("❌ Error eliminando tarea:", error);
      setError("Error al eliminar la tarea");
    }
  };

  const handleCompletarTarea = async (id) => {
    try {
      const tarea = tareas.find((t) => t.id === id);
      if (!tarea) return;

      const nuevoEstado = !tarea.completada;
      const estadoTexto = nuevoEstado
        ? "realizada_pendiente_pago"
        : "pendiente";

      await handleActualizarTarea(id, {
        completada: nuevoEstado,
        estado: estadoTexto,
        "planificacion.fechaRealizada": nuevoEstado
          ? new Date().toISOString().split("T")[0]
          : null,
        "planificacion.horaRealizada": nuevoEstado
          ? new Date().toLocaleTimeString().slice(0, 5)
          : null,
      });
    } catch (error) {
      console.error("❌ Error completando tarea:", error);
    }
  };

  // ========== MÉTODO FALTANTE EN DATABASE SERVICE ==========
  // AGREGAR ESTO TEMPORALMENTE HASTA QUE IMPLEMENTES obtenerTodasTareas()
  useEffect(() => {
    // Parche temporal para que funcione mientras implementas obtenerTodasTareas
    if (!databaseService.obtenerTodasTareas) {
      databaseService.obtenerTodasTareas = async function () {
        const db = await this.db;
        return db.getAll("tareas");
      };
      console.log("🔄 Parche temporal: obtenerTodasTareas agregado");
    }
  }, []);

  // ========== HANDLERS DE IA/VOZ ==========
  const handleTareaCreadaPorVoz = async (datosIA) => {
    try {
      // Usar trabajo seleccionado o el primero disponible
      const trabajoId = trabajoSeleccionado || trabajos[0]?.id || 1;

      const nuevaTarea = {
        trabajoId,
        titulo: datosIA.titulo || "Tarea por voz",
        descripcion: datosIA.descripcion || datosIA.textoOriginal || "",
        planificacion: {
          fechaPlanificada:
            datosIA.fecha || new Date().toISOString().split("T")[0],
          horaPlanificada: datosIA.hora || "09:00",
          duracionPlanificada: datosIA.duracion || 60,
        },
        costo: datosIA.costo ? { valor: datosIA.costo } : null,
        prioridad: datosIA.prioridad || "media",
        estado: "pendiente",
        completada: false,
      };

      await handleCrearTarea(nuevaTarea);
    } catch (error) {
      console.error("❌ Error procesando tarea por voz:", error);
      alert("Error al crear la tarea por voz");
    }
  };

  // ========== RENDERIZADO CONDICIONAL ==========
  if (cargando) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="cargando">
            <h2>🔄 Cargando aplicación...</h2>
            <div className="spinner"></div>
            <p>Inicializando base de datos</p>
          </div>
        </header>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="error">
            <h2>❌ Error</h2>
            <p>{error}</p>
            <button onClick={inicializarApp} className="btn-reintentar">
              🔄 Reintentar
            </button>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>📋 Agenda Laboral PWA</h1>
        <p>Sistema de gestión profesional con IA</p>

        {/* Estado de la base de datos */}
        <div className="db-status">
          {dbInitialized ? "✅ Base de datos conectada" : "⏳ Conectando..."}
        </div>

        {/* DASHBOARD - Vista rápida */}
        <Dashboard
          trabajos={trabajos}
          tareas={tareas}
          onSeleccionarTrabajo={setTrabajoSeleccionado}
        />

        {/* SISTEMA DE VOZ/IA */}
        <VozATarea
          onTareaCreada={handleTareaCreadaPorVoz}
          trabajos={trabajos}
          trabajoSeleccionado={trabajoSeleccionado}
        />

        {/* LISTA DE TRABAJOS */}
        <TrabajoList
          trabajos={trabajos}
          tareasPorTrabajo={tareas}
          onSelectTrabajo={setTrabajoSeleccionado}
          onEditTrabajo={(id) => console.log("Editar trabajo:", id)}
          onDeleteTrabajo={handleEliminarTrabajo}
          onAddTarea={() =>
            handleCrearTarea({ trabajoId: trabajoSeleccionado })
          }
          onTareaCompletar={handleCompletarTarea}
          onTareaEliminar={handleEliminarTarea}
        />

        {/* VISTA SEMANAL (3 meses) */}
        {trabajos.length > 0 && (
          <VistaSemanal
            trabajos={trabajos}
            tareas={tareas}
            fechaInicio={new Date()}
          />
        )}

        {/* DETALLE DEL TRABAJO SELECCIONADO */}
        {trabajoSeleccionado && (
          <div className="trabajo-detalle">
            <h2>📌 Detalle del Trabajo</h2>

            {/* CONTACTO */}
            {trabajos.find((t) => t.id === trabajoSeleccionado) && (
              <>
                <ContactoCard
                  trabajo={trabajos.find((t) => t.id === trabajoSeleccionado)}
                />

                {/* UBICACIÓN */}
                <UbicacionCard
                  trabajo={trabajos.find((t) => t.id === trabajoSeleccionado)}
                />
              </>
            )}

            {/* TAREAS DEL TRABAJO */}
            <div className="tareas-trabajo">
              <h3>
                Tareas pendientes
                <button
                  onClick={() =>
                    handleCrearTarea({ trabajoId: trabajoSeleccionado })
                  }
                  className="btn-agregar-tarea-pequeno"
                >
                  ➕ Nueva tarea
                </button>
              </h3>

              {tareas.filter(
                (t) => t.trabajoId === trabajoSeleccionado && !t.completada,
              ).length === 0 ? (
                <p className="sin-tareas">✨ No hay tareas pendientes</p>
              ) : (
                tareas
                  .filter(
                    (t) => t.trabajoId === trabajoSeleccionado && !t.completada,
                  )
                  .map((tarea) => (
                    <Tarea
                      key={tarea.id}
                      tarea={tarea}
                      onEliminar={handleEliminarTarea}
                      onEditar={(id) => console.log("Editar tarea:", id)}
                      onCompletar={handleCompletarTarea}
                    />
                  ))
              )}
            </div>
          </div>
        )}

        {/* PANEL DE BACKUP */}
        <div className="admin-section">
          <details>
            <summary>⚙️ Administración y Backup</summary>
            <BackupManager />
          </details>
        </div>

        {/* DEBUG INFO (solo desarrollo) */}
        {process.env.NODE_ENV === "development" && (
          <details className="debug-info">
            <summary>🐛 Debug Info</summary>
            <pre>
              {JSON.stringify(
                {
                  trabajos: trabajos.length,
                  tareas: tareas.length,
                  trabajoSeleccionado,
                  dbInitialized,
                },
                null,
                2,
              )}
            </pre>
          </details>
        )}
      </header>
    </div>
  );
}

// ========== DEBUG GLOBAL ==========
if (process.env.NODE_ENV === "development") {
  window.databaseService = databaseService;
  window.dbDebug = {
    clear: async () => {
      await indexedDB.deleteDatabase("AgendaLaboralDB");
      console.log("🗑️ DB eliminada. Recarga F5");
    },
    tareas: async () => {
      const tareas = await databaseService.obtenerTodasTareas();
      console.table(tareas);
      return tareas;
    },
    trabajos: async () => {
      const trabajos = await databaseService.obtenerTodosTrabajos();
      console.table(trabajos);
      return trabajos;
    },
    pendientes: async () => {
      const pendientes = await databaseService.obtenerTareasPendientes();
      console.table(pendientes);
      return pendientes;
    },
  };
  console.log("🐛 DEBUG: window.databaseService y window.dbDebug listos");
}

export default App;
