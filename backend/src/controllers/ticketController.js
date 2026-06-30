const { Ticket, Service, Station, User } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

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
  } catch (error) { next(error); }
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
  } catch (error) { next(error); }
};

exports.annulerTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
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
    res.json({ enAttente, enCours, terme: termine });
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

exports.getHistorique = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, serviceId, statut, dateDebut, dateFin } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (serviceId) where.serviceId = serviceId;
    if (statut) where.statut = statut;
    if (search) where.nomPatient = { [Op.like]: `%${search}%` };
    if (dateDebut || dateFin) {
      where.createdAt = {};
      if (dateDebut) where.createdAt[Op.gte] = new Date(dateDebut);
      if (dateFin) where.createdAt[Op.lte] = new Date(dateFin);
    }

    const { count, rows } = await Ticket.findAndCountAll({
      where,
      include: [
        { model: Service, as: 'service', attributes: ['nom', 'prefixe', 'type'] },
        { model: User, as: 'agent', attributes: ['nom'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({ tickets: rows, total: count, page: parseInt(page), pages: Math.ceil(count / parseInt(limit)) });
  } catch (error) { next(error); }
};

exports.getStatsAvancees = async (req, res, next) => {
  try {
    const aujourdhui = new Date(); aujourdhui.setHours(0, 0, 0, 0);
    const debutSemaine = new Date(aujourdhui); debutSemaine.setDate(debutSemaine.getDate() - debutSemaine.getDay());
    debutSemaine.setHours(0, 0, 0, 0);

    const services = await Service.findAll({ where: { actif: true }, order: [['ordre', 'ASC']] });

    const statsServices = await Promise.all(services.map(async (s) => {
      const tickets = await Ticket.findAll({
        where: { serviceId: s.id, createdAt: { [Op.gte]: debutSemaine } },
        attributes: ['statut', 'createdAt', 'appeleLe', 'prisEnChargeLe', 'termineLe'],
      });

      const total = tickets.length;
      const termines = tickets.filter(t => t.statut === 'termine');
      const tempsAttente = termines
        .filter(t => t.appeleLe && t.prisEnChargeLe)
        .map(t => (new Date(t.prisEnChargeLe) - new Date(t.appeleLe)) / 60000);
      const tempsMoyen = tempsAttente.length ? Math.round(tempsAttente.reduce((a, b) => a + b, 0) / tempsAttente.length) : 0;
      const tempsPriseEnCharge = termines
        .filter(t => t.prisEnChargeLe && t.termineLe)
        .map(t => (new Date(t.termineLe) - new Date(t.prisEnChargeLe)) / 60000);
      const dureeMoyenne = tempsPriseEnCharge.length ? Math.round(tempsPriseEnCharge.reduce((a, b) => a + b, 0) / tempsPriseEnCharge.length) : 0;

      return {
        id: s.id, nom: s.nom, prefixe: s.prefixe, type: s.type,
        total, termines: termines.length, tempsMoyen, dureeMoyenne,
      };
    }));

    const fluxHoraire = await Ticket.findAll({
      attributes: [
        [fn('strftime', '%H', col('createdAt')), 'heure'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: { createdAt: { [Op.gte]: aujourdhui } },
      group: [fn('strftime', '%H', col('createdAt'))],
      order: [[fn('strftime', '%H', col('createdAt')), 'ASC']],
    });

    const statsAgents = await Ticket.findAll({
      attributes: [
        'agentId',
        [fn('COUNT', col('id')), 'total'],
      ],
      where: {
        agentId: { [Op.ne]: null },
        statut: 'termine',
        termineLe: { [Op.gte]: debutSemaine },
      },
      group: ['agentId'],
      include: [{ model: User, as: 'agent', attributes: ['nom'] }],
    });

    res.json({ statsServices, fluxHoraire, statsAgents });
  } catch (error) { next(error); }
};
