import React, { useState, useEffect } from 'react';
import databaseService from '../../services/DatabaseService';
import './CalendarioMensual.css';

function CalendarioMensual({ trabajos, tareas, fecha = new Date(), onDiaClick, diaSeleccionado }) {
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

  // Obtener primer día del mes y total de días
  const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
  const diasEnMes = ultimoDia.getDate();
  const diaSemanaInicio = primerDia.getDay(); // 0 = domingo, 1 = lunes...
  
  // Ajustar para que empiece en lunes (0 = lunes, 6 = domingo)
  let offset = diaSemanaInicio === 0 ? 6 : diaSemanaInicio - 1;
  
  // Agrupar tareas por día
  const tareasPorDia = {};
  tareas.forEach(tarea => {
    if (tarea.planificacion?.fechaPlanificada) {
      const [año, mes, dia] = tarea.planificacion.fechaPlanificada.split('-').map(Number);
      if (año === fecha.getFullYear() && mes === fecha.getMonth() + 1) {
        if (!tareasPorDia[dia]) tareasPorDia[dia] = [];
        tareasPorDia[dia].push(tarea);
      }
    }
  });

  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="calendario-mensual">
      <div className="calendario-header">
        <h3>
          {fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </h3>
      </div>
      
      <div className="calendario-grid">
        {diasSemana.map(dia => (
          <div key={dia} className="calendario-dia-header">{dia}</div>
        ))}
        
        {/* Celdas vacías antes del día 1 */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} className="calendario-dia empty"></div>
        ))}
        
        {/* DÍAS DEL MES - VERSIÓN CORREGIDA */}
        {Array.from({ length: diasEnMes }, (_, i) => i + 1).map(dia => {
          const tareasDelDia = tareasPorDia[dia] || [];
          const coloresUnicos = [...new Set(tareasDelDia.map(t => 
            coloresPorTrabajo[t.trabajoId]
          ))];

          // ✅ FORMA CORRECTA: construir fecha string MANUALMENTE
          const año = fecha.getFullYear();
          const mes = String(fecha.getMonth() + 1).padStart(2, '0');
          const diaStr = String(dia).padStart(2, '0');
          const fechaDiaStr = `${año}-${mes}-${diaStr}`;
          const estaSeleccionado = diaSeleccionado === fechaDiaStr;

          return (
            <div 
              key={dia} 
              className={`calendario-dia ${tareasDelDia.length > 0 ? 'con-tareas' : ''} 
                          ${estaSeleccionado ? 'seleccionado' : ''}`}
              onClick={() => {
                // ✅ PASAMOS LA FECHA CORRECTA (ej: "2026-02-21")
                onDiaClick(fechaDiaStr);
              }}
              title={tareasDelDia.map(t => 
                `${t.titulo} (${t.planificacion?.horaPlanificada || 'sin hora'})`
              ).join('\n')}
            >
              <span className="dia-numero">{dia}</span>
              {tareasDelDia.length > 0 && (
                <div className="puntitos-container">
                  {coloresUnicos.slice(0, 3).map((color, idx) => (
                    <span 
                      key={idx} 
                      className="puntito" 
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  {coloresUnicos.length > 3 && (
                    <span className="mas-tareas">+{coloresUnicos.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarioMensual;