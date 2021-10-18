const Joi = require('joi');
const mongoose = require('mongoose');

const ContactPlan = mongoose.model(
  'ContactPlan',
  new mongoose.Schema({
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    salesperson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    contactDate: {
      type: String,
      required: true,
    },
    contactPeriod: {
      type: String,
      required: true,
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
  'contactplans'
);

function validatePlan(plan) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    salespersonId: Joi.objectId().required(),
    contactDate: Joi.string(), // "2021-09-20",
    contactPeriod: Joi.string(), //  "08:00-09:00"
  });

  return schema.validate(plan);
}

exports.ContactPlan = ContactPlan;
exports.validate = validatePlan;
