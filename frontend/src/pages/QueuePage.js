import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { connectSocket } from '../services/socket';
import { getStatusLabel, getStatusColor, formatDate } from '../utils/helpers';

const styles = {
  container: { maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700 },
  counterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 },
  counterCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  counterName: { fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#1a73e8' },
  statusBadge: (status) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    background: status?.bg || '#f0f2f5',
    color: status?.color || '#666',
    marginBottom: 12,
  }),
  ticketInfo: { fontSize: 14, color: '#333', marginBottom: 6 },
  emptyState: { color: '#999', fontSize: 14, fontStyle: 'italic' },
  btnGroup: { display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' },
  btn: (variant) => ({
    flex: 1,
    padding: '10px 16px',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    background: variant === 'primary' ? '#1a73e8' :
                variant === 'success' ? '#28a745' :
                variant === 'danger' ? '#dc3545' : '#6c757d',
    color: '#fff',
    minWidth: 100,
  }),
};

export default function QueuePage() {
  const [counters, setCounters] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);

  const loadCounters = useCallback(async () => {
    try {
      const { data } = await api.get('/counters');
      setCounters(data.counters);
    } catch (err) {}
  }, []);

  useEffect(() => {
    loadCounters();
    const socket = connectSocket();
    socket.on('ticket-called', () => loadCounters());
    socket.on('ticket-started', () => loadCounters());
    socket.on('ticket-completed', () => loadCounters());
    return () => socket.off('ticket-called ticket-started ticket-completed');
  }, [loadCounters]);

  const callNext = async (counterId) => {
    try {
      const { data } = await api.post(`/tickets/counter/${counterId}/call-next`);
      setCurrentTicket(data.ticket);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const startTicket = async (ticketId) => {
    try {
      await api.put(`/tickets/${ticketId}/start`);
    } catch (err) {}
  };

  const completeTicket = async (ticketId) => {
    try {
      await api.put(`/tickets/${ticketId}/complete`);
      setCurrentTicket(null);
    } catch (err) {}
  };

  const getActiveTicket = (counter) => {
    return counters
      .flatMap((c) => c.ticketsEnCours || [])
      .find((t) => t.guichet === counter.nom);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Gestion des Files d'Attente</h1>
      </div>
      <div style={styles.counterGrid}>
        {counters.map((counter) => (
          <div key={counter.id} style={styles.counterCard}>
            <div style={styles.counterName}>
              {counter.nom} - {counter.service?.nom}
            </div>
            <div>
              <span style={styles.statusBadge(counter.agent ? { bg: '#d4edda', color: '#155724' } : { bg: '#f8d7da', color: '#721c24' })}>
                {counter.agent ? counter.agent.nom : 'Non assigné'}
              </span>
            </div>
            {counter.agent && (
              <div style={styles.btnGroup}>
                <button onClick={() => callNext(counter.id)} style={styles.btn('primary')}>
                  Appeler suivant
                </button>
                {currentTicket && (
                  <>
                    <button onClick={() => startTicket(currentTicket.id)} style={styles.btn('success')}>
                      Commencer
                    </button>
                    <button onClick={() => completeTicket(currentTicket.id)} style={styles.btn('danger')}>
                      Terminer
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
