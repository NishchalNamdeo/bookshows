const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema
const PaymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  user: {
    type:String,
    default: null // Make user optional
  },
  amount: {
    type: Number,
    required: true
  },
  paymentId: {
    type: String,
    default: null // Placeholder, will be updated later
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'PayPal', 'Other'],
    default: 'Other'
  },
  transactionDate: {
    type: Date,
    default: null // Optional, set when payment is completed
  },
  customerEmail: {
    type: String,
    default: null // Optional
  },
  customerNumber: {
    type: String,
    default: null // Optional
  }
}, { timestamps: true });

const Payment = mongoose.model('Payment', PaymentSchema);

// Joi Validation
const validatePayment = (payment) => {
  const schema = Joi.object({
    booking: Joi.string().required(),
    user: Joi.string().allow(null), // Allow user to be null
    amount: Joi.number().min(0).required(),
    paymentId: Joi.string().allow(null), // Allow paymentId to be null
    paymentStatus: Joi.string().valid('Pending', 'Completed', 'Failed').default('Pending'),
    paymentMethod: Joi.string().valid('Credit Card', 'Debit Card', 'PayPal', 'Other').default('Other'),
    transactionDate: Joi.date().allow(null), // Allow transactionDate to be null
    customerEmail: Joi.string().email().allow(null), // Optional email
    customerNumber: Joi.string().allow(null) // Optional phone number
  });
  let { error } = schema.validate(payment);
  return error;
};

module.exports = { Payment, validatePayment };
