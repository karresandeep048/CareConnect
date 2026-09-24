const express = require('express');
const router = express.Router();
const { createDispute, getDisputes, resolveDispute } = require('../controllers/disputeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/', protect, createDispute);
router.get('/', protect, getDisputes);
router.put('/:id/resolve', protect, authorize('admin', 'ops_manager', 'support_agent'), resolveDispute);

module.exports = router;
