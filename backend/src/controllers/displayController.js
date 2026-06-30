const { Ticket, Station, Service } = require('../models');
const { Op } = require('sequelize');

exports.getFullDisplay = async (req, res, next) => {
  try {
    const [
      enAttenteEnregistrement,
  enCoursEnregistrement,
  enAttenteConsultation,
  enCoursConsultation,
  derniersTermines,
] = await Promise.all([
  Ticket.findAll({
    where: { statut: 'en_attente' },
    order: [['createdAt', 'ASC']],
    attributes: ['id', 'numero', 'nomPatient', 'createdAt'],
  }),
  Ticket.findOne({
    where: { statut: 'en_enregistrement' },
  }),
      Ticket.count({ where: { statut: 'en_attente_consultation' } }),
      Ticket.findAll({
        where: { statut: 'en_consultation' },
        attributes: ['id', 'numero', 'nomPatient', 'stationConsultation', 'appeleConsultationLe'],
        order: [['appeleConsultationLe', 'DESC']],
      }),
      Ticket.findAll({
        where: { statut: 'termine' },
        order: [['termineLe', 'DESC']],
        limit: 5,
        attributes: ['id', 'numero', 'nomPatient'],
      }),
    ]);

    const stations = await Station.findAll({
      include: [{ model: require('../models/User'), as: 'agent', attributes: ['id', 'nom'] }],
      order: [['type', 'ASC'], ['nom', 'ASC']],
    });

    const services = await Service.findAll({ where: { actif: true }, order: [['ordre', 'ASC']] });

    res.json({
      enAttenteEnregistrement,
      enCoursEnregistrement,
      enAttenteConsultation,
      enCoursConsultation,
      derniersTermines,
      stations,
      services,
    });
  } catch (error) {
    next(error);
  }
};
