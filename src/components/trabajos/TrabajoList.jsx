// src/components/trabajos/TrabajoList.jsx
import React from "react";
import "./TrabajoList.css";

function TrabajoList({
  trabajos,
  tareasPorTrabajo,
  onSelectTrabajo,
  onEditTrabajo,
  onDeleteTrabajo,
  onAddTarea,
  onTareaCompletar,
  onTareaEliminar,
}) {
  if (!trabajos || trabajos.length === 0) {
    return (
      <div className="trabajo-list-empty">
        <p>📭 No hay trabajos aún. ¡Crea tu primer trabajo!</p>
      </div>
    );
  }

  return (
    <div className="trabajo-list">
      <h2>📋 Mis Trabajos</h2>
      <div className="trabajos-grid">
        {trabajos.map((trabajo) => (
          <div
            key={trabajo.id}
            className="trabajo-card"
            onClick={() => onSelectTrabajo(trabajo.id)}
          >
            <div className="trabajo-header">
              <h3>{trabajo.nombre}</h3>
              <span className={`estado-badge estado-${trabajo.estado}`}>
                {trabajo.estado}
              </span>
            </div>

            <p className="trabajo-cliente">👤 {trabajo.cliente}</p>

            {trabajo.descripcion && (
              <p className="trabajo-descripcion">{trabajo.descripcion}</p>
            )}

            <div className="trabajo-footer">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTarea(trabajo.id);
                }}
                className="btn-small btn-primary"
              >
                ➕ Tarea
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTrabajo(trabajo.id);
                }}
                className="btn-small btn-secondary"
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTrabajo(trabajo.id);
                }}
                className="btn-small btn-danger"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrabajoList;
