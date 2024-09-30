const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select:false
  },
  googleId: {
    type: String, // To store Google OAuth users' Google ID
    unique: true,
    sparse: true, // Allows null for users not using Google
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }]
}, { timestamps: true });

const userModel = mongoose.model('User', UserSchema);

// Joi Validation
const userValidate  = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });
  let {error} = schema.validate(user);
  return error
};

module.exports = { userModel, userValidate  };
