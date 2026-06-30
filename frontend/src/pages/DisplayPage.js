import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { connectSocket } from '../services/socket';

const COLORS = { enregistrement: '#f57c00', consultation: '#2e7d32', dg: '#6a1b9a' };
const ICONS = { enregistrement: '📋', consultation: '🩺', dg: '👔' };

function jouerSon(numero, station, serviceNom) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.15);
      osc.start(ctx.currentTime + i * 0.15); osc.stop(ctx.currentTime + i * 0.15 + 0.15);
    });

    setTimeout(() => {
      if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(
          `Ticket ${numero}, veuillez vous rendre au ${station}, service ${serviceNom}`
        );
        msg.lang = 'fr-FR'; msg.rate = 0.85; msg.volume = 1;
        window.speechSynthesis.speak(msg);
      }
    }, 600);
  } catch (e) {}
}

const styles = {
  container: { maxWidth: 1200, margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 800, color: '#0d47a1', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#666' },
  appelBanner: (color, visible) => ({
    background: `linear-gradient(135deg, ${color}, ${color}dd)`,
    borderRadius: 20, padding: '20px 32px', marginBottom: 20,
    boxShadow: `0 8px 32px ${color}44`, textAlign: 'center',
    transition: 'all 0.5s ease',
    opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-20px)',
  }),
  appelLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500, letterSpacing: 2 },
  appelNum: { color: '#fff', fontSize: 64, fontWeight: 900, lineHeight: 1.1, letterSpacing: 6, textShadow: '0 2px 10px rgba(0,0,0,0.2)' },
  appelService: { color: '#fff', fontSize: 16, fontWeight: 600, marginTop: 4 },
  appelStation: { color: '#fff', fontSize: 22, fontWeight: 700, marginTop: 6, background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '6px 24px', borderRadius: 30 },
  appelMsg: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 6, fontWeight: 500 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: 16 },
  section: { background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 3px 12px rgba(0,0,0,0.07)' },
  sectionHeader: (color) => ({ fontSize: 16, fontWeight: 700, color, marginBottom: 10, paddingBottom: 6, borderBottom: `3px solid ${color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }),
  enCoursBox: (color) => ({ textAlign: 'center', padding: 16, background: `linear-gradient(135deg, ${color}18, ${color}08)`, borderRadius: 10, border: `2px solid ${color}`, marginBottom: 10 }),
  enCoursNum: { fontSize: 34, fontWeight: 800, color: '#333' },
  enCoursName: { fontSize: 14, color: '#555' },
  enCoursStation: { fontSize: 12, color: '#888', marginTop: 2 },
  stationRow: (color, active) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: 6, marginBottom: 3, background: active ? `${color}15` : '#f9f9f9' }),
  stationName: { fontSize: 12, fontWeight: 600, color: '#333' },
  stationTicket: (color) => ({ fontSize: 16, fontWeight: 700, color }),
  waitingList: { marginTop: 10 },
  item: { display: 'flex', justifyContent: 'space-between', padding: '5px 8px 5px 20px', borderBottom: '1px solid #f0f2f5', fontSize: 12 },
  empty: { textAlign: 'center', padding: 16, color: '#aaa', fontSize: 12 },
  footer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 20 },
  footerCard: (color) => ({ background: '#fff', borderRadius: 8, padding: 12, textAlign: 'center', borderTop: `4px solid ${color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }),
  footerNum: { fontSize: 22, fontWeight: 700, color: '#333' },
  footerLabel: { fontSize: 11, color: '#666', marginTop: 2 },
};

export default function DisplayPage() {
  const [data, setData] = useState(null);
  const [appel, setAppel] = useState(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);
  const prevAppelRef = useRef(null);

  useEffect(() => {
    const load = () => api.get('/display').then(({ data }) => setData(data)).catch(() => {});
    load();
    const interval = setInterval(load, 5000);
    const socket = connectSocket();
    socket.emit('join-display');

    socket.on('appel', (payload) => {
      const key = payload?.ticket?.id;
      if (key && key !== prevAppelRef.current) {
        prevAppelRef.current = key;
        setAppel(payload);
        setVisible(true);
        jouerSon(payload.ticket.numero, payload.station, payload.service?.nom);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setVisible(false), 10000);
      }
      load();
    });

    socket.on('mise-a-jour', load);
    return () => { clearInterval(interval); socket.off('appel'); socket.off('mise-a-jour'); };
  }, []);

  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: 16 }}>Chargement...</div>;

  const appelColor = appel ? COLORS[appel.service?.type] || '#1565c0' : '#1565c0';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📺 Écran d'Affichage</h1>
        <p style={styles.subtitle}>Salle d'attente - Appels en temps réel</p>
      </div>

      <div style={styles.appelBanner(appelColor, visible)}>
        <div style={styles.appelLabel}>🔔 APPEL EN COURS</div>
        <div style={styles.appelNum}>{appel?.ticket?.numero || '---'}</div>
        <div style={styles.appelService}>{ICONS[appel?.service?.type]} {appel?.service?.nom}</div>
        <div style={styles.appelStation}>🚪 Veuillez vous rendre au {appel?.station}</div>
        <div style={styles.appelMsg}>
          {appel?.ticket?.nomPatient ? `Patient: ${appel.ticket.nomPatient} · ` : ''}
          {appel?.enAttente > 0 ? `${appel.enAttente} patient(s) en attente` : 'Dernier appel'}
        </div>
      </div>

      <div style={styles.grid}>
        {data.services?.map(({ service, enAttente, enCours, stations, nbEnAttente, nbEnCours, derniersTermines }) => {
          const color = COLORS[service.type] || '#1565c0';
          return (
            <div key={service.id} style={styles.section}>
              <div style={styles.sectionHeader(color)}>
                <span>{ICONS[service.type]} {service.nom}</span>
                <span style={{ fontSize: 12, fontWeight: 400, color: '#888' }}>{nbEnAttente} attente</span>
              </div>

              {enCours?.length > 0 ? (
                <div style={styles.enCoursBox(color)}>
                  <div style={{ fontSize: 10, color: '#888' }}>{enCours[0].statut === 'appele' ? '🛎️ Appelé' : '🔄 En cours'}</div>
                  <div style={styles.enCoursNum}>{enCours[0].numero}</div>
                  <div style={styles.enCoursName}>{enCours[0].nomPatient || 'Patient'}</div>
                  <div style={styles.enCoursStation}>🚪 {enCours[0].station}</div>
                </div>
              ) : <div style={styles.empty}>Disponible</div>}

              {stations?.map((s) => {
                const t = enCours?.find(x => x.station === s.nom);
                return (
                  <div key={s.id} style={styles.stationRow(color, !!t)}>
                    <span style={styles.stationName}>🚪 {s.nom}{s.agent ? ` (${s.agent.nom})` : ''}</span>
                    <span style={styles.stationTicket(color)}>{t ? t.numero : '---'}</span>
                  </div>
                );
              })}

              <div style={styles.waitingList}>
                {nbEnAttente > 0 && <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 3 }}>⬇️ Prochains :</div>}
                {enAttente?.slice(0, 5).map((t, i) => (
                  <div key={t.id} style={styles.item}>
                    <span style={{ fontWeight: 600 }}>{i + 1}. {t.numero}</span>
                    <span>{t.nomPatient || 'Patient'}</span>
                  </div>
                ))}
                {nbEnAttente > 5 && <div style={{ textAlign: 'center', fontSize: 11, color: '#888', padding: 3 }}>+{nbEnAttente - 5} autres</div>}
                {nbEnAttente === 0 && !enCours?.length && <div style={styles.empty}>Aucun patient</div>}
              </div>

              {derniersTermines?.length > 0 && (
                <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {derniersTermines.map(t => (
                    <span key={t.id} style={{ fontSize: 10, color: '#999', background: '#f5f5f5', padding: '2px 6px', borderRadius: 8 }}>✅ {t.numero}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={styles.footer}>
        {data.services?.map(({ service, nbEnAttente, nbEnCours }) => {
          const color = COLORS[service.type] || '#1565c0';
          return (
            <div key={service.id} style={styles.footerCard(color)}>
              <div style={styles.footerNum}>{nbEnAttente + nbEnCours}</div>
              <div style={styles.footerLabel}>{service.nom} - File</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
