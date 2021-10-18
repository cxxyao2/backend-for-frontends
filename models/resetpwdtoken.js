// collection name: carts
const { string } = require('joi');
const Joi = require('joi');
const mongoose = require('mongoose');

const resetPwdTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 300,
  },
  isExpired: {
    type: Boolean,
    default: false,
  },
  expireDate: {
    type: Date,
    default: Date.now,
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

const ResetPwdToken = mongoose.model(
  'ResetPwdToken',
  resetPwdTokenSchema,
  'resetpwdtokens'
);

function validateToken(token) {
  const schema = Joi.object({
    token: Joi.string().required(),
  });

  return schema.validate(token);
}

exports.validate = validateToken;
exports.ResetPwdToken = ResetPwdToken;
