require('dotenv').config();
const { sequelize, User, Service, Station } = require('../models');
const logger = require('../utils/logger');

async function seed() {
  try {
    await sequelize.sync({ force: true });

    const admin = await User.create({
      nom: 'Super Admin', email: 'admin@example.com',
      motDePasse: 'admin123', role: 'super_admin',
    });

    const secretaire = await User.create({
      nom: 'Secrétaire', email: 'secretaire@example.com',
      motDePasse: 'agent123', role: 'agent',
    });

    const dg = await User.create({
      nom: 'Directeur Général', email: 'dg@example.com',
      motDePasse: 'agent123', role: 'agent',
    });

    const docteur1 = await User.create({
      nom: 'Dr. Kouassi', email: 'docteur1@example.com',
      motDePasse: 'agent123', role: 'agent',
    });

    const docteur2 = await User.create({
      nom: 'Dr. Koné', email: 'docteur2@example.com',
      motDePasse: 'agent123', role: 'agent',
    });

    const docteur3 = await User.create({
      nom: 'Dr. Diallo', email: 'docteur3@example.com',
      motDePasse: 'agent123', role: 'agent',
    });

    const sEnreg = await Service.create({
      nom: 'Enregistrement', prefixe: 'E', type: 'enregistrement',
      description: 'Bureau secrétariat - Enregistrement des patients', ordre: 1,
    });

    const sConsult = await Service.create({
      nom: 'Consultation', prefixe: 'C', type: 'consultation',
      description: 'Consultation médicale par les docteurs', ordre: 2,
    });

    const sDG = await Service.create({
      nom: 'Bureau DG', prefixe: 'D', type: 'dg',
      description: 'Rendez-vous avec le Directeur Général', ordre: 3,
    });

    await Station.create({ nom: 'Secrétariat', type: 'enregistrement', agentId: secretaire.id });
    await Station.create({ nom: 'Cabinet Dr. Kouassi', type: 'consultation', agentId: docteur1.id });
    await Station.create({ nom: 'Cabinet Dr. Koné', type: 'consultation', agentId: docteur2.id });
    await Station.create({ nom: 'Cabinet Dr. Diallo', type: 'consultation', agentId: docteur3.id });
    await Station.create({ nom: 'Bureau DG', type: 'dg', agentId: dg.id });

    logger.info('Base de données initialisée !');
    logger.info('Admin: admin@example.com / admin123');
    logger.info('Secrétaire: secretaire@example.com / agent123');
    logger.info('DG: dg@example.com / agent123');
    logger.info('Dr. Kouassi: docteur1@example.com / agent123');
    logger.info('Dr. Koné: docteur2@example.com / agent123');
    logger.info('Dr. Diallo: docteur3@example.com / agent123');

    process.exit(0);
  } catch (error) {
    logger.error('Erreur:', error);
    process.exit(1);
  }
}

seed();
