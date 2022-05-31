const express = require("express");
const app = express();
//Requirement files...
//error logging
const cors = require("cors");
app.use(cors());
require("./startup/logging")();
require("./startup/config")();
require("./startup/db")();
require("./startup/routes")(app);
require("./startup/prod")(app);
if (process.env.NODE_ENV != "test") {
  require("./startup/port")(app);
}

module.exports = app;
