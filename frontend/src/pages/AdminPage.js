import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { connectSocket } from '../services/socket';
import { getStatusLabel, getStatusColor, formatDate } from '../utils/helpers';

const styles = {
  container: { maxWidth: 1200, margin: '0 auto' },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 24 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 },
  statCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    textAlign: 'center',
  },
  statNumber: { fontSize: 36, fontWeight: 700, color: '#1a73e8' },
  statLabel: { fontSize: 14, color: '#666', marginTop: 4 },
  section: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 600, marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #f0f2f5', fontSize: 13, fontWeight: 600, color: '#666' },
  td: { padding: '10px 8px', borderBottom: '1px solid #f0f2f5', fontSize: 14 },
  badge: (bg, color) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    background: bg,
    color,
  }),
  btn: {
    padding: '6px 14px',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
    background: '#dc3545',
  },
  tabs: { display: 'flex', gap: 8, marginBottom: 24 },
  tab: (active) => ({
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    background: active ? '#1a73e8' : '#e0e0e0',
    color: active ? '#fff' : '#333',
  }),
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [newService, setNewService] = useState({ nom: '', prefixe: '', description: '' });

  const loadData = useCallback(async () => {
    try {
      const [servicesRes, usersRes, statsRes] = await Promise.all([
        api.get('/services'),
        api.get('/auth/users'),
        api.get('/tickets/stats/today'),
      ]);
      setServices(servicesRes.data.services);
      setUsers(usersRes.data.users);
      setStats(statsRes.data);
    } catch (err) {}
  }, []);

  useEffect(() => {
    loadData();
    const socket = connectSocket();
    socket.on('new-ticket', () => loadData());
    return () => socket.off('new-ticket');
  }, [loadData]);

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await api.post('/services', newService);
      setNewService({ nom: '', prefixe: '', description: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Supprimer ce service ?')) return;
    try {
      await api.delete(`/services/${id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const toggleUserStatus = async (id) => {
    try {
      await api.put(`/auth/users/${id}/toggle-status`);
      loadData();
    } catch (err) {}
  };

  const renderServices = () => (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>Services</div>
      <form onSubmit={handleCreateService} style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={newService.nom}
          onChange={(e) => setNewService({ ...newService, nom: e.target.value })}
          placeholder="Nom du service"
          style={{ padding: '10px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 14, flex: 1, minWidth: 150 }}
          required
        />
        <input
          value={newService.prefixe}
          onChange={(e) => setNewService({ ...newService, prefixe: e.target.value.toUpperCase() })}
          placeholder="Préfixe (A, B, C...)"
          style={{ padding: '10px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 14, width: 120 }}
          maxLength={1}
          required
        />
        <input
          value={newService.description}
          onChange={(e) => setNewService({ ...newService, description: e.target.value })}
          placeholder="Description (optionnelle)"
          style={{ padding: '10px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 14, flex: 2, minWidth: 200 }}
        />
        <button type="submit" style={{ ...styles.btn, background: '#28a745' }}>Ajouter</button>
      </form>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nom</th>
            <th style={styles.th}>Préfixe</th>
            <th style={styles.th}>En attente</th>
            <th style={styles.th}>Guichets</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id}>
              <td style={styles.td}>{s.nom}</td>
              <td style={styles.td}>{s.prefixe}</td>
              <td style={styles.td}>{s.enAttente}</td>
              <td style={styles.td}>{s.guichets?.length || 0}</td>
              <td style={styles.td}>
                <button onClick={() => handleDeleteService(s.id)} style={styles.btn}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderUsers = () => (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>Utilisateurs</div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nom</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Rôle</th>
            <th style={styles.th}>Statut</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td style={styles.td}>{u.nom}</td>
              <td style={styles.td}>{u.email}</td>
              <td style={styles.td}>
                <span style={styles.badge(u.role === 'super_admin' ? '#fff3cd' : u.role === 'admin' ? '#cce5ff' : '#d4edda',
                  u.role === 'super_admin' ? '#856404' : u.role === 'admin' ? '#004085' : '#155724')}>
                  {u.role}
                </span>
              </td>
              <td style={styles.td}>
                <span style={styles.badge(u.actif ? '#d4edda' : '#f8d7da', u.actif ? '#155724' : '#721c24')}>
                  {u.actif ? 'Actif' : 'Inactif'}
                </span>
              </td>
              <td style={styles.td}>
                <button onClick={() => toggleUserStatus(u.id)} style={styles.btn}>
                  {u.actif ? 'Désactiver' : 'Activer'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Administration</h1>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.totalEnAttente || 0}</div>
          <div style={styles.statLabel}>En attente</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.tempsMoyenAttente || 0} min</div>
          <div style={styles.statLabel}>Temps moyen</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{services.length}</div>
          <div style={styles.statLabel}>Services</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{users.length}</div>
          <div style={styles.statLabel}>Utilisateurs</div>
        </div>
      </div>

      <div style={styles.tabs}>
        <button onClick={() => setActiveTab('services')} style={styles.tab(activeTab === 'services')}>Services</button>
        <button onClick={() => setActiveTab('users')} style={styles.tab(activeTab === 'users')}>Utilisateurs</button>
      </div>

      {activeTab === 'services' ? renderServices() : renderUsers()}
    </div>
  );
}
