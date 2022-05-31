const router = require("express").Router();
//Middleware
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validObj = require("../middleware/validateObjId");
//userModel
const { User, validateUser } = require("../model/userModel");
const bcrypt = require("bcrypt");
const _ = require("lodash");

router.get("/", async (req, res) => {
  const users = await User.find({});
  if (users && users.length === 0) {
    res.status(404).send("User not found");
  }
  res.status(200).send(users);
});
router.get("/:id", validObj, async (req, res) => {
  const user = await User.findById({ _id: req.params.id });
  if (!user) return res.status(404).send("User not found");
  res.status(200).send(user);
});
router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).send(error.details[0].message);
  }
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    console.log("user already present");
    return res.status(401).send("Invalid Username or password");
  }
  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    isAdmin: req.body.isAdmin,
  });
  //becrypt Password creation
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  console.log("Successfully User added");
  res.send(_.pick(user, ["_id", "name", "email", "isAdmin"]));
});

router.put("/:id", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const salt = await bcrypt.genSalt(10);
  const updatedpassword = await bcrypt.hash(req.body.password, salt);
  const user = await User.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        name: req.body.name,
        email: req.body.email,
        password: updatedpassword,
        isAdmin: req.body.isAdmin,
      },
    }
  );

  if (user) {
    res.status(200).send(_.pick(user, ["_id", "name", "email", "isAdmin"]));
  } else {
    return res.status(401).send("user not found with given id");
  }
});
router.delete("/:id", validObj, async (req, res) => {
  const user = await User.findByIdAndRemove({ _id: req.params.id });
  if (user) {
    return res.status(200).send(user);
  } else {
    return res.status(400).send("user not found with given id");
  }
});

module.exports = router;
