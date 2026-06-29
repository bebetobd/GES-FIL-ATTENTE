const TICKET_STATUS = {
  EN_ATTENTE: 'en_attente',
  APPELE: 'appele',
  EN_COURS: 'en_cours',
  TERMINE: 'termine',
  ANNULE: 'annule',
};

const USER_ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  SUPER_ADMIN: 'super_admin',
};

const PREFIXES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

module.exports = { TICKET_STATUS, USER_ROLES, PREFIXES };
