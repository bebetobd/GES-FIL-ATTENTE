import React, { useState, useEffect } from 'react';
import api from '../services/api';

const styles = {
  container: { maxWidth: 700, margin: '0 auto', textAlign: 'center' },
  title: { fontSize: 28, fontWeight: 800, color: '#0d47a1', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 28 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 },
  serviceCard: (color) => ({
    background: '#fff', borderRadius: 16, padding: 28, cursor: 'pointer',
    border: `3px solid ${color}`, transition: 'all 0.2s',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  }),
  icon: { fontSize: 44, marginBottom: 8 },
  serviceName: { fontSize: 18, fontWeight: 700, color: '#333' },
  servicePrefixe: { fontSize: 32, fontWeight: 800, color: '#1565c0', marginTop: 4 },
  serviceDesc: { fontSize: 13, color: '#666', marginTop: 8 },
  ticketDisplay: {
    marginTop: 24, padding: 40, background: '#fff',
    borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    animation: 'fadeIn 0.3s',
  },
  bigNum: { fontSize: 96, fontWeight: 900, color: '#0d47a1', letterSpacing: 8, lineHeight: 1 },
  label: { fontSize: 14, color: '#666', marginTop: 16 },
  serviceLabel: { fontSize: 18, fontWeight: 600, color: '#333', marginTop: 4 },
  message: { fontSize: 15, color: '#555', marginTop: 12, fontWeight: 500 },
  position: { fontSize: 22, fontWeight: 700, color: '#e65100', marginTop: 8 },
  newBtn: {
    marginTop: 20, padding: '14px 40px', background: '#1565c0', color: '#fff',
    border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 16, fontWeight: 600,
  },
  input: {
    padding: '14px 18px', border: '2px solid #e0e0e0', borderRadius: 10,
    fontSize: 16, width: '100%', outline: 'none', marginBottom: 16,
  },
  form: { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 24 },
};

const COLORS = { enregistrement: '#f57c00', consultation: '#2e7d32', dg: '#6a1b9a' };
const ICONS = { enregistrement: '📋', consultation: '🩺', dg: '👔' };

export default function HallPage() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [nomPatient, setNomPatient] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/services').then(({ data }) => setServices(data.services)).catch(() => {});
  }, []);

  const genererTicket = async () => {
    if (!selectedService) return;
    setLoading(true);
    try {
      const { data } = await api.post('/tickets', {
        serviceId: selectedService.id,
        nomPatient: nomPatient || null,
      });
      setTicket(data);
    } catch (err) {
      alert('Erreur lors de la génération du ticket');
    }
    setLoading(false);
  };

  if (ticket && selectedService) {
    const color = COLORS[selectedService.type] || '#1565c0';
    return (
      <div style={styles.container}>
        <div style={styles.ticketDisplay}>
          <div style={styles.label}>Votre ticket</div>
          <div style={{ ...styles.bigNum, color }}>{ticket.ticket.numero}</div>
          <div style={styles.serviceLabel}>{ICONS[selectedService.type]} {selectedService.nom}</div>
          <div style={styles.position}>Position dans la file : {ticket.position}</div>
          <div style={styles.message}>{ticket.message}</div>
          <button onClick={() => { setTicket(null); setSelectedService(null); setNomPatient(''); }} style={styles.newBtn}>
            🖨️ Nouveau ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🏥 Bienvenue à la Clinique</h1>
      <p style={styles.subtitle}>Sélectionnez le service souhaité pour générer votre ticket</p>
      <div style={styles.grid}>
        {services.map((s) => {
          const color = COLORS[s.type] || '#1565c0';
          return (
            <div
              key={s.id}
              onClick={() => setSelectedService(s)}
              style={styles.serviceCard(color)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
            >
              <div style={styles.icon}>{ICONS[s.type]}</div>
              <div style={styles.serviceName}>{s.nom}</div>
              <div style={{ ...styles.servicePrefixe, color }}>{s.prefixe}</div>
              <div style={styles.serviceDesc}>{s.description}</div>
            </div>
          );
        })}
      </div>

      {selectedService && (
        <div style={{ ...styles.form, border: `3px solid ${COLORS[selectedService.type] || '#1565c0'}`, marginTop: 24 }}>
          <h2 style={{ marginBottom: 16, fontSize: 22, fontWeight: 700 }}>
            {ICONS[selectedService.type]} {selectedService.nom}
          </h2>
          <input
            value={nomPatient}
            onChange={(e) => setNomPatient(e.target.value)}
            placeholder="Votre nom (optionnel)"
            style={styles.input}
            onFocus={(e) => (e.target.style.borderColor = COLORS[selectedService.type])}
            onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
          />
          <button
            onClick={genererTicket}
            disabled={loading}
            style={{
              width: '100%', padding: 16, background: COLORS[selectedService.type],
              color: '#fff', border: 'none', borderRadius: 10, fontSize: 18,
              fontWeight: 700, cursor: 'pointer',
            }}
          >
            {loading ? 'Génération...' : '🖨️ Générer mon ticket'}
          </button>
        </div>
      )}
    </div>
  );
}
