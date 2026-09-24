const express = require('express');
const router = express.Router();
const {
  getProviders,
  matchProvidersForRequest,
  getProviderById,
  updateProviderProfile,
  verifyProvider
} = require('../controllers/providerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', getProviders);
router.get('/match/:requestId', matchProvidersForRequest);
router.put('/profile', protect, authorize('provider'), updateProviderProfile);
router.get('/:id', getProviderById);
router.put('/:id/verify', protect, authorize('admin', 'ops_manager'), verifyProvider);

module.exports = router;
