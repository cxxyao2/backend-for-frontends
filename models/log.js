const Joi = require('joi');
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    default: '255.255.255.255',
  },
  content: {
    type: String,
    require: true,
    trim: true,
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

const Log = mongoose.model('Log', logSchema, 'logs');

function validateLog(log) {
  const schema = Joi.object({
    content: Joi.string().trim().required(),
  });

  return schema.validate(log);
}
exports.validate = validateLog;
exports.Log = Log;
