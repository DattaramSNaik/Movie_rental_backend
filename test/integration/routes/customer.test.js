const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../../../index");
const req = supertest(app);
const { Customer } = require("../../../model/customerModel");
const { User } = require("../../../model/userModel");

describe("/api/customers", () => {
  afterEach(async () => {
    await Customer.deleteMany({});
  });
  describe("GET /", () => {
    it("should return all the Customers", async () => {
      await Customer.collection.insertMany([
        { name: "Customer1", phone: 8552049006, isGold: true },
        { name: "Customer2", phone: 8552049006, isGold: false },
        { name: "Customer3", phone: 8552049006 },
      ]);
      const res = await req.get("/api/customers");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body.some((c) => c.name == "Customer1")).toBeTruthy();
      expect(res.body.some((c) => c.phone == "8552049006")).toBeTruthy();
      expect(res.body.some((c) => c.isGold == false)).toBeTruthy();
    });
    it("should return Customers not found", async () => {
      const res = await req.get("/api/customers");
      expect(res.status).toBe(404);
    });
  });
  describe("GET /:id", () => {
    it("should return 400 if  invalid id is passed", async () => {
      const res = await req.get("/api/customers/1");
      expect(res.status).toBe(400);
    });
    it("should return 404 if  invalid id is passed", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.get("/api/customers/" + id);
      expect(res.status).toBe(404);
    });
    it("should return 200 customer when valid id passed", async () => {
      const customer = new Customer({
        name: "customer1",
        phone: 8552049006,
        isGold: true,
      });
      await customer.save();
      const res = await req.get("/api/customers/" + customer._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", customer._id.toHexString());
      expect(res.body).toHaveProperty("name", customer.name);
      expect(res.body).toHaveProperty("phone", customer.phone);
      expect(res.body).toHaveProperty("isGold", customer.isGold);
    });
  });
  describe("POST /", () => {
    //find token found or not (access denied)
    it("should return  401 if token is not found", async () => {
      const res = await req.post("/api/customers");
      expect(res.status).toBe(401);
    });
    it("should return  400 if token is invalid", async () => {
      const res = await req.post("/api/customers").set("x-auth-token", "a");
      expect(res.status).toBe(400);
    });
    it("should return  400 if invalid input of name less than 5 charecter ", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const res = await req
        .post("/api/customers")
        .set("x-auth-token", token)
        .send({
          name: "cust",
          phone: 8552049006,
          isGold: true,
        });
      expect(res.status).toBe(400);
    });
    it("should return  400 if invalid input of name greater than 15 charecter ", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const res = await req
        .post("/api/customers")
        .set("x-auth-token", token)
        .send({
          name: "custagsdjhgfldhjsgfladhgf",
          phone: "8552049006",
          isGold: true,
        });
      expect(res.status).toBe(400);
    });
    it("should return  400 if invalid input of phone number greater than 10  cherecter ", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const res = await req
        .post("/api/customers")
        .set("x-auth-token", token)
        .send({
          name: "customer",
          phone: "855204900633",
          isGold: true,
        });
      expect(res.status).toBe(400);
    });
    it("should return  400 if invalid input of phone number less than 7  cherecter ", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const res = await req
        .post("/api/customers")
        .set("x-auth-token", token)
        .send({
          name: "customer",
          phone: "8552",
          isGold: true,
        });
      expect(res.status).toBe(400);
    });
    it("should save the customer add successfully", async () => {
      const user = new User();
      const token = user.getAuthToken();
      await req.post("/api/customers").set("x-auth-token", token).send({
        name: "customer",
        phone: "8552049006",
        isGold: true,
      });
      const customer = await Customer.findOne({ name: "customer" });
      expect(customer).not.toBeNull();
      expect(customer).toHaveProperty("name", "customer");
    });
    it("should 200 return the customer add sucessfully", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const res = await req
        .post("/api/customers")
        .set("x-auth-token", token)
        .send({
          name: "customer",
          phone: "8552049006",
          isGold: true,
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "customer");
    });
  });
  describe("PUT /:id", () => {
    it("should return 400 if invalid id is passed", async () => {
      const res = await req.put("/api/customers/1");
      expect(res.status).toBe(400);
    });
    it("should return 404 if  valid id passed with correct format but customer not found", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const id = new mongoose.Types.ObjectId();
      const res = await req
        .put("/api/customers/" + id)
        .set("x-auth-token", token)
        .send({
          name: "customer",
          phone: "8552049006",
          isGold: true,
        });
      expect(res.status).toBe(404);
    });
    it("should return  400 if token is invalid", async () => {
      const res = await req.put("/api/customers/1").set("x-auth-token", "a");
      expect(res.status).toBe(400);
    });
    it("should return 404 objectid does not exist (customer not found)", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const res = await req
        .put("/api/customers/6249a0c6a41379804de56599")
        .set("x-auth-token", token)
        .send({
          name: "customer",
          phone: "8552049006",
          isGold: true,
        });
      expect(res.status).toBe(404);
    });
    it("should return  400 if invalid input of name less than 5 charecter ", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const customer = new Customer({
        name: "customer",
        phone: "8552049006",
        isGold: true,
      });
      await customer.save();
      const res = await req
        .put("/api/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({
          name: "cust",
          phone: "8552049006",
          isGold: true,
        });
      expect(res.status).toBe(400);
    });
    it("should return  400 if invalid input of name greater than  15 charecter ", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const customer = new Customer({
        name: "customer",
        phone: "8552049006",
        isGold: true,
      });
      await customer.save();
      const res = await req
        .put("/api/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({
          name: "custumerNameeedsas",
          phone: "8552049006",
          isGold: true,
        });
      expect(res.status).toBe(400);
    });
    it("should return  400 if invalid input of phone number greater than 10  cherecter ", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const customer = new Customer({
        name: "customer",
        phone: "8552049006",
        isGold: true,
      });
      await customer.save();
      const res = await req
        .put("/api/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({
          name: "custumerNameeedsas",
          phone: "85520490066665666",
          isGold: true,
        });
      expect(res.status).toBe(400);
    });
    it("should return  400 if invalid input of phone number less than 7  cherecter ", async () => {
      const user = new User();
      const token = user.getAuthToken();
      const customer = new Customer({
        name: "customer",
        phone: "8552049006",
        isGold: true,
      });
      await customer.save();
      const res = await req
        .put("/api/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({
          name: "custumerNameeedsas",
          phone: "57858",
          isGold: true,
        });
      expect(res.status).toBe(400);
    });
    it("should return 200 status and the customer", async () => {
      const user = new User();
      const token = user.getAuthToken();
      let customer = new Customer({
        name: "customer",
        phone: "8552049006",
        isGold: true,
      });
      await customer.save();
      const res = await req
        .put("/api/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({
          name: "Akshay",
          phone: "8552049006",
          isGold: true,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "Akshay");
    });
    it("should save the Customer", async () => {
      const user = new User();
      const token = user.getAuthToken();
      let customer = new Customer({
        name: "customer",
        phone: "8552049006",
        isGold: true,
      });
      await customer.save();
      const res = await req
        .put("/api/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({
          name: "Akshay",
          phone: "8552049006",
          isGold: true,
        });

      customer = await Customer.findOne({
        name: "Akshay",
        phone: "8552049006",
        isGold: true,
      });
      expect(customer).not.toBeNull();
      expect(customer).toHaveProperty("name", "Akshay");
    });
  });
  describe("DELETE /:id", () => {
    it("should only handle admin", async () => {
      const user = new User();
      const token = user.getAuthToken();
      let customer = new Customer({
        name: "customer",
        phone: "8552049006",
        isGold: true,
      });
      await customer.save();
      const res = await req
        .delete("/api/customers/" + customer._id)
        .set("x-auth-token", token);
      expect(res.status).toBe(403);
    });
    // //invalid id passed(validate obj id file)
    it("should return 400 if invalid id is passed", async () => {
      const res = await req.delete("/api/customers/1");
      expect(res.status).toBe(400);
    });
    it("should return 404 objectid does not exist (customer not found)", async () => {
      const user = new User({
        isAdmin: true,
      });
      const token = user.getAuthToken();
      const res = await req
        .delete("/api/customers/6249a0c6a41379804de56599")
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return 404 if  valid id passed with correct format but customer not found", async () => {
      const user = new User({
        isAdmin: true,
      });
      const token = user.getAuthToken();
      const id = new mongoose.Types.ObjectId();
      const res = await req
        .delete("/api/customers/", id)
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });
    //invalid token passed
    it("should return  400 if token is invalid", async () => {
      const res = await req.delete("/api/customers/1").set("x-auth-token", "a");
      expect(res.status).toBe(400);
    });
    it("should return 200 customer successfully deleted", async () => {
      const user = new User({
        isAdmin: true,
      });
      const token = user.getAuthToken();
      let customer = new Customer({
        name: "customer",
        phone: "8552049006",
        isGold: true,
      });
      await customer.save();
      const res = await req
        .delete("/api/customers/" + customer._id)
        .set("x-auth-token", token);
      expect(res.status).toBe(200);
    });

    it("should delete and return deleted the Customer", async () => {
      const user = new User({ isAdmin: true });
      const token = user.getAuthToken();
      let customer = new Customer({
        name: "customer",
        phone: "8552049006",
        isGold: true,
      });
      await customer.save();
      const res = await req
        .delete("/api/customers/" + customer._id)
        .set("x-auth-token", token);
      expect(res.body).toHaveProperty("name", customer.name);
    });
  });
});
