const { OrderHeader, validate } = require('../models/orderheader');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');

const express = require('express');
const { Customer } = require('../models/customer');
const router = express.Router();
const _ = require('lodash');

// http(s)://xxx.xxx.xxx.xxx:xxxx/api/orderheaders?startdate=2022-09-12&enddate=2022-09-13&createuser=2322332323
router.get('/', async (req, res) => {
  let orderheaders = [];
  let returnArray = [];
  let startdate;
  let enddate;
  let createuser;

  // case 1, no query
  if (!req.query.startdate && !req.query.enddate && !req.query.createuser) {
    orderheaders = await OrderHeader.find()
      .populate('customer', 'name')
      .populate('createUser', 'name')
      .sort('createDate');
  }

  // case 2, startdate
  if (req.query.startdate && !req.query.enddate && !req.query.createuser) {
    startdate = req.query.startdate;
    orderheaders = await OrderHeader.find({ orderDate: { $gte: startdate } })
      .populate('customer', 'name ')
      .populate('createUser', 'name ')
      .sort('createDate');
  }

  // case 3, enddate
  if (req.query.enddate && !req.query.startdate && !req.query.createuser) {
    enddate = req.query.enddate;
    orderheaders = await OrderHeader.find({ orderDate: { $lte: enddate } })
      .populate('customer', 'name ')
      .populate('createUser', 'name ')
      .sort('createDate');
  }

  // case 4, startdate,enddate
  if (req.query.enddate && req.query.startdate && !req.query.createuser) {
    enddate = req.query.enddate;
    startdate = req.query.startdate;
    orderheaders = await OrderHeader.find({
      orderDate: { $gte: startdate, $lte: enddate },
    })
      .populate('customer', 'name ')
      .populate('createUser', 'name ')
      .sort('createDate');
  }
  // case 5, startdate,enddate,createuser
  if (req.query.enddate && req.query.startdate && req.query.createuser) {
    enddate = req.query.enddate;
    startdate = req.query.startdate;
    createuser = req.query.createuser;
    orderheaders = await OrderHeader.find({
      orderDate: { $gte: startdate, $lte: enddate },
      createUser: createuser,
    })
      .populate('customer', 'name ')
      .populate('createUser', 'name ')
      .sort('name');
  }

  orderheaders.forEach((orderHeader) => {
    returnArray.push({
      _id: orderHeader._id,
      orderDate: orderHeader.orderDate,
      customerId: orderHeader.customer._id,
      customerName: orderHeader.customer.name,
      salespersonName: orderHeader.createUser.name,
      salespersonId: orderHeader.createUser._id,
      createDate: orderHeader.createDate,
    });
  });
  res.send(returnArray);
});

router.post('/', [auth, admin], async (req, res) => {
  const { error } = validate(_.pick(req.body, ['customerId', 'orderDate']));
  if (error) return res.status(400).send({message:error.details[0].message});

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send({message:'Invalid customer.'});

  // required paths
  const orderHeader = new OrderHeader();
  orderHeader.customer = req.body.customerId;
  orderHeader.orderDate = req.body.orderDate;

  // default paths:  value from login information
  orderHeader.updateUser = req.user._id;
  orderHeader.createUser = req.user._id;
  const newOrderHeader = await orderHeader.save();

  res.send(newOrderHeader);
});

router.put('/:id', [auth, admin], async (req, res) => {
  const { error } = validate(_.pick(req.body, ['customerId', 'orderDate']));
  if (error) return res.status(400).send({message:error.details[0].message});

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send({message:'Invalid customer.'});

  let orderHeader = await OrderHeader.findById(req.params.id);
  if (!orderHeader)
    return res
      .status(404)
      .send({message:'The OrderHeader with the given ID was not found.'});

  // only update paths whose value is not null or undefined
  if (req.body.customerId) orderHeader.customer = req.body.customerId;
  if (req.body.orderDate) orderHeader.orderDate = req.body.orderDate;

  // default paths:  value from login information
  orderHeader.updateUser = req.user._id;
  orderHeader.updateDate = new Date();
  const newOrderHeader = await orderHeader.save();

  return res.status(200).send({
    data: newOrderHeader,
    message: `The order with the given ID  is successfully updated.`,
  });
});

// router.delete("/:id", [auth, admin], async (req, res) => {
router.delete('/:id', [auth, admin], async (req, res) => {
  const orderHeader = await OrderHeader.findByIdAndRemove(req.params.id);

  if (!orderHeader)
    return res.status(404).send('The Order with the given ID was not found.');

  res.send(orderHeader);
});

router.get('/:id', async (req, res) => {
  const orderHeader = await OrderHeader.findById(req.params.id)
    .populate('customer', 'name ')
    .populate('createUser', 'name ');

  if (!orderHeader)
    return res
      .status(404)
      .send('The OrderHeader with the given ID was not found.');

  res.send({
    _id: orderHeader._id,
    orderDate: orderHeader.orderDate,
    customerId: orderHeader.customer._id,
    customerName: orderHeader.customer.name,
    salespersonName: orderHeader.createUser.name,
    salespersonId: orderHeader.createUser._id,
    createDate: orderHeader.createDate,
  });
});

module.exports = router;
