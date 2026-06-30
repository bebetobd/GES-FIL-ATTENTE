import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { connectSocket } from '../services/socket';

const COLORS = { enregistrement: '#f57c00', consultation: '#2e7d32', dg: '#6a1b9a' };
const ICONS = { enregistrement: '📋', consultation: '🩺', dg: '👔' };
const NAMES = { enregistrement: 'Enregistrement', consultation: 'Consultation', dg: 'Bureau DG' };

const styles = {
  container: { maxWidth: 1200, margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 800, color: '#0d47a1', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666' },
  appelBanner: (color, visible) => ({
    background: `linear-gradient(135deg, ${color}, ${color}dd)`,
    borderRadius: 20, padding: '24px 32px', marginBottom: 24,
    boxShadow: `0 8px 32px ${color}44`,
    textAlign: 'center',
    transition: 'all 0.5s ease',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(-20px)',
  }),
  appelLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 500, letterSpacing: 2 },
  appelNum: { color: '#fff', fontSize: 72, fontWeight: 900, lineHeight: 1.1, letterSpacing: 6, textShadow: '0 2px 10px rgba(0,0,0,0.2)' },
  appelService: { color: '#fff', fontSize: 18, fontWeight: 600, marginTop: 4 },
  appelStation: { color: '#fff', fontSize: 24, fontWeight: 700, marginTop: 8, background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '8px 24px', borderRadius: 30 },
  appelMsg: { color: 'rgba(255,255,255,0.9)', fontSize: 16, marginTop: 8, fontWeight: 500 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 },
  section: { background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  sectionHeader: (color) => ({
    fontSize: 18, fontWeight: 700, color, marginBottom: 12, paddingBottom: 8, borderBottom: `3px solid ${color}`,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  }),
  enCoursBox: (color) => ({
    textAlign: 'center', padding: 20, background: `linear-gradient(135deg, ${color}18, ${color}08)`, borderRadius: 12, border: `2px solid ${color}`, marginBottom: 12,
  }),
  enCoursNum: { fontSize: 40, fontWeight: 800, color: '#333' },
  enCoursName: { fontSize: 15, color: '#555' },
  enCoursStation: { fontSize: 13, color: '#888', marginTop: 2 },
  stationRow: (color, active) => ({
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, marginBottom: 4, background: active ? `${color}15` : '#f9f9f9',
  }),
  stationName: { fontSize: 13, fontWeight: 600, color: '#333' },
  stationTicket: (color) => ({ fontSize: 18, fontWeight: 700, color }),
  waitingList: { marginTop: 12 },
  item: { display: 'flex', justifyContent: 'space-between', padding: '6px 10px 6px 24px', borderBottom: '1px solid #f0f2f5', fontSize: 13 },
  itemNum: { fontWeight: 600 },
  empty: { textAlign: 'center', padding: 20, color: '#aaa', fontSize: 13 },
  footer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 24 },
  footerCard: (color) => ({ background: '#fff', borderRadius: 10, padding: 14, textAlign: 'center', borderTop: `4px solid ${color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }),
  footerNum: { fontSize: 24, fontWeight: 700, color: '#333' },
  footerLabel: { fontSize: 12, color: '#666', marginTop: 2 },
};

export default function DisplayPage() {
  const [data, setData] = useState(null);
  const [appel, setAppel] = useState(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    const load = () => api.get('/display').then(({ data }) => setData(data)).catch(() => {});
    load();
    const interval = setInterval(load, 5000);
    const socket = connectSocket();
    socket.emit('join-display');

    socket.on('appel', (payload) => {
      setAppel(payload);
      setVisible(true);
      load();
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setVisible(false), 8000);
    });

    socket.on('mise-a-jour', load);
    return () => { clearInterval(interval); socket.off('appel'); socket.off('mise-a-jour'); };
  }, []);

  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: 18 }}>Chargement de l'affichage...</div>;

  const appelColor = appel ? COLORS[appel.service?.type] || '#1565c0' : '#1565c0';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📺 Écran d'Affichage</h1>
        <p style={styles.subtitle}>Salle d'attente - Suivez les appels en temps réel</p>
      </div>

      {/* BANNIERE D'APPEL - visible quand un ticket est appelé */}
      <div style={styles.appelBanner(appelColor, visible)}>
        <div style={styles.appelLabel}>🔔 APPEL EN COURS</div>
        <div style={styles.appelNum}>{appel?.ticket?.numero || '---'}</div>
        <div style={styles.appelService}>{ICONS[appel?.service?.type]} {appel?.service?.nom}</div>
        <div style={styles.appelStation}>🚪 Veuillez vous rendre au {appel?.station}</div>
        <div style={styles.appelMsg}>
          {appel?.ticket?.nomPatient ? `Patient: ${appel.ticket.nomPatient} · ` : ''}
          {appel?.enAttente > 0 ? `${appel.enAttente} patient(s) encore en attente` : 'Dernier appel de la file'}
        </div>
      </div>

      {/* GRILLE DES SERVICES */}
      <div style={styles.grid}>
        {data.services?.map(({ service, enAttente, enCours, stations, nbEnCours, nbEnAttente, derniersTermines }) => {
          const color = COLORS[service.type] || '#1565c0';
          return (
            <div key={service.id} style={styles.section}>
              <div style={styles.sectionHeader(color)}>
                <span>{ICONS[service.type]} {service.nom}</span>
                <span style={{ fontSize: 13, fontWeight: 400, color: '#888' }}>{nbEnAttente} en attente</span>
              </div>

              {enCours?.length > 0 ? (
                <div style={styles.enCoursBox(color)}>
                  <div style={{ fontSize: 11, color: '#888' }}>{enCours[0].statut === 'appele' ? '🛎️ Appelé' : '🔄 En cours'}</div>
                  <div style={styles.enCoursNum}>{enCours[0].numero}</div>
                  <div style={styles.enCoursName}>{enCours[0].nomPatient || 'Patient'}</div>
                  <div style={styles.enCoursStation}>🚪 {enCours[0].station}</div>
                </div>
              ) : (
                <div style={styles.empty}>En attente de patient</div>
              )}

              {stations?.map((s) => {
                const t = enCours?.find(x => x.station === s.nom);
                return (
                  <div key={s.id} style={styles.stationRow(color, !!t)}>
                    <span style={styles.stationName}>
                      🚪 {s.nom}
                      {s.agent && <span style={{ fontWeight: 400, color: '#888' }}> ({s.agent.nom})</span>}
                    </span>
                    <span style={styles.stationTicket(color)}>{t ? t.numero : '---'}</span>
                  </div>
                );
              })}

              <div style={styles.waitingList}>
                {nbEnAttente > 0 && <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4 }}>⬇️ Prochains :</div>}
                {enAttente?.slice(0, 6).map((t, i) => (
                  <div key={t.id} style={styles.item}>
                    <span style={styles.itemNum}>{i + 1}. {t.numero}</span>
                    <span>{t.nomPatient || 'Patient'}</span>
                  </div>
                ))}
                {nbEnAttente > 6 && <div style={{ textAlign: 'center', fontSize: 12, color: '#888', padding: 4 }}>+{nbEnAttente - 6} autres</div>}
                {nbEnAttente === 0 && !enCours?.length && <div style={styles.empty}>Aucun patient</div>}
              </div>

              {derniersTermines?.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {derniersTermines.map(t => (
                    <span key={t.id} style={{ fontSize: 11, color: '#999', background: '#f5f5f5', padding: '2px 8px', borderRadius: 10 }}>✅ {t.numero}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* STATS BAR */}
      <div style={styles.footer}>
        {data.services?.map(({ service, nbEnAttente, nbEnCours }) => {
          const color = COLORS[service.type] || '#1565c0';
          return (
            <div key={service.id} style={styles.footerCard(color)}>
              <div style={styles.footerNum}>{nbEnAttente + nbEnCours}</div>
              <div style={styles.footerLabel}>{service.nom} - Total file</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
