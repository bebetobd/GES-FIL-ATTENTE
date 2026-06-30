const sequelize = require('../config/database');
const User = require('./User');
const Service = require('./Service');
const Station = require('./Station');
const Ticket = require('./Ticket');

Service.hasMany(Ticket, { foreignKey: 'serviceId', as: 'tickets' });
Ticket.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

User.hasMany(Ticket, { foreignKey: 'creePar', as: 'ticketsCreer' });
Ticket.belongsTo(User, { foreignKey: 'creePar', as: 'createur' });

User.hasMany(Ticket, { foreignKey: 'agentEnregistrement', as: 'enregistrements' });
Ticket.belongsTo(User, { foreignKey: 'agentEnregistrement', as: 'agentEnreg' });

User.hasMany(Ticket, { foreignKey: 'agentConsultation', as: 'consultations' });
Ticket.belongsTo(User, { foreignKey: 'agentConsultation', as: 'agentConsult' });

User.hasMany(Station, { foreignKey: 'agentId', as: 'stations' });
Station.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });

module.exports = { sequelize, User, Service, Station, Ticket };
