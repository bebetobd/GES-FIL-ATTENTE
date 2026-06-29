const { Service, Ticket, Counter } = require('../models');
const { TICKET_STATUS } = require('../config/constants');
const { Op } = require('sequelize');

exports.createService = async (req, res, next) => {
  try {
    const { nom, prefixe, description } = req.body;
    const existingPrefixe = await Service.findOne({ where: { prefixe } });
    if (existingPrefixe) {
      return res.status(409).json({ message: 'Ce préfixe est déjà utilisé' });
    }

    const service = await Service.create({ nom, prefixe, description });
    res.status(201).json({ service });
  } catch (error) {
    next(error);
  }
};

exports.getAllServices = async (req, res, next) => {
  try {
    const services = await Service.findAll({
      include: [
        {
          model: Counter,
          as: 'guichets',
          where: { actif: true },
          required: false,
        },
      ],
      order: [['nom', 'ASC']],
    });

    const result = await Promise.all(
      services.map(async (service) => {
        const waitingCount = await Ticket.count({
          where: { serviceId: service.id, statut: TICKET_STATUS.EN_ATTENTE },
        });
        return { ...service.toJSON(), enAttente: waitingCount };
      })
    );

    res.json({ services: result });
  } catch (error) {
    next(error);
  }
};

exports.getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [{ model: Counter, as: 'guichets' }],
    });

    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    const waitingCount = await Ticket.count({
      where: { serviceId: service.id, statut: TICKET_STATUS.EN_ATTENTE },
    });

    res.json({ service: { ...service.toJSON(), enAttente: waitingCount } });
  } catch (error) {
    next(error);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    const { nom, prefixe, description, actif } = req.body;
    await service.update({ nom, prefixe, description, actif });
    res.json({ service });
  } catch (error) {
    next(error);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    const ticketCount = await Ticket.count({ where: { serviceId: service.id } });
    if (ticketCount > 0) {
      return res.status(400).json({ message: 'Impossible de supprimer un service avec des tickets associés' });
    }

    await service.destroy();
    res.json({ message: 'Service supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};
