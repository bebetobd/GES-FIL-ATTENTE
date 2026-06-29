const router = require('express').Router();
const displayController = require('../controllers/displayController');

router.get('/all', displayController.getAllDisplays);
router.get('/:serviceId', displayController.getDisplayData);

module.exports = router;
