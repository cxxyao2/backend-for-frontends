// collection: orders
// customerId in customers collection
// productId in product collection
// collection (table) . document( record)
const Joi = require('joi');
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderHeader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderHeader',
  },
  orderDate: {
    type: String,
    required: true,
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
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  createDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updateDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  createUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updateUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Order = mongoose.model('Order', orderSchema, 'orders');

function validateOrder(order) {
  const schema = Joi.object({
    orderHeader: Joi.objectId().required(),
    orderDate: Joi.string().required(),
    customerId: Joi.objectId().required(),
    productId: Joi.objectId().required(),
    quantity: Joi.number().required().min(0).max(9999),
    price: Joi.number().required().min(0),
    amount: Joi.number().required().min(0),
  });

  return schema.validate(order);
}

exports.validate = validateOrder;
exports.Order = Order;
