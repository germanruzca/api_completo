var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({
    status: 200,
    message : 'Welcome to the API from Germán Ruiz USERS'
  });
});

module.exports = router;
