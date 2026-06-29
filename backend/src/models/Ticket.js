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
  statut: {
    type: DataTypes.ENUM('en_attente', 'appele', 'en_cours', 'termine', 'annule'),
    defaultValue: 'en_attente',
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Services', key: 'id' },
  },
  agentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'Users', key: 'id' },
  },
  guichet: {
    type: DataTypes.STRING,
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
  tempsAttente: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = Ticket;
