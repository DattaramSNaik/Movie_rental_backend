const mongoose = require("mongoose");
const Joi = require("joi");

Joi.objectId = require("joi-objectid")(Joi);

const rentalSchema = new mongoose.Schema({
  customer: new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 50,
    },
    phone: {
      type: String,
      required: true,
      minLength: 7,
      maxLength: 10,
    },
  }),
  movie: {
    required: true,
    type: new mongoose.Schema({
      title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
      },
      dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255,
      },
    }),
  },
  dateOut: {
    type: Date,
    default: Date.now,
  },
  dateIn: {
    type: Date,
    default: null,
  },
  rentalFee: {
    type: Number,
    min: 0,
    max: 500,
    required: true,
  },
});
const Rentals = mongoose.model("rentals", rentalSchema);

function validateRentals(rental) {
  const Schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
    _id: Joi.objectId(),
  });
  return Schema.validate(rental);
}

module.exports.Rentals = Rentals;
module.exports.validateRentals = validateRentals;
