const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const stationController = require('../controllers/stationController');

router.get('/', stationController.getAllStations);
router.get('/type/:type', stationController.getStationsByType);
router.post('/', authenticate, authorize('super_admin', 'admin'), stationController.createStation);
router.put('/:id/assign', authenticate, authorize('super_admin', 'admin'), stationController.assignAgent);
router.delete('/:id', authenticate, authorize('super_admin'), stationController.deleteStation);

module.exports = router;
