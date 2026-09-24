const express = require('express');
const router = express.Router();
const { validateCoupon, listCoupons } = require('../controllers/couponController');

router.get('/', listCoupons);
router.post('/validate', validateCoupon); // public: used by the Cost Estimator too

module.exports = router;
