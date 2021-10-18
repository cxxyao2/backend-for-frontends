// collection: orderheaders
// customerId in customers collection
// productId in product collection
// collection (table) . document( record)
const Joi = require('joi');
const mongoose = require('mongoose');

const orderheaderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  orderDate: {
    type: String,
    required: true,
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

const OrderHeader = mongoose.model(
  'OrderHeader',
  orderheaderSchema,
  'orderheaders'
);

function validateOrderHeader(orderHeader) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    orderDate: Joi.string().required(), // 2002-09-21
  });

  return schema.validate(orderHeader);
}

exports.validate = validateOrderHeader;
exports.OrderHeader = OrderHeader;
