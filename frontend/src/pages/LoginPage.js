import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const styles = {
  container: { maxWidth: 400, margin: '60px auto', background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  title: { fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  input: { padding: '12px 16px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15, outline: 'none' },
  btn: { background: '#1565c0', color: '#fff', border: 'none', padding: 14, borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' },
  error: { background: '#f8d7da', color: '#721c24', padding: 12, borderRadius: 8, fontSize: 14, textAlign: 'center' },
};

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(email, motDePasse);
      try {
        const stationsRes = await api.get('/stations');
        const userStation = stationsRes.data.stations.find(s => s.agentId === data.user?.id);
        if (userStation) {
          data.user.stationType = userStation.type;
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (_) {}
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Connexion</h1>
      <p style={styles.subtitle}>Connectez-vous pour accéder à votre service</p>
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={styles.input} required />
        <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} placeholder="Mot de passe" style={styles.input} required />
        <button type="submit" style={styles.btn}>Se connecter</button>
      </form>
    </div>
  );
}
