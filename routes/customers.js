const { Customer, validate } = require('../models/customer');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');

const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  let customers = {};
  let isAuthorized;
  let createDate;
  if (!req.query.isAuthorized && !req.query.createDate) {
    customers = await Customer.find().sort('name');
  }
  if (req.query.isAuthorized) {
    // http://localhost:5000/api/customers/?isAuthorized=true ? is necessary
    isAuthorized = req.query.isAuthorized;
    customers = await Customer.find({ isAuthorized: isAuthorized });
  }
  if (req.query.createDate) {
    // http://localhost:5000/api/customers/?isAuthorized=true ? is necessary
    createDate = req.query.createDate;
    customers = await Customer.find({ createDate: { $gt: createDate } });
  }

  if (req.query.isAuthorized && req.query.createDate) {
    createDate = req.query.createDate;
    isAuthorized = req.query.isAuthorized;
    customers = await Customer.find({
      isAuthorized: isAuthorized,
      createDate: { $gt: createDate },
    });
  }

  return res.send(customers);
});

router.post('/', [auth, admin], async (req, res) => {
  const { error } = validate(
    _.pick(req.body, ['name', 'phone', 'address', 'email'])
  );
  if (error) return res.status(400).send(error.details[0].message);
  let customer = new Customer();
  // required paths
  customer.name = req.body.name;
  customer.phone = req.body.phone;
  customer.address = req.body.address;
  customer.email = req.body.email;

  // optional paths
  if (req.body.latitude) customer.latitude = req.body.latitude;
  if (req.body.longitude) customer.longitude = req.body.longitude;
  if (req.body.isAuthorized) customer.isAuthorized = req.body.isAuthorized;
  if (req.body.credit) customer.credit = req.body.credit;
  if (req.body.imageUrl) customer.imageUrl = req.body.imageUrl;

  // default paths:  value from login information
  customer.updateUser = req.user._id;
  customer.createUser = req.user._id;
  const newCustomer = await customer.save();

  res.send(newCustomer);
});

router.put('/:id', [auth, admin], async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer)
    return res
      .status(404)
      .send('The customer with the given ID was not found.');

  // only update paths whose value is not null or undefined
  if (req.body.name) customer.name = req.body.name;
  if (req.body.phone) customer.phone = req.body.phone;
  if (req.body.address) customer.address = req.body.address;

  if (req.body.latitude) customer.latitude = req.body.latitude;
  if (req.body.longitude) customer.longitude = req.body.longitude;
  if (req.body.isAuthorized) customer.isAuthorized = req.body.isAuthorized;
  if (req.body.credit) customer.credit = req.body.credit;
  if (req.body.imageUrl) customer.imageUrl = req.body.imageUrl;
  if (req.body.email) customer.email = req.body.email;

  // default paths:  value from login information
  customer.updateUser = req.user._id;
  customer.updateDate = new Date();
  const newCustomer = await customer.save();
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  return res.status(200).send({
    data: newCustomer,
    message: `The customer <<${customer.name}>> with the given ID  is successfully updated.`,
  });
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer)
    return res
      .status(404)
      .send('The customer with the given ID was not found.');

  return res.status(200).send({
    message: `The customer <<${customer.name}>> with the given ID  is successfully deleted.`,
  });
});

router.get('/:id', async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer)
    return res
      .status(404)
      .send('The customer with the given ID was not found.');

  res.send(customer);
});

module.exports = router;
