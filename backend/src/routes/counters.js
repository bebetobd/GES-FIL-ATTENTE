const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const counterController = require('../controllers/counterController');

router.get('/', authenticate, counterController.getAllCounters);
router.get('/service/:serviceId', authenticate, counterController.getCountersByService);
router.post('/', authenticate, authorize('super_admin', 'admin'), counterController.createCounter);
router.put('/:id', authenticate, authorize('super_admin', 'admin'), counterController.updateCounter);
router.put('/:id/assign', authenticate, authorize('super_admin', 'admin'), counterController.assignAgent);
router.delete('/:id', authenticate, authorize('super_admin'), counterController.deleteCounter);

module.exports = router;
