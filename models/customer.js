const Joi = require('joi');
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  phone: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  address: {
    type: String,
    minlength: 5,
    maxlength: 200,
  },
  email: {
    type: String,
    minlength: 5,
    maxlength: 200,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  latitude: {
    type: Number,
    default: -45.01,
  },
  longitude: {
    type: Number,
    default: -73.01,
  },
  isAuthorized: {
    type: Boolean,
    default: false,
  },
  credit: {
    type: String,
    enum: ['$1k', '$10k', '$100k'],
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
const Customer = mongoose.model('Customer', customerSchema, 'customers');

function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    phone: Joi.string().min(5).max(50).required(),
    address: Joi.string().min(5).max(200).required(),
    email: Joi.string().min(5).max(200).required(),
  });

  return schema.validate(customer);
}

exports.customerSchema = customerSchema;
exports.Customer = Customer;
exports.validate = validateCustomer;
