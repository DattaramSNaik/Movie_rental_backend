const router = require("express").Router();
//middleware
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validObj = require("../middleware/validateObjId");
// Geners Model
const { Genre, validateGenre } = require("../model/genreModel");

router.get("/", async (req, res) => {
  const genres = await Genre.find({});
  if (genres && genres.length === 0) {
    res.status(404).send("Genres not found");
  }
  res.status(200).send(genres);
});

router.get("/count", async (req, res) => {
  const name = req.query.name;
  let query = {};
  if (name) {
    query["name"] = new RegExp(name, "i");
  }
  const genresCount = await Genre.find(query).count();
  if (genresCount && genresCount.length === 0) {
    res.status(404).send("Genres not found");
  }
  res.status(200).send({ genresCount });
});

router.post("/paginationSearch", async (req, res) => {
  const { currentPage, pageSize, name } = req.body;
  const query = {};
  if (name) {
    query["name"] = new RegExp(name, "i");
  }
  const genres = await Genre.find(query)
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize);
  if (genres && genres.length === 0) {
    res.status(404).send("Genres not found");
  }
  res.status(200).send(genres);
});

router.get("/:id", validObj, async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).send("Genres not found");
  res.status(200).send(genre);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  } else {
    const genre = new Genre({
      name: req.body.name,
    });

    await genre.save();
    res.status(200).send(genre);
  }
});
router.put("/:id", auth, async (req, res) => {
  console.log(req.params.id);
  const { error } = validateGenre(req.body);
  if (error) {
    console.log(error.details[0].message);
    return res.status(400).send(error.details[0].message);
  } else {
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      {
        $set: { name: req.body.name },
      },
      { new: true }
    );
    console.log("genre", genre);
    if (genre) {
      res.send(genre);
    } else {
      res.status(404).send("Genre Not Found");
    }
  }
});

router.delete("/:id", auth, admin, async (req, res) => {
  const genre = await Genre.findByIdAndRemove({ _id: req.params.id });
  if (genre) {
    res.send(genre);
  } else {
    res.status(404).send("Genre Not Found");
  }
});
module.exports = router;
