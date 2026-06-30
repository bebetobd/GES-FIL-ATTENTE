const { Station, User } = require('../models');

exports.getAllStations = async (req, res, next) => {
  try {
    const stations = await Station.findAll({
      include: [{ model: User, as: 'agent', attributes: ['id', 'nom', 'email'] }],
      order: [['type', 'ASC'], ['nom', 'ASC']],
    });

    res.json({ stations });
  } catch (error) {
    next(error);
  }
};

exports.getStationsByType = async (req, res, next) => {
  try {
    const stations = await Station.findAll({
      where: { type: req.params.type },
      include: [{ model: User, as: 'agent', attributes: ['id', 'nom', 'email'] }],
      order: [['nom', 'ASC']],
    });

    res.json({ stations });
  } catch (error) {
    next(error);
  }
};

exports.assignAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const station = await Station.findByPk(id);
    if (!station) {
      return res.status(404).json({ message: 'Station non trouvée' });
    }

    if (agentId) {
      const agent = await User.findByPk(agentId);
      if (!agent) {
        return res.status(400).json({ message: 'Agent invalide' });
      }
    }

    await station.update({ agentId: agentId || null });

    const updated = await Station.findByPk(id, {
      include: [{ model: User, as: 'agent', attributes: ['id', 'nom', 'email'] }],
    });

    res.json({ station: updated });
  } catch (error) {
    next(error);
  }
};

exports.createStation = async (req, res, next) => {
  try {
    const { nom, type, agentId } = req.body;
    const station = await Station.create({ nom, type, agentId });
    res.status(201).json({ station });
  } catch (error) {
    next(error);
  }
};

exports.deleteStation = async (req, res, next) => {
  try {
    const station = await Station.findByPk(req.params.id);
    if (!station) return res.status(404).json({ message: 'Station non trouvée' });
    await station.destroy();
    res.json({ message: 'Station supprimée' });
  } catch (error) {
    next(error);
  }
};
