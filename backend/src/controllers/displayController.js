const { Ticket, Station, Service } = require('../models');
const { Op } = require('sequelize');

exports.getFullDisplay = async (req, res, next) => {
  try {
    const services = await Service.findAll({ where: { actif: true }, order: [['ordre', 'ASC']] });

    const data = await Promise.all(services.map(async (service) => {
      const [enAttente, enCours, stations] = await Promise.all([
        Ticket.findAll({
          where: { serviceId: service.id, statut: 'en_attente' },
          order: [['createdAt', 'ASC']],
          attributes: ['id', 'numero', 'nomPatient', 'createdAt'],
        }),
        Ticket.findAll({
          where: { serviceId: service.id, statut: { [Op.in]: ['appele', 'en_cours'] } },
          order: [['appeleLe', 'DESC']],
          attributes: ['id', 'numero', 'nomPatient', 'station', 'statut'],
        }),
        Station.findAll({
          where: { type: service.type, actif: true },
          include: [{ model: require('../models/User'), as: 'agent', attributes: ['id', 'nom'] }],
        }),
      ]);

      const derniersTermines = await Ticket.findAll({
        where: { serviceId: service.id, statut: 'termine' },
        order: [['termineLe', 'DESC']],
        limit: 5,
        attributes: ['id', 'numero', 'nomPatient'],
      });

      return {
        service: service.toJSON(),
        enAttente,
        enCours,
        stations,
        derniersTermines,
        nbEnAttente: enAttente.length,
        nbEnCours: enCours.length,
      };
    }));

    res.json({ services: data });
  } catch (error) { next(error); }
};
