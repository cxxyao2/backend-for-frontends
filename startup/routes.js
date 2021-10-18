const auth = require('../routes/auth');
const carts = require('../routes/carts');
const contactplans = require('../routes/contactplans');
const contactrecords = require('../routes/contactrecords');
const customers = require('../routes/customers');
const files = require('../routes/files');
// TODO: itineraries exact data from multiple tables
const logs = require('../routes/logs');
const orders = require('../routes/orders');
const orderheaders = require('../routes/orderheaders');
const products = require('../routes/products');
const users = require('../routes/users');
const waitlists = require('../routes/waitlists');
const reports = require('../routes/reports');
const error = require('../middleware/error');

module.exports = function (app) {
  app.use('/api/auth', auth);
  app.use('/api/carts', carts);
  app.use('/api/contactplans', contactplans);
  app.use('/api/contactrecords', contactrecords);
  app.use('/api/customers', customers);
  app.use('/api/files', files);
  app.use('/api/logs', logs);
  app.use('/api/orders', orders);
  app.use('/api/orderheaders', orderheaders);
  app.use('/api/products', products);
  app.use('/api/users', users);
  app.use('/api/waitlists', waitlists);
  app.use('/api/reports', reports);
  app.use(error);
};
