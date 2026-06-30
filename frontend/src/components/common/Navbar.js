import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const styles = {
  navbar: {
    background: 'linear-gradient(135deg, #0d47a1, #1565c0)',
    padding: '0 24px', height: 60,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  logo: { color: '#fff', fontSize: 18, fontWeight: 700, textDecoration: 'none' },
  nav: { display: 'flex', gap: 4, alignItems: 'center' },
  link: { color: 'rgba(255,255,255,0.9)', textDecoration: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500 },
  button: { background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  badge: { color: '#fff', fontSize: 12, opacity: 0.8, marginRight: 8 },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.logo}>🏥 Clinique - File d'Attente</Link>
      <div style={styles.nav}>
        <Link to="/" style={styles.link}>🏠 Tablette Hall</Link>
        <Link to="/display" style={styles.link}>📺 Écran</Link>
        {user ? (
          <>
            {user.stationType && <Link to={`/service/${user.stationType}`} style={styles.link}>📋 Mon Service</Link>}
            {(user.role === 'admin' || user.role === 'super_admin') && <Link to="/admin" style={styles.link}>⚙️ Admin</Link>}
            <span style={styles.badge}>{user.nom}</span>
            <button onClick={handleLogout} style={styles.button}>Déconnexion</button>
          </>
        ) : (
          <Link to="/login" style={styles.link}>Connexion</Link>
        )}
      </div>
    </nav>
  );
}
