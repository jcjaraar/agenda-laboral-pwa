import React, { useState, useEffect } from 'react';
import databaseService from '../../services/DatabaseService';
import './ProximosDias.css';

function ProximosDias({ trabajos, tareas }) {
  const [coloresPorTrabajo, setColoresPorTrabajo] = useState({});
  const [tareasAgrupadas, setTareasAgrupadas] = useState({});

  useEffect(() => {
    const cargarDatos = async () => {
      // Cargar colores
      const colores = {};
      for (const trabajo of trabajos) {
        colores[trabajo.id] = await databaseService.obtenerColorTrabajo(trabajo.id);
      }
      setColoresPorTrabajo(colores);

      // Agrupar tareas por trabajo y fecha (próximos 7 días)
      const hoy = new Date();
      const sieteDias = [];
      for (let i = 0; i < 7; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + i);
        sieteDias.push(fecha.toISOString().split('T')[0]);
      }

      const agrupado = {};
      trabajos.forEach(trabajo => {
        const tareasDelTrabajo = tareas.filter(t => 
          t.trabajoId === trabajo.id &&
          t.planificacion?.fechaPlanificada &&
          sieteDias.includes(t.planificacion.fechaPlanificada)
        );

        if (tareasDelTrabajo.length > 0) {
          agrupado[trabajo.id] = {
            trabajo,
            color: colores[trabajo.id],
            tareas: tareasDelTrabajo.sort((a, b) => 
              a.planificacion.fechaPlanificada.localeCompare(b.planificacion.fechaPlanificada)
            )
          };
        }
      });
      
      setTareasAgrupadas(agrupado);
    };

    cargarDatos();
  }, [trabajos, tareas]);

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short'
    }).replace('.', '');
  };

  const formatearHora = (horaStr) => {
    if (!horaStr) return '--:--';
    return horaStr.substring(0, 5);
  };

  return (
    <div className="proximos-dias">
      <h3>📅 Próximos 7 días</h3>
      
      {Object.keys(tareasAgrupadas).length === 0 ? (
        <p className="sin-tareas">✨ No hay tareas programadas para los próximos 7 días</p>
      ) : (
        <div className="trabajos-lista">
          {Object.values(tareasAgrupadas).map(({ trabajo, color, tareas }) => (
            <div 
              key={trabajo.id} 
              className="trabajo-seccion"
              style={{ 
                borderLeftColor: color,
                backgroundColor: `${color}08` // 08 = 5% de opacidad
              }}
            >
              {/* HEADER DE TRABAJO CON COLOR */}
              <div className="trabajo-header">
                <div 
                  className="trabajo-color-badge"
                  style={{ 
                    backgroundColor: color,
                    boxShadow: `0 2px 6px ${color}40`
                  }}
                >
                  <span className="trabajo-color-letra">
                    {trabajo.nombre.charAt(0)}
                  </span>
                </div>
                <div className="trabajo-info-header">
                  <h4 style={{ color: color }}>{trabajo.nombre}</h4>
                  <span className="trabajo-cliente">{trabajo.cliente}</span>
                </div>
              </div>
              
              {/* LISTA DE TAREAS */}
              <div className="tareas-lista">
                {tareas.map(tarea => (
                  <div 
                    key={tarea.id} 
                    className="tarea-item"
                    style={{ 
                      borderLeftColor: color,
                      borderLeftWidth: '4px',
                      borderLeftStyle: 'solid'
                    }}
                  >
                    <div className="tarea-hora">
                      {formatearHora(tarea.planificacion?.horaPlanificada)}
                    </div>
                    
                    <div className="tarea-info">
                      <div className="tarea-titulo">{tarea.titulo}</div>
                      <div className="tarea-fecha">
                        {formatearFecha(tarea.planificacion.fechaPlanificada)}
                      </div>
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
      )}
    </div>
  );
}

export default ProximosDias;