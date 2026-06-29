import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const styles = {
  hero: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  title: {
    fontSize: 36,
    fontWeight: 800,
    marginBottom: 16,
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    lineHeight: 1.6,
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24,
    maxWidth: 900,
    margin: '0 auto',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: 32,
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    transition: 'all 0.3s',
    textAlign: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 1.5,
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    maxWidth: 800,
    margin: '40px auto 0',
  },
  statCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 700,
    color: '#1a73e8',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
};

export default function HomePage() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.get('/services').then(({ data }) => setServices(data.services)).catch(() => {});
  }, []);

  return (
    <div>
      <div style={styles.hero}>
        <h1 style={styles.title}>Bienvenue au Système de Gestion de File d'Attente</h1>
        <p style={styles.subtitle}>
          Gérez efficacement vos files d'attente avec prise de ticket numérique,<br />
          affichage en temps réel et statistiques détaillées.
        </p>

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{services.length}</div>
            <div style={styles.statLabel}>Services</div>
          </div>
          {services.map((s) => (
            <div key={s.id} style={styles.statCard}>
              <div style={styles.statNumber}>{s.enAttente || 0}</div>
              <div style={styles.statLabel}>{s.nom} - En attente</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.cards}>
        <Link to="/ticket" style={styles.card}>
          <div style={styles.icon}>🎫</div>
          <div style={styles.cardTitle}>Prendre un Ticket</div>
          <div style={styles.cardDesc}>Obtenez votre ticket de file d'attente pour le service souhaité</div>
        </Link>
        <Link to="/display" style={styles.card}>
          <div style={styles.icon}>📺</div>
          <div style={styles.cardTitle}>Écran d'Affichage</div>
          <div style={styles.cardDesc}>Visualisez l'état des files d'attente en temps réel</div>
        </Link>
        <Link to="/queue" style={styles.card}>
          <div style={styles.icon}>⚡</div>
          <div style={styles.cardTitle}>Gestion des Files</div>
          <div style={styles.cardDesc}>Interface agent pour gérer les tickets et appeler les clients</div>
        </Link>
      </div>
    </div>
  );
}
