const express = require('express');
const router = express.Router();
const {
  aiClassifyText,
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateRequestStatus
} = require('../controllers/requestController');
const { createSOSRequest } = require('../controllers/sosController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/ai-classify', aiClassifyText);
router.post('/sos', protect, authorize('customer'), createSOSRequest);
router.post('/', protect, createServiceRequest);
router.get('/', protect, getServiceRequests);
router.get('/:id', protect, getServiceRequestById);
router.put('/:id/status', protect, updateRequestStatus);

module.exports = router;
