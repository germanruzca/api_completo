var express = require('express');
const createError = require('http-errors');
var router = express.Router();
const {jsonResponse} = require('../lib/jsonresponse');

const auth = require('../auth/auth.middleware');


const Order = require('../model/orders.model');

router.get('/',auth.checkAuth, async (req, res, next) => {
  let results ={};
  try {
    results = await Order.find({}, 'iduser total date products');
  } catch (error) {
    next(createError(400, 'Ha ocurrdio un error'))
  }

  res.json(jsonResponse(200, {body: results}));
});

router.post('/',auth.checkAuth, async (req, res, next) => {
  const {iduser, products } = req.body;

  if(!iduser || !products) {
    next(createError(400, 'Faltan datos'));
  } else if(iduser && products && products.length > 0) {
    const order = new Order({iduser, products});

    try {
      const result = await order.save();
    } catch (error) {
      return next(createError(500, error));
    }
    res.json(jsonResponse(200, {message: 'Orden creada'}));
  }
})

module.exports = router;