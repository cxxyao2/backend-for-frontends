const { ContactRecord, validate } = require('../models/contactrecord');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');

const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  let contactRecords = [];
  if (!req.query.salesperson) {
    contactRecords = await ContactRecord.find()
      .populate('customer', 'name')
      .populate('createUser', 'name')
      .sort('contactDate  contactPeriod');
  }
  // query: salesperson +  contactDate
  if (req.query.salesperson && req.query.contactDate) {
    contactRecords = await ContactRecord.find({
      createUser: req.query.salesperson,
      contactDate: req.query.contactDate,
    })
      .populate('customer', 'name')
      .populate('createUser', 'name')
      .sort('contactDate  contactPeriod');
  }

  let returnArray = [];
  contactRecords.forEach((record) => {
    returnArray.push({
      _id: record._id,
      customerId: record.customer._id,
      customerName: record.customer.name,
      salespersonId: record.createUser._id,
      salespersonName: record.createUser.name,
      contactDate: record.contactDate,
      contactPeriod: record.contactPeriod,
      actualContactDT: record.actualContactDT,
      latitude: record.latitude,
      longitude: record.longitude,
      notes: record.notes,
      createDate: record.createDate,
      isVisited: record.isVisited,
    });
  });
  res.send(returnArray);
});

router.post('/', [auth, admin], async (req, res) => {
  const { error } = validate(
    _.pick(req.body, ['customerId', 'contactDate', 'contactPeriod'])
  );
  if (error) return res.status(400).send({message:error.details[0].message});

  let contactRecord = new ContactRecord({
    customer: req.body.customerId,
    contactDate: req.body.contactDate,
    contactPeriod: req.body.contactPeriod,
  });

  if (req.body.actualContactDT)
    contactRecord.actualContactDT = req.body.actualContactDT;
  if (req.body.photoName) contactRecord.photoName = req.body.photoName;
  if (req.body.latitude) contactRecord.latitude = req.body.latitude;
  if (req.body.longitude) contactRecord.longitude = req.body.longitude;
  if (req.body.notes) contactRecord.notes = req.body.notes;

  contactRecord.createUser = req.user._id;
  contactRecord.updateUser = req.user._id;
  const newContactRecord = await contactRecord.save();
  res.send(newContactRecord);
});

router.put('/:id', [auth, admin], async (req, res) => {
  const contactRecord = await ContactRecord.findById(req.params.id);
  if (!contactRecord)
    return res
      .status(404)
      .send('The ContactRecord with the given ID was not found.');

  contactRecord.actualContactDT = req.body.actualContactDT;
  contactRecord.isVisited = true;

  if (req.body.photoName) contactRecord.photoName = req.body.photoName;
  if (req.body.latitude) contactRecord.latitude = req.body.latitude;
  if (req.body.longitude) contactRecord.longitude = req.body.longitude;
  if (req.body.notes) contactRecord.notes = req.body.notes;

  contactRecord.updateDate = new Date();
  contactRecord.updateUser = req.user._id;
  const newContactRecord = await contactRecord.save();

  return res.status(200).send({
    data: newContactRecord,
    message: `The contactrecord  with the given ID  is successfully updated.`,
  });
});

// delete
// scenario 1: http://xxx.xxx.xxx.xxx/api/contactrecords?id=xxxx
// scenario 2: http://xxx.xxx.xxx.xxx/api/contactrecords?contactDate=2021-06-22&createUser=bbbbxxxx

router.delete('/', [auth, admin], async (req, res) => {
  if (req.query.id) {
    const record = await ContactRecord.findByIdAndRemove(req.query.id);
    if (!record)
      return res.status(404).send('The cart with the given ID was not found.');

    return res.send({
      data: null,
      message: `1 record has been deleted successfully.`,
    });
  }

  if (req.query.contactDate && req.query.createUser) {
    const result = await ContactRecord.deleteMany({
      contactDate: req.query.contactDate,
      createUser: req.query.createUser,
    });

    res.send({
      data: null,
      message: `${result.deletedCount} records have been deleted successfully.`,
    });
  }
});

router.get('/:id', async (req, res) => {
  const record = await ContactRecord.findById(req.params.id)
    .populate('customer', 'name')
    .populate('createUser', 'name')
    .sort('contactDate  contactPeriod');

  if (!record)
    return res
      .status(404)
      .send('The ContactRecord with the given ID was not found.');

  res.send({
    _id: record._id,
    customerId: record.customer._id,
    customerName: record.customer.name,
    salespersonId: record.createUser._id,
    salespersonName: record.createUser.name,
    contactDate: record.contactDate,
    contactPeriod: record.contactPeriod,
    actualContactDT: record.actualContactDT,
    latitude: record.latitude,
    longitude: record.longitude,
    notes: record.notes,
    createDate: record.createDate,
    isVisited: record.isVisited,
  });
});

module.exports = router;
