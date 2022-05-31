const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../../../index");
const req = supertest(app);
const { Customer } = require("../../../model/customerModel");
const { Genre } = require("../../../model/genreModel");
const { Movie } = require("../../../model/moviesModel");
const { Rentals } = require("../../../model/rentalModel");
const { User } = require("../../../model/userModel");

describe("/api/rental", () => {
  afterEach(async () => {
    await Rentals.deleteMany({});
    await Movie.deleteMany({});
    await Genre.deleteMany({});
    await Customer.deleteMany({});
  });
  describe("Get /", () => {
    it("should return 200 when user get rental data", async () => {
      await Rentals.collection.insertMany([
        {
          customerId: "6238a5c371732037a9442dd9",
          movieId: "6238a63271732037a9442de0",
          rentalFee: 21,
          dateIn: null,
          dateOut: new Date(),
        },
      ]);
      const res = await req.get("/api/rentals");
      expect(res.status).toBe(200);
    });
    it("should return 200 when user get rental data", async () => {
      const res = await req.get("/api/rentals");
      expect(res.status).toBe(404);
    });
  });
  describe("Get /:id", () => {
    it("should return 400 if  invalid id is passed", async () => {
      const res = await req.get("/api/rentals/1");
      expect(res.status).toBe(400);
    });
    it("should return 404 if  valid id passed but rentals not found", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.get("/api/rentals/" + id);
      expect(res.status).toBe(404);
    });
    it("should return 200 get data using id", async () => {
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
      const customer = new Customer({
        name: "customer1",
        phone: 8552049006,
        isGold: true,
      });
      await customer.save();
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
      await rental.save();
      const res = await req.get("/api/rentals/" + rental._id);
      expect(res.status).toBe(200);
    });
  });
  describe("POST /", () => {
    it("should return 401 token not found ", async () => {
      const genre = new Genre({
        name: "genre162",
      });
      await genre.save();
      const movie = new Movie({
        title: "movie22",
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numberInStock: 54,
        dailyRentalRate: 22,
      });
      await movie.save();
      const customer = new Customer({
        name: "customer5",
        phone: 8552049006,
        isGold: true,
      });
      await customer.save();
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
      await rental.save();
      const res = await req.post("/api/rentals/");
      expect(res.status).toBe(401);
    });
    it("should return 400 token get but not valid found ", async () => {
      const genre = new Genre({
        name: "genre162",
      });
      await genre.save();
      const movie = new Movie({
        title: "movie22",
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numberInStock: 54,
        dailyRentalRate: 22,
      });
      await movie.save();
      const customer = new Customer({
        name: "customer5",
        phone: 8552049006,
        isGold: true,
      });
      await customer.save();
      const rental = {
        customerId: customer._id,
        movieId: movie._id,
      };

      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", "dd")
        .send(rental);
      expect(res.status).toBe(400);
    });
    it("should return 400 movieId not found ", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const customer = new Customer({
        name: "customer5",
        phone: 8552049006,
        isGold: true,
      });
      await customer.save();
      const rental = {
        customerId: customer._id,
        movieId: "6238a5c371732037a9442dd9",
      };

      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send(rental);
      expect(res.status).toBe(400);
    });
    it("should return 400 customerId not found ", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre162",
      });
      await genre.save();
      const movie = new Movie({
        title: "movie22",
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numberInStock: 54,
        dailyRentalRate: 22,
      });
      await movie.save();

      const rental = {
        customerId: "6238a5c371732037a9442dd9",
        movieId: movie._id,
      };

      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send(rental);
      expect(res.status).toBe(400);
    });
    it("should return 200 rental data save successfully", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre162",
      });
      await genre.save();
      const movie = new Movie({
        title: "movie22",
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numberInStock: 54,
        dailyRentalRate: 22,
      });
      await movie.save();
      const customer = new Customer({
        name: "customer5",
        phone: 8552049006,
        isGold: true,
      });
      await customer.save();
      const rental = {
        customerId: customer._id,
        movieId: movie._id,
      };
      console.log("rental data" + rental);
      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send(rental);
      expect(res.status).toBe(200);
    });
    it("should return 400 if numberInStock is zero", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre162",
      });
      await genre.save();
      const movie = new Movie({
        title: "movie22",
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numberInStock: 0,
        dailyRentalRate: 22,
      });
      await movie.save();
      const customer = new Customer({
        name: "customer5",
        phone: 8552049006,
        isGold: true,
      });
      await customer.save();
      const rental = {
        customerId: customer._id,
        movieId: movie._id,
      };

      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send(rental);
      expect(res.status).toBe(400);
    });
    it("should save rental if data is valid", async () => {
      const genre34 = new Genre({ name: "genre34" });
      await genre34.save();
      const customer34 = new Customer({
        name: "customer34",
        phone: "123456789",
      });
      await customer34.save();
      const movie34 = new Movie({
        title: "movie34",
        dailyRentalRate: 1.1,
        numberInStock: 10,
        genre: { name: genre34.name, _id: genre34._id },
      });
      await movie34.save();
      const user = new User();
      const token = user.getAuthToken();
      const res = await req
        .post("/api/rentals")
        .set("x-auth-token", token)
        .send({ customerId: customer34._id, movieId: movie34._id });
      expect(res.status).toBe(200);
      const rental = await Rentals.findOne({ "movie.title": "movie34" });
      expect(rental).not.toBeNull();
      expect(rental).toHaveProperty("rentalFee", 11);
    });
    it("should decrement numberInStock of the chosen movie by 1", async () => {
      const genre = new Genre({ name: "genre" });
      await genre.save();
      const customer = new Customer({
        name: "customer436",
        phone: "123656789",
      });
      await customer.save();
      let movie = new Movie({
        title: "movie36",
        dailyRentalRate: 1.1,
        numberInStock: 10,
        genre: { name: genre.name, _id: genre._id },
      });
      await movie.save();
      const user = new User();
      const token = user.getAuthToken();
      await req
        .post("/api/rentals")
        .set("x-auth-token", token)
        .send({ customerId: customer._id, movieId: movie._id });
      movie = await Movie.findById(movie._id);
      expect(movie.numberInStock).toBe(9);
    });
  });
  describe("/:id patch", () => {
    it("should return 401 if token is not provided", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.patch("/api/rentals/" + id);
      expect(res.status).toBe(401);
    });
    it("should return 404 if invalid id is send", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const res = await req.patch("/api/rentals/1").set("x-auth-token", token);
      expect(res.status).toBe(400);
    });
    it("should update rental if data is valid", async () => {
      const genre40 = new Genre({ name: "genre40" });
      await genre40.save();
      const customer40 = new Customer({
        name: "customer40",
        phone: "124056789",
      });
      await customer40.save();
      const movie40 = new Movie({
        title: "movie40",
        dailyRentalRate: 1.1,
        numberInStock: 10,
        genre: { name: genre40.name, _id: genre40._id },
      });
      await movie40.save();
      let rental = new Rentals({
        customer: {
          name: customer40.name,
          phone: customer40.phone,
          _id: customer40._id,
        },
        movie: {
          title: movie40.title,
          dailyRentalRate: movie40.dailyRentalRate,
          _id: movie40._id,
        },
        rentalFee: 40,
      });
      await rental.save();
      const token = new User().getAuthToken();
      await req
        .patch("/api/rentals/" + rental._id)
        .set("x-auth-token", token)
        .send({ dateIn: new Date() });
      rental = await Rentals.findOne({ "movie.title": "movie40" });
      expect(rental.dateIn).not.toBeNull();
    });
    it("should send updated rental if data is valid", async () => {
      const genre50 = new Genre({ name: "genre50" });
      await genre50.save();
      const customer50 = new Customer({
        name: "customer50",
        phone: "125056789",
      });
      await customer50.save();
      const movie50 = new Movie({
        title: "movie50",
        dailyRentalRate: 1.1,
        numberInStock: 10,
        genre: { name: genre50.name, _id: genre50._id },
      });
      await movie50.save();
      let rental = new Rentals({
        customer: {
          name: customer50.name,
          phone: customer50.phone,
          _id: customer50._id,
        },
        movie: {
          title: movie50.title,
          dailyRentalRate: movie50.dailyRentalRate,
          _id: movie50._id,
        },
        rentalFee: 50,
      });
      await rental.save();
      const token = new User().getAuthToken();
      const res = await req
        .patch("/api/rentals/" + rental._id)
        .set("x-auth-token", token)
        .send({ dateIn: new Date() });
      expect(res.body.dateIn).not.toBeNull();
    });
    it("should increment numberInStock of chosen movie by 1 data is valid", async () => {
      const genre55 = new Genre({ name: "genre55" });
      await genre55.save();
      const customer55 = new Customer({
        name: "customer55",
        phone: "125556789",
      });
      await customer55.save();
      let movie55 = new Movie({
        title: "movie55",
        dailyRentalRate: 1.1,
        numberInStock: 10,
        genre: { name: genre55.name, _id: genre55._id },
      });
      await movie55.save();
      let rental = new Rentals({
        customer: {
          name: customer55.name,
          phone: customer55.phone,
          _id: customer55._id,
        },
        movie: {
          title: movie55.title,
          dailyRentalRate: movie55.dailyRentalRate,
          _id: movie55._id,
        },
        rentalFee: 55,
      });
      await rental.save();
      const token = new User().getAuthToken();
      await req
        .patch("/api/rentals/" + rental._id)
        .set("x-auth-token", token)
        .send({ dateIn: new Date() });
      movie55 = await Movie.findById(movie55._id);
      expect(movie55.numberInStock).toBe(11);
    });
  });
  describe("/:id delte", () => {
    it("should return 401 if token is not provided", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.delete("/api/rentals/" + id);
      expect(res.status).toBe(401);
    });
    it("should return 403 if logged in user is not an admin is not provided", async () => {
      const id = new mongoose.Types.ObjectId();
      const token = new User().getAuthToken();
      const res = await req
        .delete("/api/rentals/" + id)
        .set("x-auth-token", token);
      expect(res.status).toBe(403);
    });
    it("should return 404 if invalid id is send", async () => {
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        isAdmin: true,
      });
      const token = user.getAuthToken();
      const res = await req.delete("/api/rentals/1").set("x-auth-token", token);
      expect(res.status).toBe(400);
    });
    it("should delete rental if data is valid", async () => {
      const genre60 = new Genre({ name: "genre60" });
      await genre60.save();
      const customer60 = new Customer({
        name: "customer60",
        phone: "126056789",
      });
      await customer60.save();
      const movie60 = new Movie({
        title: "movie60",
        dailyRentalRate: 1.1,
        numberInStock: 10,
        genre: { name: genre60.name, _id: genre60._id },
      });
      await movie60.save();
      let rental = new Rentals({
        customer: {
          name: customer60.name,
          phone: customer60.phone,
          _id: customer60._id,
        },
        movie: {
          title: movie60.title,
          dailyRentalRate: movie60.dailyRentalRate,
          _id: movie60._id,
        },
        rentalFee: 60,
      });
      await rental.save();
      const token = new User({
        _id: new mongoose.Types.ObjectId(),
        isAdmin: true,
      }).getAuthToken();
      await req.delete("/api/rentals/" + rental._id).set("x-auth-token", token);
      rental = await Rentals.findById(rental._id);
      expect(rental).toBeNull();
    });

    it("should increment numberInStock of chosen movie by 1 data is valid", async () => {
      const genre70 = new Genre({ name: "genre70" });
      await genre70.save();
      const customer70 = new Customer({
        name: "customer70",
        phone: "127056789",
      });
      await customer70.save();
      let movie70 = new Movie({
        title: "movie70",
        dailyRentalRate: 1.1,
        numberInStock: 10,
        genre: { name: genre70.name, _id: genre70._id },
      });
      await movie70.save();
      let rental = new Rentals({
        customer: {
          name: customer70.name,
          phone: customer70.phone,
          _id: customer70._id,
        },
        movie: {
          title: movie70.title,
          dailyRentalRate: movie70.dailyRentalRate,
          _id: movie70._id,
        },
        rentalFee: 70,
      });
      await rental.save();
      const token = new User({
        _id: new mongoose.Types.ObjectId(),
        isAdmin: true,
      }).getAuthToken();
      await req.delete("/api/rentals/" + rental._id).set("x-auth-token", token);
      movie70 = await Movie.findById(movie70._id);
      expect(movie70.numberInStock).toBe(11);
    });
  });
});
