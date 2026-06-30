import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { connectSocket } from '../services/socket';

const styles = {
  container: { maxWidth: 900, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700 },
  mainCard: { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  activeTicket: {
    textAlign: 'center',
    padding: 32,
    background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
    borderRadius: 16,
    marginBottom: 20,
  },
  ticketNum: { fontSize: 56, fontWeight: 800, color: '#0d47a1' },
  patientName: { fontSize: 20, fontWeight: 600, color: '#333', marginTop: 4 },
  waitingList: { marginTop: 20 },
  listTitle: { fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#555' },
  listItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', borderBottom: '1px solid #f0f2f5',
  },
  itemNum: { fontSize: 18, fontWeight: 700, color: '#1565c0' },
  itemName: { fontSize: 14, color: '#555' },
  itemTime: { fontSize: 12, color: '#999' },
  emptyState: { textAlign: 'center', padding: 40, color: '#999', fontSize: 15 },
  btn: (variant) => ({
    padding: '14px 28px',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 600,
    background: variant === 'success' ? '#2e7d32' : '#1565c0',
    color: '#fff',
    margin: '0 8px 8px 0',
  }),
};

export default function EnregistrementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enAttente, setEnAttente] = useState([]);
  const [ticketActuel, setTicketActuel] = useState(null);
  const [station, setStation] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [stationsRes, ticketsRes] = await Promise.all([
        api.get('/stations/type/enregistrement'),
        api.get('/display'),
      ]);
      const maStation = stationsRes.data.stations.find(s => s.agentId === user?.id);
      setStation(maStation);
      setEnAttente(ticketsRes.data.enAttenteEnregistrement || []);
      setTicketActuel(ticketsRes.data.enCoursEnregistrement || null);
    } catch (err) {}
  }, [user]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadData();
    const socket = connectSocket();
    socket.on('ticket-cree', loadData);
    socket.on('enregistrement-appele', loadData);
    socket.on('enregistrement-valide', loadData);
    return () => { socket.off('ticket-cree'); socket.off('enregistrement-appele'); socket.off('enregistrement-valide'); };
  }, [user, navigate, loadData]);

  const appelerSuivant = async () => {
    if (!station) return alert('Aucune station d\'enregistrement assignée');
    try {
      const { data } = await api.post(`/tickets/station/${station.id}/call-enregistrement`);
      setTicketActuel(data.ticket);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const validerEnregistrement = async () => {
    if (!ticketActuel) return;
    try {
      await api.put(`/tickets/${ticketActuel.id}/validate-enregistrement`);
      setTicketActuel(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📋 Enregistrement des Patients</h1>
        {station && <span style={{ fontSize: 14, color: '#666' }}>Station: <strong>{station.nom}</strong></span>}
      </div>

      <div style={styles.mainCard}>
        {ticketActuel ? (
          <div style={styles.activeTicket}>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>Patient en cours d'enregistrement</div>
            <div style={styles.ticketNum}>{ticketActuel.numero}</div>
            <div style={styles.patientName}>{ticketActuel.nomPatient || 'Patient'}</div>
            <div style={{ marginTop: 16 }}>
              <button onClick={validerEnregistrement} style={styles.btn('success')}>
                ✅ Valider et envoyer en consultation
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <button onClick={appelerSuivant} style={styles.btn('primary')} disabled={enAttente.length === 0}>
              📞 Appeler le patient suivant
            </button>
            {enAttente.length === 0 && (
              <div style={styles.emptyState}>Aucun patient en attente d'enregistrement</div>
            )}
          </div>
        )}

        <div style={styles.waitingList}>
          <div style={styles.listTitle}>Patients en attente d'enregistrement ({enAttente.length})</div>
          {enAttente.length === 0 ? (
            <div style={styles.emptyState}>Liste vide</div>
          ) : (
            enAttente.map((t, i) => (
              <div key={t.id} style={styles.listItem}>
                <div>
                  <span style={styles.itemNum}>{t.numero}</span>
                  <span style={styles.itemName}> - {t.nomPatient || 'Patient'}</span>
                </div>
                <span style={styles.itemTime}>
                  {new Date(t.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
