const router = require("express").Router();

//middleware
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validObj = require("../middleware/validateObjId");
//movieModel
const { Movie, validateMovie } = require("../model/moviesModel");
//genremodel
const { Genre } = require("../model/genreModel");

router.get("/", async (req, res) => {
  const movies = await Movie.find({});
  if (movies && movies.length === 0) {
    res.status(404).send("Movies not found");
  }
  res.status(200).send(movies);
});
router.get("/count", async (req, res) => {
  const genreName = req.query.genreName;
  const title = req.query.title;

  const query = {};
  if (genreName) {
    query["genre.name"] = genreName;
  }
  if (title) {
    query["title"] = new RegExp(title, "i");
  }
  const moviesCount = await Movie.find(query).count();
  res.status(200).send({ moviesCount });
});

router.get("/:id", validObj, async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).send("Movie not found");
  res.status(200).send(movie);
});

router.post("/pfs", async (req, res) => {
  const { currentPage, pageSize, genreName, title, sort_by } = req.body;
  let query = {};
  if (genreName) {
    query["genre.name"] = genreName;
  }
  if (title) {
    query["title"] = new RegExp(title, "i");
  }
  let sort = {};

  if (sort_by) {
    let { field, order_by } = sort_by;
    sort[field] = order_by;
  }
  const Movies = await Movie.find(query)
    .sort(sort)
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize);

  res.status(200).send(Movies);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateMovie(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).send(error.details[0].message);
  }

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) {
    return res.status(400).send("No genre found with give id");
  }
  const movie = new Movie({
    title: req.body.title,
    genre: {
      name: genre.name,
      _id: genre._id,
    },
    dailyRentalRate: req.body.dailyRentalRate,
    numberInStock: req.body.numberInStock,
    liked: req.body.liked,
  });
  await movie.save();
  res.send(movie);
});

router.put("/:id", validObj, auth, async (req, res) => {
  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("No genre found with give id");
  const { error } = validateMovie(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const movie = await Movie.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        title: req.body.title,
        genre: {
          name: genre.name,
          _id: genre._id,
        },
        dailyRentalRate: req.body.dailyRentalRate,
        numberInStock: req.body.numberInStock,
        liked: req.body.liked,
      },
    },
    { new: true }
  );
  if (movie) {
    res.status(200).send(movie);
  } else {
    res.status(404).send("Movie Not Found");
  }
});

router.delete("/:id", validObj, auth, admin, async (req, res) => {
  const movie = await Movie.findByIdAndRemove({ _id: req.params.id });
  if (movie) {
    res.send(movie);
  } else {
    res.status(404).send("Movie Not Found");
  }
});
module.exports = router;
