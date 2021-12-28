var express = require('express');
const createError = require('http-errors');
var router = express.Router();
const {jsonResponse} = require('../lib/jsonresponse');

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
  const { username, password } = req.body;

  if (!username || !password) {
    next(createError(400, 'Missing username or password'));
  } else  if(username && password) {
    const user = new User({ username, password });

    const exists = await user.usernameExists(username);
    if (exists) {
      next(createError(400, 'Username already exists'));
    } else {
      await user.save();

      res.json(jsonResponse(200, 
        {
          message: 'User created successfully',
        }
      ));
    }
  }
});

module.exports = router;
