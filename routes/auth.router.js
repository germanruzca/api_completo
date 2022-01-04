var express = require('express');
const createError = require('http-errors');
var router = express.Router();
const jwt = require('jsonwebtoken');
const Token = require('../model/token.model');
const {jsonResponse} = require('../lib/jsonresponse');
const {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} = process.env;

const auth = require('../auth/auth.middleware');


const User = require('../model/users.model');

router.post('/signup', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next(createError(400, 'Missing username or password'));
  } else  if(username && password) {
    const user = new User({ username, password });

    const exists = await user.usernameExists(username);
    if (exists) {
      next(createError(400, 'Username already exists'));
    } else {
      const accessToken = user.createAccessToken()
      const refreshToken = await user.createRefreshToken()
      await user.save();

      res.json(jsonResponse(200, 
        {
          message: 'User created successfully',
          accessToken,
          refreshToken
        }
      ));
    }
  }
})

router.post('/login',  async (req, res, next) => {
  const {username, password} = req.body;

    try{
        let user = new User();
        const userExists = await user.usernameExists(username);
        if(userExists){
            user = await User.findOne({username: username}); 
            console.log(user);
            const passwordCorrect = await user.isCorrectPassword(password, user.password);
            if(passwordCorrect){
                let accessToken = await user.createAccessToken();
                let refreshToken = await user.createRefreshToken();

                return res.json({
                    accessToken, refreshToken
                });
            }else{
                return next(new Error('username and/or password incorrect'));
            }
               
        }else{
            return next(new Error('user does not exist'));
        }

    }catch(err){
        console.log(err);
    }
})

router.post('/logout',  async (req, res, next) => {
  const {refreshToken} = req.body;

  try{
      await Token.findOneAndRemove({token: refreshToken});
      res.json({
          success: 'Token removed'
      });
  }catch(ex){
      return next(new Error('Error loging out the user'));
  }
})

router.post('/refresh-token',  async (req, res, next) => {
  const {refreshToken} = req.body;

    if(!refreshToken){
        return next(new Error('No token provided'));
    }

    try{

        const tokenDocument = await Token.findOne({token: refreshToken});

        if(!tokenDocument){
            return next(new Error('No token found'));
        }

        const payload = jwt.verify(tokenDocument.token, REFRESH_TOKEN_SECRET);
        const accessToken = jwt.sign({user: payload}, ACCESS_TOKEN_SECRET, {expiresIn: '10m'});

        res.json({
            accessToken
        });
    }catch(err){

    }
})

module.exports = router;