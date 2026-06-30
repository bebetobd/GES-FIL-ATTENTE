import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { connectSocket } from '../services/socket';

const LABELS = {
  enregistrement: { icon: '📋', title: 'Enregistrement', color: '#f57c00' },
  consultation: { icon: '🩺', title: 'Consultation', color: '#2e7d32' },
  dg: { icon: '👔', title: 'Bureau DG', color: '#6a1b9a' },
};

const styles = {
  container: { maxWidth: 900, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 24, fontWeight: 700 },
  mainCard: { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  currentBox: (color) => ({
    textAlign: 'center', padding: 24,
    background: `linear-gradient(135deg, ${color}22, ${color}11)`,
    borderRadius: 12, border: `2px solid ${color}`,
    marginBottom: 16,
  }),
  currentNum: { fontSize: 48, fontWeight: 800, color: '#333' },
  currentName: { fontSize: 18, fontWeight: 600, color: '#333', marginTop: 4 },
  currentStation: { fontSize: 14, color: '#666', marginTop: 2 },
  waitingSection: { marginTop: 16 },
  listTitle: { fontSize: 15, fontWeight: 600, color: '#555', marginBottom: 8 },
  listItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', borderBottom: '1px solid #f0f2f5',
  },
  itemNum: { fontSize: 18, fontWeight: 700, color: '#1565c0' },
  itemName: { fontSize: 14, color: '#555', marginLeft: 8 },
  itemTime: { fontSize: 12, color: '#999' },
  empty: { textAlign: 'center', padding: 30, color: '#999', fontSize: 14 },
  btn: (bg) => ({
    padding: '14px 28px', border: 'none', borderRadius: 10, cursor: 'pointer',
    fontSize: 16, fontWeight: 600, color: '#fff', background: bg,
    margin: '4px',
  }),
  smallBtn: (bg) => ({
    padding: '6px 14px', border: 'none', borderRadius: 6, cursor: 'pointer',
    fontSize: 12, fontWeight: 600, color: '#fff', background: bg, marginLeft: 8,
  }),
};

export default function ServicePage() {
  const { type } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [enAttente, setEnAttente] = useState([]);
  const [enCours, setEnCours] = useState(null);
  const [stations, setStations] = useState([]);
  const [stats, setStats] = useState({});
  const info = LABELS[type] || { icon: '📋', title: type, color: '#1565c0' };

  const loadData = useCallback(async () => {
    try {
      const [servRes, stationsRes] = await Promise.all([
        api.get('/services'),
        api.get(`/stations/type/${type}`),
      ]);
      const s = servRes.data.services.find(x => x.type === type);
      setService(s);
      setStations(stationsRes.data.stations);

      if (s) {
        const fileRes = await api.get(`/tickets/file/${s.id}`);
        setEnAttente(fileRes.data.enAttente);
        setEnCours(fileRes.data.enCours);
        setStats({ termine: fileRes.data.termine });
      }
    } catch (err) {}
  }, [type]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadData();
    const socket = connectSocket();
    const handler = () => loadData();
    socket.on('nouveau-ticket', handler);
    socket.on('mise-a-jour', handler);
    return () => { socket.off('nouveau-ticket', handler); socket.off('mise-a-jour', handler); };
  }, [user, navigate, loadData]);

  const appelerSuivant = async (stationId) => {
    if (!service) return;
    try {
      const { data } = await api.post(`/tickets/${service.id}/station/${stationId}/call`);
      setEnCours(data.ticket);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const commencer = async (ticketId) => {
    try { await api.put(`/tickets/${ticketId}/start`); loadData(); } catch (err) {}
  };

  const terminer = async (ticketId) => {
    try { await api.put(`/tickets/${ticketId}/complete`); setEnCours(null); loadData(); } catch (err) {}
  };

  const maStation = stations.find(s => s.agentId === user?.id);
  const monTicket = enCours && enCours.station === maStation?.nom ? enCours : null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{info.icon} {info.title}</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {maStation && <span style={{ fontSize: 14, color: '#666' }}>Station: <strong>{maStation.nom}</strong></span>}
          <span style={{ fontSize: 14, color: '#2e7d32', fontWeight: 600 }}>✅ {stats.termine || 0} aujourd'hui</span>
        </div>
      </div>

      <div style={styles.mainCard}>
        {monTicket ? (
          <div style={styles.currentBox(info.color)}>
            <div style={{ fontSize: 13, color: '#555' }}>Prise en charge</div>
            <div style={styles.currentNum}>{monTicket.numero}</div>
            <div style={styles.currentName}>{monTicket.nomPatient || 'Patient'}</div>
            <div style={styles.currentStation}>Station: {monTicket.station}</div>
            <div style={{ marginTop: 12 }}>
              {monTicket.statut === 'appele' && (
                <button onClick={() => commencer(monTicket.id)} style={styles.btn('#1565c0')}>
                  ▶️ Commencer
                </button>
              )}
              {monTicket.statut === 'en_cours' && (
                <button onClick={() => terminer(monTicket.id)} style={styles.btn('#c62828')}>
                  ✅ Terminer
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 24 }}>
            {maStation && (
              <button onClick={() => appelerSuivant(maStation.id)} style={styles.btn(info.color)}
                disabled={enAttente.length === 0}>
                📞 Appeler patient suivant
              </button>
            )}
            {!maStation && (
              <div style={styles.empty}>Aucune station assignée à votre compte</div>
            )}
            {enAttente.length === 0 && maStation && (
              <div style={styles.empty}>Aucun patient en attente</div>
            )}
          </div>
        )}

        <div style={styles.waitingSection}>
          <div style={styles.listTitle}>
            Patients en attente ({enAttente.length})
            {enAttente.length > 0 && ` - Temps estimé: ~${enAttente.length * 5} min`}
          </div>
          {enAttente.length === 0 ? (
            <div style={styles.empty}>Liste vide</div>
          ) : (
            enAttente.map((t) => (
              <div key={t.id} style={styles.listItem}>
                <div>
                  <span style={styles.itemNum}>{t.numero}</span>
                  <span style={styles.itemName}>{t.nomPatient || 'Patient'}</span>
                </div>
                <span style={styles.itemTime}>
                  {new Date(t.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {stations.map((s) => (
          <div key={s.id} style={{
            background: '#fff', borderRadius: 10, padding: 14, textAlign: 'center',
            border: s.agentId === user?.id ? `2px solid ${info.color}` : '1px solid #e0e0e0',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{s.nom}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              {s.agent ? s.agent.nom : 'Non assigné'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
