const { Waitlist, validate } = require('../models/waitlist')
const admin = require('../middleware/admin')
const auth = require('../middleware/auth')

const express = require('express')
const router = express.Router()
const _ = require('lodash')

router.get('/', async (req, res) => {
  let waitlists = []
  if (!req.query.customer) {
    waitlists = await Waitlist.find()
      .populate('customer', 'name')
      .populate('product', 'name category')
      .sort('createDate')
  }
  if (req.query.customer) {
    waitlists = await Waitlist.find({
      customer: req.query.customer,
    })
      .populate('customer', 'name')
      .populate('product', 'name category')
      .sort('createDate')
  }
  let returnArray = []
  waitlists.forEach((wait) => {
    returnArray.push({
      _id: wait._id,
      customerId: wait.customer._id,
      customerName: wait.customer.name,
      productId: wait.product._id,
      productName: wait.product.name,
      createDate: wait.createDate,
    })
  })
  res.send(returnArray)
})

router.post('/', [auth, admin], async (req, res) => {
  const { error } = validate(req.body)
  if (error) return res.status(400).send({ message: error.details[0].message })

  let waitlist = new Waitlist({
    customer: req.body.customerId,
    product: req.body.productId,
    createUser: req.user._id,
  })
  cart = await waitlist.save()
  res.send(waitlist)
})

router.put('/:id', [auth, admin], async (req, res) => {
  const { error } = validate(req.body)
  if (error) return res.status(400).send({ message: error.details[0].message })
  const waitlist = await Waitlist.findByIdAndUpdate(
    req.params.id,
    {
      customer: req.body.customerId,
      product: req.body.productId,
      updateUser: req.user._id,
    },
    { new: true } // true means return updated object
  )

  if (!waitlist)
    return res.status(404).send('The waitlist with the given ID was not found.')

  res.send(waitlist)
})

router.delete('/:id', [auth, admin], async (req, res) => {
  const waitlist = await Waitlist.findByIdAndRemove(req.params.id)

  if (!waitlist)
    return res.status(404).send('The waitlist with the given ID was not found.')

  res.send(waitlist)
})

router.get('/:id', async (req, res) => {
  const wait = await Waitlist.findById(req.params.id)
    .populate('customer', 'name')
    .populate('product', 'name category')

  if (!wait)
    return res.status(404).send('The waitlist with the given ID was not found.')

  res.send({
    _id: wait._id,
    customerId: wait.customer._id,
    customerName: wait.customer.name,
    productId: wait.product._id,
    productName: wait.product.name,
    createDate: wait.createDate,
  })
})

module.exports = router
