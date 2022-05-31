const router = require("express").Router();
//user model
const { User } = require("../model/userModel");
const bcrypt = require("bcrypt");
const Joi = require("joi");
//make manual password validation
const passwordComplexity = require("joi-password-complexity");
const _ = require("lodash");

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).send("Invalid email or password");
  }
  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) {
    return res.status(401).send("Invalid Username or password");
  }
  const token = user.getAuthToken();
  res.send(token);
});

function validate(user) {
  const schema = Joi.object({
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
  });
  return schema.validate(user);
}

module.exports = router;
