const { Ticket, Service, Counter } = require('../models');
const { TICKET_STATUS } = require('../config/constants');
const { Op } = require('sequelize');

exports.getDisplayData = async (req, res, next) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findByPk(serviceId, {
      include: [{ model: Counter, as: 'guichets', where: { actif: true }, required: false }],
    });

    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    const ticketEnCours = await Ticket.findOne({
      where: {
        serviceId,
        statut: { [Op.in]: [TICKET_STATUS.APPELE, TICKET_STATUS.EN_COURS] },
      },
      order: [['appeleLe', 'DESC']],
    });

    const derniersAppeles = await Ticket.findAll({
      where: {
        serviceId,
        statut: { [Op.in]: [TICKET_STATUS.TERMINE, TICKET_STATUS.EN_COURS, TICKET_STATUS.APPELE] },
      },
      order: [['appeleLe', 'DESC']],
      limit: 10,
    });

    const enAttente = await Ticket.count({
      where: { serviceId, statut: TICKET_STATUS.EN_ATTENTE },
    });

    const counterStatus = await Promise.all(
      (service.guichets || []).map(async (counter) => {
        const currentTicket = await Ticket.findOne({
          where: {
            guichet: counter.nom,
            statut: { [Op.in]: [TICKET_STATUS.EN_COURS, TICKET_STATUS.APPELE] },
          },
          order: [['appeleLe', 'DESC']],
        });
        return {
          id: counter.id,
          nom: counter.nom,
          numero: counter.numero,
          ticketEnCours: currentTicket?.numero || null,
          estOccupe: !!currentTicket,
        };
      })
    );

    res.json({
      service: service.toJSON(),
      ticketEnCours: ticketEnCours?.toJSON() || null,
      derniersAppeles: derniersAppeles.map((t) => t.toJSON()),
      enAttente,
      guichets: counterStatus,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllDisplays = async (req, res, next) => {
  try {
    const services = await Service.findAll({
      where: { actif: true },
      attributes: ['id', 'nom', 'prefixe'],
    });

    const displaysData = await Promise.all(
      services.map(async (service) => {
        const enAttente = await Ticket.count({
          where: { serviceId: service.id, statut: TICKET_STATUS.EN_ATTENTE },
        });

        const ticketEnCours = await Ticket.findOne({
          where: {
            serviceId: service.id,
            statut: { [Op.in]: [TICKET_STATUS.APPELE, TICKET_STATUS.EN_COURS] },
          },
          order: [['appeleLe', 'DESC']],
        });

        return {
          id: service.id,
          nom: service.nom,
          prefixe: service.prefixe,
          enAttente,
          ticketEnCours: ticketEnCours?.numero || null,
        };
      })
    );

    res.json({ services: displaysData });
  } catch (error) {
    next(error);
  }
};
