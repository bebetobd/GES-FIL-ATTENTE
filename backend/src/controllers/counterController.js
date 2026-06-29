const { Counter, Service, User } = require('../models');

exports.createCounter = async (req, res, next) => {
  try {
    const { nom, numero, serviceId } = req.body;
    const service = await Service.findByPk(serviceId);

    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    const counter = await Counter.create({ nom, numero, serviceId });
    res.status(201).json({ counter });
  } catch (error) {
    next(error);
  }
};

exports.getAllCounters = async (req, res, next) => {
  try {
    const counters = await Counter.findAll({
      include: [
        { model: Service, as: 'service' },
        { model: User, as: 'agent', attributes: ['id', 'nom', 'email'] },
      ],
      order: [['numero', 'ASC']],
    });

    res.json({ counters });
  } catch (error) {
    next(error);
  }
};

exports.getCountersByService = async (req, res, next) => {
  try {
    const counters = await Counter.findAll({
      where: { serviceId: req.params.serviceId },
      include: [{ model: User, as: 'agent', attributes: ['id', 'nom', 'email'] }],
      order: [['numero', 'ASC']],
    });

    res.json({ counters });
  } catch (error) {
    next(error);
  }
};

exports.assignAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const counter = await Counter.findByPk(id);
    if (!counter) {
      return res.status(404).json({ message: 'Guichet non trouvé' });
    }

    if (agentId) {
      const agent = await User.findByPk(agentId);
      if (!agent || agent.role !== 'agent') {
        return res.status(400).json({ message: 'Agent invalide' });
      }
    }

    await counter.update({ agentId: agentId || null });

    const updatedCounter = await Counter.findByPk(id, {
      include: [{ model: User, as: 'agent', attributes: ['id', 'nom', 'email'] }],
    });

    res.json({ counter: updatedCounter });
  } catch (error) {
    next(error);
  }
};

exports.updateCounter = async (req, res, next) => {
  try {
    const counter = await Counter.findByPk(req.params.id);
    if (!counter) {
      return res.status(404).json({ message: 'Guichet non trouvé' });
    }

    const { nom, numero, actif } = req.body;
    await counter.update({ nom, numero, actif });

    const updatedCounter = await Counter.findByPk(counter.id, {
      include: [{ model: User, as: 'agent', attributes: ['id', 'nom', 'email'] }],
    });

    res.json({ counter: updatedCounter });
  } catch (error) {
    next(error);
  }
};

exports.deleteCounter = async (req, res, next) => {
  try {
    const counter = await Counter.findByPk(req.params.id);
    if (!counter) {
      return res.status(404).json({ message: 'Guichet non trouvé' });
    }

    await counter.destroy();
    res.json({ message: 'Guichet supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};
