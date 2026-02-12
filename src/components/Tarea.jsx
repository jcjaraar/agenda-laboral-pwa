// src/components/Tarea.jsx
import React from "react";
import "./Tarea.css"; // Crearemos esto después

/**
 * Componente Tarea - Similar a una clase Tarea en Java
 *
 * Props (como parámetros del constructor):
 * @param {Object} tarea - Objeto con datos de la tarea
 * @param {Function} onEliminar - Callback para eliminar
 * @param {Function} onEditar - Callback para editar
 * @param {Function} onCompletar - Callback para marcar como completada
 */
function Tarea({ tarea, onEliminar, onEditar, onCompletar }) {
  // Destructurar objeto (similar a getters en Java)
  const { id, titulo, descripcion, fecha, completada, prioridad } = tarea;

  // Determinar clase CSS basada en estado
  const claseTarea = `tarea ${completada ? "completada" : ""} prioridad-${prioridad}`;

  return (
    <div className={claseTarea}>
      {/* Header de la tarea */}
      <div className="tarea-header">
        <input
          type="checkbox"
          checked={completada}
          onChange={() => onCompletar(id)}
          className="tarea-checkbox"
        />

        <div className="tarea-info">
          <h3 className="tarea-titulo">{titulo}</h3>
          <div className="tarea-metadata">
            <span className="tarea-fecha">📅 {fecha}</span>
            <span className={`tarea-prioridad prioridad-${prioridad}`}>
              {prioridad === "alta"
                ? "🔴"
                : prioridad === "media"
                  ? "🟡"
                  : "🟢"}{" "}
              {prioridad}
            </span>
          </div>
        </div>
      </div>

      {/* Descripción */}
      {descripcion && <p className="tarea-descripcion">{descripcion}</p>}

      {/* Acciones (CRUD) */}
      <div className="tarea-acciones">
        <button
          onClick={() => onEditar(id)}
          className="btn-editar"
          style={{ minHeight: "44px" }} // Mínimo para dedos
        >
          ✏️ Editar
        </button>

        <button
          onClick={() => onEliminar(id)}
          className="btn-eliminar"
          title="Eliminar tarea"
          style={{ minHeight: "44px" }}
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
}

// Validación de props (similar a tipos en TypeScript o validación en Java)
Tarea.propTypes = {
  // Definiríamos tipos aquí (instalaría prop-types después)
};

export default Tarea;
