const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../../../index");
const bcrypt = require("bcrypt");
const req = supertest(app);
const { User } = require("../../../model/userModel");

describe("/api/login", () => {
  afterEach(async () => {
    await User.deleteMany({});
  });
  describe("Post /", () => {
    it("should return 400 when email or password missing ", async () => {
      const login = {
        email: "akshay@gmail.com",
        password: "",
      };
      const res = await req.post("/api/login").send(login);
      expect(res.status).toBe(400);
    });
    it("should return 404 when password not match", async () => {
      const salt = await bcrypt.genSalt(10);
      const user = new User({
        name: "akshay3",
        email: "akshay7@gmail.com",
        password: await bcrypt.hash("Naik@07726", salt),
        isAdmin: true,
      });
      await user.save();
      const login = {
        email: "akshay7@gmail.com",
        password: "Naik@2285",
      };

      const res = await req.post("/api/login").send(login);

      expect(res.status).toBe(401);
    });
    it("should return 404 when email or user not present in db", async () => {
      const salt = await bcrypt.genSalt(10);
      const user = new User({
        name: "akshay3",
        email: "akshay7@gmail.com",
        password: await bcrypt.hash("Naik@07726", salt),
        isAdmin: true,
      });
      await user.save();
      const login = {
        email: "ak7@gmail.com",
        password: "Naik@07726",
      };
      const res = await req.post("/api/login").send(login);

      expect(res.status).toBe(404);
    });
    it("should return 404 when email or user not present in db", async () => {
      const salt = await bcrypt.genSalt(10);
      const user = new User({
        name: "akshay3",
        email: "akshay7@gmail.com",
        password: await bcrypt.hash("Naik@07726", salt),
        isAdmin: true,
      });
      await user.save();
      const login = {
        email: "akshay7@gmail.com",
        password: "Naik@07726",
      };
      const res = await req.post("/api/login").send(login);
      expect(res.status).toBe(200);
    });
  });
});
