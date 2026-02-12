function ContactoCard({ trabajo }) {
  return (
    <div className="contacto-card">
      <h4>📞 Contacto</h4>
      {trabajo.contacto?.telefono && <p>📱 Tel: {trabajo.contacto.telefono}</p>}
      {trabajo.contacto?.email && <p>✉️ Email: {trabajo.contacto.email}</p>}
      {trabajo.contacto?.whatsapp && (
        <a href={`https://wa.me/${trabajo.contacto.whatsapp}`} target="_blank">
          💬 WhatsApp
        </a>
      )}
    </div>
  );
}
export default ContactoCard;
