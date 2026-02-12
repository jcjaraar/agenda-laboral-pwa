// src/components/debug/DebugPanel.jsx
import React, { useState, useEffect } from "react";
import DBDebugger from "../../utils/debugDB";

function DebugPanel() {
  // ✅ CORRECTO:
  const [dbDebugger, setDbDebugger] = useState(null);
  const [stats, setStats] = useState(null);
  const [mostrarPanel, setMostrarPanel] = useState(false);

  useEffect(() => {
    const init = async () => {
      const dbg = new DBDebugger();
      await dbg.init();
      setDbDebugger(dbg);
      setStats(await dbg.getStats());
    };

    if (mostrarPanel) {
      init();
    }
  }, [mostrarPanel]);

  const handleExport = async () => {
    if (dbDebugger) {
      await dbDebugger.exportToJSON();
      alert("Backup exportado!");
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (dbDebugger) {
          await dbDebugger.importFromJSON(data);
          alert("Datos importados correctamente!");
          setStats(await dbDebugger.getStats());
        }
      } catch (error) {
        alert("Error importando datos: " + error.message);
      }
    };
    reader.readAsText(file);
  };

  // Atajo de teclado: Ctrl+Shift+D para mostrar/ocultar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        setMostrarPanel(!mostrarPanel);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mostrarPanel]);

  if (!mostrarPanel) {
    return (
      <button
        onClick={() => setMostrarPanel(true)}
        className="btn-debug-toggle"
        title="Ctrl+Shift+D"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="debug-panel">
      <div className="debug-header">
        <h3>🔧 Panel de Debug - Base de Datos</h3>
        <button onClick={() => setMostrarPanel(false)}>× Cerrar</button>
      </div>

      {stats && (
        <div className="debug-stats">
          <h4>📊 Estadísticas:</h4>
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}

      <div className="debug-actions">
        <button onClick={handleExport} className="btn-export">
          💾 Exportar Backup (JSON)
        </button>

        <label className="btn-import">
          📂 Importar Backup
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: "none" }}
          />
        </label>

        <button
          onClick={() => {
            if (window.confirm("¿Limpiar toda la base de datos?")) {
              // Implementar limpieza
              alert("Base de datos limpiada (esto es un placeholder)");
            }
          }}
          className="btn-clear"
        >
          🗑️ Limpiar DB
        </button>
      </div>

      <div className="debug-tips">
        <h4>💡 Accesos Rápidos:</h4>
        <ul>
          <li>
            <strong>Chrome DevTools:</strong> F12 → Application → IndexedDB
          </li>
          <li>
            <strong>Ver en consola:</strong> Ejecutar{" "}
            <code>window.dbDebugger.getStats()</code>
          </li>
          <li>
            <strong>Atajo teclado:</strong> Ctrl+Shift+D para este panel
          </li>
        </ul>
      </div>
    </div>
  );
}
