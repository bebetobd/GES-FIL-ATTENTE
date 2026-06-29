import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const styles = {
  navbar: {
    background: 'linear-gradient(135deg, #1a73e8, #0d47a1)',
    padding: '0 24px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  logo: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 700,
    textDecoration: 'none',
  },
  nav: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  link: {
    color: 'rgba(255,255,255,0.9)',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  button: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
  },
  userBadge: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.8,
    marginRight: 8,
  },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.logo}>File d'Attente</Link>
      <div style={styles.nav}>
        <Link to="/" style={styles.link}>Accueil</Link>
        <Link to="/ticket" style={styles.link}>Prendre un ticket</Link>
        <Link to="/display" style={styles.link}>Affichage</Link>
        {user ? (
          <>
            <Link to="/queue" style={styles.link}>File d'attente</Link>
            {(user.role === 'admin' || user.role === 'super_admin') && (
              <Link to="/admin" style={styles.link}>Administration</Link>
            )}
            <span style={styles.userBadge}>{user.nom}</span>
            <button onClick={handleLogout} style={styles.button}>Déconnexion</button>
          </>
        ) : (
          <Link to="/login" style={styles.link}>Connexion</Link>
        )}
      </div>
    </nav>
  );
}
