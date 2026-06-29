const { Ticket, Service, Counter } = require('../models');
const { TICKET_STATUS } = require('../config/constants');
const { Op } = require('sequelize');

exports.createTicket = async (req, res, next) => {
  try {
    const { serviceId } = req.body;
    const service = await Service.findByPk(serviceId);

    if (!service || !service.actif) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    const lastTicket = await Ticket.findOne({
      where: { serviceId },
      order: [['numeroSequence', 'DESC']],
    });

    const nextSequence = (lastTicket?.numeroSequence || 0) + 1;
    const numero = `${service.prefixe}${String(nextSequence).padStart(3, '0')}`;

    const ticket = await Ticket.create({
      numero,
      numeroSequence: nextSequence,
      serviceId,
      statut: TICKET_STATUS.EN_ATTENTE,
    });

    const ticketCount = await Ticket.count({
      where: { serviceId, statut: TICKET_STATUS.EN_ATTENTE },
    });

    req.io.to(`display-${serviceId}`).emit('new-ticket', ticket.toJSON());

    res.status(201).json({
      ticket,
      position: ticketCount,
      estimatedWait: ticketCount * 5,
    });
  } catch (error) {
    next(error);
  }
};

exports.callNextTicket = async (req, res, next) => {
  try {
    const { counterId } = req.params;
    const counter = await Counter.findByPk(counterId, {
      include: [{ model: Service, as: 'service' }],
    });

    if (!counter) {
      return res.status(404).json({ message: 'Guichet non trouvé' });
    }

    if (counter.agentId !== req.user.id && req.user.role === 'agent') {
      return res.status(403).json({ message: 'Ce guichet ne vous appartient pas' });
    }

    const ticket = await Ticket.findOne({
      where: {
        serviceId: counter.serviceId,
        statut: TICKET_STATUS.EN_ATTENTE,
      },
      order: [['createdAt', 'ASC']],
      include: [{ model: Service, as: 'service' }],
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Aucun ticket en attente' });
    }

    await ticket.update({
      statut: TICKET_STATUS.APPELE,
      agentId: req.user.id,
      guichet: counter.nom,
      appeleLe: new Date(),
    });

    const waitingCount = await Ticket.count({
      where: {
        serviceId: counter.serviceId,
        statut: TICKET_STATUS.EN_ATTENTE,
      },
    });

    req.io.to(`display-${counter.serviceId}`).emit('ticket-called', {
      ticket: ticket.toJSON(),
      counter: counter.nom,
      waitingCount,
    });

    res.json({ ticket, waitingCount });
  } catch (error) {
    next(error);
  }
};

exports.startTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id);

    if (!ticket || ticket.statut !== TICKET_STATUS.APPELE) {
      return res.status(400).json({ message: 'Ticket non trouvé ou déjà pris en charge' });
    }

    await ticket.update({
      statut: TICKET_STATUS.EN_COURS,
      prisEnChargeLe: new Date(),
    });

    req.io.to(`display-${ticket.serviceId}`).emit('ticket-started', ticket.toJSON());

    res.json({ ticket });
  } catch (error) {
    next(error);
  }
};

exports.completeTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    const tempsAttente = ticket.prisEnChargeLe
      ? Math.round((new Date() - new Date(ticket.prisEnChargeLe)) / 60000)
      : 0;

    await ticket.update({
      statut: TICKET_STATUS.TERMINE,
      termineLe: new Date(),
      tempsAttente,
    });

    req.io.to(`display-${ticket.serviceId}`).emit('ticket-completed', ticket.toJSON());

    res.json({ ticket });
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

    await ticket.update({ statut: TICKET_STATUS.ANNULE });

    req.io.to(`display-${ticket.serviceId}`).emit('ticket-cancelled', ticket.toJSON());

    res.json({ ticket });
  } catch (error) {
    next(error);
  }
};

exports.getTicketsByService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const { statut } = req.query;

    const where = { serviceId };
    if (statut) where.statut = statut;

    const tickets = await Ticket.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    res.json({ tickets });
  } catch (error) {
    next(error);
  }
};

exports.getTodayStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Ticket.findAll({
      attributes: [
        'statut',
        [require('sequelize').fn('COUNT', 'id'), 'count'],
      ],
      where: {
        createdAt: { [Op.gte]: today },
      },
      group: ['statut'],
    });

    const totalEnAttente = await Ticket.count({
      where: { statut: TICKET_STATUS.EN_ATTENTE },
    });

    const tempsMoyenAttente = await Ticket.findOne({
      attributes: [[require('sequelize').fn('AVG', require('sequelize').col('tempsAttente')), 'moyenne']],
      where: {
        tempsAttente: { [Op.ne]: null },
        createdAt: { [Op.gte]: today },
      },
    });

    res.json({
      stats,
      totalEnAttente,
      tempsMoyenAttente: Math.round(tempsMoyenAttente?.get('moyenne') || 0),
    });
  } catch (error) {
    next(error);
  }
};
