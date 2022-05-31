const supertest = require("supertest");

const app = require("../../../index");
const req = supertest(app);
const { User } = require("../../../model/userModel");
const { Genre, validateGenre } = require("../../../model/genreModel");

describe("auth middleware", () => {
  afterEach(async () => {
    await Genre.deleteMany({});
  });
  it("should return  401 if token is not found", async () => {
    const res = await req.post("/api/genres");
    expect(res.status).toBe(401);
  });
  it("should return  400 if token is invalid", async () => {
    const res = await req.post("/api/genres").set("x-auth-token", "a");
    expect(res.status).toBe(400);
  });
  it("should return  200 if token is valid", async () => {
    const user = new User();
    const token = user.getAuthToken();
    const res = await req
      .post("/api/genres")
      .set("x-auth-token", token)
      .send({ name: "genre1" });
    expect(res.status).toBe(200);
  });
});
