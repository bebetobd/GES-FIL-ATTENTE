import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import TicketPage from './pages/TicketPage';
import QueuePage from './pages/QueuePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import DisplayPage from './pages/DisplayPage';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    padding: '24px',
    maxWidth: 1200,
    width: '100%',
    margin: '0 auto',
  },
};

export default function App() {
  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ticket" element={<TicketPage />} />
          <Route path="/display" element={<DisplayPage />} />
          <Route path="/display/:serviceId" element={<DisplayPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/queue" element={<ProtectedRoute><QueuePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['super_admin', 'admin']}><AdminPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
