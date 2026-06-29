const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Counter = sequelize.define('Counter', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numero: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

module.exports = Counter;
