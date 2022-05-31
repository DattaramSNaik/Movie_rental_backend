const loginRoutes = require("../routes/loginRoutes");
const userRoutes = require("../routes/userRoutes");
const genreRoutes = require("../routes/genreRoutes");
const customerRoutes = require("../routes/customerRoutes");
const movieRoutes = require("../routes/moviesRoutes");
const rentalRoutes = require("../routes/rentalRoutes");
const error = require("../middleware/error");
const express = require("express");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/users", userRoutes);
  app.use("/api/genres", genreRoutes);
  app.use("/api/customers", customerRoutes);
  app.use("/api/movies", movieRoutes);
  app.use("/api/rentals", rentalRoutes);
  app.use("/api/login", loginRoutes);
  app.use(error);
};
