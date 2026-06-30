import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const styles = {
  container: { maxWidth: 1100, margin: '0 auto' },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 24 },
  tabs: { display: 'flex', gap: 8, marginBottom: 20 },
  tab: (active) => ({
    padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 14, fontWeight: 600, background: active ? '#1565c0' : '#e0e0e0', color: active ? '#fff' : '#333',
  }),
  section: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 600, marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 8px', borderBottom: '2px solid #f0f2f5', fontSize: 13, fontWeight: 600, color: '#666' },
  td: { padding: '8px', borderBottom: '1px solid #f0f2f5', fontSize: 13 },
  badge: (bg, color) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: bg, color,
  }),
  input: { padding: '8px 12px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 14 },
  btn: (color) => ({ padding: '6px 14px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', background: color }),
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('stations');
  const [stations, setStations] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [newStation, setNewStation] = useState({ nom: '', type: 'accueil' });

  const load = useCallback(async () => {
    try {
      const [s, u, st] = await Promise.all([
        api.get('/stations'), api.get('/auth/users'), api.get('/tickets/stats'),
      ]);
      setStations(s.data.stations);
      setUsers(u.data.users);
      setStats(st.data);
    } catch (err) {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const assignAgent = async (stationId, agentId) => {
    try { await api.put(`/stations/${stationId}/assign`, { agentId: agentId || null }); load(); } catch (err) {}
  };

  const createStation = async (e) => {
    e.preventDefault();
    try { await api.post('/stations', newStation); setNewStation({ nom: '', type: 'accueil' }); load(); } catch (err) {}
  };

  const deleteStation = async (id) => {
    if (!window.confirm('Supprimer cette station ?')) return;
    try { await api.delete(`/stations/${id}`); load(); } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚙️ Administration</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'En attente', value: stats.enAttente },
          { label: 'En enreg.', value: stats.enEnregistrement },
          { label: 'En attente consult.', value: stats.enAttenteConsultation },
          { label: 'En consult.', value: stats.enConsultation },
          { label: 'Terminés', value: stats.termineAujourdhui },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: 16, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1565c0' }}>{s.value || 0}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.tabs}>
        <button onClick={() => setActiveTab('stations')} style={styles.tab(activeTab === 'stations')}>Stations</button>
        <button onClick={() => setActiveTab('users')} style={styles.tab(activeTab === 'users')}>Utilisateurs</button>
      </div>

      {activeTab === 'stations' ? (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Stations de travail</div>
          <form onSubmit={createStation} style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <input value={newStation.nom} onChange={(e) => setNewStation({ ...newStation, nom: e.target.value })} placeholder="Nom de la station" style={styles.input} required />
            <select value={newStation.type} onChange={(e) => setNewStation({ ...newStation, type: e.target.value })} style={styles.input}>
              <option value="accueil">Accueil</option>
              <option value="enregistrement">Enregistrement</option>
              <option value="consultation">Consultation</option>
            </select>
            <button type="submit" style={styles.btn('#2e7d32')}>Ajouter</button>
          </form>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nom</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Agent</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => (
                <tr key={s.id}>
                  <td style={styles.td}>{s.nom}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(
                      s.type === 'accueil' ? '#e3f2fd' : s.type === 'enregistrement' ? '#fce4ec' : '#e8f5e9',
                      s.type === 'accueil' ? '#1565c0' : s.type === 'enregistrement' ? '#c62828' : '#2e7d32'
                    )}>{s.type}</span>
                  </td>
                  <td style={styles.td}>
                    <select value={s.agentId || ''} onChange={(e) => assignAgent(s.id, e.target.value || null)} style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
                      <option value="">Non assigné</option>
                      {users.filter(u => u.role === 'agent').map((u) => (
                        <option key={u.id} value={u.id}>{u.nom}</option>
                      ))}
                    </select>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => deleteStation(s.id)} style={styles.btn('#c62828')}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Utilisateurs</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nom</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Rôle</th>
                <th style={styles.th}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={styles.td}>{u.nom}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(
                      u.role === 'super_admin' ? '#fff3cd' : u.role === 'admin' ? '#cce5ff' : '#d4edda',
                      u.role === 'super_admin' ? '#856404' : u.role === 'admin' ? '#004085' : '#155724'
                    )}>{u.role}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.badge(u.actif ? '#d4edda' : '#f8d7da', u.actif ? '#155724' : '#721c24')}>
                      {u.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
