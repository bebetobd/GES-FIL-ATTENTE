const { Ticket, Service, Station } = require('../models');
const { Op } = require('sequelize');

exports.creerTicket = async (req, res, next) => {
  try {
    const { nomPatient } = req.body;
    const serviceAccueil = await Service.findOne({ where: { type: 'accueil', actif: true } });

    if (!serviceAccueil) {
      return res.status(500).json({ message: 'Service accueil non configuré' });
    }

    const lastTicket = await Ticket.findOne({
      order: [['numeroSequence', 'DESC']],
    });

    const nextSequence = (lastTicket?.numeroSequence || 0) + 1;
    const numero = `A${String(nextSequence).padStart(3, '0')}`;

    const ticket = await Ticket.create({
      numero,
      numeroSequence: nextSequence,
      nomPatient: nomPatient || null,
      statut: 'en_attente',
      serviceId: serviceAccueil.id,
      creePar: req.user?.id || null,
    });

    const enAttenteEnregistrement = await Ticket.count({
      where: { statut: 'en_attente' },
    });

    const enAttenteConsultation = await Ticket.count({
      where: { statut: 'en_attente_consultation' },
    });

    req.io.to('display').emit('ticket-cree', {
      ticket: ticket.toJSON(),
      enAttenteEnregistrement,
      enAttenteConsultation,
    });

    res.status(201).json({
      ticket,
      position: enAttenteEnregistrement,
      message: `Ticket ${numero} créé. Veuillez attendre l'appel pour l'enregistrement.`,
    });
  } catch (error) {
    next(error);
  }
};

exports.appelerEnregistrement = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const station = await Station.findByPk(stationId);

    if (!station || station.type !== 'enregistrement') {
      return res.status(404).json({ message: 'Station d\'enregistrement non trouvée' });
    }

    const ticket = await Ticket.findOne({
      where: { statut: 'en_attente' },
      order: [['createdAt', 'ASC']],
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Aucun patient en attente d\'enregistrement' });
    }

    await ticket.update({
      statut: 'en_enregistrement',
      agentEnregistrement: req.user.id,
      stationEnregistrement: station.nom,
      appeleEnregistrementLe: new Date(),
    });

    const enAttente = await Ticket.count({ where: { statut: 'en_attente' } });

    req.io.to('display').emit('enregistrement-appele', {
      ticket: ticket.toJSON(),
      station: station.nom,
      enAttente,
    });

    res.json({ ticket, enAttente });
  } catch (error) {
    next(error);
  }
};

exports.validerEnregistrement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id);

    if (!ticket || ticket.statut !== 'en_enregistrement') {
      return res.status(400).json({ message: 'Ticket non trouvé ou pas en cours d\'enregistrement' });
    }

    const serviceConsultation = await Service.findOne({ where: { type: 'consultation', actif: true } });

    await ticket.update({
      statut: 'en_attente_consultation',
      serviceId: serviceConsultation.id,
      valideEnregistrementLe: new Date(),
    });

    const enAttenteConsultation = await Ticket.count({
      where: { statut: 'en_attente_consultation' },
    });

    req.io.to('display').emit('enregistrement-valide', {
      ticket: ticket.toJSON(),
      enAttenteConsultation,
    });

    res.json({ ticket, enAttenteConsultation });
  } catch (error) {
    next(error);
  }
};

exports.appelerConsultation = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const station = await Station.findByPk(stationId);

    if (!station || station.type !== 'consultation') {
      return res.status(404).json({ message: 'Cabinet de consultation non trouvé' });
    }

    const ticket = await Ticket.findOne({
      where: { statut: 'en_attente_consultation' },
      order: [['valideEnregistrementLe', 'ASC'], ['createdAt', 'ASC']],
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Aucun patient en attente de consultation' });
    }

    await ticket.update({
      statut: 'en_consultation',
      agentConsultation: req.user.id,
      stationConsultation: station.nom,
      appeleConsultationLe: new Date(),
    });

    const enAttente = await Ticket.count({
      where: { statut: 'en_attente_consultation' },
    });

    const enCours = await Ticket.findAll({
      where: { statut: 'en_consultation' },
      attributes: ['numero', 'stationConsultation', 'nomPatient'],
    });

    req.io.to('display').emit('consultation-appele', {
      ticket: ticket.toJSON(),
      station: station.nom,
      enAttente,
      consultationsEnCours: enCours,
    });

    res.json({ ticket, enAttente, consultationsEnCours: enCours });
  } catch (error) {
    next(error);
  }
};

exports.terminerConsultation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id);

    if (!ticket || ticket.statut !== 'en_consultation') {
      return res.status(400).json({ message: 'Ticket non trouvé ou pas en consultation' });
    }

    await ticket.update({
      statut: 'termine',
      termineLe: new Date(),
    });

    const enAttente = await Ticket.count({
      where: { statut: 'en_attente_consultation' },
    });

    const enCours = await Ticket.findAll({
      where: { statut: 'en_consultation' },
      attributes: ['numero', 'stationConsultation', 'nomPatient'],
    });

    req.io.to('display').emit('consultation-terminee', {
      ticket: ticket.toJSON(),
      enAttente,
      consultationsEnCours: enCours,
    });

    res.json({ ticket, enAttente, consultationsEnCours: enCours });
  } catch (error) {
    next(error);
  }
};

exports.annulerTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    await ticket.update({ statut: 'annule' });
    req.io.to('display').emit('ticket-annule', ticket.toJSON());

    res.json({ ticket });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const [
      enAttente,
      enEnregistrement,
      enAttenteConsultation,
      enConsultation,
      termineAujourdhui,
    ] = await Promise.all([
      Ticket.count({ where: { statut: 'en_attente' } }),
      Ticket.count({ where: { statut: 'en_enregistrement' } }),
      Ticket.count({ where: { statut: 'en_attente_consultation' } }),
      Ticket.count({ where: { statut: 'en_consultation' } }),
      Ticket.count({
        where: {
          statut: 'termine',
          termineLe: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    res.json({
      enAttente,
      enEnregistrement,
      enAttenteConsultation,
      enConsultation,
      termineAujourdhui,
      total: enAttente + enEnregistrement + enAttenteConsultation + enConsultation,
    });
  } catch (error) {
    next(error);
  }
};
