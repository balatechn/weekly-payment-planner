const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Local authentication
router.post('/register', authController.register);
router.post('/login', authController.login);

// Microsoft 365 SSO (disabled by default - uncomment if you need Azure AD)
// router.get('/microsoft', passport.authenticate('azure_ad_oauth2'));
// router.get('/callback', 
//   passport.authenticate('azure_ad_oauth2', { failureRedirect: '/auth/error' }),
//   authController.ssoCallback
// );

// Get current user
router.get('/me', authMiddleware, authController.me);

module.exports = router;
