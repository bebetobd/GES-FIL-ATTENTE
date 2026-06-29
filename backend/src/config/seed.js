require('dotenv').config();
const { sequelize, User, Service, Counter } = require('../models');
const logger = require('../utils/logger');

async function seed() {
  try {
    await sequelize.sync({ force: true });

    const superAdmin = await User.create({
      nom: 'Super Admin',
      email: 'admin@example.com',
      motDePasse: 'admin123',
      role: 'super_admin',
    });

    const agent1 = await User.create({
      nom: 'Agent 1',
      email: 'agent1@example.com',
      motDePasse: 'agent123',
      role: 'agent',
    });

    const agent2 = await User.create({
      nom: 'Agent 2',
      email: 'agent2@example.com',
      motDePasse: 'agent123',
      role: 'agent',
    });

    const serviceAccueil = await Service.create({
      nom: 'Accueil',
      prefixe: 'A',
      description: 'Service d\'accueil et orientation',
    });

    const serviceCaisse = await Service.create({
      nom: 'Caisse',
      prefixe: 'B',
      description: 'Service de paiement et facturation',
    });

    const serviceInfo = await Service.create({
      nom: 'Information',
      prefixe: 'C',
      description: 'Service d\'information et renseignements',
    });

    await Counter.create({ nom: 'Guichet 1', numero: 1, serviceId: serviceAccueil.id, agentId: agent1.id });
    await Counter.create({ nom: 'Guichet 2', numero: 2, serviceId: serviceAccueil.id });
    await Counter.create({ nom: 'Caisse 1', numero: 1, serviceId: serviceCaisse.id, agentId: agent2.id });
    await Counter.create({ nom: 'Caisse 2', numero: 2, serviceId: serviceCaisse.id });
    await Counter.create({ nom: 'Info 1', numero: 1, serviceId: serviceInfo.id });

    logger.info('Base de données initialisée avec succès !');
    logger.info('Admin: admin@example.com / admin123');
    logger.info('Agent: agent1@example.com / agent123');

    process.exit(0);
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

seed();
