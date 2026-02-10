// src/App.js - VERSIÓN CORREGIDA
import React, { useState, useEffect } from 'react'; // ← ¡AQUÍ ESTÁ EL CAMBIO!
import './App.css';
import Tarea from './components/Tarea';

import database from './services/database';

function App() {
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [busqueda, setBusqueda] = useState('');

  const [filtroPrioridad, setFiltroPrioridad] = useState('todas');


  // En tu código, agrega:
  console.log('App cargada en móvil:', {
    ancho: window.innerWidth,
    alto: window.innerHeight,
    userAgent: navigator.userAgent
  });

  // Cargar tareas al iniciar (como en componentDidMount)
  useEffect(() => {
    cargarTareasDesdeDB();
  }, []);

  const cargarTareasDesdeDB = async () => {
    try {
      setCargando(true);
      const tareasDB = await database.obtenerTodasTareas();
      setTareas(tareasDB);
    } catch (error) {
      console.error('Error cargando tareas:', error);
      // Fallback a datos locales
      setTareas([/* datos de ejemplo */]);
    } finally {
      setCargando(false);
    }
  };

  const handleAgregarTarea = async () => {
    const nuevaTarea = {
      titulo: `Nueva tarea ${tareas.length + 1}`,
      descripcion: "Descripción de ejemplo",
      fecha: new Date().toISOString().split('T')[0],
      completada: false,
      prioridad: "media",
      trabajoId: 1
    };

    try {
      // Guardar en IndexedDB
      const id = await database.agregarTarea(nuevaTarea);
      
      // Actualizar estado local
      setTareas([...tareas, { ...nuevaTarea, id }]);
    } catch (error) {
      console.error('Error guardando tarea:', error);
      alert('Error al guardar la tarea');
    }
  };

  const handleEliminarTarea = async (id) => {
    try {
      // Eliminar de IndexedDB
      await database.eliminarTarea(id);
      
      // Eliminar del estado local
      setTareas(tareas.filter(tarea => tarea.id !== id));
    } catch (error) {
      console.error('Error eliminando tarea:', error);
    }
  };


  // useEffect - Se ejecuta cuando el componente se monta ([] = solo al inicio)
  useEffect(() => {
    // Aquí iría la carga real desde IndexedDB
    console.log('Componente montado - Cargando tareas...');
    
    // Simulamos una carga asíncrona
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      console.log('Tareas cargadas');
    }, 500);
    
    // Este return es opcional, para limpieza (como componentWillUnmount)
    return () => {
      console.log('Componente desmontado - Limpiando...');
    };
  }, []); // Array vacío = solo al montar

  const handleEditarTarea = (id) => {
    alert(`Editar tarea con ID: ${id}`);
  };

  const handleCompletarTarea = (id) => {
    setTareas(tareas.map(tarea => 
      tarea.id === id 
        ? { ...tarea, completada: !tarea.completada }
        : tarea
    ));
  };

  // Si está cargando, mostrar spinner
  if (cargando) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="cargando">
            <h2>🔄 Cargando tareas...</h2>
            <div className="spinner"></div>
          </div>
        </header>
      </div>
    );
  }
/**
  // Filtra tareas:
const tareasFiltradas = tareas.filter(tarea => 
  tarea.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
  tarea.descripcion.toLowerCase().includes(busqueda.toLowerCase())
);
 */

  const tareasFiltradas = tareas.filter(tarea => 
  filtroPrioridad === 'todas' || tarea.prioridad === filtroPrioridad
);

  return (
    <div className="App">
      <header className="App-header">
        <h1>📋 Gestor de Tareas por Trabajo</h1>
        <p>PWA con React - Proyecto de Tesis</p>
        
        <div className="estadisticas">
          <p>
            Total: {tareas.length} | 
            Completadas: {tareas.filter(t => t.completada).length} | 
            Pendientes: {tareas.filter(t => !t.completada).length}
          </p>
        </div>
        

<input 
  type="text"
  placeholder="🔍 Buscar tareas..."
  value={busqueda}
  onChange={(e) => setBusqueda(e.target.value)}
/>

<select onChange={(e) => setFiltroPrioridad(e.target.value)}>
  <option value="todas">Todas las prioridades</option>
  <option value="alta">Alta prioridad</option>
  <option value="media">Media prioridad</option>
  <option value="baja">Baja prioridad</option>
</select>

        <button 
          onClick={handleAgregarTarea}
          className="btn-agregar"
        >
          ➕ Agregar Tarea de Prueba
        </button>
        
        <div className="lista-tareas">
          <h2>Tareas del Trabajo #1</h2>
          
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
        
        <div className="roadmap">
          <h3>🚀 Próximas Funcionalidades:</h3>
          <ul>
            <li>✅ Componente Tarea creado</li>
            <li>⬜ Convertir a PWA (Service Worker)</li>
            <li>⬜ IndexedDB para persistencia</li>
            <li>⬜ Componente Trabajo con múltiples tareas</li>
            <li>⬜ Integración con Gemini API</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;