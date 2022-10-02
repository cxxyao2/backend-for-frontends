const { Cart, validate } = require('../models/cart')
const admin = require('../middleware/admin')
const auth = require('../middleware/auth')
const express = require('express')
const router = express.Router()
const _ = require('lodash')

router.get('/', async (req, res) => {
  let carts = []
  let returnArray = []
  if (!req.query.createUser) {
    carts = await Cart.find()
      .populate('customer', ' name ')
      .populate('product', ' name category imageUrl isOnsale price stock ')
      .populate('createUser', ' name ')
      .sort('createDate')
  }

  // Filter by [customer + createUser]
  if (req.query.createUser && req.query.customer) {
    let createUser = req.query.createUser
    let customer = req.query.customer
    carts = await Cart.find({ createUser: createUser, customer: customer })
      .populate('customer', '  name ')
      .populate('product', ' name category imageUrl isOnsale price stock ')
      .populate('createUser', ' name ')
      .sort('createDate')
  }

  if (!carts) return res.status(200).send([])

  carts.forEach((cart) => {
    returnArray.push({
      _id: cart._id,
      selected: cart.selected,
      productId: cart.product._id,
      productName: cart.product.name,
      productCategory: cart.product.category,
      customerId: cart.customer._id,
      customerName: cart.customer.name,
      createDate: cart.createDate,
      price: cart.product.price,
      stock: cart.product.stock,
      quantity: cart.quantity,
      imageUrl: cart.product.imageUrl,
      salespersonId: cart.createUser._id,
      salespersonName: cart.createUser.name,
    })
  })
  res.send(returnArray)
})

router.post('/', [auth, admin], async (req, res) => {
  const { error } = validate(
    _.pick(req.body, ['customerId', 'productId', 'quantity'])
  )

  if (error) return res.status(400).send({ message: error.details[0].message })

  let cart = new Cart({
    customer: req.body.customerId,
    product: req.body.productId,
    quantity: req.body.quantity,
  })

  if (req.body.selected) cart.selected = req.body.selected

  // default paths:  value from login information
  cart.updateUser = req.user._id
  cart.createUser = req.user._id
  const newCart = await cart.save()

  res.send(newCart)
})

router.put('/:id', [auth, admin], async (req, res) => {
  const cart = await Cart.findById(req.params.id)
  if (!cart)
    return res.status(404).send('The cart with the given ID was not found.')

  // only update paths whose value is not null or undefined
  if (req.body.customerId) cart.customer = req.body.customerId
  if (req.body.productId) cart.product = req.body.productId
  if (req.body.quantity) cart.quantity = req.body.quantity
  if (req.body.selected !== undefined) cart.selected = req.body.selected

  // default paths:  value from login information
  cart.updateUser = req.user._id
  cart.updateDate = new Date()

  cart.save(function (err, obj) {
    if (err) return res.send(err)

    return res.status(200).send({
      message: 'The cart  with the given ID  is successfully updated!',
      data: obj,
    })
  })

  // const cart = await Cart.findByIdAndUpdate(
  //   ,
  //   {
  //     customer: req.body.customerId,
  //     product: req.body.productId,
  //     quantity: req.body.quantity,
  //     updateUser: req.user._id,
  //     updateDate: new Date(),
  //   },
  //   { new: true } // true means return updated object
  // );
})

// http://xxx.xxx.xxx.xxx/api/carts?id=xxxx
// http://xxx.xxx.xxx.xxx/api/carts?customer=aaaa&createUser=bbbb

router.delete('/', [auth, admin], async (req, res) => {
  if (req.query.id) {
    const cart = await Cart.findByIdAndRemove(req.query.id)
    if (!cart)
      return res.status(404).send('The cart with the given ID was not found.')

    return res.send({
      data: null,
      message: `1 record has been deleted successfully.`,
    })
  }

  if (req.query.customer && req.query.createUser) {
    const result = await Cart.deleteMany({
      customer: req.query.customer,
      createUser: req.query.createUser,
    })

    res.send({
      data: null,
      message: `${result.deletedCount} records have been deleted successfully.`,
    })
  }
})

router.get('/:id', async (req, res) => {
  const cart = await Cart.findById(req.params.id)
    .populate('customer', '  name ')
    .populate('product', ' name category imageUrl isOnsale price stock ')
    .populate('createUser', ' name ')
    .sort('createDate')

  if (!cart)
    return res.status(404).send('The cart with the given ID was not found.')

  res.send({
    _id: cart._id,
    selected: cart.selected,
    productId: cart.product._id,
    productName: cart.product.name,
    productCategory: cart.product.category,
    customerId: cart.customer._id,
    customerName: cart.customer.name,
    createDate: cart.createDate,
    price: cart.product.price,
    stock: cart.product.stock,
    quantity: cart.quantity,
    imageUrl: cart.product.imageUrl,
    salespersonId: cart.createUser._id,
    salespersonName: cart.createUser.name,
  })
})

module.exports = router
