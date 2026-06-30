const sequelize = require('../config/database');
const User = require('./User');
const Service = require('./Service');
const Station = require('./Station');
const Ticket = require('./Ticket');

Service.hasMany(Ticket, { foreignKey: 'serviceId', as: 'tickets' });
Ticket.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

Station.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });
User.hasMany(Station, { foreignKey: 'agentId', as: 'stations' });

User.hasMany(Ticket, { foreignKey: 'agentId', as: 'ticketsTraites' });
Ticket.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });

module.exports = { sequelize, User, Service, Station, Ticket };
