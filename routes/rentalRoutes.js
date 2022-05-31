const router = require("express").Router();
const { Movie } = require("../model/moviesModel");
//middleware
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validObj = require("../middleware/validateObjId");
//customer Model
const { Customer } = require("../model/customerModel");
//rental Model
const { Rentals, validateRentals } = require("../model/rentalModel");

router.get("/", async (req, res) => {
  const rentals = await Rentals.find({});
  if (rentals && rentals.length === 0) {
    res.status(404).send("Genres not found");
  }
  res.status(200).send(rentals);
});
router.get("/count", async (req, res) => {
  const rentalCount = await Rentals.find({}).count();
  if (rentalCount && rentalCount.length === 0) {
    res.status(404).send("Genres not found");
  }
  res.status(200).send({ rentalCount });
});

router.get("/:id", validObj, async (req, res) => {
  const rental = await Rentals.findById(req.params.id);
  if (!rental) return res.status(404).send("rentals not found");
  res.status(200).send(rental);
});
router.post("/paginationSearch", async (req, res) => {
  const { currentPage, pageSize } = req.body;
  const rentals = await Rentals.find()
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize);
  if (rentals && rentals.length === 0) {
    res.status(404).send("Rental customers not found");
  }
  res.status(200).send(rentals);
});
router.post("/", auth, async (req, res) => {
  const { error } = validateRentals(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send("No movie found with give id");
  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("No Customer found with give id");

  if (movie.numberInStock == 0) {
    return res.status(400).send("Movie Out of stock");
  }
  const rental = new Rentals({
    customer: {
      name: customer.name,
      phone: customer.phone,
      _id: customer._id,
    },
    movie: {
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
      _id: movie._id,
    },
    rentalFee: movie.dailyRentalRate * 10,
  });
  const session = await Rentals.startSession();
  session.startTransaction();
  try {
    await rental.save();
    await Movie.findByIdAndUpdate(movie._id, { $inc: { numberInStock: -1 } });
    session.commitTransaction();
    session.endSession();
    res.send(rental);
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    return res.send(error.message);
  }
});
router.patch("/:id", validObj, auth, async (req, res) => {
  const session = await Rentals.startSession();
  session.startTransaction();
  try {
    const rental = await Rentals.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { dateIn: req.body.dateIn } }, //new Date().getTime() from console
      { new: true }
    );

    await Movie.findByIdAndUpdate(rental.movie._id, {
      $inc: { numberInStock: 1 },
    });
    session.commitTransaction();
    session.endSession();
    res.send(rental);
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    return res.send(error.message);
  }
});
router.delete("/:id", validObj, auth, admin, async (req, res) => {
  const session = await Rentals.startSession();
  session.startTransaction();
  try {
    const rental = await Rentals.findByIdAndDelete({ _id: req.params.id });
    await Movie.findByIdAndUpdate(rental.movie._id, {
      $inc: { numberInStock: 1 },
    });
    session.commitTransaction();
    session.endSession();
    console.log("sussesfully deleted");
    res.send(rental);
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    return res.send(error.message);
  }
});

module.exports = router;
