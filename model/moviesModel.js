const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const { genreSchema } = require("./genreModel");
const { join } = require("lodash");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: 5,
    maxlength: 50,
    required: [true, "title is required"],
  },
  genre: {
    type: genreSchema,
    required: [true, "Genre  is required"],
  },
  dailyRentalRate: {
    type: Number,
    min: 0,
    max: 255,
    required: true,
  },
  numberInStock: {
    type: Number,
    min: 0,
    max: 255,
    required: true,
  },
  liked: {
    type: Boolean,
    default: false,
  },
});
const Movie = mongoose.model("movies", movieSchema);

function validateMovie(movie) {
  const Schema = Joi.object({
    title: Joi.string().min(5).max(50).required(),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).max(255).required(),
    dailyRentalRate: Joi.number().min(0).max(255).required(),
    liked: Joi.boolean(),
    //_id: Joi.objectId(),
  });
  return Schema.validate(movie);
}

module.exports.Movie = Movie;
module.exports.validateMovie = validateMovie;
