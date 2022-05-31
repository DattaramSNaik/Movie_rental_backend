const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../../../index");
const req = supertest(app);
const { Movie } = require("../../../model/moviesModel");
const { Genre } = require("../../../model/genreModel");
const { User } = require("../../../model/userModel");

describe("/api/movies", () => {
  afterEach(async () => {
    await Genre.deleteMany({});
    await Movie.deleteMany({});
  });
  describe("GET /", () => {
    it("should return all the Movies", async () => {
      await Movie.collection.insertMany([
        {
          title: "movie1",
          genre: {
            _id: "6249a0c6a41379804de56599",
            name: "genre14",
          },
          numberInStock: 52,
          dailyRentalRate: 22,
        },
      ]);
      const res = await req.get("/api/movies");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body.some((m) => m.title == "movie1")).toBeTruthy();
      expect(res.body.some((m) => m.numberInStock == "52")).toBeTruthy();
      expect(res.body.some((m) => m.dailyRentalRate == "22")).toBeTruthy();
    });
    it("should return all the Movies", async () => {
      const res = await req.get("/api/movies");
      expect(res.status).toBe(404);
    });
  });
  describe("GET /:id", () => {
    it("should return 400 if  invalid id is passed", async () => {
      const res = await req.get("/api/movies/1");
      expect(res.status).toBe(400);
    });
    it("should return 404 if  valid id passed but genre not found", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.get("/api/movies/" + id);
      expect(res.status).toBe(404);
    });
    it("should return 200 Movie when valid id passed", async () => {
      const genre = new Genre({
        name: "genre15",
      });
      await genre.save();
      const movie = new Movie({
        title: "movie2",
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numberInStock: 52,
        dailyRentalRate: 22,
      });
      await movie.save();
      const res = await req.get("/api/movies/" + movie._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", movie._id.toHexString());
      expect(res.body).toHaveProperty("title", movie.title);
    });
  });
  describe("POST /", () => {
    it("should return  401 if token is not found", async () => {
      const res = await req.post("/api/movies");
      expect(res.status).toBe(401);
    });
    it("should return  400 if invalid input title less than 5 and greater than 50 charecter found", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre18",
      });
      await genre.save();
      let movie = {
        title: "mov",
        genreId: genre._id,
        numberInStock: 52,
        dailyRentalRate: 22,
      };
      const res = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send(movie);
      expect(res.status).toBe(400);
    });
    it("should return  400 if invalid input numberInStock be negative and greater than 255 Number found", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre18",
      });
      await genre.save();
      let movie = {
        title: new Array(256).join("test"),
        genreId: genre._id,
        numberInStock: -1,
        dailyRentalRate: 22,
      };
      const res = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send(movie);
      expect(res.status).toBe(400);
    });
    it("should return  400 if invalid input dailyRentalRate be negative and greater than 255 Number found", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre18",
      });
      await genre.save();
      let movie = {
        title: "mov",
        genreId: genre._id,
        numberInStock: 52,
        dailyRentalRate: -22,
      };
      const res = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send(movie);
      expect(res.status).toBe(400);
    });
    it("should return  400 if invalid input genreid or genre not found", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre18",
      });
      await genre.save();
      let movie = {
        title: "mov",
        genreId: "objectId",
        numberInStock: 52,
        dailyRentalRate: 22,
      };
      const res = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send(movie);
      expect(res.status).toBe(400);
    });
    it("should save and return 200 response with Movie data", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre17",
      });
      await genre.save();
      let movie = {
        title: "movie4",
        genreId: genre._id,
        numberInStock: 52,
        dailyRentalRate: 22,
      };
      const res = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send(movie);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("title", "movie4");
    });
  });
  describe("PUT /:id", () => {
    //validate
    it("should return 400 if invalid id is passed ", async () => {
      const res = await req.put("/api/movies/1");
      expect(res.status).toBe(400);
    });
    //token not found (Access denied)
    it("should return  401 if token is not found", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.put("/api/movies/" + id);
      expect(res.status).toBe(401);
    });
    //token  got token but not correct)
    it("should return  400 if we got token but not correct", async () => {
      const res = await req.put("/api/movies/1").set("x-auth-token", "a");
      expect(res.status).toBe(400);
    });
    it("should return  400 if invalid input title less than 5 and greater than 50 charecter found", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre1832",
      });
      await genre.save();

      let data = {
        title: "movie4",
        genreId: genre._id,
        numberInStock: 52,
        dailyRentalRate: 22,
      };
      const pt = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send(data);

      const res = await req
        .put("/api/movies/" + pt.body._id)
        .set("x-auth-token", token)
        .send({
          title: "mo",
          genreId: pt.body.genre._id,
          numberInStock: 52,
          dailyRentalRate: 22,
        });

      expect(res.status).toBe(400);
    });
    it("should return  400 if invalid input genre_Id not found", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre1832",
      });
      await genre.save();

      let data = {
        title: "movie4",
        genreId: genre._id,
        numberInStock: 52,
        dailyRentalRate: 22,
      };
      const pt = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send(data);

      const res = await req
        .put("/api/movies/" + pt.body._id)
        .set("x-auth-token", token)
        .send({
          title: "movie5",
          genreId: pt.body.genre,
          numberInStock: 52,
          dailyRentalRate: 22,
        });

      expect(res.status).toBe(400);
    });
    it("should return  200 when updated movie", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre1832",
      });
      await genre.save();

      let data = {
        title: "movie4",
        genreId: genre._id,
        numberInStock: 52,
        dailyRentalRate: 22,
      };
      const pt = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send(data);

      const res = await req
        .put("/api/movies/" + pt.body._id)
        .set("x-auth-token", token)
        .send({
          title: "movie5",
          genreId: pt.body.genre._id,
          numberInStock: 52,
          dailyRentalRate: 22,
        });

      expect(res.status).toBe(200);
    });
  });
  describe("Delete  /:id", () => {
    it("should give 403 error when user is not admin", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre1832",
      });
      await genre.save();

      let data = {
        title: "movie4",
        genreId: genre._id,
        numberInStock: 52,
        dailyRentalRate: 22,
      };
      const pt = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send(data);

      const res = await req
        .delete("/api/movies/" + pt.body._id)
        .set("x-auth-token", token);
      expect(res.status).toBe(403);
    });
    it("should return 401 when token not found ", async () => {
      const user = new User({
        isAdmin: true,
      });
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre1832",
      });
      await genre.save();

      let data = {
        title: "movie4",
        genreId: genre._id,
        numberInStock: 52,
        dailyRentalRate: 22,
      };
      const pt = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send(data);
      const res = await req.delete("/api/movies/" + pt.body._id);
      expect(res.status).toBe(401);
    });
    it("should return 400 when token not valid", async () => {
      const user = new User({
        isAdmin: true,
      });
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre1832",
      });
      await genre.save();
      let data = {
        title: "movie4",
        genreId: genre._id,
        numberInStock: 52,
        dailyRentalRate: 22,
      };
      const pt = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send(data);
      const res = await req
        .delete("/api/movies/" + pt.body._id)
        .set("x-auth-token", "dd");
      expect(res.status).toBe(400);
    });
    it("should return 400 when invalid object id", async () => {
      const user = new User({
        isAdmin: true,
      });
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre1832",
      });
      await genre.save();
      let data = {
        title: "movie4",
        genreId: genre._id,
        numberInStock: 52,
        dailyRentalRate: 22,
      };
      const pt = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send(data);
      const res = await req.delete("/api/movies/aa").set("x-auth-token", token);
      expect(res.status).toBe(400);
    });
    it("should return 200 Movie Deleted successfully", async () => {
      const user = new User({
        isAdmin: true,
      });
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre1832",
      });
      await genre.save();
      let data = {
        title: "movie4",
        genreId: genre._id,
        numberInStock: 52,
        dailyRentalRate: 22,
      };
      const pt = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send(data);
      const res = await req
        .delete("/api/movies/" + pt.body._id)
        .set("x-auth-token", token);
      expect(res.status).toBe(200);
    });
  });
});
