const express = require('express');
const { saveRecord, getRecord } = require('../controllers/gameController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/record', authMiddleware, saveRecord); // POST para criar ou atualizar recorde
router.get('/record', authMiddleware, getRecord); // GET para buscar o recorde

module.exports = router;
