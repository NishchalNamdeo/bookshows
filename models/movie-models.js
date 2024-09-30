const mongoose = require("mongoose");
const Joi = require('joi');
const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 1, maxlength: 100 },
  poster: { type: Buffer, default: null },
  posterMimeType: { type: String, default: null },
  video: { type: Buffer, default: null },
  videoMimeType: { type: String, default: null },
  genre: { type: String, required: true },
  duration: { type: Number, required: true },
  releaseDate: { type: Date, required: true },
  comingsoon: { type: Boolean, default: true }, // Default to coming soon
  isReleased: { type: Boolean, default: false }, // Flag for release status
  description: { type: String, maxlength: 500 },
  theaters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Theater' }] // Reference to theaters
}, { timestamps: true });

const movieModel = mongoose.model('Movie', MovieSchema);

const movievalidation = (movie) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(100).required(),
    genre: Joi.string().required(),
    duration: Joi.number().integer().min(30).required(),
    releaseDate: Joi.date().required(),
    description: Joi.string().max(500),
    poster: Joi.binary(),   // Optional poster validation
    video: Joi.binary(),    // Optional video validation
    comingsoon: Joi.boolean(), // Optional boolean field for coming soon
    isReleased: Joi.boolean() // Optional boolean field for release status
  });

  const { error } = schema.validate(movie);
  return error;
};

module.exports = { movieModel, movievalidation };


module.exports = { movieModel, movievalidation };
