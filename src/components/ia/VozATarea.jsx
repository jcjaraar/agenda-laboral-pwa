import React from 'react';

function VozATarea({ onTareaCreada, trabajos, trabajoSeleccionado }) {
  
  // ========== CREAR TAREA DEMO CON TRABAJO ALEATORIO ==========
  const crearTareaDemo = () => {
    // 1. Filtrar solo trabajos activos
    const trabajosActivos = trabajos.filter(t => t.estado === 'activo');
    
    // 2. Si no hay trabajos, usar trabajo por defecto
    let trabajoElegido;
    if (trabajosActivos.length === 0) {
      trabajoElegido = { id: 1, nombre: "Trabajo Demo", cliente: "Cliente Demo" };
    } else {
      // Elegir un trabajo ALEATORIO
      const indiceAleatorio = Math.floor(Math.random() * trabajosActivos.length);
      trabajoElegido = trabajosActivos[indiceAleatorio];
    }

    // 3. Lista de tareas de ejemplo (cada una puede ir a cualquier trabajo)
    const tareasDemo = [
      {
        titulo: `Revisar documentación - ${trabajoElegido.nombre}`,
        descripcion: "Analizar requisitos y planificar tareas",
        fecha: new Date().toISOString().split('T')[0],
        hora: "09:30",
        duracion: 90,
        prioridad: "alta"
      },
      {
        titulo: `Llamar a cliente - ${trabajoElegido.cliente}`,
        descripcion: "Confirmar detalles del trabajo",
        fecha: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        hora: "11:00",
        duracion: 30,
        prioridad: "media"
      },
      {
        titulo: `Preparar presupuesto - ${trabajoElegido.nombre}`,
        descripcion: "Calcular costos de materiales",
        fecha: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        hora: "14:15",
        duracion: 120,
        prioridad: "alta"
      },
      {
        titulo: `Actualizar sistema - ${trabajoElegido.nombre}`,
        descripcion: "Instalar últimas actualizaciones",
        fecha: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        hora: "10:00",
        duracion: 60,
        prioridad: "baja"
      }
    ];

    // 4. Elegir UNA tarea al azar de la lista
    const tareaElegida = tareasDemo[Math.floor(Math.random() * tareasDemo.length)];

    // 5. Agregar el ID del trabajo elegido
    tareaElegida.trabajoId = trabajoElegido.id;

    // 6. Enviar la tarea al Dashboard
    onTareaCreada(tareaElegida);
  };

  return (
    <div className="voz-a-tarea" style={{
      background: '#f0f9ff',
      padding: '20px',
      borderRadius: '12px',
      margin: '20px 0'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#0369a1' }}>🎤 Simulador de Voz / IA</h3>
      
      <button 
        onClick={crearTareaDemo}
        style={{
          background: '#0284c7',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '15px'
        }}
      >
        🎲 Crear tarea de prueba (trabajo aleatorio)
      </button>

      <div style={{
        background: '#e0f2fe',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#075985'
      }}>
        <strong>📌 Demo:</strong> Cada vez que hacés clic, se crea una tarea en un trabajo DISTINTO al azar.
        {trabajos.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <strong>Trabajos disponibles:</strong>{' '}
            {trabajos.filter(t => t.estado === 'activo').map(t => t.nombre).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

export default VozATarea;