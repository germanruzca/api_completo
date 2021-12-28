var express = require('express');
var router = express.Router();
const User = require('../model/users.model');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let results = [];
  try {
    results = await User.find({}, 'username password');
  } catch (error) {
    
  }

  res.json(results);
});


/** POST a new user */
router.post('/', async function(req, res, next) {

});

module.exports = router;
