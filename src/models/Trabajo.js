// src/models/Trabajo.js - VERSIÓN MEJORADA
class Trabajo {
  constructor(data) {
    this.id = data.id || Date.now();
    this.nombre = data.nombre;
    this.cliente = data.cliente;

    // 1. CONTACTO/REFERENCIA
    this.contacto = {
      telefono: data.contacto?.telefono || "",
      email: data.contacto?.email || "",
      whatsapp: data.contacto?.whatsapp || data.contacto?.telefono || "",
      notasContacto: data.contacto?.notas || "",
    };

    // 2. DIRECCIÓN/UBICACIÓN (para Google Maps)
    this.ubicacion = {
      direccion: data.ubicacion?.direccion || "",
      coordenadas: data.ubicacion?.coordenadas || null, // {lat, lng}
      notasUbicacion: data.ubicacion?.notas || "",
      transporte: {
        colectivos: data.ubicacion?.transporte?.colectivos || [],
        enlaceGoogleMaps: data.ubicacion?.transporte?.enlaceGoogleMaps || "",
        tiempoEstimado: data.ubicacion?.transporte?.tiempoEstimado || 0, // minutos
      },
    };

    // 3. PERIODICIDAD (como Google Calendar)
    this.periodicidad = {
      tipo: data.periodicidad?.tipo || "único", // 'único', 'diario', 'semanal', 'mensual', 'anual'
      frecuencia: data.periodicidad?.frecuencia || 1, // cada X días/semanas/etc
      diasSemana: data.periodicidad?.diasSemana || [], // [0,2,4] para Lunes, Miércoles, Viernes
      fechaFin: data.periodicidad?.fechaFin || null,
      excluirFinesDeSemana: data.periodicidad?.excluirFinesDeSemana !== false,
    };

    // 4. COSTO/VALOR
    this.costo = {
      valorHora: data.costo?.valorHora || 0,
      moneda: data.costo?.moneda || "ARS",
      tipoCobro: data.costo?.tipoCobro || "por_hora", // 'por_hora', 'fijo', 'variable'
    };

    this.descripcion = data.descripcion || "";
    this.estado = data.estado || "activo";
    this.fechaCreacion = data.fechaCreacion || new Date().toISOString();
    this.fechaActualizacion = new Date().toISOString();
    this.tags = data.tags || [];
  }

  // Métodos para comunicación
  getLinkWhatsapp() {
    if (!this.contacto.whatsapp) return null;
    const mensaje = `Hola ${this.cliente}, te contacto sobre ${this.nombre}`;
    return `https://wa.me/${this.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
  }

  getLinkLlamada() {
    if (!this.contacto.telefono) return null;
    return `tel:${this.contacto.telefono}`;
  }

  getLinkEmail() {
    if (!this.contacto.email) return null;
    return `mailto:${this.contacto.email}`;
  }

  getLinkGoogleMaps() {
    if (this.ubicacion.coordenadas) {
      return `https://www.google.com/maps?q=${this.ubicacion.coordenadas.lat},${this.ubicacion.coordenadas.lng}`;
    }
    if (this.ubicacion.direccion) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.ubicacion.direccion)}`;
    }
    return null;
  }

  // Métodos para periodicidad
  generarEventosRecurrentes(fechaInicio, fechaFin) {
    // Similar a Google Calendar - genera tareas recurrentes
    // Implementación basada en la periodicidad configurada
  }
}
