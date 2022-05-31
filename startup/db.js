const config = require("config");
const mongoose = require("mongoose");

module.exports = function () {
  mongoose
    .connect(config.get("db_url"))
    .then(() =>
      console.log(`Connected to Movie Rental DB.${config.get("db_url")}`)
    );
  //.catch((err) => console.log(err.message));
};
