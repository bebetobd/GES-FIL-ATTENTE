export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(statut) {
  const colors = {
    en_attente: { bg: '#fff3cd', color: '#856404' },
    appele: { bg: '#cce5ff', color: '#004085' },
    en_cours: { bg: '#d4edda', color: '#155724' },
    termine: { bg: '#f8f9fa', color: '#6c757d' },
    annule: { bg: '#f8d7da', color: '#721c24' },
  };
  return colors[statut] || { bg: '#f8f9fa', color: '#6c757d' };
}

export function getStatusLabel(statut) {
  const labels = {
    en_attente: 'En attente',
    appele: 'Appelé',
    en_cours: 'En cours',
    termine: 'Terminé',
    annule: 'Annulé',
  };
  return labels[statut] || statut;
}
