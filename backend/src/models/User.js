const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  motDePasse: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'agent'),
    defaultValue: 'agent',
  },
  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      user.motDePasse = await bcrypt.hash(user.motDePasse, 10);
    },
    beforeUpdate: async (user) => {
      if (user.changed('motDePasse')) {
        user.motDePasse = await bcrypt.hash(user.motDePasse, 10);
      }
    },
  },
});

User.prototype.verifierMotDePasse = async function (motDePasse) {
  return bcrypt.compare(motDePasse, this.motDePasse);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.motDePasse;
  return values;
};

module.exports = User;
