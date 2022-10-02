const { ContactPlan, validate } = require('../models/contactplan');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');

const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  let contactplans = [];
  if (!req.query.salesperson) {
    contactplans = await ContactPlan.find()
      .populate('customer', 'name')
      .populate('salesperson', 'name')
      .sort('contactDate contactPeriod');
  }

  // http://localhost:5000/api/contactplans?salesperson=6146a413d52414655a6e917d&contactDate=2021-09-22
  if (req.query.salesperson && req.query.contactDate) {
    contactplans = await ContactPlan.find({
      salesperson: req.query.salesperson,
      contactDate: req.query.contactDate,
    })
      .populate('customer', 'name')
      .populate('salesperson', 'name')
      .sort('contactDate contactPeriod');
  }

  let returnArray = [];
  contactplans.forEach((plan) =>
    returnArray.push({
      _id: plan._id,
      customerId: plan.customer._id,
      customerName: plan.customer.name,
      salespersonId: plan.salesperson._id,
      salespersonName: plan.salesperson.name,
      contactDate: plan.contactDate,
      contactPeriod: plan.contactPeriod,
      createDate: plan.createDate,
    })
  );

  res.send(returnArray);
});

router.post('/', [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status().send(error.details[0].message);

  let contactplan = new ContactPlan({
    customer: req.body.customerId,
    salesperson: req.body.salespersonId,
    contactDate: req.body.contactDate,
    contactPeriod: req.body.contactPeriod,
    createUser: req.user._id,
  });
  contactplan = await contactplan.save();

  res.send(contactplan);
});

router.put('/:id', [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
    if (error) return res.status(400).send({message:error.details[0].message});
  const contactplan = await ContactPlan.findByIdAndUpdate(
    req.params.id,
    {
      customer: req.body.customerId,
      salesperson: req.body.salespersonId,
      contactDate: req.body.contactDate,
      contactPeriod: req.body.contactPeriod,
      updateUser: req.user._id,
    },
    { new: true } // true means return updated object
  );

  if (!contactplan)
    return res
      .status(404)
      .send('The contactplan with the given ID was not found.');

  res.send(contactplan);
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const contactplan = await ContactPlan.findByIdAndRemove(req.params.id);

  if (!contactplan)
    return res
      .status(404)
      .send('The ContactPlan with the given ID was not found.');

  res.send(contactplan);
});

router.get('/:id', async (req, res) => {
  const plan = await ContactPlan.findById(req.params.id)
    .populate('customer', 'name')
    .populate('salesperson', 'name')
    .sort('contactDate contactPeriod');

  if (!plan)
    return res
      .status(404)
      .send('The contactplan with the given ID was not found.');

  res.send({
    _id: plan._id,
    customerId: plan.customer._id,
    customerName: plan.customer.name,
    salespersonId: plan.salesperson._id,
    salespersonName: plan.salesperson.name,
    contactDate: plan.contactDate,
    contactPeriod: plan.contactPeriod,
    createDate: plan.createDate,
  });
});

module.exports = router;
