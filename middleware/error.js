//const winston = require('winston')

module.exports = function (err, req, res, next) {
  // winston.error(err.message, err)
  console.error(err.message, err)
  res.status(500).send({ message: err.message.substr(0, 100) })
}
