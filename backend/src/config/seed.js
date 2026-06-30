require('dotenv').config();
const { sequelize, User, Service, Station } = require('../models');
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

    const agentAccueil = await User.create({
      nom: 'Agent Accueil',
      email: 'accueil@example.com',
      motDePasse: 'agent123',
      role: 'agent',
    });

    const secretaire = await User.create({
      nom: 'Secrétaire Médical',
      email: 'secretaire@example.com',
      motDePasse: 'agent123',
      role: 'agent',
    });

    const docteur1 = await User.create({
      nom: 'Dr. Kouassi',
      email: 'docteur1@example.com',
      motDePasse: 'agent123',
      role: 'agent',
    });

    const docteur2 = await User.create({
      nom: 'Dr. Koné',
      email: 'docteur2@example.com',
      motDePasse: 'agent123',
      role: 'agent',
    });

    const docteur3 = await User.create({
      nom: 'Dr. Diallo',
      email: 'docteur3@example.com',
      motDePasse: 'agent123',
      role: 'agent',
    });

    const serviceAccueil = await Service.create({
      nom: 'Accueil',
      prefixe: 'A',
      type: 'accueil',
      description: 'Hall d\'accueil - Création des tickets',
      ordre: 1,
    });

    const serviceEnregistrement = await Service.create({
      nom: 'Enregistrement',
      prefixe: 'B',
      type: 'enregistrement',
      description: 'Bureau secrétariat - Enregistrement des patients',
      ordre: 2,
    });

    const serviceConsultation = await Service.create({
      nom: 'Consultation',
      prefixe: 'C',
      type: 'consultation',
      description: 'Consultation et traitement par les docteurs',
      ordre: 3,
    });

    await Station.create({ nom: 'Accueil 1', type: 'accueil', agentId: agentAccueil.id });
    await Station.create({ nom: 'Secrétariat', type: 'enregistrement', agentId: secretaire.id });
    await Station.create({ nom: 'Cabinet Dr. Kouassi', type: 'consultation', agentId: docteur1.id });
    await Station.create({ nom: 'Cabinet Dr. Koné', type: 'consultation', agentId: docteur2.id });
    await Station.create({ nom: 'Cabinet Dr. Diallo', type: 'consultation', agentId: docteur3.id });
    await Station.create({ nom: 'Bureau DG', type: 'consultation' });

    logger.info('Base de données initialisée avec succès !');
    logger.info('Admin: admin@example.com / admin123');
    logger.info('Accueil: accueil@example.com / agent123');
    logger.info('Secrétaire: secretaire@example.com / agent123');
    logger.info('Docteur 1: docteur1@example.com / agent123');
    logger.info('Docteur 2: docteur2@example.com / agent123');
    logger.info('Docteur 3: docteur3@example.com / agent123');

    process.exit(0);
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

seed();
