const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  loginUser,
  verifyCode,
  registerUser,
  logoutUser,
  excludeUser,
} = require('../controllers/authController');
const router = express.Router();

router.post('/login', loginUser);
router.post('/verify', verifyCode);
router.post('/register', registerUser);
router.post('/logout', authMiddleware, logoutUser);
router.delete('/exclude', authMiddleware, excludeUser);

module.exports = router;
