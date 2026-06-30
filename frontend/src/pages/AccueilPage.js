import React, { useState } from 'react';
import api from '../services/api';

const styles = {
  container: { maxWidth: 500, margin: '0 auto', textAlign: 'center' },
  title: { fontSize: 28, fontWeight: 700, color: '#0d47a1', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 32 },
  form: { background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  input: {
    width: '100%',
    padding: '14px 18px',
    border: '2px solid #e0e0e0',
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 16,
    outline: 'none',
  },
  btn: {
    width: '100%',
    padding: 16,
    background: '#1565c0',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 18,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  ticketDisplay: {
    marginTop: 32,
    padding: 40,
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  },
  ticketNum: { fontSize: 80, fontWeight: 800, color: '#1565c0', letterSpacing: 6, lineHeight: 1 },
  ticketLabel: { fontSize: 14, color: '#666', marginTop: 12 },
  message: { fontSize: 16, color: '#333', marginTop: 16, fontWeight: 500 },
  newBtn: {
    marginTop: 16,
    padding: '12px 32px',
    background: 'transparent',
    color: '#1565c0',
    border: '2px solid #1565c0',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 600,
  },
  quickBtns: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  quickBtn: (active) => ({
    padding: '8px 16px',
    borderRadius: 20,
    border: active ? '2px solid #1565c0' : '2px solid #e0e0e0',
    background: active ? '#e3f2fd' : '#fff',
    cursor: 'pointer',
    fontSize: 14,
    color: active ? '#1565c0' : '#666',
    fontWeight: active ? 600 : 400,
  }),
};

export default function AccueilPage() {
  const [nomPatient, setNomPatient] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuick, setSelectedQuick] = useState('');

  const patientsType = ['Nouveau patient', 'Consultation simple', 'Urgence', 'Suivi'];

  const prendreTicket = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/tickets', {
        nomPatient: nomPatient || selectedQuick || null,
      });
      setTicket(data);
    } catch (err) {
      alert('Erreur lors de la création du ticket');
    }
    setLoading(false);
  };

  if (ticket) {
    return (
      <div style={styles.container}>
        <div style={styles.ticketDisplay}>
          <div style={styles.ticketLabel}>Ticket créé</div>
          <div style={styles.ticketNum}>{ticket.ticket.numero}</div>
          {ticket.ticket.nomPatient && (
            <div style={{ marginTop: 8, fontSize: 18, fontWeight: 600 }}>{ticket.ticket.nomPatient}</div>
          )}
          <div style={styles.message}>{ticket.message}</div>
          <button onClick={() => { setTicket(null); setNomPatient(''); setSelectedQuick(''); }} style={styles.newBtn}>
            Nouveau ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🏠 Hall d'Accueil</h1>
      <p style={styles.subtitle}>Créez un ticket pour un nouveau patient</p>
      <div style={styles.form}>
        <div style={styles.quickBtns}>
          {patientsType.map((p) => (
            <button
              key={p}
              onClick={() => { setSelectedQuick(p); setNomPatient(''); }}
              style={styles.quickBtn(selectedQuick === p)}
            >
              {p}
            </button>
          ))}
        </div>
        <input
          value={nomPatient}
          onChange={(e) => { setNomPatient(e.target.value); setSelectedQuick(''); }}
          placeholder="Nom du patient (optionnel)"
          style={styles.input}
          onFocus={(e) => (e.target.style.borderColor = '#1565c0')}
          onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
        />
        <button onClick={prendreTicket} disabled={loading} style={styles.btn}
          onMouseEnter={(e) => { if (!loading) e.target.style.background = '#0d47a1'; }}
          onMouseLeave={(e) => { if (!loading) e.target.style.background = '#1565c0'; }}
        >
          {loading ? 'Création...' : '🖨️ Créer un ticket'}
        </button>
      </div>
    </div>
  );
}
