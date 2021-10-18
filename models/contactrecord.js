const Joi = require('joi');
const mongoose = require('mongoose');

const ContactRecord = mongoose.model(
  'ContactRecord',
  new mongoose.Schema({
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    contactDate: {
      type: String,
      required: true,
    },
    contactPeriod: {
      type: String,
      required: true,
    },
    actualContactDT: {
      type: Date,
      default: Date.now,
    },
    photoName: {
      type: String,
      default: '',
    },
    latitude: {
      type: Number,
      default: 45,
    },
    longitude: {
      type: Number,
      default: -73,
    },
    notes: {
      type: String,
      default: '',
    },
    isVisited: {
      type: Boolean,
      default: false,
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
  'contactrecords'
);

function validate(actualRecord) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    contactDate: Joi.string().required(),
    contactPeriod: Joi.string().required(),
  });

  return schema.validate(actualRecord);
}

exports.ContactRecord = ContactRecord;
exports.validate = validate;
