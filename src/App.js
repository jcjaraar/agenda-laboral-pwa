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
  const cargarDatosEjemplo = async () => {
    console.log("📂 Cargando datos de ejemplo...");

    // Trabajo de ejemplo
    const trabajoEjemplo = {
      nombre: "Desarrollo App Tesis",
      cliente: "Universidad",
      descripcion: "Aplicación PWA para gestión de tareas laborales con IA",
      estado: "activo",
      contacto: {
        telefono: "123456789",
        email: "cliente@universidad.edu",
        whatsapp: "123456789",
      },
      ubicacion: {
        direccion: "Av. Siempre Viva 123",
        coordenadas: { lat: -34.6037, lng: -58.3816 },
        transporte: {
          colectivos: ["15", "29", "111"],
          tiempoEstimado: 45,
        },
      },
      costo: {
        valorHora: 1500,
        moneda: "ARS",
      },
    };

    const trabajoCreado = await databaseService.crearTrabajo(trabajoEjemplo);

    // Tareas de ejemplo
    const tareasEjemplo = [
      {
        trabajoId: trabajoCreado.id,
        titulo: "Diseñar interfaz principal",
        descripcion: "Crear wireframes y mockups",
        planificacion: {
          fechaPlanificada: new Date().toISOString().split("T")[0],
          horaPlanificada: "10:00",
          duracionPlanificada: 120,
        },
        prioridad: "alta",
        estado: "pendiente",
        completada: false,
      },
      {
        trabajoId: trabajoCreado.id,
        titulo: "Implementar base de datos",
        descripcion: "Configurar IndexedDB con backup",
        planificacion: {
          fechaPlanificada: new Date().toISOString().split("T")[0],
          horaPlanificada: "14:00",
          duracionPlanificada: 180,
        },
        prioridad: "alta",
        estado: "pendiente",
        completada: false,
      },
      {
        trabajoId: trabajoCreado.id,
        titulo: "Integrar Gemini API",
        descripcion: "Conectar con IA para procesamiento de voz",
        planificacion: {
          fechaPlanificada: new Date(Date.now() + 86400000)
            .toISOString()
            .split("T")[0],
          horaPlanificada: "09:00",
          duracionPlanificada: 240,
        },
        prioridad: "media",
        estado: "pendiente",
        completada: false,
      },
    ];

    for (const tarea of tareasEjemplo) {
      await databaseService.crearTarea(tarea);
    }

    // Recargar datos
    await cargarDatosDesdeDB();
    console.log("✅ Datos de ejemplo cargados");
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
