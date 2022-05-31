module.exports = function (req, res, next) {
  try {
    if (!req.user.isAdmin) {
      res.status(403).json({ error: "Unauthorized user" });
      return;
    } else {
      next();
    }
  } catch (error) {
    return res.status(400).send(error.message);
  }
};
