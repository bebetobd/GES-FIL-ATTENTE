import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { connectSocket } from '../services/socket';

const styles = {
  header: { textAlign: 'center', padding: '40px 20px' },
  title: { fontSize: 32, fontWeight: 800, color: '#0d47a1', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 },
  card: (bg) => ({
    background: bg || '#fff',
    borderRadius: 16,
    padding: 28,
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    textDecoration: 'none',
    color: 'inherit',
    textAlign: 'center',
    transition: 'transform 0.2s',
  }),
  icon: { fontSize: 40, marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: 600, marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#666', lineHeight: 1.5 },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 12,
    maxWidth: 800,
    margin: '32px auto',
  },
  statBox: { background: '#fff', borderRadius: 10, padding: 16, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statNum: { fontSize: 28, fontWeight: 700, color: '#1565c0' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 2 },
};

export default function HomePage() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const load = () => api.get('/tickets/stats').then(({ data }) => setStats(data)).catch(() => {});
    load();
    const socket = connectSocket();
    socket.on('ticket-cree', load);
    socket.on('enregistrement-appele', load);
    socket.on('enregistrement-valide', load);
    socket.on('consultation-appele', load);
    socket.on('consultation-terminee', load);
    return () => { socket.off('ticket-cree'); socket.off('enregistrement-appele'); socket.off('enregistrement-valide'); socket.off('consultation-appele'); socket.off('consultation-terminee'); };
  }, []);

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Système de Gestion de File d'Attente</h1>
        <p style={styles.subtitle}>Centre Médical - Suivez le flux complet des patients</p>

        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <div style={styles.statNum}>{stats.enAttente || 0}</div>
            <div style={styles.statLabel}>En attente enreg.</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statNum}>{stats.enEnregistrement || 0}</div>
            <div style={styles.statLabel}>En cours d'enreg.</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statNum}>{stats.enAttenteConsultation || 0}</div>
            <div style={styles.statLabel}>En attente consult.</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statNum}>{stats.enConsultation || 0}</div>
            <div style={styles.statLabel}>En consultation</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statNum}>{stats.termineAujourdhui || 0}</div>
            <div style={styles.statLabel}>Terminés aujourd'hui</div>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <Link to="/accueil" style={styles.card('#e3f2fd')}>
          <div style={styles.icon}>🏠</div>
          <div style={styles.cardTitle}>Hall Accueil</div>
          <div style={styles.cardDesc}>Créez un ticket pour un nouveau patient</div>
        </Link>
        <Link to="/enregistrement" style={styles.card('#fce4ec')}>
          <div style={styles.icon}>📋</div>
          <div style={styles.cardTitle}>Secrétariat</div>
          <div style={styles.cardDesc}>Enregistrez les patients et validez leur passage</div>
        </Link>
        <Link to="/consultation" style={styles.card('#e8f5e9')}>
          <div style={styles.icon}>🩺</div>
          <div style={styles.cardTitle}>Consultation</div>
          <div style={styles.cardDesc}>Consultez les patients enregistrés</div>
        </Link>
        <Link to="/display" style={styles.card('#fff3e0')}>
          <div style={styles.icon}>📺</div>
          <div style={styles.cardTitle}>Écran d'Affichage</div>
          <div style={styles.cardDesc}>Visualisez le flux en temps réel</div>
        </Link>
      </div>
    </div>
  );
}
