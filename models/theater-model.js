const mongoose = require('mongoose');
const Joi = require('joi');

// Define Showtime Schema
const showtimeSchema = new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  times: [ // Updated to handle multiple show times for a single date
    {
      type: String,
      required: true
    }
  ]
});

// Define Theater Schema
const theaterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: String,
    required: true
  },
  seats: [
    {
      type: {
        type: String,
        enum: ['Premium', 'Gold', 'Balcony'],
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  seatPrices: {
    Premium: {
      type: Number,
      required: true
    },
    Gold: {
      type: Number,
      required: true
    },
    Balcony: {
      type: Number,
      required: true
    }
  },
  movies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie'
    }
  ],
  showtimes: [showtimeSchema],
  deleted: {
    type: Boolean,
    default: false
  }
});

const Theater = mongoose.model('Theater', theaterSchema);

// Define validation schema using Joi
const validateTheater = (theater) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    location: Joi.string().required(),
    seats: Joi.array().items(Joi.object({
      type: Joi.string().valid('Premium', 'Gold', 'Balcony').required(),
      quantity: Joi.number().required()
    })).required(),
    seatPrices: Joi.object({
      Premium: Joi.number().required(),
      Gold: Joi.number().required(),
      Balcony: Joi.number().required()
    }).required(),
    movies: Joi.array().items(Joi.string()).required(),
    showtimes: Joi.array().items(Joi.object({
      movieId: Joi.string().required(),
      date: Joi.date().iso().required(),
      times: Joi.array().items(Joi.string()).required()
    })).required()
  });
  let {error} = schema.validate(theater);
  return error
};

module.exports = {
  Theater,
  validateTheater
};
