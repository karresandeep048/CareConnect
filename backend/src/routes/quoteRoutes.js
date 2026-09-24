const express = require('express');
const router = express.Router();
const { createQuote, getQuotes } = require('../controllers/quoteController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/', protect, authorize('provider'), createQuote);
router.get('/', protect, getQuotes);

module.exports = router;
