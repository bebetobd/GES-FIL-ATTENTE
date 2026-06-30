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
    type: DataTypes.ENUM('en_attente', 'appele', 'en_cours', 'termine', 'annule'),
    defaultValue: 'en_attente',
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  station: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  agentId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  appeleLe: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  prisEnChargeLe: {
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
