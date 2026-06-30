const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const serviceController = require('../controllers/serviceController');

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', authenticate, authorize('super_admin'), serviceController.createService);
router.put('/:id', authenticate, authorize('super_admin'), serviceController.updateService);
router.delete('/:id', authenticate, authorize('super_admin'), serviceController.deleteService);

module.exports = router;
