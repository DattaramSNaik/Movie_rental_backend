const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    maxlength: 10,
    required: true,
  },
});
const Genre = mongoose.model("genres", genreSchema);

function validateGenre(genre) {
  const Schema = Joi.object({
    name: Joi.string().min(3).max(10).required(),
    _id: Joi.objectId(),
  });
  return Schema.validate(genre);
}

module.exports.Genre = Genre;
module.exports.validateGenre = validateGenre;
module.exports.genreSchema = genreSchema;
