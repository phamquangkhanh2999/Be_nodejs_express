const authController = require('../controllers/authController');
const middlewareController = require('../controllers/middlewareController');
const router = require('express').Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/refreshToken', authController.requestRefreshToken);
router.post(
  '/logout',
  middlewareController.verifyToken,
  authController.logoutUser
);

module.exports = router;