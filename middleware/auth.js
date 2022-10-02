const config = require('config')
const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
  // 2022.Sep.28 nextJS. cannot set cookie in fetch command. Remove cookie.

  let token = req.header(config.get('tokenHeaderName'))

  if (!token) {
    return res
      .status(401)
      .send({ message: 'Access denied.No valid token provided.' }) // Unauthorized
  } else {
    try {
      const decoded = jwt.verify(token, config.get('jwtPrivateKey'))
      req.user = decoded
      console.log('user', decoded)
      next()
    } catch (error) {
      res.status(400).send({ message: 'Invalid token.' })
    }
  }
  // let token = req.header(config.get('tokenHeaderName'))
  // let cookie = req.cookies[config.get('cookieName')]

  
  // if (!token || token !== cookie) {
  //   return res
  //     .status(401)
  //     .send({ message: 'Access denied.No valid token provided.' }) // Unauthorized
  // } else {
  //   try {
  //     const decoded = jwt.verify(token, config.get('jwtPrivateKey'))
  //     req.user = decoded
  //     next()
  //   } catch (error) {
  //     res.status(400).send({ message: 'Invalid token.' })
  //   }
  // }
}
