function Dashboard({ trabajos, tareas, onSeleccionarTrabajo }) {
  const tareasPendientes = tareas.filter((t) => t.estado === "pendiente");
  const tareasHoy = tareas.filter(
    (t) =>
      t.planificacion?.fechaPlanificada ===
      new Date().toISOString().split("T")[0],
  );

  return (
    <div className="dashboard">
      <h2>📊 Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{trabajos.length}</div>
          <div className="stat-label">Trabajos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tareas.length}</div>
          <div className="stat-label">Tareas totales</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tareasPendientes.length}</div>
          <div className="stat-label">Pendientes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tareasHoy.length}</div>
          <div className="stat-label">Para hoy</div>
        </div>
      </div>
    </div>
  );
}
export default Dashboard;
