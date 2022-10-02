const { Log, validate } = require('../models/log');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');

const express = require('express');

const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  let logs;
  let returnLogs = [];

  if (!req.query.startDate && !req.query.endDate) {
    logs = await Log.find().populate('createUser', 'name').sort('_id');
  } else {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    let userId = null;
    let content = null;
    if (
      req.query.userId !== null &&
      req.query.userId !== undefined &&
      req.query.userId.length > 0
    ) {
      userId = req.query.userId;
    }
    content = req.query.content || '';

    if (userId && startDate && endDate) {
      logs = await Log.find({
        createUser: userId,
        content: { $regex: content, $options: '$i' },
        createDate: { $gte: startDate, $lt: endDate },
      }).populate('createUser', 'name');
    } else if (startDate && endDate) {
      logs = await Log.find({
        createDate: { $gte: startDate, $lt: endDate },
      }).populate('createUser', 'name');
    }
  }

  if (!logs) return res.status(404).send('No log meets the filter conditions');

  logs.forEach((log) => {
    returnLogs.push({
      _id: log.id,
      createUser: log.createUser._id,
      userName: log.createUser.name,
      createDate: log.createDate,
      ip: log.ip,
      content: log.content,
    });
  });
  return res.send(returnLogs);
});

router.post('/', [auth], async (req, res) => {
  const { error } = validate(_.pick(req.body, ['content']));
  if (error) return res.status(400).send({message:error.details[0].message});

  const ip = req.connection.remoteAddress || req.headers['x-forwarded-for'];
  const log = new Log({
    ip,
    content: req.body.content,
    createUser: req.user._id,
  });
  await log.save();
  res.send(log);
});

router.put('/:id', [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send({message:error.details[0].message});

  let log = await Log.findById(req.params.id);
  if (!log)
    return res.status(404).send('The Log with the given ID was not found.');

  log = await Log.updateOne(
    { _id: req.params.id },
    {
      $set: {
        content: req.body.content,
        updateUser: req.user._id,
      },
    }
  );

  res.send(log);
});

// router.delete("/:id", [auth, admin], async (req, res) => {
router.delete('/:id', [auth, admin], async (req, res) => {
  const log = await Log.findByIdAndRemove(req.params.id);

  if (!log)
    return res.status(404).send('The Log with the given ID was not found.');

  res.send(log);
});

router.get('/:id', async (req, res) => {
  const log = await Log.populate('createUser', 'name').findById(req.params.id);

  if (!log)
    return res.status(404).send('The Log with the given ID was not found.');

  let returnLog;
  returnLog.push({
    _id: log.id,
    createUser: log.createUser._id,
    userName: log.createUser.name,
    createDate: log.createDate,
    ip: log.ip,
    content: log.content,
  });

  return res.send(returnLog);
});

module.exports = router;
