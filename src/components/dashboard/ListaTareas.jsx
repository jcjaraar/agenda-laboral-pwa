import React, { useState, useEffect } from 'react';
import databaseService from '../../services/DatabaseService';
import './ListaTareas.css';

function ListaTareas({ trabajos, tareas, fecha }) {
  const [coloresPorTrabajo, setColoresPorTrabajo] = useState({});

  useEffect(() => {
    const cargarColores = async () => {
      const colores = {};
      for (const trabajo of trabajos) {
        colores[trabajo.id] = await databaseService.obtenerColorTrabajo(trabajo.id);
      }
      setColoresPorTrabajo(colores);
    };
    cargarColores();
  }, [trabajos]);

  if (tareas.length === 0) {
    return (
      <div className="lista-tareas-vacia">
        <p>✨ No hay tareas programadas para este día</p>
      </div>
    );
  }

  // Agrupar tareas por trabajo
  const tareasPorTrabajo = {};
  tareas.forEach(tarea => {
    if (!tareasPorTrabajo[tarea.trabajoId]) {
      const trabajo = trabajos.find(t => t.id === tarea.trabajoId);
      tareasPorTrabajo[tarea.trabajoId] = {
        trabajo,
        color: coloresPorTrabajo[tarea.trabajoId],
        tareas: []
      };
    }
    tareasPorTrabajo[tarea.trabajoId].tareas.push(tarea);
  });

  return (
    <div className="lista-tareas-dia">
      {Object.values(tareasPorTrabajo).map(({ trabajo, color, tareas }) => (
        <div 
          key={trabajo.id} 
          className="trabajo-seccion-dia"
          style={{ 
            borderLeftColor: color,
            backgroundColor: `${color}08`
          }}
        >
          <div className="trabajo-header-dia">
            <div 
              className="trabajo-color-badge"
              style={{ backgroundColor: color }}
            >
              {trabajo.nombre.charAt(0)}
            </div>
            <div className="trabajo-info-dia">
              <h4 style={{ color }}>{trabajo.nombre}</h4>
              <span className="trabajo-cliente">{trabajo.cliente}</span>
            </div>
          </div>

          <div className="tareas-lista-dia">
            {tareas
              .sort((a, b) => 
                (a.planificacion?.horaPlanificada || '00:00').localeCompare(
                  b.planificacion?.horaPlanificada || '00:00'
                )
              )
              .map(tarea => (
                <div 
                  key={tarea.id} 
                  className="tarea-item-dia"
                  style={{ borderLeftColor: color }}
                >
                  <div className="tarea-hora-dia">
                    {tarea.planificacion?.horaPlanificada || '--:--'}
                  </div>
                  <div className="tarea-info-dia">
                    <div className="tarea-titulo-dia">{tarea.titulo}</div>
                    {tarea.descripcion && (
                      <div className="tarea-descripcion-dia">{tarea.descripcion}</div>
                    )}
                  </div>
                  <div className={`tarea-prioridad prioridad-${tarea.prioridad || 'media'}`}>
                    {tarea.prioridad || 'media'}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ListaTareas;