const { body } = require('express-validator');

const loginValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('motDePasse').notEmpty().withMessage('Mot de passe requis'),
];

const registerValidation = [
  body('nom').notEmpty().withMessage('Nom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('motDePasse')
    .isLength({ min: 6 })
    .withMessage('Mot de passe doit contenir au moins 6 caractères'),
];

module.exports = { loginValidation, registerValidation };
