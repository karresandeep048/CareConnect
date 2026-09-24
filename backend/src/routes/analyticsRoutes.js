const express = require('express');
const router = express.Router();
const { getPlatformAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/dashboard', protect, authorize('admin', 'ops_manager', 'support_agent'), getPlatformAnalytics);

module.exports = router;
