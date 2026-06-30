import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { connectSocket } from '../services/socket';

const styles = {
  container: { maxWidth: 1000, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 24, fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 },
  card: { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  cardHeader: (color) => ({
    fontSize: 16, fontWeight: 600, color: '#fff', background: color,
    padding: '10px 16px', borderRadius: '10px 10px 0 0', margin: '-24px -24px 16px -24px',
  }),
  stationName: { fontSize: 14, color: '#666', marginBottom: 12 },
  currentTicketBox: {
    textAlign: 'center', padding: 20, background: '#e8f5e9', borderRadius: 12, marginBottom: 16,
  },
  currentNum: { fontSize: 40, fontWeight: 700, color: '#2e7d32' },
  currentPatient: { fontSize: 16, fontWeight: 500, color: '#333', marginTop: 4 },
  waitingSection: { marginTop: 16 },
  waitingTitle: { fontSize: 14, fontWeight: 600, color: '#555', marginBottom: 8 },
  patientItem: {
    display: 'flex', justifyContent: 'space-between', padding: '10px 12px',
    borderBottom: '1px solid #f0f2f5', alignItems: 'center',
  },
  patientNum: { fontSize: 16, fontWeight: 700, color: '#1565c0' },
  patientName: { fontSize: 13, color: '#555' },
  patientTime: { fontSize: 12, color: '#999' },
  empty: { textAlign: 'center', padding: 30, color: '#999', fontSize: 14 },
  btn: (color) => ({
    width: '100%', padding: 14, border: 'none', borderRadius: 10, cursor: 'pointer',
    fontSize: 15, fontWeight: 600, color: '#fff', background: color, marginTop: 12,
  }),
  smallBtn: (color) => ({
    padding: '6px 14px', border: 'none', borderRadius: 6, cursor: 'pointer',
    fontSize: 12, fontWeight: 600, color: '#fff', background: color, marginLeft: 8,
  }),
};

export default function ConsultationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [enAttente, setEnAttente] = useState([]);
  const [enCours, setEnCours] = useState([]);
  const [ticketActuel, setTicketActuel] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [stationsRes, displayRes] = await Promise.all([
        api.get('/stations/type/consultation'),
        api.get('/display'),
      ]);
      setStations(stationsRes.data.stations);
      setEnAttente(displayRes.data.enAttenteConsultation || []);
      setEnCours(displayRes.data.enCoursConsultation || []);
    } catch (err) {}
  }, []);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadData();
    const socket = connectSocket();
    socket.on('enregistrement-valide', loadData);
    socket.on('consultation-appele', loadData);
    socket.on('consultation-terminee', loadData);
    return () => { socket.off('enregistrement-valide'); socket.off('consultation-appele'); socket.off('consultation-terminee'); };
  }, [user, navigate, loadData]);

  const appelerPatient = async (stationId) => {
    try {
      const { data } = await api.post(`/tickets/station/${stationId}/call-consultation`);
      setTicketActuel(data.ticket);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const terminerConsultation = async (ticketId) => {
    try {
      await api.put(`/tickets/${ticketId}/complete-consultation`);
      setTicketActuel(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const maStation = stations.find(s => s.agentId === user?.id);
  const monEnCours = enCours.find(t => t.stationConsultation === maStation?.nom);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🩺 Consultation</h1>
        {maStation && <span style={{ fontSize: 14, color: '#666' }}>Votre cabinet: <strong>{maStation.nom}</strong></span>}
      </div>

      <div style={styles.grid}>
        {stations.map((station) => {
          const estMienne = station.agentId === user?.id;
          const stationEnCours = enCours.find(t => t.stationConsultation === station.nom);

          return (
            <div key={station.id} style={{ ...styles.card, border: estMienne ? '2px solid #2e7d32' : 'none' }}>
              <div style={styles.cardHeader(estMienne ? '#2e7d32' : '#78909c')}>
                {station.nom} {estMienne ? '👈' : ''}
              </div>
              <div style={styles.stationName}>
                {station.agent ? `Dr. ${station.agent.nom}` : 'Non assigné'}
              </div>

              {stationEnCours ? (
                <div style={styles.currentTicketBox}>
                  <div style={{ fontSize: 12, color: '#555' }}>En consultation</div>
                  <div style={styles.currentNum}>{stationEnCours.numero}</div>
                  <div style={styles.currentPatient}>{stationEnCours.nomPatient || 'Patient'}</div>
                  {estMienne && (
                    <button onClick={() => terminerConsultation(
                      enCours.find(t => t.stationConsultation === station.nom)?.id
                    )} style={styles.btn('#c62828')}>
                      ✅ Terminer la consultation
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <div style={{ fontSize: 14, color: '#999' }}>Disponible</div>
                  {estMienne && (
                    <button onClick={() => appelerPatient(station.id)} style={styles.btn('#1565c0')}
                      disabled={enAttente.length === 0}>
                      📞 Appeler patient suivant
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ ...styles.card, marginTop: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Patients en attente de consultation ({enAttente.length})
        </div>
        {enAttente.length === 0 ? (
          <div style={styles.empty}>Aucun patient en attente</div>
        ) : (
          enAttente.map((t, i) => (
            <div key={t.id} style={styles.patientItem}>
              <div>
                <span style={styles.patientNum}>{t.numero}</span>
                <span style={styles.patientName}> - {t.nomPatient || 'Patient'}</span>
              </div>
              <span style={styles.patientTime}>
                {new Date(t.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
