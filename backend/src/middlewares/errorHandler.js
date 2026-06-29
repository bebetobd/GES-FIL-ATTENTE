const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err.message);

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Erreur de validation',
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      message: 'Cette valeur existe déjà',
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
