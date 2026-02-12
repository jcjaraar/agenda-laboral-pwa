function VistaSemanal({ trabajos, tareas, fechaInicio }) {
  const tareasHoy = tareas.filter(
    (t) =>
      t.planificacion?.fechaPlanificada ===
      new Date().toISOString().split("T")[0],
  );

  return (
    <div className="vista-semanal">
      <h3>📅 Próximos 7 días</h3>
      <div className="tareas-hoy">
        <strong>Hoy:</strong> {tareasHoy.length} tareas
      </div>
    </div>
  );
}
export default VistaSemanal;
