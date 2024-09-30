const express = require('express');
const app = express();  
const router = express.Router();
const bookingController = require('../controllers/bookingControllers');


router.get("/", function(req,res,next){
    res.send("heelo booking")
})



// Create Booking
router.post('/create', bookingController.createBooking);

// Get Booking by Ticket ID
router.get('/ticket/:id', bookingController.getBookingByTicketId);
// router.get('/ticket/all', bookingController.getBookingByall);

// Cancel Booking
router.delete('/delete/:id', bookingController.cancelBooking);

module.exports = router;






module.exports = router


