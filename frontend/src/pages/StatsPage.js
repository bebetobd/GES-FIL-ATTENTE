import React, { useState, useEffect } from 'react';
import api from '../services/api';

const COLORS = { enregistrement: '#f57c00', consultation: '#2e7d32', dg: '#6a1b9a' };
const ICONS = { enregistrement: '📋', consultation: '🩺', dg: '👔' };

const styles = {
  container: { maxWidth: 1000, margin: '0 auto' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 20 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 },
  card: { background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 3px 12px rgba(0,0,0,0.07)' },
  cardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid #f0f2f5' },
  statRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5', fontSize: 14 },
  statLabel: { color: '#555' },
  statValue: { fontWeight: 700, color: '#333' },
  barBg: { background: '#f0f2f5', borderRadius: 8, height: 24, overflow: 'hidden', marginBottom: 8 },
  barFill: (color, pct) => ({ height: '100%', background: color, borderRadius: 8, width: `${pct}%`, transition: 'width 0.5s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 600, minWidth: pct > 15 ? 'auto' : 0 }),
  barLabel: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginBottom: 2 },
  empty: { textAlign: 'center', padding: 40, color: '#999', fontSize: 14 },
};

export default function StatsPage() {
  const [data, setData] = useState(null);
  const [flux, setFlux] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/tickets/stats-avancees'),
      api.get('/tickets/stats'),
    ]).then(([avancees, stats]) => {
      setData(avancees.data);
    }).catch(() => {});
  }, []);

  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Chargement des statistiques...</div>;

  const maxTotal = Math.max(...data.statsServices.map(s => s.total), 1);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 Statistiques Avancées</h1>

      <div style={styles.grid}>
        {/* Stats par service */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>📊 Performance par Service</div>
          {data.statsServices.map((s) => {
            const color = COLORS[s.type] || '#1565c0';
            return (
              <div key={s.id} style={{ marginBottom: 16 }}>
                <div style={styles.statRow}>
                  <span>{ICONS[s.type]} <strong>{s.nom}</strong></span>
                  <span style={{ fontSize: 12, color: '#888' }}>{s.total} tickets</span>
                </div>
                <div style={styles.barBg}>
                  <div style={styles.barFill(color, (s.total / maxTotal) * 100)}>
                    {s.total > 0 && (s.total)}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 12, color: '#666' }}>
                  <div>📥 Total: <strong>{s.total}</strong></div>
                  <div>✅ Terminés: <strong>{s.termines}</strong></div>
                  <div>⏱️ Tps moyen: <strong>{s.tempsMoyen} min</strong></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Temps d'attente */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>⏱️ Temps d'Attente & Prise en Charge</div>
          {data.statsServices.map((s) => {
            const color = COLORS[s.type] || '#1565c0';
            const maxTps = Math.max(...data.statsServices.map(x => Math.max(x.tempsMoyen, x.dureeMoyenne)), 1);
            return (
              <div key={s.id} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 6 }}>{ICONS[s.type]} {s.nom}</div>
                <div style={styles.barLabel}>
                  <span>⏳ Attente avant service</span>
                  <span>{s.tempsMoyen} min</span>
                </div>
                <div style={styles.barBg}><div style={styles.barFill('#f57c00', (s.tempsMoyen / maxTps) * 100)} /></div>
                <div style={styles.barLabel}>
                  <span>🔄 Durée de service</span>
                  <span>{s.dureeMoyenne} min</span>
                </div>
                <div style={styles.barBg}><div style={styles.barFill('#2e7d32', (s.dureeMoyenne / maxTps) * 100)} /></div>
              </div>
            );
          })}
        </div>

        {/* Flux par heure */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>🕐 Flux Horaire (Aujourd'hui)</div>
          {data.fluxHoraire?.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 140, padding: '20px 0 0' }}>
              {(() => {
                const heures = Array.from({ length: 24 }, (_, i) => {
                  const f = data.fluxHoraire.find(h => parseInt(h.heure) === i);
                  return { heure: `${String(i).padStart(2, '0')}h`, count: f ? parseInt(f.count) : 0 };
                });
                const maxCount = Math.max(...heures.map(h => h.count), 1);
                return heures.map((h, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 10, color: '#888', marginBottom: 2 }}>{h.count > 0 ? h.count : ''}</span>
                    <div style={{ width: '100%', background: '#1565c0', borderRadius: '4px 4px 0 0', height: `${(h.count / maxCount) * 100}%`, minHeight: h.count > 0 ? 4 : 0, transition: 'height 0.3s', opacity: h.count > 0 ? 1 : 0.3 }} />
                    <span style={{ fontSize: 8, color: '#999', marginTop: 4, transform: 'rotate(-45deg)' }}>{h.heure}</span>
                  </div>
                ));
              })()}
            </div>
          ) : <div style={styles.empty}>Aucune donnée aujourd'hui</div>}
        </div>

        {/* Performance agents */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>👨‍⚕️ Performance Agents (semaine)</div>
          {data.statsAgents?.length > 0 ? (
            data.statsAgents.map((a, i) => {
              const maxA = Math.max(...data.statsAgents.map(x => parseInt(x.total)), 1);
              const pct = (parseInt(a.total) / maxA) * 100;
              return (
                <div key={a.agentId || i} style={{ marginBottom: 12 }}>
                  <div style={styles.barLabel}>
                    <span>{a.agent?.nom || 'Agent'}</span>
                    <span>{a.total} tickets ✅</span>
                  </div>
                  <div style={styles.barBg}>
                    <div style={styles.barFill('#2e7d32', pct)} />
                  </div>
                </div>
              );
            })
          ) : <div style={styles.empty}>Aucune donnée cette semaine</div>}
        </div>
      </div>
    </div>
  );
}
