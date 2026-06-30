const { Service, Ticket, Station } = require('../models');
const { Op } = require('sequelize');

exports.createService = async (req, res, next) => {
  try {
    const { nom, prefixe, type, description, ordre } = req.body;
    const service = await Service.create({ nom, prefixe, type, description, ordre });
    res.status(201).json({ service });
  } catch (error) {
    next(error);
  }
};

exports.getAllServices = async (req, res, next) => {
  try {
    const services = await Service.findAll({
      order: [['ordre', 'ASC']],
    });
    res.json({ services });
  } catch (error) {
    next(error);
  }
};

exports.getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [{ model: Station, as: 'stations' }],
    });
    if (!service) return res.status(404).json({ message: 'Service non trouvé' });
    res.json({ service });
  } catch (error) {
    next(error);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service non trouvé' });
    const { nom, prefixe, type, description, ordre, actif } = req.body;
    await service.update({ nom, prefixe, type, description, ordre, actif });
    res.json({ service });
  } catch (error) {
    next(error);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service non trouvé' });
    const ticketCount = await Ticket.count({ where: { serviceId: service.id } });
    if (ticketCount > 0) return res.status(400).json({ message: 'Impossible de supprimer un service avec des tickets associés' });
    await service.destroy();
    res.json({ message: 'Service supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};
