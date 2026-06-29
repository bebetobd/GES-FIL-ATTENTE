const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.login = async (req, res, next) => {
  try {
    const { email, motDePasse } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.verifierMotDePasse(motDePasse))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    if (!user.actif) {
      return res.status(403).json({ message: 'Compte désactivé' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { nom, email, motDePasse, role } = req.body;
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }

    const user = await User.create({ nom, email, motDePasse, role: role || 'agent' });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({ token, user });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { nom, motDePasse } = req.body;
    const updates = {};
    if (nom) updates.nom = nom;
    if (motDePasse) updates.motDePasse = motDePasse;

    await req.user.update(updates);
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    await user.update({ actif: !user.actif });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};
