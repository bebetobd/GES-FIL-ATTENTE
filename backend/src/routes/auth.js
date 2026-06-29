const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth');
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authenticate, authorize('super_admin', 'admin'), authController.register);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);
router.get('/users', authenticate, authorize('super_admin', 'admin'), authController.getAllUsers);
router.put('/users/:id/toggle-status', authenticate, authorize('super_admin'), authController.toggleUserStatus);

module.exports = router;
