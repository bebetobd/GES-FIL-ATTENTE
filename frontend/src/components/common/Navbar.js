import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const styles = {
  navbar: {
    background: 'linear-gradient(135deg, #0d47a1, #1565c0)',
    padding: '0 20px', height: 56,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  logo: { color: '#fff', fontSize: 16, fontWeight: 700, textDecoration: 'none' },
  nav: { display: 'flex', gap: 3, alignItems: 'center' },
  link: { color: 'rgba(255,255,255,0.9)', textDecoration: 'none', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500 },
  button: { background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 },
  badge: { color: '#fff', fontSize: 11, opacity: 0.8, marginRight: 6 },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.logo}>🏥 File d'Attente</Link>
      <div style={styles.nav}>
        <Link to="/" style={styles.link}>🏠 Hall</Link>
        <Link to="/display" style={styles.link}>📺 Écran</Link>
        {user ? (
          <>
            {user.stationType && <Link to={`/service/${user.stationType}`} style={styles.link}>📋 Service</Link>}
            {(user.role === 'admin' || user.role === 'super_admin') && (
              <>
                <Link to="/historique" style={styles.link}>📜 Historique</Link>
                <Link to="/stats" style={styles.link}>📊 Stats</Link>
                <Link to="/admin" style={styles.link}>⚙️ Admin</Link>
              </>
            )}
            <span style={styles.badge}>{user.nom}</span>
            <button onClick={handleLogout} style={styles.button}>Exit</button>
          </>
        ) : (
          <Link to="/login" style={styles.link}>Connexion</Link>
        )}
      </div>
    </nav>
  );
}
