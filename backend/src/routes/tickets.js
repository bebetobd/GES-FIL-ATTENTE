const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const ticketController = require('../controllers/ticketController');

router.post('/', ticketController.creerTicket);
router.post('/station/:stationId/call-enregistrement', authenticate, ticketController.appelerEnregistrement);
router.put('/:id/validate-enregistrement', authenticate, ticketController.validerEnregistrement);
router.post('/station/:stationId/call-consultation', authenticate, ticketController.appelerConsultation);
router.put('/:id/complete-consultation', authenticate, ticketController.terminerConsultation);
router.put('/:id/cancel', authenticate, ticketController.annulerTicket);
router.get('/stats', authenticate, ticketController.getStats);

module.exports = router;
