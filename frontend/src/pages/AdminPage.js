import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const styles = {
  container: { maxWidth: 1100, margin: '0 auto' },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 24 },
  tabs: { display: 'flex', gap: 8, marginBottom: 20 },
  tab: (active) => ({ padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, background: active ? '#1565c0' : '#e0e0e0', color: active ? '#fff' : '#333' }),
  section: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 600, marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 8px', borderBottom: '2px solid #f0f2f5', fontSize: 13, fontWeight: 600, color: '#666' },
  td: { padding: '8px', borderBottom: '1px solid #f0f2f5', fontSize: 13 },
  badge: (bg, color) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: bg, color }),
  input: { padding: '8px 12px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 14 },
  btn: (color) => ({ padding: '6px 14px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', background: color }),
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 },
  statCard: (color) => ({ background: '#fff', borderRadius: 10, padding: 16, textAlign: 'center', borderTop: `4px solid ${color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }),
  statNum: { fontSize: 24, fontWeight: 700, color: '#333' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 2 },
};

const TYPE_COLORS = { enregistrement: '#f57c00', consultation: '#2e7d32', dg: '#6a1b9a' };

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('stations');
  const [stations, setStations] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, services: [] });
  const [newStation, setNewStation] = useState({ nom: '', type: 'enregistrement' });

  const load = useCallback(async () => {
    try {
      const [s, u, st] = await Promise.all([api.get('/stations'), api.get('/auth/users'), api.get('/tickets/stats')]);
      setStations(s.data.stations);
      setUsers(u.data.users);
      setStats(st.data);
    } catch (err) {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const assignAgent = async (sid, agentId) => {
    try { await api.put(`/stations/${sid}/assign`, { agentId: agentId || null }); load(); } catch (err) {}
  };

  const createStation = async (e) => {
    e.preventDefault();
    try { await api.post('/stations', newStation); setNewStation({ nom: '', type: 'enregistrement' }); load(); } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const deleteStation = async (id) => {
    if (!window.confirm('Supprimer cette station ?')) return;
    try { await api.delete(`/stations/${id}`); load(); } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚙️ Administration</h1>

      <div style={styles.statsGrid}>
        {stats.services?.map(s => (
          <div key={s.id} style={styles.statCard(TYPE_COLORS[s.type] || '#1565c0')}>
            <div style={styles.statNum}>{s.enAttente + s.enCours}</div>
            <div style={styles.statLabel}>{s.nom} (file)</div>
            <div style={{ fontSize: 11, color: '#999' }}>✅ {s.termine} finis</div>
          </div>
        ))}
        <div style={styles.statCard('#0d47a1')}>
          <div style={styles.statNum}>{stats.total || 0}</div>
          <div style={styles.statLabel}>Total en file</div>
        </div>
      </div>

      <div style={styles.tabs}>
        <button onClick={() => setActiveTab('stations')} style={styles.tab(activeTab === 'stations')}>Stations</button>
        <button onClick={() => setActiveTab('users')} style={styles.tab(activeTab === 'users')}>Utilisateurs</button>
      </div>

      {activeTab === 'stations' ? (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Stations de travail</div>
          <form onSubmit={createStation} style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <input value={newStation.nom} onChange={(e) => setNewStation({ ...newStation, nom: e.target.value })} placeholder="Nom" style={styles.input} required />
            <select value={newStation.type} onChange={(e) => setNewStation({ ...newStation, type: e.target.value })} style={styles.input}>
              <option value="enregistrement">Enregistrement</option>
              <option value="consultation">Consultation</option>
              <option value="dg">Bureau DG</option>
            </select>
            <button type="submit" style={styles.btn('#2e7d32')}>Ajouter</button>
          </form>
          <table style={styles.table}>
            <thead><tr>
              <th style={styles.th}>Nom</th><th style={styles.th}>Type</th><th style={styles.th}>Agent</th><th style={styles.th}>Actions</th>
            </tr></thead>
            <tbody>
              {stations.map(s => (
                <tr key={s.id}>
                  <td style={styles.td}>{s.nom}</td>
                  <td style={styles.td}><span style={styles.badge(TYPE_COLORS[s.type] + '22', TYPE_COLORS[s.type])}>{s.type}</span></td>
                  <td style={styles.td}>
                    <select value={s.agentId || ''} onChange={(e) => assignAgent(s.id, e.target.value || null)} style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
                      <option value="">Non assigné</option>
                      {users.filter(u => u.role === 'agent').map(u => <option key={u.id} value={u.id}>{u.nom}</option>)}
                    </select>
                  </td>
                  <td style={styles.td}><button onClick={() => deleteStation(s.id)} style={styles.btn('#c62828')}>Supprimer</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Utilisateurs</div>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Nom</th><th style={styles.th}>Email</th><th style={styles.th}>Rôle</th><th style={styles.th}>Statut</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={styles.td}>{u.nom}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}><span style={styles.badge(u.role === 'super_admin' ? '#fff3cd' : u.role === 'admin' ? '#cce5ff' : '#d4edda', u.role === 'super_admin' ? '#856404' : u.role === 'admin' ? '#004085' : '#155724')}>{u.role}</span></td>
                  <td style={styles.td}><span style={styles.badge(u.actif ? '#d4edda' : '#f8d7da', u.actif ? '#155724' : '#721c24')}>{u.actif ? 'Actif' : 'Inactif'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
