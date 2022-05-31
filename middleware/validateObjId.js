const mongoose = require("mongoose");
module.exports = function (req, res, next) {
  try {
    const isValid = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!isValid) {
      return res.status(400).send("Invalid objectID");
    }
    next();
  } catch (error) {
    res.send(error.message);
    console.log(error.message);
  }
};
