require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { sequelize } = require('./models');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const serviceRoutes = require('./routes/services');
const counterRoutes = require('./routes/counters');
const displayRoutes = require('./routes/display');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/counters', counterRoutes);
app.use('/api/display', displayRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

io.on('connection', (socket) => {
  logger.info(`Client connecté: ${socket.id}`);

  socket.on('join-counter', (counterId) => {
    socket.join(`counter-${counterId}`);
  });

  socket.on('join-display', (serviceId) => {
    socket.join(`display-${serviceId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client déconnecté: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    logger.info('Connexion à la base de données établie avec succès');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    server.listen(PORT, () => {
      logger.info(`Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Impossible de se connecter à la base de données:', err);
    process.exit(1);
  });

module.exports = { app, server, io };
