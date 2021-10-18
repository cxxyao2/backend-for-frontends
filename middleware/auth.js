const config = require('config');
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  let token = req.header(config.get('tokenHeaderName'));
  let cookie = req.cookies[config.get('cookieName')];

  if (!token || token !== cookie) {
    return res.status(401).send('Access denied.No valid token provided.'); // Unauthorized
  } else {
    try {
      const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
      req.user = decoded;
      next();
    } catch (error) {
      res.status(400).send('Invalid token.');
    }
  }
};
