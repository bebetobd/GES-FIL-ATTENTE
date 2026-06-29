import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { connectSocket } from '../services/socket';

const styles = {
  container: { maxWidth: 1200, margin: '0 auto' },
  serviceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: 20,
  },
  serviceCard: (selected) => ({
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    cursor: selected ? 'default' : 'pointer',
    border: selected ? '3px solid #1a73e8' : '3px solid transparent',
    transition: 'all 0.3s',
  }),
  serviceName: { fontSize: 20, fontWeight: 700, color: '#1a73e8', marginBottom: 16 },
  currentTicket: { fontSize: 72, fontWeight: 800, color: '#1a1a2e', textAlign: 'center', letterSpacing: 6 },
  currentLabel: { textAlign: 'center', fontSize: 16, color: '#666', marginTop: 4 },
  counterRow: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: 20,
    gap: 12,
    flexWrap: 'wrap',
  },
  counterItem: (active) => ({
    textAlign: 'center',
    padding: '12px 20px',
    background: active ? '#d4edda' : '#f8f9fa',
    borderRadius: 10,
    minWidth: 100,
  }),
  counterName: { fontSize: 14, fontWeight: 600, color: '#333' },
  counterTicket: { fontSize: 28, fontWeight: 700, color: active => active ? '#155724' : '#999' },
  waitingCount: { fontSize: 14, color: '#856404', marginTop: 8, textAlign: 'center' },
  historySection: { marginTop: 24 },
  historyTitle: { fontSize: 14, fontWeight: 600, color: '#666', marginBottom: 8 },
  historyGrid: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  historyItem: { padding: '6px 14px', background: '#f0f2f5', borderRadius: 6, fontSize: 13, color: '#666' },
  selectBar: { display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
  selectBtn: (active) => ({
    padding: '12px 24px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 600,
    background: active ? '#1a73e8' : '#e0e0e0',
    color: active ? '#fff' : '#333',
    transition: 'all 0.2s',
  }),
};

export default function DisplayPage() {
  const { serviceId } = useParams();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [displayData, setDisplayData] = useState(null);

  useEffect(() => {
    api.get('/services').then(({ data }) => {
      setServices(data.services);
      if (serviceId) {
        setSelectedService(serviceId);
      }
    }).catch(() => {});
  }, [serviceId]);

  useEffect(() => {
    if (!selectedService) return;
    const fetchDisplay = () => {
      api.get(`/display/${selectedService}`).then(({ data }) => setDisplayData(data)).catch(() => {});
    };
    fetchDisplay();
    const interval = setInterval(fetchDisplay, 5000);
    const socket = connectSocket();
    socket.emit('join-display', selectedService);
    socket.on('ticket-called', fetchDisplay);
    socket.on('ticket-completed', fetchDisplay);
    return () => {
      clearInterval(interval);
      socket.off('ticket-called');
      socket.off('ticket-completed');
    };
  }, [selectedService]);

  if (!selectedService) {
    return (
      <div style={styles.container}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Écran d'Affichage</h1>
        <p style={{ color: '#666', marginBottom: 20 }}>Sélectionnez un service :</p>
        <div style={styles.selectBar}>
          {services.map((s) => (
            <button key={s.id} onClick={() => setSelectedService(s.id)} style={styles.selectBtn(false)}>
              {s.nom} ({s.prefixe})
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!displayData) return <div style={{ padding: 40, textAlign: 'center' }}>Chargement...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.serviceCard(true)}>
        <div style={styles.serviceName}>{displayData.service.nom}</div>
        <div style={styles.currentTicket}>
          {displayData.ticketEnCours?.numero || '---'}
        </div>
        <div style={styles.currentLabel}>
          {displayData.ticketEnCours ? 'Appelé au ' + displayData.ticketEnCours.guichet : 'En attente de ticket'}
        </div>
        <div style={styles.counterRow}>
          {(displayData.guichets || []).map((c) => (
            <div key={c.id} style={styles.counterItem(c.estOccupe)}>
              <div style={styles.counterName}>{c.nom}</div>
              <div style={styles.counterTicket(c.estOccupe)}>{c.ticketEnCours || '---'}</div>
            </div>
          ))}
        </div>
        <div style={styles.waitingCount}>
          {displayData.enAttente} personne(s) en attente
        </div>
      </div>

      {displayData.derniersAppeles?.length > 0 && (
        <div style={styles.historySection}>
          <div style={styles.historyTitle}>Derniers tickets appelés</div>
          <div style={styles.historyGrid}>
            {displayData.derniersAppeles.map((t) => (
              <span key={t.id} style={styles.historyItem}>{t.numero}</span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setSelectedService(null)}
        style={{ marginTop: 20, padding: '8px 16px', border: 'none', borderRadius: 8, background: '#6c757d', color: '#fff', cursor: 'pointer', fontSize: 14 }}
      >
        Changer de service
      </button>
    </div>
  );
}
