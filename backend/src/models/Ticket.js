const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numeroSequence: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nomPatient: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  statut: {
    type: DataTypes.ENUM(
      'en_attente',
      'en_enregistrement',
      'en_attente_consultation',
      'en_consultation',
      'termine',
      'annule'
    ),
    defaultValue: 'en_attente',
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  creePar: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  agentEnregistrement: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  agentConsultation: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  stationEnregistrement: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stationConsultation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  appeleEnregistrementLe: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  valideEnregistrementLe: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  appeleConsultationLe: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  termineLe: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = Ticket;
