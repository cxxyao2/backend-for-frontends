const Joi = require('joi');
const config = require('config');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { User } = require('../models/user');
const { ResetPwdToken } = require('../models/resetpwdtoken');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { newResetPassword, sendOrderDetailEmail } = require('../email.js');
const auth = require('../middleware/auth');

// login
router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error)
    return res
      .status(400)
      .send({ status: false, message: error.details[0].message, data: null });

  let user = await User.findOne({
    $or: [{ email: req.body.email }, { name: req.body.email }],
  });

  if (!user)
    return res.status(400).send({
      status: false,
      message: 'Invalid email or password',
      data: null,
    });

  const lockedMessage =
    'You exceeded max retry count.Please send a reset password email.';
  if (user.isFrozen) return res.status(400).send(lockedMessage);

  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword) {
    let { failedCount } = user;
    failedCount += 1;

    let maxTryCount = config.get('pwdTryMax');
    if (isNaN(maxTryCount)) {
      maxTryCount = 3;
    }
    if (failedCount > maxTryCount) {
      user.isFrozen = true;
    } else {
      user.failedCount = failedCount;
    }
    await user.save();
    if (!user.isFrozen) {
      return res.status(400).send('Invalid email or password.');
    } else {
      return res.status(400).send(lockedMessage);
    }
  }

  const token = user.generateAuthToken();
  // secure : only works for https . not of http, production environment
  res.cookie(config.get('cookieName'), token, {
    sameSite: 'none',
    secure: true,
  });
  // for Angular localhost, development environment
  // res.cookie(config.get('cookieName'), token);
  res.send({
    data: _.pick(user, [
      '_id',
      'name',
      'email',
      'isAdmin',
      'isManager',
      'isSalesperson',
      'isFrozen',
      'failedCount',
    ]),
    message: 'You have successfully logged in.',
    token: token,
  });
});

// update password
router.put('/', [auth], async (req, res) => {
  const { error } = validateUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ _id: req.user._id });
  if (!user) return res.status(400).send('Invalid user.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid old password.');

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.newPassword, salt);
  await user.save();

  res.send({ message: 'You have successfully updated your password.' });
});

// send place order email
router.post('/send-place-order-email', async (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const amount = req.body.amount;
  const tax = req.body.tax;
  const total = req.body.total;
  if (email !== undefined && email.trim().length > 0) {
    await sendOrderDetailEmail(email, name, amount, tax, total);
    return res.status(200).send({
      message: 'A place order notification email has been sent to customer.',
    });
  } else {
    return res.status(400).send({
      message: 'Customer email address is null.',
    });
  }
});

// send reset password Email
router.post('/send-reset-email', async (req, res) => {
  const email = req.body.email;
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Invalid email.');

  const token = jwt.sign({ email: email }, config.get('jwtPrivateKey'));

  //  http://xxx.xxx.xxx.xxx:300/xxx?token=xxxx TODO  config.get("frontendUrl")
  //  let url = `http://localhost:3000/reset-password?token=${token}`;
  // local frontendUrl: http://localhost:3000

  let url = `${config.get('frontendUrl')}/reset-password?token=${token}`;
  try {
    const tokenRecord = new ResetPwdToken();
    tokenRecord.token = token;

    let expiredMinutes = parseFloat(config.get('tokenExpiredMinute'));

    if (isNaN(expiredMinutes)) {
      expiredMinutes = 60; // minimum 60 minutes
    }
    const currentDate = new Date();
    const milliseconds =
      currentDate.getMilliseconds() + expiredMinutes * 60 * 1000;
    tokenRecord.expireDate = new Date(milliseconds);
    await tokenRecord.save();
    await newResetPassword(user.name, url, email);
    return res
      .status(200)
      .send({ message: 'A password reset email has been sent to your email.' });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

// reset password by token. ResetPwdToken
// http://xx.xxx.xx.xxx：5000/api/auth/reset-password?token=xxxxx
router.post('/reset-password', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send('Invalid token.');
  let tokenRecord = await ResetPwdToken.findOne({ token: token });
  if (!tokenRecord) return res.status(400).send('Invalid Token.');

  let now = new Date();
  if (now > tokenRecord.expireDate || tokenRecord.isExpired === 1)
    return res.status(400).send('Token expired.');

  var decoded = jwt.verify(token, config.get('jwtPrivateKey'));

  let email = decoded.email;
  let user = await User.findOne({ email: email });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.newPassword, salt);
  user.isFrozen = false;
  user.failedCount = 0;
  await user.save();

  tokenRecord.isExpired = true;
  await tokenRecord.save();

  res.status(200).send({ message: 'Password is reset successfully.' });
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(3).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(req);
}

function validateUpdate(req) {
  const schema = Joi.object({
    password: Joi.string().min(5).max(255).required(),
    newPassword: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(req);
}

module.exports = router;
