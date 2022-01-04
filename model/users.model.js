require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

const Token = require('./token.model');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  }
});

UserSchema.pre('save', function (next) {
  if(this.isModified('password') || this.isNew){
    const document = this;
    bcrypt.hash(document.password, 10, function (err, hash){
      if(err){
        next(err);
      }else{
        document.password = hash;
        next();
      }
    })
  } else {
    next()
  }
});

UserSchema.methods.usernameExists = async (username) => {
  console.log('username Exists')
  try {
    let result = await mongoose.model('User').find({username: username});
    return result.length > 0;
  } catch (error) {
    return false;
  }
  
}

UserSchema.methods.isCorrectPassword = async (password, hash) => {
  console.log('Si son iguales :D')
  try {
    const same = await bcrypt.compare(password, hash);
    return same;
  } catch (error) {
    return false; 
  }
  
}

UserSchema.methods.createAccessToken =  () => {
  const {id, username } = this;

  const accessToken = jwt.sign(
    { user: {id, username}},
    ACCESS_TOKEN_SECRET,
    {expiresIn: '1d'}
  );

  return accessToken;
}

UserSchema.methods.createRefreshToken = async () => {
  const { id, username } = this;
  const refreshToken = jwt.sign(
    { user: { id, username } },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  );

  try {
    await new Token({token: refreshToken}).save();

    return refreshToken;
  } catch (error) {
    next(new Error('Error crating refresh token'));
  }
}

module.exports = mongoose.model('User', UserSchema);