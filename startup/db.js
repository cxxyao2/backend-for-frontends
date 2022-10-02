// const winston = require('winston');
const mongoose = require('mongoose')
const config = require('config')

module.exports = function () {
  const db = config.get('db')

  mongoose.connect(
    db,
    {
      useNewUrlParser: true,

      useUnifiedTopology: true,
    },
    (err) => {
      if (err) throw err
      console.log('Connected to MongoDB!!!')
    }
  )

  // mongoose
  //   .connect(db, {
  //     useFindAndModify: false,
  //     useCreateIndex: true,
  //   })
  //   .then(() =>
  //     // winston.info(`Connected to ${db}...`));
  //     console.info('connect to db')
  //   )
}
