const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../../../index");
const bcrypt = require("bcrypt");
const req = supertest(app);
const { User } = require("../../../model/userModel");

describe("/api/users", () => {
  afterEach(async () => {
    await User.deleteMany({});
  });
  describe("GET /", () => {
    it("should return all the User", async () => {
      const salt = await bcrypt.genSalt(10);
      const password = "12345";
      await User.collection.insertMany([
        {
          name: "akshay",
          email: "akshay7@gmail.com",
          password: await bcrypt.hash(password, salt),
          isAdmin: true,
        },
      ]);
      const res = await req.get("/api/users");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body.some((U) => U.name == "akshay")).toBeTruthy();
      expect(res.body.some((U) => U.email == "akshay7@gmail.com")).toBeTruthy();
    });
    it("should return 404 user not found", async () => {
      const res = await req.get("/api/users");
      expect(res.status).toBe(404);
    });
  });
  describe("GET /:id", () => {
    it("should return 400 if  invalid id is passed", async () => {
      const res = await req.get("/api/users/1");
      expect(res.status).toBe(400);
    });
    it("should return 404 if invalid id is passed", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.get("/api/users/" + id);
      expect(res.status).toBe(404);
    });
    it("should return 200 the user found when valid id passed", async () => {
      const salt = await bcrypt.genSalt(10);
      const user = new User({
        name: "akshay2",
        email: "akshay75@gmail.com",
        password: await bcrypt.hash("123456", salt),
        isAdmin: true,
      });
      await user.save();
      const res = await req.get("/api/users/" + user._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", user._id.toHexString());
      expect(res.body).toHaveProperty("name", user.name);
    });
  });
  describe("POST /", () => {
    it("should return  400 if name have less than length 5 and greater than length 25 found", async () => {
      const salt = await bcrypt.genSalt(10);
      const res = await req.post("/api/users").send({
        name: "aks",
        email: "akshay7@gmail.com",
        password: await bcrypt.hash("12345", salt),
        isAdmin: true,
      });
      expect(res.status).toBe(400);
    });
    it("should return  400 if email less than length 5 , greater than length 255 and without .com .net  found", async () => {
      const salt = await bcrypt.genSalt(10);
      const res = await req.post("/api/users").send({
        name: "akshay",
        email: "ak@gmail",
        password: await bcrypt.hash("12345", salt),
        isAdmin: true,
      });
      expect(res.status).toBe(400);
    });
    it("should return  400 if password less than 8 cher , greater than 25 atleast one Lowercase,Uppercase,Symbol, Numeric charecter found", async () => {
      const salt = await bcrypt.genSalt(10);
      const res = await req.post("/api/users").send({
        name: "akshay55",
        email: "akshay7@gmail.com",
        password: "12345",
        isAdmin: true,
      });

      expect(res.status).toBe(400);
    });
    it("should save the user inside database if did proper validation", async () => {
      const salt = await bcrypt.genSalt(10);
      const res = await req.post("/api/users").send({
        name: "akshay",
        email: "akshay@gmail.com",
        password: await bcrypt.hash("Naik@07726", salt),
        isAdmin: true,
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "akshay");
    });
    it("should be unique email will insert in database everytime", async () => {
      const salt = await bcrypt.genSalt(10);
      const user = new User({
        name: "akshay2",
        email: "akshay7@gmail.com",
        password: await bcrypt.hash("123456", salt),
        isAdmin: true,
      });
      await user.save();
      const res = await req.post("/api/users").send({
        name: "akshay",
        email: "akshay7@gmail.com",
        password: await bcrypt.hash("Naik@07726", salt),
        isAdmin: true,
      });
      expect(res.status).toBe(401);
    });
  });
  describe("PUT /", () => {
    it("should return 400 if invalid id is passed ", async () => {
      const res = await req.put("/api/users/1");
      expect(res.status).toBe(400);
    });

    it("should return  400 if name have min length 5 and max length 25 found", async () => {
      const salt = await bcrypt.genSalt(10);
      const user = new User({
        name: "akshay3",
        email: "akshay7@gmail.com",
        password: await bcrypt.hash("Naik@07726", salt),
        isAdmin: true,
      });
      await user.save();
      const res = await req.put("/api/users/" + user._id).send({
        name: "aks",
        email: "akshay7@gmail.com",
        password: await bcrypt.hash("Naik@07726", salt),
        isAdmin: true,
      });
      expect(res.status).toBe(400);
    });
    it("should return  400 if email less than length 5 , greater than length 255 and without .com .net  found", async () => {
      const salt = await bcrypt.genSalt(10);
      const user = new User({
        name: "akshay3",
        email: "akshay7@gmail.com",
        password: await bcrypt.hash("Naik@07726", salt),
        isAdmin: true,
      });
      await user.save();
      const res = await req.put("/api/users/" + user._id).send({
        name: "akshay4",
        email: "akshay7@gmail",
        password: await bcrypt.hash("Naik@07726", salt),
        isAdmin: true,
      });
      expect(res.status).toBe(400);
    });
    it("should return  400 if password less than 8 cher , greater than 1024 atleast one Lowercase,Uppercase,Symbol, Numeric charecter found", async () => {
      const salt = await bcrypt.genSalt(10);
      const user = new User({
        name: "testting9",
        email: "testing@gmail.com",
        password: await bcrypt.hash("Naik@07726", salt),
        isAdmin: true,
      });
      await user.save();

      const res = await req.put("/api/users/" + user._id).send({
        name: "akshay8",
        email: "akshay7@gmail.com",
        password: "Naik",
        isAdmin: true,
      });

      expect(res.status).toBe(400);
    });
    it("should save updated data the user inside database if did proper validation", async () => {
      const salt = await bcrypt.genSalt(10);
      const user = new User({
        name: "akshay3",
        email: "akshay7@gmail.com",
        password: await bcrypt.hash("Naik@07726", salt),
        isAdmin: true,
      });
      await user.save();
      const res = await req.put("/api/users/" + user._id).send({
        name: "akshay45",
        email: "akshay78@gmail.com",
        password: "Akhsay$5255",
        isAdmin: true,
      });
      expect(res.status).toBe(200);
    });
  });
  describe("Delete /:id", () => {
    it("should return 400 when invalid object id", async () => {
      const salt = await bcrypt.genSalt(10);

      const pt = await req.post("/api/users").send({
        name: "akshay",
        email: "akshay7@gmail.com",
        password: await bcrypt.hash("Naik@07726", salt),
        isAdmin: true,
      });

      const res = await req.delete("/api/users/" + "ss");

      expect(res.status).toBe(400);
    });
    it("should return 200 user Deleted successfully", async () => {
      const salt = await bcrypt.genSalt(10);
      const pt = await req.post("/api/users").send({
        name: "akshay",
        email: "akshay7@gmail.com",
        password: await bcrypt.hash("Naik@07726", salt),
        isAdmin: true,
      });

      const res = await req.delete("/api/users/" + pt.body._id);

      expect(res.status).toBe(200);
    });
  });
});
