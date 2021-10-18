const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const bcrypt = require('bcrypt');
const { User, validate } = require('../models/user');
const express = require('express');
const config = require('config');
const router = express.Router();
const _ = require('lodash');

router.get('/:id', auth, async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  res.send(user);
});

router.get('/', async (req, res) => {
  let users;
  if (!req.query.email) {
    users = await User.find().select('-password');
    return res.send(users);
  }

  //http://localhost:5000/api/users/?email=Jane2@hotmail.com
  const email = req.query.email;
  users = await User.find({
    email: email,
  });
  return res.send(users);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({
    $or: [{ email: req.body.email }, { name: req.body.name }],
  });
  if (user) return res.status(400).send('User has already registered.');
  user = new User(_.pick(req.body, ['name', 'email', 'password']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  const newUser = await user.save();

  const token = user.generateAuthToken();
  // FOR ANGULAR .
  res.cookie(config.get('cookieName'), token);
  res.send({
    data: _.pick(newUser, [
      '_id',
      'name',
      'email',
      'isAdmin',
      'isManager',
      'isSalesperson',
      'isFrozen',
      'failedCount',
    ]),
    message: `User  ${newUser.name} has been added successfully.`,
  });
});

// FOR REACT
//   res
//     .header("x-auth-token", token)
//     .header("access-control-expose-headers", "x-auth-token")
//     .send(_.pick(user, ["_id", "name", "email"]));
// });

router.put('/:id', [auth, admin], async (req, res) => {
  let user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).send('The User with the given ID was not found.');

  // only update paths that have chagned
  if (req.body.isAdmin !== undefined) user.isAdmin = req.body.isAdmin;
  if (req.body.isManager !== undefined) user.isManager = req.body.isManager;
  if (req.body.isSalesperson !== undefined)
    user.isSalesperson = req.body.isSalesperson;
  if (req.body.isFrozen !== undefined) user.isFrozen = req.body.isFrozen;

  // default paths:  value from login information
  user.updateUser = req.user._id;
  user.updateDate = new Date();
  const newUser = await user.save();

  return res.status(200).send({
    data: _.pick(newUser, [
      '_id',
      'name',
      'email',
      'isAdmin',
      'isManager',
      'isSalesperson',
      'isFrozen',
      'failedCount',
    ]),
    message: `The user with the given ID  is successfully updated.`,
  });
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id);

  if (!user)
    return res.status(404).send('The user with the given ID was not found.');

  return res.status(200).send({
    message: `The user <<${user.name}>> with the given ID  is successfully deleted.`,
  });
});

module.exports = router;
