const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 5,
    maxlength: 15,
    required: [true, "name is required"],
  },
  phone: {
    type: String,
    min: 7,
    max: 10,
    required: [true, "Phone Number is required"],
  },
  isGold: {
    type: Boolean,
    default: false,
  },
});
const Customer = mongoose.model("customers", customerSchema);

function validateCustomer(customer) {
  const Schema = Joi.object({
    name: Joi.string().min(5).max(15).required(),
    phone: Joi.string().min(7).max(10).required(),
    isGold: Joi.boolean(),
    _id: Joi.objectId(),
  });
  return Schema.validate(customer);
}

module.exports.Customer = Customer;
module.exports.validateCustomer = validateCustomer;
