const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const tc = require('../controllers/ticketController');

router.post('/', tc.creerTicket);
router.get('/file/:serviceId', tc.getFileService);
router.get('/stats', authenticate, tc.getStats);
router.get('/historique', authenticate, tc.getHistorique);
router.get('/stats-avancees', authenticate, tc.getStatsAvancees);
router.post('/:serviceId/station/:stationId/call', authenticate, tc.appelerSuivant);
router.put('/:id/start', authenticate, tc.commencerService);
router.put('/:id/complete', authenticate, tc.terminerService);
router.put('/:id/cancel', authenticate, tc.annulerTicket);

module.exports = router;
