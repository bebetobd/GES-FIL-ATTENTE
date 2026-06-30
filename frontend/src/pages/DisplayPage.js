import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { connectSocket } from '../services/socket';

const styles = {
  container: { maxWidth: 1200, margin: '0 auto' },
  title: { fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 24, color: '#0d47a1' },
  mainGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 },
  sectionCard: { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  sectionTitle: (color) => ({ fontSize: 18, fontWeight: 600, color, marginBottom: 16, paddingBottom: 8, borderBottom: `3px solid ${color}` }),
  currentTicket: {
    textAlign: 'center', padding: 24, background: '#e3f2fd', borderRadius: 12, marginBottom: 16,
  },
  ticketNumber: { fontSize: 48, fontWeight: 800, color: '#0d47a1' },
  ticketPatient: { fontSize: 18, fontWeight: 500, color: '#333', marginTop: 4 },
  stationLabel: { fontSize: 14, color: '#555', marginTop: 4 },
  waitingSection: { marginTop: 16 },
  listTitle: { fontSize: 14, fontWeight: 600, color: '#555', marginBottom: 8 },
  listItem: {
    display: 'flex', justifyContent: 'space-between', padding: '8px 12px',
    borderBottom: '1px solid #f5f5f5', fontSize: 14,
  },
  consultationGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
  consultCard: (occupied) => ({
    background: occupied ? '#e8f5e9' : '#f5f5f5',
    borderRadius: 12, padding: 16, textAlign: 'center',
    border: occupied ? '2px solid #4caf50' : '2px solid #e0e0e0',
  }),
  consultStation: { fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 },
  consultTicket: { fontSize: 28, fontWeight: 700, color: '#2e7d32' },
  consultPatient: { fontSize: 13, color: '#555', marginTop: 2 },
  footerCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 },
  infoCard: { background: '#fff', borderRadius: 10, padding: 16, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  infoNum: { fontSize: 28, fontWeight: 700, color: '#1565c0' },
  infoLabel: { fontSize: 13, color: '#666', marginTop: 2 },
  doneList: { marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  doneItem: { padding: '6px 16px', background: '#f5f5f5', borderRadius: 20, fontSize: 13, color: '#666' },
  empty: { textAlign: 'center', padding: 30, color: '#999', fontSize: 14 },
};

export default function DisplayPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = () => api.get('/display').then(({ data }) => setData(data)).catch(() => {});
    load();
    const interval = setInterval(load, 3000);
    const socket = connectSocket();
    socket.emit('join-display');
    socket.on('ticket-cree', load);
    socket.on('enregistrement-appele', load);
    socket.on('enregistrement-valide', load);
    socket.on('consultation-appele', load);
    socket.on('consultation-terminee', load);
    return () => { clearInterval(interval); socket.off('ticket-cree'); socket.off('enregistrement-appele'); socket.off('enregistrement-valide'); socket.off('consultation-appele'); socket.off('consultation-terminee'); };
  }, []);

  if (!data) return <div style={{ padding: 40, textAlign: 'center' }}>Chargement...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📺 Tableau de Bord - Flux des Patients</h1>

      <div style={styles.mainGrid}>
        <div style={styles.sectionCard}>
          <div style={styles.sectionTitle('#1565c0')}>📋 Enregistrement</div>
          {data.enCoursEnregistrement ? (
            <div style={styles.currentTicket}>
              <div style={{ fontSize: 13, color: '#555' }}>En cours d'enregistrement</div>
              <div style={styles.ticketNumber}>{data.enCoursEnregistrement.numero}</div>
              <div style={styles.ticketPatient}>{data.enCoursEnregistrement.nomPatient || 'Patient'}</div>
              <div style={styles.stationLabel}>Au: {data.enCoursEnregistrement.stationEnregistrement}</div>
            </div>
          ) : (
            <div style={styles.empty}>Aucun enregistrement en cours</div>
          )}
          <div style={styles.waitingSection}>
            <div style={styles.listTitle}>En attente ({data.enAttenteEnregistrement?.length || 0})</div>
            {data.enAttenteEnregistrement?.length > 0 ? (
              data.enAttenteEnregistrement.slice(0, 10).map((t) => (
                <div key={t.id} style={styles.listItem}>
                  <span><strong>{t.numero}</strong> - {t.nomPatient || 'Patient'}</span>
                  <span>{new Date(t.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))
            ) : <div style={styles.empty}>Liste vide</div>}
          </div>
        </div>

        <div style={styles.sectionCard}>
          <div style={styles.sectionTitle('#2e7d32')}>🩺 Consultations</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#2e7d32', textAlign: 'center' }}>
            {data.enAttenteConsultation || 0}
          </div>
          <div style={{ textAlign: 'center', fontSize: 14, color: '#666' }}>Patient(s) en attente</div>

          <div style={{ marginTop: 20, fontSize: 14, fontWeight: 600, color: '#555' }}>Derniers terminés</div>
          <div style={styles.doneList}>
            {data.derniersTermines?.map((t) => (
              <span key={t.id} style={styles.doneItem}>✅ {t.numero}</span>
            ))}
            {(!data.derniersTermines || data.derniersTermines.length === 0) && (
              <div style={styles.empty}>Aucun</div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.sectionTitle('#2e7d32')}>Cabinet de Consultation</div>
      <div style={styles.consultationGrid}>
        {data.stations?.filter(s => s.type === 'consultation').map((station) => {
          const enCours = data.enCoursConsultation?.find(t => t.stationConsultation === station.nom);
          return (
            <div key={station.id} style={styles.consultCard(!!enCours)}>
              <div style={styles.consultStation}>{station.nom}</div>
              {station.agent && <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Dr. {station.agent.nom}</div>}
              {enCours ? (
                <>
                  <div style={styles.consultTicket}>{enCours.numero}</div>
                  <div style={styles.consultPatient}>{enCours.nomPatient || 'Patient'}</div>
                </>
              ) : (
                <div style={{ color: '#999', fontSize: 14, padding: 8 }}>Disponible</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={styles.footerCards}>
        <div style={styles.infoCard}>
          <div style={styles.infoNum}>{data.enAttenteEnregistrement?.length || 0}</div>
          <div style={styles.infoLabel}>En attente enreg.</div>
        </div>
        <div style={styles.infoCard}>
          <div style={styles.infoNum}>{data.enAttenteConsultation || 0}</div>
          <div style={styles.infoLabel}>En attente consult.</div>
        </div>
        <div style={styles.infoCard}>
          <div style={styles.infoNum}>{data.enCoursConsultation?.length || 0}</div>
          <div style={styles.infoLabel}>En consultation</div>
        </div>
      </div>
    </div>
  );
}
