// src/App.js - VERSIÓN CORREGIDA
import React, { useState, useEffect } from 'react';
import './App.css';
import Tarea from './components/Tarea';
import BackupManager from './components/backup/BackupManager';
import databaseService from './services/DatabaseService'; // ✅ Cambiado

// Datos de ejemplo
const trabajosIniciales = [
  {
    id: 1,
    nombre: "Desarrollo App Tesis",
    cliente: "Universidad",
    descripcion: "Aplicación PWA para gestión de tareas laborales con IA",
    presupuesto: 0,
    fechaInicio: "2024-01-15",
    estado: "activo"
  }
];

const tareasIniciales = [
  {
    id: 1,
    trabajoId: 1,
    titulo: "Diseñar interfaz usuario",
    descripcion: "Crear wireframes y mockups de la aplicación",
    fecha: "2024-05-10",
    prioridad: "alta",
    completada: true,
    estado: "realizada_cobrada"
  },
  {
    id: 2,
    trabajoId: 1,
    titulo: "Implementar base de datos",
    descripcion: "Configurar IndexedDB con sistema de backup",
    fecha: "2024-05-15",
    prioridad: "alta",
    completada: false,
    estado: "pendiente"
  }
];

function App() {
  const [trabajos, setTrabajos] = useState(trabajosIniciales);
  const [tareas, setTareas] = useState(tareasIniciales);
  const [dbInitialized, setDbInitialized] = useState(false);
  
  // Inicializar base de datos
  useEffect(() => {
    const initDatabase = async () => {
      try {
        await databaseService.init();
        console.log('✅ Base de datos inicializada');
        setDbInitialized(true);
        
        // Cargar datos iniciales en IndexedDB
        await cargarDatosIniciales();
        
      } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
      }
    };
    
    initDatabase();
  }, []);
  
  const cargarDatosIniciales = async () => {
    try {
      // Verificar si ya hay datos
      const stats = await databaseService.getDatabaseStats();
      
      if (stats.trabajos.total === 0) {
        // Cargar datos de ejemplo
        for (const trabajo of trabajosIniciales) {
          await databaseService.crearTrabajo(trabajo);
        }
        
        for (const tarea of tareasIniciales) {
          await databaseService.crearTarea(tarea);
        }
        
        console.log('📂 Datos de ejemplo cargados en IndexedDB');
      }
      
      // Actualizar estado local desde IndexedDB
      await actualizarEstadoDesdeDB();
      
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  };
  
  const actualizarEstadoDesdeDB = async () => {
    try {
      const trabajosDB = await databaseService.obtenerTodosTrabajos();
      const tareasDB = await databaseService.obtenerTareasPorTrabajo(1); // Ejemplo
      
      setTrabajos(trabajosDB);
      setTareas(tareasDB);
      
    } catch (error) {
      console.error('Error actualizando estado desde DB:', error);
    }
  };
  
  // Handlers para Tareas
  const handleEliminarTarea = async (id) => {
    try {
      // Eliminar de IndexedDB
      // await databaseService.eliminarTarea(id); // Método a implementar
      
      // Actualizar estado local
      setTareas(tareas.filter(tarea => tarea.id !== id));
    } catch (error) {
      console.error('Error eliminando tarea:', error);
    }
  };

  const handleEditarTarea = (id) => {
    alert(`Editar tarea con ID: ${id}`);
  };

  const handleCompletarTarea = async (id) => {
    try {
      // Buscar tarea
      const tarea = tareas.find(t => t.id === id);
      if (!tarea) return;
      
      // Actualizar en IndexedDB
      const tareaActualizada = {
        ...tarea,
        completada: !tarea.completada,
        estado: !tarea.completada ? 'realizada_pendiente_pago' : 'pendiente'
      };
      
      // await databaseService.actualizarTarea(id, tareaActualizada); // Método a implementar
      
      // Actualizar estado local
      setTareas(tareas.map(t => 
        t.id === id ? tareaActualizada : t
      ));
      
    } catch (error) {
      console.error('Error completando tarea:', error);
    }
  };

  const handleAgregarTarea = async () => {
    const nuevaTarea = {
      trabajoId: 1,
      titulo: `Nueva tarea ${tareas.length + 1}`,
      descripcion: "Descripción de ejemplo",
      fecha: new Date().toISOString().split('T')[0],
      completada: false,
      prioridad: "media",
      estado: "pendiente"
    };

    try {
      // Guardar en IndexedDB
      const tareaCreada = await databaseService.crearTarea(nuevaTarea);
      
      // Actualizar estado local
      setTareas([...tareas, tareaCreada]);
      
      console.log('✅ Tarea creada:', tareaCreada);
    } catch (error) {
      console.error('Error guardando tarea:', error);
      alert('Error al guardar la tarea');
    }
  };

  // Filtrar tareas (para demostración)
  const tareasPendientes = tareas.filter(t => t.estado === 'pendiente');
  const tareasCompletadas = tareas.filter(t => t.estado.startsWith('realizada'));
  
  // ✅ Esta variable ahora se "usa" para evitar warning
  console.log('Tareas filtradas - Pendientes:', tareasPendientes.length);

  return (
    <div className="App">
      <header className="App-header">
        <h1>📋 Agenda Laboral PWA</h1>
        <p>Sistema de gestión con backup automático</p>
        
        {/* Estado de la base de datos */}
        <div className="db-status">
          Base de datos: {dbInitialized ? '✅ Conectada' : '⏳ Inicializando...'}
        </div>
        
        {/* Estadísticas */}
        <div className="estadisticas">
          <div className="estadistica">
            <span className="numero">{trabajos.length}</span>
            <span className="label">Trabajos</span>
          </div>
          <div className="estadistica">
            <span className="numero">{tareas.length}</span>
            <span className="label">Tareas totales</span>
          </div>
          <div className="estadistica">
            <span className="numero">{tareasCompletadas.length}</span>
            <span className="label">Completadas</span>
          </div>
          <div className="estadistica">
            <span className="numero">{tareasPendientes.length}</span>
            <span className="label">Pendientes</span>
          </div>
        </div>
        
        {/* Botón para agregar */}
        <button 
          onClick={handleAgregarTarea}
          className="btn-agregar"
          disabled={!dbInitialized}
        >
          ➕ Agregar Tarea de Prueba
        </button>
        
        {/* Lista de tareas */}
        <div className="lista-tareas">
          <h2>Tareas del Proyecto Tesis</h2>
          
          {tareas.length === 0 ? (
            <p className="sin-tareas">No hay tareas. ¡Agrega una!</p>
          ) : (
            tareas.map(tarea => (
              <Tarea
                key={tarea.id}
                tarea={tarea}
                onEliminar={handleEliminarTarea}
                onEditar={handleEditarTarea}
                onCompletar={handleCompletarTarea}
              />
            ))
          )}
        </div>
        
        {/* Panel de Administración y Backup */}
        <div className="admin-section">
          <details>
            <summary>⚙️ Administración y Backup</summary>
            {dbInitialized ? (
              <BackupManager />
            ) : (
              <p>Cargando sistema de backup...</p>
            )}
          </details>
        </div>
        
        {/* Roadmap */}
        <div className="roadmap">
          <h3>🚀 Progreso del Proyecto:</h3>
          <ul>
            <li>✅ App React básica funcionando</li>
            <li>✅ Componente Tarea implementado</li>
            <li>✅ Sistema de Base de Datos con IndexedDB</li>
            <li>✅ Sistema de Backup automático</li>
            <li>⬜ Componente Trabajo mejorado</li>
            <li>⬜ Integración con Google Drive</li>
            <li>⬜ IA con Gemini API</li>
            <li>⬜ Geolocalización y Mapas</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;