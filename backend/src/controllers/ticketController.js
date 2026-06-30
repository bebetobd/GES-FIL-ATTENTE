const { Ticket, Service, Station } = require('../models');
const { Op } = require('sequelize');

exports.creerTicket = async (req, res, next) => {
  try {
    const { serviceId, nomPatient } = req.body;
    const service = await Service.findByPk(serviceId);
    if (!service || !service.actif) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    const lastTicket = await Ticket.findOne({
      where: { serviceId },
      order: [['numeroSequence', 'DESC']],
    });

    const nextSeq = (lastTicket?.numeroSequence || 0) + 1;
    const numero = `${service.prefixe}${String(nextSeq).padStart(3, '0')}`;

    const ticket = await Ticket.create({
      numero, numeroSequence: nextSeq, nomPatient: nomPatient || null,
      statut: 'en_attente', serviceId,
    });

    const enAttente = await Ticket.count({
      where: { serviceId, statut: 'en_attente' },
    });

    req.io.to('display').emit('mise-a-jour', { serviceId });
    req.io.to(`service-${serviceId}`).emit('nouveau-ticket', ticket.toJSON());

    res.status(201).json({
      ticket,
      position: enAttente,
      message: `Ticket ${numero} pour ${service.nom}. ${enAttente} personne(s) devant vous.`,
    });
  } catch (error) {
    next(error);
  }
};

exports.appelerSuivant = async (req, res, next) => {
  try {
    const { serviceId, stationId } = req.params;
    const station = await Station.findByPk(stationId);
    if (!station) return res.status(404).json({ message: 'Station non trouvée' });

    const ticket = await Ticket.findOne({
      where: { serviceId, statut: 'en_attente' },
      order: [['createdAt', 'ASC']],
    });
    if (!ticket) return res.status(404).json({ message: 'Aucun patient en attente' });

    await ticket.update({
      statut: 'appele', agentId: req.user.id,
      station: station.nom, appeleLe: new Date(),
    });

    const enAttente = await Ticket.count({ where: { serviceId, statut: 'en_attente' } });

    const service = await Service.findByPk(serviceId);

    req.io.to('display').emit('appel', {
      ticket: ticket.toJSON(),
      station: station.nom,
      service: { id: service.id, nom: service.nom, type: service.type },
      enAttente,
    });

    res.json({ ticket, enAttente });
  } catch (error) {
    next(error);
  }
};

exports.commencerService = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket || !['appele', 'en_attente'].includes(ticket.statut)) {
      return res.status(400).json({ message: 'Ticket non trouvé ou déjà pris' });
    }
    await ticket.update({ statut: 'en_cours', prisEnChargeLe: new Date() });
    req.io.to('display').emit('mise-a-jour', { serviceId: ticket.serviceId });
    res.json({ ticket });
  } catch (error) {
    next(error);
  }
};

exports.terminerService = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket || ticket.statut !== 'en_cours') {
      return res.status(400).json({ message: 'Ticket non trouvé ou pas en cours' });
    }
    await ticket.update({ statut: 'termine', termineLe: new Date() });
    req.io.to('display').emit('mise-a-jour', { serviceId: ticket.serviceId });
    res.json({ ticket });
  } catch (error) {
    next(error);
  }
};

exports.annulerTicket = async (req, res, next) => {
  try {const { id } = req.params;
    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé' });
    await ticket.update({ statut: 'annule' });
    req.io.to('display').emit('mise-a-jour', { serviceId: ticket.serviceId });
    res.json({ ticket });
  } catch (error) { next(error); }
};

exports.getFileService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const [enAttente, enCours, termine] = await Promise.all([
      Ticket.findAll({ where: { serviceId, statut: 'en_attente' }, order: [['createdAt', 'ASC']] }),
      Ticket.findOne({ where: { serviceId, statut: { [Op.in]: ['appele', 'en_cours'] } }, order: [['appeleLe', 'DESC']] }),
      Ticket.count({ where: { serviceId, statut: 'termine', termineLe: { [Op.gte]: new Date(new Date().setHours(0,0,0,0)) } } }),
    ]);
    res.json({ enAttente, enCours, termine });
  } catch (error) { next(error); }
};

exports.getStats = async (req, res, next) => {
  try {
    const services = await Service.findAll({ where: { actif: true } });
    const stats = await Promise.all(services.map(async (s) => {
      const [enAttente, enCours, termine] = await Promise.all([
        Ticket.count({ where: { serviceId: s.id, statut: 'en_attente' } }),
        Ticket.count({ where: { serviceId: s.id, statut: { [Op.in]: ['appele', 'en_cours'] } } }),
        Ticket.count({ where: { serviceId: s.id, statut: 'termine', termineLe: { [Op.gte]: new Date(new Date().setHours(0,0,0,0)) } } }),
      ]);
      return { id: s.id, nom: s.nom, prefixe: s.prefixe, type: s.type, enAttente, enCours, termine };
    }));
    const total = stats.reduce((a, s) => a + s.enAttente + s.enCours, 0);
    res.json({ services: stats, total });
  } catch (error) { next(error); }
};
