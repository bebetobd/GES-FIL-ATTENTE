import React, { useState, useEffect } from 'react';
import api from '../services/api';

const styles = {
  container: { maxWidth: 600, margin: '0 auto', textAlign: 'center' },
  title: { fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#1a1a2e' },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 32 },
  serviceGrid: { display: 'grid', gap: 16, gridTemplateColumns: '1fr' },
  serviceBtn: (selected) => ({
    background: selected ? '#1a73e8' : '#fff',
    color: selected ? '#fff' : '#333',
    border: selected ? '2px solid #1a73e8' : '2px solid #e0e0e0',
    padding: '20px 24px',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 500,
    transition: 'all 0.2s',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  count: (selected) => ({
    background: selected ? 'rgba(255,255,255,0.2)' : '#f0f2f5',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 13,
    color: selected ? '#fff' : '#666',
  }),
  ticketDisplay: {
    marginTop: 32,
    padding: 32,
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  ticketNumber: {
    fontSize: 64,
    fontWeight: 800,
    color: '#1a73e8',
    letterSpacing: 4,
  },
  ticketLabel: { fontSize: 14, color: '#666', marginTop: 8 },
  position: { fontSize: 18, color: '#333', marginTop: 16, fontWeight: 500 },
  waitTime: { fontSize: 14, color: '#888', marginTop: 4 },
  printBtn: {
    marginTop: 24,
    background: '#1a73e8',
    color: '#fff',
    border: 'none',
    padding: '12px 32px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 600,
  },
  newBtn: {
    marginTop: 12,
    background: 'transparent',
    color: '#1a73e8',
    border: '2px solid #1a73e8',
    padding: '10px 24px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
};

export default function TicketPage() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/services').then(({ data }) => setServices(data.services)).catch(() => {});
  }, []);

  const prendreTicket = async (serviceId) => {
    setLoading(true);
    try {
      const { data } = await api.post('/tickets', { serviceId });
      setTicket(data);
      setSelectedService(serviceId);
    } catch (err) {
      alert('Erreur lors de la prise de ticket');
    }
    setLoading(false);
  };

  const reinitialiser = () => {
    setTicket(null);
    setSelectedService(null);
  };

  if (ticket) {
    const service = services.find((s) => s.id === selectedService);
    return (
      <div style={styles.container}>
        <div style={styles.ticketDisplay}>
          <div style={styles.ticketLabel}>Votre numéro</div>
          <div style={styles.ticketNumber}>{ticket.ticket.numero}</div>
          <div style={styles.ticketLabel}>Service: {service?.nom}</div>
          <div style={styles.position}>Position dans la file: {ticket.position}</div>
          <div style={styles.waitTime}>Temps d'attente estimé: {ticket.estimatedWait} min</div>
          <button onClick={window.print} style={styles.printBtn}>Imprimer</button>
          <br />
          <button onClick={reinitialiser} style={styles.newBtn}>Prendre un autre ticket</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Prendre un Ticket</h1>
      <p style={styles.subtitle}>Sélectionnez le service souhaité</p>
      <div style={styles.serviceGrid}>
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => prendreTicket(service.id)}
            disabled={loading}
            style={styles.serviceBtn(selectedService === service.id)}
            onMouseEnter={(e) => {
              if (selectedService !== service.id) {
                e.target.style.borderColor = '#1a73e8';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedService !== service.id) {
                e.target.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <span>{service.nom} ({service.prefixe})</span>
            <span style={styles.count(selectedService === service.id)}>
              {service.enAttente || 0} en attente
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
