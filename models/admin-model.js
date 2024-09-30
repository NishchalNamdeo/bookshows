const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema
const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    unique: true
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
    select:false
  },
  role: {
    type: String,
    default: 'admin'
  }
}, { timestamps: true });

// Password hashing before saving the admin

const adminModel = mongoose.model('Admin', AdminSchema);

// Joi Validation for Admin
const adminvalidator = (admin) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().min(5).max(255).required(),
    password: Joi.string().min(5).max(1024).required()
  });
  let {error} =  schema.validate(admin);
  return error
};

module.exports = { adminModel, adminvalidator};
