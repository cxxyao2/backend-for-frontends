const express = require('express');
const router = express.Router();

const { Order } = require('../models/order');
const { User } = require('../models/user');
const { Customer } = require('../models/customer');
const { Product } = require('../models/product');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');

// xxxx.xxxx.xxxx.xxx:xxx/reports/monthly-product?year=2021&month=9
router.get('/monthly-product', [auth], async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  const startDate = new Date(year, month, 1, 0, 0, 0);
  let yearOfEndDate;
  let monthOfEndDate;
  let endDate;

  if (month === 11) {
    // december
    yearOfEndDate = year + 1;
    monthOfEndDate = 1;
  } else {
    yearOfEndDate = year;
    monthOfEndDate = month + 1;
  }
  endDate = new Date(yearOfEndDate, monthOfEndDate, 1, 0, 0, 0);

  const data = await Order.aggregate([
    {
      $match: {
        createDate: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customers_info',
      },
    },
    {
      $unwind: {
        path: '$customers_info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'products_info',
      },
    },
    {
      $unwind: {
        path: '$products_info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'createUser',
        foreignField: '_id',
        as: 'salespersons_info',
      },
    },
    {
      $unwind: {
        path: '$salespersons_info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        customer: 1,
        product: 1,
        createUser: 1,
        amount: 1,
        'customers_info.name': 1,
        'products_info.name': 1,
        'salespersons_info.name': 1,
      },
    },
    {
      $group: {
        _id: {
          product: '$product',
          productName: '$products_info.name',
        },
        totalAmount: { $sum: '$amount' },
      },
    },
    {
      $sort: {
        totalAmount: -1,
      },
    },
  ]).limit(10);

  return res.send(data);
});

router.get('/monthly-customer', [auth], async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  const startDate = new Date(year, month, 1, 0, 0, 0);
  let yearOfEndDate;
  let monthOfEndDate;
  let endDate;
  if (month === 11) {
    // december
    yearOfEndDate = year + 1;
    monthOfEndDate = 1;
  } else {
    yearOfEndDate = year;
    monthOfEndDate = month + 1;
  }
  endDate = new Date(yearOfEndDate, monthOfEndDate, 1, 0, 0, 0);

  let data = await Order.aggregate([
    {
      $match: {
        createDate: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customers_info',
      },
    },
    {
      $unwind: {
        path: '$customers_info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'products_info',
      },
    },
    {
      $unwind: {
        path: '$products_info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'createUser',
        foreignField: '_id',
        as: 'salespersons_info',
      },
    },
    {
      $unwind: {
        path: '$salespersons_info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        customer: 1,
        product: 1,
        createUser: 1,
        amount: 1,
        'customers_info.name': 1,
        'products_info.name': 1,
        'salespersons_info.name': 1,
      },
    },
    {
      $group: {
        _id: {
          customer: '$customer',
          customerName: '$customers_info.name',
        },
        totalAmount: { $sum: '$amount' },
      },
    },
    {
      $sort: {
        totalAmount: -1,
      },
    },
  ]).limit(10);

  return res.send(data);
});

router.get('/monthly-salesperson', [auth], async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  const startDate = new Date(year, month, 1, 0, 0, 0);
  let yearOfEndDate;
  let monthOfEndDate;
  let endDate;
  if (month === 11) {
    // december
    yearOfEndDate = year + 1;
    monthOfEndDate = 1;
  } else {
    yearOfEndDate = year;
    monthOfEndDate = month + 1;
  }
  endDate = new Date(yearOfEndDate, monthOfEndDate, 1, 0, 0, 0);

  let data = await Order.aggregate([
    {
      $match: {
        createDate: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customers_info',
      },
    },
    {
      $unwind: {
        path: '$customers_info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'products_info',
      },
    },
    {
      $unwind: {
        path: '$products_info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'createUser',
        foreignField: '_id',
        as: 'salespersons_info',
      },
    },
    {
      $unwind: {
        path: '$salespersons_info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        customer: 1,
        product: 1,
        createUser: 1,
        amount: 1,
        'customers_info.name': 1,
        'products_info.name': 1,
        'salespersons_info.name': 1,
      },
    },
    {
      $group: {
        _id: {
          salesperson: '$createUser',
          salespersonName: '$salespersons_info.name',
        },
        totalAmount: { $sum: '$amount' },
      },
    },
    {
      $sort: {
        totalAmount: -1,
      },
    },
  ]).limit(10);

  return res.send(data);
});

router.get('/monthly-initdata', [auth], async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  const startDate = new Date(year, month, 1, 0, 0, 0);
  let yearOfEndDate;
  let monthOfEndDate;
  let endDate;
  if (month === 11) {
    // december
    yearOfEndDate = year + 1;
    monthOfEndDate = 1;
  } else {
    yearOfEndDate = year;
    monthOfEndDate = month + 1;
  }
  endDate = new Date(yearOfEndDate, monthOfEndDate, 1, 0, 0, 0);

  let data = await Order.aggregate([
    {
      $match: {
        createDate: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customers_info',
      },
    },
    {
      $unwind: {
        path: '$customers_info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'products_info',
      },
    },
    {
      $unwind: {
        path: '$products_info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'createUser',
        foreignField: '_id',
        as: 'salespersons_info',
      },
    },
    {
      $unwind: {
        path: '$salespersons_info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        customer: 1,
        product: 1,
        createUser: 1,
        createDate: 1,
        amount: 1,
        'customers_info.name': 1,
        'products_info.name': 1,
        'salespersons_info.name': 1,
      },
    },
  ]);
  return res.send(data);
});
module.exports = router;
