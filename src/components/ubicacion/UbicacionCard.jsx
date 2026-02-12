function UbicacionCard({ trabajo }) {
  return (
    <div className="ubicacion-card">
      <h4>📍 Ubicación</h4>
      <p>{trabajo.ubicacion?.direccion || "Sin dirección"}</p>
      {trabajo.ubicacion?.transporte?.colectivos?.length > 0 && (
        <p>
          🚌 Colectivos: {trabajo.ubicacion.transporte.colectivos.join(", ")}
        </p>
      )}
    </div>
  );
}
export default UbicacionCard;
