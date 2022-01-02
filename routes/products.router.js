var express = require('express');
const createError = require('http-errors');
var router = express.Router();
const {jsonResponse} = require('../lib/jsonresponse');

const Product = require('../model/products.model');

router.get('/', async (req, res, next) => {
  let results = {};
  
  try {
    results = await Product.find({}, 'title price');
  } catch (error) {
    next(createError(500, 'Error fetching products'));
  }
  console.log(results)

  res.json(jsonResponse(200, {results: results}));
});

router.post('/', async (req, res, next) => {
  const { title, price } = req.body;

  if(!title || !price) {
    next(createError(400, 'Missing title or price'));
  } else if(title && price) {
    
    try {
      const product = new Product({ title, price });
      await product.save();
    } catch (error) {
      next(createError(500, 'Error saving product'));
    }

    res.json(jsonResponse(200, {
      message: 'Product created successfully',
    }));
  }
});

router.get('/:idproduct', async (req, res, next) => {
  let results = {};

  const { idproduct } = req.params;

  if(!idproduct) next(createError(400, 'Missing idproduct'));

  try {
    results = await Product.findById(idproduct, 'title price');
  } catch (error) {
    next(createError(500, 'Error fetching product'));
  }

  res.json(jsonResponse(200, {results}));
});

router.patch('/:idproduct', async (req, res, next) => {
  let update = {};

  const  {idproduct} = req.params;
  const { title, price } = req.body;

  if(!idproduct) next(createError(400, 'Missing idproduct'));

  if(!title && !price) next(createError(400, 'Missing title or price'));

  if(title) update['title'] = title;
  if(price) update['price'] = price;

  try {
    await Product.findByIdAndUpdate(idproduct, update);
  } catch (error) {
    next(createError(500, 'Error updating product'));
  }

  res.json(jsonResponse(200, {message: `Product ${idproduct} updated successfully`}));
});

router.delete('/:idproduct', async (req, res, next) => {

  const { idproduct } = req.params;

  if(!idproduct) next(createError(400, 'Missing idproduct'));

  try {
    await Product.findByIdAndDelete(idproduct);
  } catch (error) {
    next(createError(500, 'Error deleting product'));
  }

  res.json(jsonResponse(200, {message: `Product ${idproduct} deleted successfully`}));
  
});

module.exports = router;