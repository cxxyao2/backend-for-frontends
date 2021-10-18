// collection name: carts
const Joi = require('joi');
const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  createDate: {
    type: Date,
    default: Date.now,
  },
  updateDate: {
    type: Date,
    default: Date.now,
  },
  createUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updateUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Waitlist = mongoose.model('Waitlist', waitlistSchema, 'waitlists');

function validateWaitlist(waitlist) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    productId: Joi.objectId().required(),
  });

  return schema.validate(waitlist);
}

exports.Waitlist = Waitlist;
exports.validate = validateWaitlist;
