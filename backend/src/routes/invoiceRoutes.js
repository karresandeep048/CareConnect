const express = require('express');
const router = express.Router();
const { getInvoices, payInvoice } = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getInvoices);
router.post('/:id/pay', protect, payInvoice);

module.exports = router;
