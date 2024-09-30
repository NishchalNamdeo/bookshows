const mongoose = require('mongoose');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

// Mongoose Schema
const BookingSchema = new mongoose.Schema({
  user: {
    type:String,
    default: null
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  theater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theater',
    required: true
  },
  seats: [
    {
      seatNumber: {
        type: String,
        required: true
      },
      seatType: {
        type: String,
        enum: ['Premium', 'Gold', 'Balcony'],
        required: true
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  ticketId: {
    type: String,
    unique: true,
    default: null // Ticket ID is optional at creation
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerNumber: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Booking = mongoose.model('Booking', BookingSchema);

// Joi Validation
const validateBooking = (booking) => {
  const schema = Joi.object({
    user: Joi.string().allow(null), // Allow user to be null or a string
    movie: Joi.string().required(),
    theater: Joi.string().required(),
    seats: Joi.array().items(Joi.object({
      seatNumber: Joi.string().required(),
      seatType: Joi.string().valid('Premium', 'Gold', 'Balcony').required()
    })).min(1).required(),
    totalAmount: Joi.number().min(1).required(),
    paymentStatus: Joi.string().valid('Pending', 'Completed', 'Failed').optional(), // Optional field
    ticketId: Joi.string().allow(null), // Ticket ID can be null
    customerEmail: Joi.string().email().required(),
    customerNumber: Joi.string().required()
  });

  const { error } = schema.validate(booking);
  return error;
};

module.exports = { Booking, validateBooking };
