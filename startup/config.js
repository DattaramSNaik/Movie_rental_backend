const config = require("config");
module.exports = function () {
  if (!config.get("jwtPrivateKey")) {
    console.log("FATAL ERROR JWTPRIVATE KEY IS NOT FOUND");
    process.exit(1);
  }
};
