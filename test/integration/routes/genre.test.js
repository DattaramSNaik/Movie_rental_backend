const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../../../index");
const req = supertest(app);
const { User } = require("../../../model/userModel");
const { Genre, validateGenre } = require("../../../model/genreModel");

describe("/api/genres", () => {
  afterEach(async () => {
    await Genre.deleteMany({});
  });
  describe(" GET /", () => {
    it("should return all the genres", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);
      const res = await req.get("/api/genres");
      expect(res.status).toBe(200);
      //expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.name == "genre1")).toBeTruthy();
      expect(res.body.some((g) => g.name == "genre2")).toBeTruthy();
    });
    it("should return 404 if genre are not found", async () => {
      const res = await req.get("/api/genres");
      expect(res.status).toBe(404);
    });
  });
  describe("GET /:id", () => {
    it("should return 400 if  invalid id is passed", async () => {
      const res = await req.get("/api/genres/1");
      expect(res.status).toBe(400);
    });
    it("should return 404 if  valid id passed but genre not found", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.get("/api/genres/" + id);
      expect(res.status).toBe(404);
    });
    it("should return 200 genre when valid id passed", async () => {
      const genre = new Genre({
        name: "genre3",
      });
      await genre.save();
      const res = await req.get("/api/genres/" + genre._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", genre._id.toHexString());
      expect(res.body).toHaveProperty("name", genre.name);
    });
  });
  describe("POST /", () => {
    it("should return  401 if token is not found", async () => {
      const res = await req.post("/api/genres");
      expect(res.status).toBe(401);
    });
    it("should return  400 if invalid input less than 3 charecter genre", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const res = await req
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name: "g1" });
      expect(res.status).toBe(400);
    });
    it("should return  400 if invalid input greater than 10 charecter genre", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const res = await req
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name: "aaaaaaaaaaaa" });
      expect(res.status).toBe(400);
    });
    it("should save and using find return the genre", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const res = await req
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name: "Drama" });
      expect(res.status).toBe(200);
      const genre = await Genre.findOne({ name: "Drama" });
      expect(genre).not.toBeNull();
      expect(genre).toHaveProperty("name", "Drama");
    });
    it("should return 200 the genre and check response ", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const res = await req
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name: "genre5" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "genre5");
    });
  });
  describe("PUT /:id", () => {
    //invalid id passed
    it("should return 400 if invalid id is passed", async () => {
      const res = await req.put("/api/genres/1");
      expect(res.status).toBe(400);
    });
    //valid id passed but genre not found
    it("should return 404 if  valid id passed with correct format but genre not found", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const id = new mongoose.Types.ObjectId();
      const res = await req
        .put("/api/genres/" + id)
        .set("x-auth-token", token)
        .send({ name: "genre6" });
      expect(res.status).toBe(404);
    });
    //invalid token passed
    it("should return  400 if token is invalid", async () => {
      const res = await req.put("/api/genres/1").set("x-auth-token", "a");
      expect(res.status).toBe(400);
    });
    // joi validation lessthan 3 charecter not allowed
    it("should return 400 if put data is less than 3 character", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre7",
      });
      await genre.save();
      const res = await req
        .put("/api/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name: "pe" });
      expect(res.status).toBe(400);
    });
    // joi validation lessthan 10 charecter not allowed
    it("should return 400 if put data is greater than 10 character", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre8",
      });
      await genre.save();
      const res = await req
        .put("/api/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name: "aaaaaaaaaaa" });
      expect(res.status).toBe(400);
    });
    it("should return 404 objectid does not exist ( genre not found )", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const res = await req
        .put("/api/genres/6249a0c6a41379804de56599")
        .set("x-auth-token", token)
        .send({ name: "Akshay" });
      expect(res.status).toBe(404);
    });
    //200 status data updated and show
    it("should return 200 and check property present or not", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre9",
      });
      await genre.save();
      const res = await req
        .put("/api/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name: "Akshay" });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "Akshay");
    });
    //genre updated and find in db
    it("should return update the genre", async () => {
      const user = new User();
      const token = user.getAuthToken();
      let genre = new Genre({
        name: "genre10",
      });
      await genre.save();
      const res = await req
        .put("/api/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name: "Akshay" });
      expect(res.status).toBe(200);
      expect(res.body).not.toBeNull();
      expect(res.body).toHaveProperty("name", "Akshay");
    });
  });
  describe("DELETE /:id", () => {
    it("should give 403 error when user is not admin", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre11",
      });
      await genre.save();
      const res = await req
        .delete("/api/genres/" + genre._id)
        .set("x-auth-token", token);
      expect(res.status).toBe(403);
    });
    //invalid id passed
    it("should return 404 objectid does not exist (genre not found)", async () => {
      const user = new User({
        isAdmin: true,
      });
      const token = user.getAuthToken();
      const res = await req
        .delete("/api/genres/6249a0c6a41379804de56599")
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });
    //valid id passed but genre not found
    it("should return 404 if  valid id passed with correct format but genre not found", async () => {
      const user = new User({
        isAdmin: true,
      });
      const token = user.getAuthToken();
      const id = new mongoose.Types.ObjectId();
      const res = await req
        .delete("/api/genres/" + id)
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });
    //invalid token passed
    it("should return  400 if token is invalid", async () => {
      const res = await req.delete("/api/genres/1").set("x-auth-token", "a");
      expect(res.status).toBe(400);
    });

    //200 status data updated and show
    it("should return 200 the deleted genre", async () => {
      const user = new User({
        isAdmin: true,
      });
      const token = user.getAuthToken();
      const genre = new Genre({
        name: "genre12",
      });
      await genre.save();
      const res = await req
        .delete("/api/genres/" + genre._id)
        .set("x-auth-token", token);
      expect(res.status).toBe(200);
    });
  });
});
