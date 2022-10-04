// const winston = require('winston') // logger everything
const express = require('express')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const config = require('config')
// const logger = require('./middleware/logger')

const app = express()
app.use(express.static('public')) // make a folder public2

const whitelist = config.get('frontendUrl').split(';')
let corsOptions = {
  origin: (origin, callback) => {
    console.log('origin is ', origin)
    console.log('whitelist is', whitelist)
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}
// app.use(cors(corsOptions))
app.use(cors()) // todo development environment

app.use(express.json())
app.use(
  express.urlencoded({
    extended: true,
  })
)

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  })
)

app.use(cookieParser())
//app.use(logger)

// require('./startup/logging')()
require('./startup/routes')(app)
require('./startup/db')()
require('./startup/config')()
require('./startup/validate')()
require('./startup/prod')(app)

// $export NODE_ENV=production
if (app.get('env') === 'development') {
  app.use(morgan('tiny'))
  console.log('Morgan enabled...')
}

const port = process.env.PORT || config.get('port')
const server = app.listen(port, () =>
  // winston.info(`Listening on port ${port}...`)
  console.info(`Listening on port ${port}...`)
)
