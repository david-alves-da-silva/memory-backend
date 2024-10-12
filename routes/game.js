const express = require('express');
const { saveRecord, getRecord } = require('../controllers/gameController');
const router = express.Router();

router.post('/record', saveRecord); // POST para criar ou atualizar recorde
router.get('/record', getRecord); // GET para buscar o recorde

module.exports = router;
