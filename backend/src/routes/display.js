const router = require('express').Router();
const displayController = require('../controllers/displayController');

router.get('/', displayController.getFullDisplay);

module.exports = router;
