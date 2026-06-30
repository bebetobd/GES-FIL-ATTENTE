const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const ticketController = require('../controllers/ticketController');

router.post('/', ticketController.creerTicket);
router.get('/file/:serviceId', ticketController.getFileService);
router.get('/stats', authenticate, ticketController.getStats);
router.post('/:serviceId/station/:stationId/call', authenticate, ticketController.appelerSuivant);
router.put('/:id/start', authenticate, ticketController.commencerService);
router.put('/:id/complete', authenticate, ticketController.terminerService);
router.put('/:id/cancel', authenticate, ticketController.annulerTicket);

module.exports = router;
