const { Payment, validatePayment } = require('../models/payment-model');
const { Booking } = require('../models/booking-models');
const { Theater } = require('../models/theater-model'); // Assuming you have the Theater model
const { v4: uuidv4 } = require('uuid');

// Create Payment with additional checks for user and booking
const createPayment = async (req, res) => {
    const { booking, user, amount, paymentMethod, customerEmail, customerNumber } = req.body;

    // Validate payment details
    const error = validatePayment({
        booking,
        user,
        amount,
        paymentMethod,
        customerEmail,
        customerNumber
    });

    if (error) return res.status(400).send(error.details[0].message);

    try {
        // Check if the booking exists and belongs to the user
        let bookingToValidate;
        if (customerEmail) {
            // For logged-in users, the booking must belong to the user
            bookingToValidate = await Booking.findOne({ _id: booking,customerEmail,customerNumber });
            if (!bookingToValidate) return res.status(403).send('This booking does not belong to the user');
        } else {
            // For non-logged-in users, validate using email and phone number
            bookingToValidate = await Booking.findOne({ 
                _id: booking, 
                customerEmail, 
                customerNumber 
            });
            if (!bookingToValidate) return res.status(404).send('Booking not found or customer details do not match');
        }

        // Check if the movie in the booking is still available
        // const theater = await Theater.findOne({ 
        //     movies: bookingToValidate.movieId, // Assuming `movieId` is a field in the booking
        // });

        // if (!theater) return res.status(404).send('Movie not available in any theater');

        // If all checks pass, create and save the payment with pending status
        const payment = new Payment({
            booking,
            user: user || null, // If no user, set it to null
            amount,
            paymentId: null, // Placeholder, to be updated after successful payment
            paymentStatus: 'Pending',
            paymentMethod,
            transactionDate: null,
            customerEmail,
            customerNumber
        });

        await payment.save();

        res.status(201).json({
            message: 'Payment created successfully. Please complete the payment process.',
            paymentId: payment._id // Send the payment ID for use in the payment success confirmation
        });
    } catch (err) {
        res.status(500).send("Error creating payment: " + err.message);
    }
};

// Payment Success with additional checks for user and booking ownership
const paymentSuccess = async (req, res) => {
    const { paymentStatus, transactionDate, customerEmail, customerNumber } = req.body;
    const paymentId = req.params.id; // Extract paymentId from URL parameters

    try {
        // Find the payment by paymentId
        const payment = await Payment.findById(paymentId);
        if (!payment) return res.status(404).send('Payment not found');
console.log(payment);

        // Ensure the booking exists and belongs to the user or matches non-logged-in user details
        let bookingToUpdate;
        if (payment.customerEmail) {
            // For logged-in users, ensure the booking belongs to the user
            bookingToUpdate = await Booking.findOne({ _id: payment.booking, customerEmail: payment.customerEmail });
            // console.log(user);
            
            if (!bookingToUpdate) return res.status(403).send('This booking does not belong to the user');
        } else {
            // For non-logged-in users, match based on email and phone number
            bookingToUpdate = await Booking.findOne({ 
                _id: payment.booking, 
                customerEmail, 
                customerNumber 
            });
            if (!bookingToUpdate) return res.status(404).send('Booking not found or customer details do not match');
        }

        // Check if the movie is still available in the theater (Optional)
        // const theater = await Theater.findOne({ 
        //     movies: bookingToUpdate.movieId, // Assuming `movieId` is stored in the booking
        // });

        // if (!theater) return res.status(404).send('Movie not available in any theater');

        // Update the payment record with the final status
        payment.paymentStatus = paymentStatus;
        payment.transactionDate = transactionDate || Date.now(); // Use transaction date if provided
        await payment.save();

        if (paymentStatus === 'Completed') {
            // Generate ticket ID and update the booking
            bookingToUpdate.ticketId = uuidv4(); // Generate unique ticket ID
            bookingToUpdate.paymentStatus = paymentStatus;
            await bookingToUpdate.save();
        }

        res.status(200).send('Payment successfully verified and booking updated');
    } catch (err) {
        res.status(500).send("Error verifying payment: " + err.message);
    }
};

module.exports = {
    createPayment,
    paymentSuccess
};
