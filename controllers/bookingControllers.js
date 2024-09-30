const { Booking, validateBooking } = require('../models/booking-models');
const { Theater } = require('../models/theater-model');
const { v4: uuidv4 } = require('uuid');


// Create a Booking
const createBooking = async (req, res) => {
    const { user, movie, theater, seats, totalAmount, customerEmail, customerNumber } = req.body;

    // Validate request data
    const error = validateBooking({
        user,
        movie,
        theater,
        seats,
        totalAmount,
        customerEmail,
        customerNumber,
        paymentStatus: 'Pending', // Set default value
        ticketId: null // No ticket ID initially
    });

    if (error) return res.status(400).send(error.details[0].message);

    try {
        // Find the theater and check seat availability
        const theaterData = await Theater.findById(theater);
        if (!theaterData) return res.status(404).send('Theater not found');

        let isAvailable = true;

        for (const seat of seats) {
            const seatType = theaterData.seats.find(s => s.type === seat.seatType);
            if (!seatType || seatType.quantity <= 0) {
                isAvailable = false;
                break;
            }
        }

        if (!isAvailable) return res.status(400).send('Some seats are not available');

        // Create and save the booking without ticket ID
        const booking = new Booking({
            user: user || undefined,
            movie,
            theater,
            seats,
            totalAmount,
            ticketId: null, // No ticket ID initially
            customerEmail,
            customerNumber
        });

        await booking.save();

        // Update theater seat availability
        for (const seat of seats) {
            const seatTypeIndex = theaterData.seats.findIndex(s => s.type === seat.seatType);
            if (seatTypeIndex !== -1) {
                theaterData.seats[seatTypeIndex].quantity -= 1; // Decrease seat quantity
            }
        }

        await theaterData.save();

        res.status(201).json(booking);
    } catch (err) {
        res.status(500).send("Error creating booking: " + err.message);
    }
};


// Get all Bookings
// const getBookings = async (req, res) => {
//     try {
//         const bookings = await Booking.find().populate('movie', 'title').populate('theater', 'name');
//         if (bookings.length === 0) return res.status(404).send('No bookings found');
//         res.status(200).json(bookings);
//     } catch (err) {
//         res.status(500).send("Error fetching bookings: " + err.message);
//     }
// };

// Get Booking by ID
const getBookingByTicketId = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('movie', 'title').populate('theater', 'name');
        if (!booking) return res.status(404).send('Booking with the given ID not found');
        res.status(200).json(booking);
    } catch (err) {
        res.status(500).send("Error fetching booking: " + err.message);
    }
};

// Update Booking by ID
// const updateBooking = async (req, res) => {
//     const { seats, totalAmount, paymentStatus, customerEmail, customerNumber } = req.body;

//     // Validate request data
//     const error = validateBooking({
//         seats,
//         totalAmount,
//         paymentStatus,
//         customerEmail,
//         customerNumber
//     });

//     if (error) return res.status(400).send(error.details[0].message);

//     try {
//         const booking = await Booking.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
//         if (!booking) return res.status(404).send('Booking with the given ID not found');
//         res.status(200).json(booking);
//     } catch (err) {
//         res.status(500).send("Error updating booking: " + err.message);
//     }
// };

// Cancel Booking by ID
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) return res.status(404).send('Booking with the given ID not found');

        // Update theater seat availability
        const theater = await Theater.findById(booking.theater);
        if (theater) {
            for (const seat of booking.seats) {
                const seatTypeIndex = theater.seats.findIndex(s => s.type === seat.seatType);
                if (seatTypeIndex !== -1) {
                    theater.seats[seatTypeIndex].quantity += 1; // Restore seat quantity
                }
            }
            await theater.save();
        }

        res.status(200).send('Booking canceled successfully');
    } catch (err) {
        res.status(500).send("Error canceling booking: " + err.message);
    }
};

module.exports = {
    createBooking,
    getBookingByTicketId,
    cancelBooking
};
