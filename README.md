Admin complete
Movie complete
Theater complete


Not completed

User
booking
serach
payment
loction detection




const express = require('express');
const router = express.Router();
const { createBooking, getBooking, deleteBooking, getBookingsByUser } = require('../controllers/bookingController');

router.post('/', createBooking);
router.get('/:id', getBooking);
router.delete('/:id', deleteBooking);
router.get('/user/:userId', getBookingsByUser);

module.exports = router;
