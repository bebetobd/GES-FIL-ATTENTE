const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prefixe: {
    type: DataTypes.STRING(1),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('accueil', 'enregistrement', 'consultation'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  ordre: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

module.exports = Service;
