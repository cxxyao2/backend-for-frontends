const { Order, validate } = require('../models/order')
const admin = require('../middleware/admin')
const auth = require('../middleware/auth')

const express = require('express')
const { Customer } = require('../models/customer')
const { Product } = require('../models/product')
const router = express.Router()
const _ = require('lodash')

// http(s)://xxx.xxx.xxx.xxx:xxxx/api/orders?startdate=2022-09-12&enddate=2022-09-13&createuser=2322332323
// https://....orders?orderHeader=xxxxx
router.get('/', async (req, res) => {
  let orders = []
  let returnArray = []
  let startdate
  let enddate
  let createuser

  // case 0, no query
  if (
    !req.query.startdate &&
    !req.query.enddate &&
    !req.query.createuser &&
    !req.query.orderHeader
  ) {
    orders = await Order.find()
      .populate('customer', 'name ')
      .populate('product', 'name category ')
      .populate('createUser', 'name ')
      .sort(' createDate orderHeader  ')
  }

  // case 1, orderHeader
  if (req.query.orderHeader) {
    let header = req.query.orderHeader

    orders = await Order.find({ orderHeader: header })
      .populate('customer', 'name ')
      .populate('product', 'name category ')
      .populate('createUser', 'name ')
      .sort(' createDate orderHeader  ')
  }

  // case 2, startdate
  if (req.query.startdate && !req.query.enddate && !req.query.createuser) {
    startdate = req.query.startdate

    orders = await Order.find({ orderDate: { $gte: startdate } })
      .populate('customer', 'name ')
      .populate('product', 'name category ')
      .populate('createUser', 'name ')
      .sort(' createDate orderHeader  ')
  }

  // case 3, enddate
  if (req.query.enddate && !req.query.startdate && !req.query.createuser) {
    enddate = req.query.enddate
    orders = await Order.find({ orderDate: { $lte: enddate } })
      .populate('customer', 'name ')
      .populate('product', 'name category ')
      .populate('createUser', 'name ')
      .sort(' createDate orderHeader  ')
  }

  // case 4, startdate,enddate
  if (req.query.enddate && req.query.startdate && !req.query.createuser) {
    enddate = req.query.enddate
    startdate = req.query.startdate

    orders = await Order.find({
      orderDate: { $gte: startdate, $lte: enddate },
    })
      .populate('customer', 'name ')
      .populate('product', 'name category ')
      .populate('createUser', 'name ')
      .sort(' createDate orderHeader  ')
  }
  // case 5, startdate,enddate,createuser
  if (req.query.enddate && req.query.startdate && req.query.createuser) {
    enddate = req.query.enddate
    startdate = req.query.startdate
    createuser = req.query.createuser
    orders = await Order.find({
      orderDate: { $gte: startdate, $lte: enddate },
      createUser: createuser,
    })
      .populate('customer', 'name ')
      .populate('product', 'name category ')
      .populate('createUser', 'name ')
      .sort(' createDate orderHeader  ')
  }

  orders.forEach((order) => {
    returnArray.push({
      orderHeader: order.orderHeader,
      orderDate: order.orderDate,
      productId: order.product._id,
      productName: order.product.name,
      productCategory: order.product.category,
      quantity: order.quantity,
      price: order.price,
      amount: order.amount,
      customerId: order.customer._id,
      _id: order._id,
      customerName: order.customer.name,
      salespersonId: order.createUser._id,
      salespersonName: order.createUser.name,
      isPaid: order.isPaid,
      createDate: order.createDate,
    })
  })
  res.send(returnArray)
})

router.post('/', [auth, admin], async (req, res) => {
  const { error } = validate(
    _.pick(req.body, [
      'orderHeader',
      'orderDate',
      'customerId',
      'productId',
      'quantity',
      'price',
      'amount',
    ])
  )
  if (error) return res.status(400).send({ message: error.details[0].message })

  const customer = await Customer.findById(req.body.customerId)
  if (!customer) return res.status(400).send({ message: 'Invalid customer.' })

  const product = await Product.findById(req.body.productId)
  if (!product) return res.status(400).send({ message: 'Invalid product.' })

  // required paths
  const order = new Order()
  order.orderHeader = req.body.orderHeader
  order.orderDate = req.body.orderDate
  order.customer = req.body.customerId
  order.product = req.body.productId
  order.quantity = req.body.quantity
  order.price = req.body.price
  order.amount = req.body.amount

  // optional paths
  if (req.body.isPaid !== undefined) order.isPaid = req.body.isPaid
  if (req.body.orderDate) order.orderDate = req.body.orderDate

  // default paths:  value from login information
  order.updateUser = req.user._id
  order.createUser = req.user._id
  const newOrder = await order.save()

  res.send(newOrder)
})

router.put('/:id', [auth, admin], async (req, res) => {
  const customer = await Customer.findById(req.body.customerId)
  if (!customer) return res.status(400).send({ message: 'Invalid customer.' })

  const product = await Product.findById(req.body.productId)
  if (!product) return res.status(400).send({ message: 'Invalid product.' })

  let order = await Order.findById(req.params.id)
  if (!order)
    return res
      .status(404)
      .send({ message: 'The Order with the given ID was not found.' })

  // only update paths whose value is not null or undefined
  if (req.body.orderDate) order.orderDate = req.body.orderDate
  if (req.body.customerId) order.customer = req.body.customerId
  if (req.body.productId) order.product = req.body.productId
  if (req.body.quantity) order.quantity = req.body.quantity

  if (req.body.price) order.price = req.body.price
  if (req.body.amount) order.amount = req.body.amount
  if (req.body.isPaid !== undefined) order.isPaid = req.body.isPaid
  if (req.body.orderDate) order.orderDate = req.body.orderDate

  // default paths:  value from login information
  order.updateUser = req.user._id
  order.updateDate = new Date()
  const newOrder = await order.save()

  return res.status(200).send({
    data: newOrder,
    message: `The order with the given ID  is successfully updated.`,
  })
})

router.delete('/:id', [auth, admin], async (req, res) => {
  const order = await Order.findByIdAndRemove(req.params.id)

  if (!order)
    return res.status(404).send('The Order with the given ID was not found.')

  res.send(order)
})

router.get('/:id', async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name ')
    .populate('product', 'name category ')
    .populate('createUser', 'name ')

  if (!order)
    return res.status(404).send('The Order with the given ID was not found.')

  res.send({
    orderHeader: order.OrderHeader,
    orderDate: order.orderDate,
    productId: order.product._id,
    productName: order.product.name,
    productCategory: order.product.category,
    quantity: order.quantity,
    price: order.price,
    amount: order.amount,
    customerId: order.customer._id,
    _id: order._id,
    customerName: order.customer.name,
    salespersonId: order.createUser._id,
    salespersonName: order.createUser.name,
    isPaid: order.isPaid,
    createDate: order.createDate,
  })
})

module.exports = router
