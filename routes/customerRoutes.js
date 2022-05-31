const router = require("express").Router();
//middleware
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validObj = require("../middleware/validateObjId");
//customer model
const { Customer, validateCustomer } = require("../model/customerModel");

router.get("/", async (req, res) => {
  const customers = await Customer.find({});
  if (customers && customers.length === 0) {
    res.status(404).send("Customers not found");
  }
  res.status(200).send(customers);
});
router.get("/count", async (req, res) => {
  const name = req.query.name;
  let query = {};
  if (name) {
    query["name"] = new RegExp(name, "i");
  }
  const customerCount = await Customer.find(query).count();
  if (customerCount && customerCount.length === 0) {
    res.status(404).send("Customers not found");
  }
  res.status(200).send({ customerCount });
});
router.get("/:id", validObj, async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).send("Customer not found");
  res.status(200).send(customer);
});
router.post("/paginationSearch", async (req, res) => {
  const { currentPage, pageSize, name } = req.body;
  const query = {};
  if (name) {
    query["name"] = new RegExp(name, "i");
  }
  const customer = await Customer.find(query)
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize);
  if (customer && customer.length === 0) {
    res.status(404).send("Customers not found");
  }
  res.status(200).send(customer);
});
router.post("/", auth, async (req, res) => {
  const customers = new Customer({
    name: req.body.name,
    phone: req.body.phone,
    isGold: req.body.isGold,
  });

  const existingCustomer = await Customer.findOne({ name: req.body.name });
  if (existingCustomer) {
    return res.status(409).send("Customer already exist");
  }
  const { error } = validateCustomer(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  } else {
    await customers.save();
    res.status(200).send(customers);
  }
});
router.put("/:id", auth, async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  } else {
    const customers = await Customer.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          phone: req.body.phone,
          isGold: req.body.isGold,
        },
      },
      { new: true }
    );
    if (customers) {
      res.send(customers);
    } else {
      res.status(404).send("customers Not Found");
    }
  }
});

router.delete("/:id", auth, async (req, res) => {
  const customers = await Customer.findByIdAndRemove({ _id: req.params.id });
  if (customers) {
    res.send(customers);
  } else {
    res.status(404).send({ error: "customers Not Found" });
  }
});
module.exports = router;
