import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const COLORS = { enregistrement: '#f57c00', consultation: '#2e7d32', dg: '#6a1b9a' };
const STATUS = { en_attente: '⏳ Attente', appele: '🛎️ Appelé', en_cours: '🔄 En cours', termine: '✅ Terminé', annule: '❌ Annulé' };
const STATUS_COLORS = { en_attente: '#f57c00', appele: '#1565c0', en_cours: '#2e7d32', termine: '#555', annule: '#c62828' };

const styles = {
  container: { maxWidth: 1100, margin: '0 auto' },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 20 },
  filters: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' },
  input: { padding: '8px 12px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 13 },
  select: { padding: '8px 12px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 13, background: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f5f7fa', borderBottom: '2px solid #e0e0e0', fontSize: 12, fontWeight: 600, color: '#666' },
  td: { padding: '8px 12px', borderBottom: '1px solid #f0f2f5', fontSize: 13 },
  badge: (color) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: `${color}18`, color }),
  pagination: { display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16, alignItems: 'center' },
  pageBtn: (active) => ({ padding: '6px 14px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: active ? '#1565c0' : '#e0e0e0', color: active ? '#fff' : '#333' }),
};

export default function HistoriquePage() {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [services, setServices] = useState([]);
  const [filters, setFilters] = useState({ search: '', serviceId: '', statut: '', dateDebut: '', dateFin: '' });

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page, limit: 30, ...filters });
      if (!filters.search) params.delete('search');
      if (!filters.serviceId) params.delete('serviceId');
      if (!filters.statut) params.delete('statut');
      if (!filters.dateDebut) params.delete('dateDebut');
      if (!filters.dateFin) params.delete('dateFin');

      const { data } = await api.get(`/tickets/historique?${params}`);
      setTickets(data.tickets);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {}
  }, [page, filters]);

  useEffect(() => {
    load();
    api.get('/services').then(({ data }) => setServices(data.services)).catch(() => {});
  }, [load]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📜 Historique des Tickets ({total})</h1>

      <div style={styles.filters}>
        <input value={filters.search} onChange={e => { setFilters({ ...filters, search: e.target.value }); setPage(1); }} placeholder="Rechercher patient..." style={styles.input} />
        <select value={filters.serviceId} onChange={e => { setFilters({ ...filters, serviceId: e.target.value }); setPage(1); }} style={styles.select}>
          <option value="">Tous les services</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
        </select>
        <select value={filters.statut} onChange={e => { setFilters({ ...filters, statut: e.target.value }); setPage(1); }} style={styles.select}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input type="date" value={filters.dateDebut} onChange={e => { setFilters({ ...filters, dateDebut: e.target.value }); setPage(1); }} style={styles.input} />
        <input type="date" value={filters.dateFin} onChange={e => { setFilters({ ...filters, dateFin: e.target.value }); setPage(1); }} style={styles.input} />
        <button onClick={() => { setFilters({ search: '', serviceId: '', statut: '', dateDebut: '', dateFin: '' }); setPage(1); }} style={{ padding: '8px 14px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, background: '#c62828', color: '#fff' }}>Reset</button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Ticket</th>
            <th style={styles.th}>Patient</th>
            <th style={styles.th}>Service</th>
            <th style={styles.th}>Statut</th>
            <th style={styles.th}>Station</th>
            <th style={styles.th}>Agent</th>
            <th style={styles.th}>Créé le</th>
          </tr>
        </thead>
        <tbody>
          {tickets.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#999' }}>Aucun résultat</td></tr>
          )}
          {tickets.map(t => (
            <tr key={t.id}>
              <td style={styles.td}><strong>{t.numero}</strong></td>
              <td style={styles.td}>{t.nomPatient || '—'}</td>
              <td style={styles.td}>{t.service?.nom || '—'}</td>
              <td style={styles.td}><span style={styles.badge(STATUS_COLORS[t.statut])}>{STATUS[t.statut] || t.statut}</span></td>
              <td style={styles.td}>{t.station || '—'}</td>
              <td style={styles.td}>{t.agent?.nom || '—'}</td>
              <td style={styles.td}>{new Date(t.createdAt).toLocaleString('fr-FR')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {pages > 1 && (
        <div style={styles.pagination}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={styles.pageBtn(false)}>◀</button>
          <span style={{ fontSize: 14, color: '#666' }}>Page {page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} style={styles.pageBtn(false)}>▶</button>
        </div>
      )}
    </div>
  );
}
