// collection name: carts
const Joi = require('joi');
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  selected: {
    type: Boolean,
    default: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    max: 9999,
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

const Cart = mongoose.model('Cart', cartSchema, 'carts');

function validateCart(cart) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    productId: Joi.objectId().required(),
    quantity: Joi.number().required().min(0).max(9999),
  });

  return schema.validate(cart);
}

exports.validate = validateCart;
exports.Cart = Cart;

// const Post = mongoose.model('Post', PostSchema, 'posts');
// const User = mongoose.model('User', UserSchema, 'users');
// module.exports = {
//   User,
//   Post,
// };
