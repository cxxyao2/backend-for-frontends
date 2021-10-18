const { Product, validate } = require('../models/product');
const express = require('express');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');

const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  let products;
  if (!req.query.productName) {
    products = await Product.find().sort('name');
  }
  if (req.query.productName) {
    products = await Product.find({
      name: new RegExp(req.query.productName, 'i'),
    }).sort('name');
  }

  res.send(products);
});

router.post('/', [auth, admin], async (req, res) => {
  const { error } = validate(_.pick(req.body, ['name']));
  if (error) return res.status(400).send(error.details[0].message);

  let product = new Product();
  // required paths
  product.name = req.body.name;

  // optional paths
  if (req.body.category) product.category = req.body.category;
  if (req.body.imageUrl) product.imageUrl = req.body.imageUrl; // e.g. products/e1
  if (req.body.isOnsale !== undefined) product.isOnsale = req.body.isOnsale;
  if (req.body.price) product.price = req.body.price;
  if (req.body.stock) product.stock = req.body.stock;
  if (req.body.description) product.description = req.body.description;

  // default paths:  value from login information
  product.updateUser = req.user._id;
  product.createUser = req.user._id;

  await product.save();
  res.send(product);
});

router.put('/:id', [auth, admin], async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product)
    return res.status(404).send('The Product with the given ID was not found.');

  // optional paths
  if (req.body.name) product.name = req.body.name;
  if (req.body.category) product.category = req.body.category;
  if (req.body.imageUrl) product.imageUrl = req.body.imageUrl; // e.g. products/e1
  if (req.body.isOnsale !== undefined) product.isOnsale = req.body.isOnsale;
  if (req.body.price) product.price = req.body.price;
  if (req.body.stock) product.stock = req.body.stock;
  if (req.body.description) product.description = req.body.description;

  // default paths:  value from login information
  product.updateUser = req.user._id;
  product.updateDate = new Date();
  const newProduct = await product.save();

  res.send(newProduct);
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const product = await Product.findByIdAndRemove(req.params.id);

  if (!product)
    return res.status(404).send('The Product with the given ID was not found.');

  res.send(product);
});

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product)
    return res.status(404).send('The Product with the given ID was not found.');

  res.send(product);
});

module.exports = router;
