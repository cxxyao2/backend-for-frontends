const Joi = require('joi');
const mongoose = require('mongoose');

const Product = mongoose.model(
  'Product',
  new mongoose.Schema({
    name: String,
    description: String,
    category: {
      type: String,
      enum: ['gas', 'diesel', 'lubricant'],
      default: 'gas',
    },
    imageUrl: {
      type: String,
      default: 'products/e1',
    },
    isOnsale: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 1,
      min: 0,
    },
    stock: {
      type: Number,
      default: 99999,
      min: 0,
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
  }),
  'products'
);

function validateProduct(product) {
  const schema = Joi.object({
    name: Joi.string().required(),
  });

  return schema.validate(product);
}

exports.validate = validateProduct;
exports.Product = Product;
