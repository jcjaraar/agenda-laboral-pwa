// src/models/Tarea.js - VERSIÓN MEJORADA
class Tarea {
  constructor(data) {
    this.id = data.id || Date.now();
    this.trabajoId = data.trabajoId; // Relación 1:N

    // Información básica
    this.titulo = data.titulo;
    this.descripcion = data.descripcion || "";

    // 2. DÍA Y HORARIO + DURACIÓN
    this.planificacion = {
      fechaPlanificada:
        data.planificacion?.fechaPlanificada ||
        new Date().toISOString().split("T")[0],
      horaPlanificada: data.planificacion?.horaPlanificada || "09:00",
      duracionPlanificada: data.planificacion?.duracionPlanificada || 60, // minutos
      fechaRealizada: data.planificacion?.fechaRealizada || null,
      horaRealizada: data.planificacion?.horaRealizada || null,
      duracionReal: data.planificacion?.duracionReal || null,
    };

    // 1. COSTO (sobreescribe el del trabajo si es diferente)
    this.costo = {
      valor: data.costo?.valor || null, // null = usar valor del trabajo
      moneda: data.costo?.moneda || "ARS",
      notasCosto: data.costo?.notas || "",
    };

    // 3. NOTAS/REGISTRO
    this.notas = data.notas || "";

    // 4. ESTADOS MEJORADOS
    this.estado = data.estado || "pendiente"; // 'pendiente', 'realizada_cobrada', 'realizada_pendiente_pago', 'cancelada'
    this.completada = data.completada || false;

    // Metadata
    this.prioridad = data.prioridad || "media"; // 'alta', 'media', 'baja'
    this.fechaCreacion = data.fechaCreacion || new Date().toISOString();
    this.fechaActualizacion = new Date().toISOString();
    this.etiquetas = data.etiquetas || [];
  }

  // Calcular costo (usa el de la tarea o del trabajo)
  calcularCosto(valorHoraTrabajo) {
    const duracion =
      this.planificacion.duracionReal || this.planificacion.duracionPlanificada;
    const horas = duracion / 60;

    if (this.costo.valor !== null) {
      return this.costo.valor;
    }

    return horas * valorHoraTrabajo;
  }

  // Métodos para estados
  puedeCobrarse() {
    return this.estado === "realizada_pendiente_pago";
  }

  estaPendiente() {
    return this.estado === "pendiente";
  }

  estaCompletada() {
    return this.estado.startsWith("realizada") || this.estado === "cancelada";
  }

  // Método para Google Calendar
  getGoogleCalendarLink() {
    const startDate = new Date(
      `${this.planificacion.fechaPlanificada}T${this.planificacion.horaPlanificada}`,
    );
    const endDate = new Date(
      startDate.getTime() + this.planificacion.duracionPlanificada * 60000,
    );

    const details = `Tarea: ${this.titulo}\nTrabajo: ${this.trabajoId}\nDescripción: ${this.descripcion}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(this.titulo)}&details=${encodeURIComponent(details)}&dates=${startDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z/${endDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
  }
}
