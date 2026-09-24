const express = require('express');
const router = express.Router();
const { chat, estimate } = require('../controllers/assistantController');

router.post('/chat', chat);
router.post('/estimate', estimate);

module.exports = router;
