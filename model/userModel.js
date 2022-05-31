const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const passwordComplexity = require("joi-password-complexity");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 5,
    maxlength: 25,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    minlength: 5,
    maxlength: 255,
    required: [true, "Email required"],
  },
  password: {
    type: String,
    minlength: 8,
    maxlength: 1024,
    required: [true, "password required"],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});
userSchema.methods.getAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      isAdmin: this.isAdmin,
    },
    config.get("jwtPrivateKey")
  );
};
const User = mongoose.model("userAuth", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(25).required(),
    email: Joi.string()
      .min(5)
      .max(255)
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
    password: new passwordComplexity({
      min: 8,
      max: 1024,
      lowerCase: 1,
      upperCase: 1,
      numeric: 1,
      symbol: 1,
      requirementCount: 4,
    }).required(),
    isAdmin: Joi.boolean(),
    _id: Joi.objectId(),
  });
  return schema.validate(user);
}

module.exports.userSchema = userSchema;
module.exports.User = User;
module.exports.validateUser = validateUser;
module.exports.getAuthToken = userSchema.methods.getAuthToken;
