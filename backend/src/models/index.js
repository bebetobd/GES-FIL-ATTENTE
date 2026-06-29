const sequelize = require('../config/database');
const User = require('./User');
const Service = require('./Service');
const Counter = require('./Counter');
const Ticket = require('./Ticket');

User.hasMany(Ticket, { foreignKey: 'agentId', as: 'ticketsTraites' });
Ticket.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });

Service.hasMany(Ticket, { foreignKey: 'serviceId', as: 'tickets' });
Ticket.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

Service.hasMany(Counter, { foreignKey: 'serviceId', as: 'guichets' });
Counter.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

User.hasMany(Counter, { foreignKey: 'agentId', as: 'counters' });
Counter.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });

module.exports = { sequelize, User, Service, Counter, Ticket };
