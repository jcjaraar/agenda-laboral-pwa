// Trabajo.jsx - Cada trabajo tiene múltiples tareas

import Tarea from "./components/Tarea";

function Trabajo({ trabajo, tareas }) {
  return (
    <div className="trabajo">
      <h2>{trabajo.nombre}</h2>
      <p>Cliente: {trabajo.cliente}</p>
      <p>Presupuesto: ${trabajo.presupuesto}</p>

      <div className="tareas-del-trabajo">
        {tareas.map((tarea) => (
          <Tarea key={tarea.id} tarea={tarea} />
        ))}
      </div>
    </div>
  );
}
