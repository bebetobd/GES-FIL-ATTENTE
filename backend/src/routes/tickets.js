const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const ticketController = require('../controllers/ticketController');

router.post('/', ticketController.createTicket);
router.get('/service/:serviceId', ticketController.getTicketsByService);
router.get('/stats/today', authenticate, ticketController.getTodayStats);
router.post('/counter/:counterId/call-next', authenticate, ticketController.callNextTicket);
router.put('/:id/start', authenticate, ticketController.startTicket);
router.put('/:id/complete', authenticate, ticketController.completeTicket);
router.put('/:id/cancel', authenticate, ticketController.annulerTicket);

module.exports = router;
