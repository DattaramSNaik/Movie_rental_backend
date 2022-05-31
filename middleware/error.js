const winston = require("winston");

module.exports = function (error, req, res, next) {
  if (error) {
    winston.error(error.message);
    return res.status(500).send(`Something bad request ${error.message}`);
  }
};
