const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentControllers');

// Create Payment
router.post('/create', paymentController.createPayment);
router.get('/', (req,res) =>{
    res.send('Payment Page')
});

// Payment Success
router.post('/verify/:id', paymentController.paymentSuccess);

module.exports = router;
