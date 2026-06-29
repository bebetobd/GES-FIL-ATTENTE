import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const styles = {
  container: {
    maxWidth: 420,
    margin: '60px auto',
    background: '#fff',
    borderRadius: 16,
    padding: 40,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  title: { fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 32 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  label: { fontSize: 14, fontWeight: 500, color: '#333' },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: 8,
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    background: '#1a73e8',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
  },
  error: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: 8,
    fontSize: 14,
    textAlign: 'center',
  },
};

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');

  if (user) return <Navigate to="/queue" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, motDePasse);
      navigate('/queue');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Connexion</h1>
      <p style={styles.subtitle}>Connectez-vous pour gérer les files d'attente</p>
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}
        <div>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            placeholder="admin@example.com"
            required
            onFocus={(e) => (e.target.style.borderColor = '#1a73e8')}
            onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
          />
        </div>
        <div>
          <label style={styles.label}>Mot de passe</label>
          <input
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            style={styles.input}
            placeholder="admin123"
            required
            onFocus={(e) => (e.target.style.borderColor = '#1a73e8')}
            onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
          />
        </div>
        <button type="submit" style={styles.button}>Se connecter</button>
      </form>
    </div>
  );
}
