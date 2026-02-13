import React, { useState, useEffect } from "react";
import databaseService from "../../services/DatabaseService";
import CalendarioMensual from "./CalendarioMensual";
import ProximosDias from "./ProximosDias";
import ListaTareas from "./ListaTareas";

function Dashboard({ trabajos, tareas, onSeleccionarTrabajo }) {
  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [vistaActiva, setVistaActiva] = useState("proximos"); // "proximos", "dia"

  const tareasPendientes = tareas.filter((t) => t.estado === "pendiente");
  const tareasHoy = tareas.filter(
    (t) =>
      t.planificacion?.fechaPlanificada ===
      new Date().toISOString().split("T")[0],
  );

  // Manejar clic en un día del calendario
  const handleDiaClick = (fechaStr) => {
    // fechaStr ya viene como "2026-02-02" desde CalendarioMensual
    setDiaSeleccionado(fechaStr);
    setVistaActiva("dia");
  };

  // Volver a vista de próximos días
  const handleVolver = () => {
    setVistaActiva("proximos");
    setDiaSeleccionado(null);
  };

  return (
    <div className="dashboard">
      <h2>📊 Panel de Control</h2>

      {/* RESUMEN NUMÉRICO */}
      {/* 📊 ESTADÍSTICAS RÁPIDAS - SOLO VISIBLE EN DESARROLLO */}
      {process.env.NODE_ENV === "development" && (
        <details style={{ marginBottom: "20px" }}>
          <summary
            style={{
              cursor: "pointer",
              color: "#475569",
              fontSize: "0.9rem",
              fontWeight: "600",
              padding: "8px 12px",
              background: "#f1f5f9",
              borderRadius: "8px",
              display: "inline-block",
            }}
          >
            📊 Ver estadísticas rápidas
          </summary>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "12px",
              padding: "16px",
              background: "#f8fafc",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              alignItems: "center",
            }}
          >
            <span
              style={{
                background: "#e2e8f0",
                padding: "6px 14px",
                borderRadius: "24px",
                fontSize: "0.85rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>🏢</span> {trabajos.length}{" "}
              trabajos
            </span>

            <span
              style={{
                background: "#e2e8f0",
                padding: "6px 14px",
                borderRadius: "24px",
                fontSize: "0.85rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>📋</span> {tareas.length}{" "}
              tareas
            </span>

            <span
              style={{
                background: "#fef9c3",
                padding: "6px 14px",
                borderRadius: "24px",
                fontSize: "0.85rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>⏳</span>{" "}
              {tareasPendientes.length} pendientes
            </span>

            <span
              style={{
                background: "#dbeafe",
                padding: "6px 14px",
                borderRadius: "24px",
                fontSize: "0.85rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>📅</span> {tareasHoy.length}{" "}
              para hoy
            </span>

            <span
              style={{
                background: "#dcfce7",
                padding: "6px 14px",
                borderRadius: "24px",
                fontSize: "0.85rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>✅</span>{" "}
              {tareas.filter((t) => t.completada).length} completadas
            </span>
          </div>
        </details>
      )}

      {/* 🗓️ CALENDARIO MENSUAL */}
      <CalendarioMensual
        trabajos={trabajos}
        tareas={tareas}
        fecha={fechaCalendario}
        onDiaClick={handleDiaClick}
        diaSeleccionado={diaSeleccionado}
      />

      {/* 📋 VISTA DINÁMICA DE TAREAS */}
      <div className="vista-tareas-container">
        <div className="vista-header">
          <h3>
            {vistaActiva === "proximos"
              ? "📅 Próximas 10 tareas"
              : (() => {
                  // ✅ FORMA CORRECTA - Parseo manual
                  const [año, mes, dia] = diaSeleccionado
                    .split("-")
                    .map(Number);
                  const fechaObj = new Date(año, mes - 1, dia);
                  return `📌 Tareas del ${fechaObj.toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}`;
                })()}
          </h3>
          {vistaActiva === "dia" && (
            <button onClick={handleVolver} className="btn-volver">
              ← Ver próximas tareas
            </button>
          )}
        </div>

        {vistaActiva === "proximos" ? (
          <ProximosDias trabajos={trabajos} tareas={tareas} limite={10} />
        ) : (
          <ListaTareas
            trabajos={trabajos}
            tareas={tareas.filter(
              (t) => t.planificacion?.fechaPlanificada === diaSeleccionado,
            )}
            fecha={diaSeleccionado}
          />
        )}
      </div>

      {/* 🔍 PANEL DE DEPURACIÓN */}
      {process.env.NODE_ENV === "development" && (
        <div className="debug-panel">
          <details>
            <summary>🧪 Panel de Depuración</summary>
            <div className="debug-buttons">
              <button onClick={() => databaseService.debugQuery("todas")}>
                📋 Ver todas las tareas
              </button>
              <button onClick={() => databaseService.debugQuery("pendientes")}>
                ⏳ Ver pendientes
              </button>
              <button onClick={() => databaseService.debugQuery("hoy")}>
                📅 Ver tareas de hoy
              </button>
              <button onClick={() => console.table(tareas)}>
                🔍 Estado local
              </button>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
