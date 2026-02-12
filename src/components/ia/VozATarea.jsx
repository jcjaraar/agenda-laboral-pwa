function VozATarea({ onTareaCreada, trabajos, trabajoSeleccionado }) {
  return (
    <div className="voz-a-tarea">
      <button
        className="btn-voz"
        onClick={() => {
          const demo = {
            titulo: "Reunión de prueba",
            descripcion: "Tarea creada por voz (demo)",
            fecha: new Date().toISOString().split("T")[0],
            hora: "15:00",
            duracion: 60,
          };
          onTareaCreada(demo);
        }}
      >
        🎤 Agregar por voz (demo)
      </button>
      <p className="demo-hint">⚡ Demo: simula entrada por voz</p>
    </div>
  );
}
export default VozATarea;
