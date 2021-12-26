require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwb = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET, REQUEST_TOKEN_SECRET } = process.env;

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
    bcrypt.hash(document.password, 10, (err, hash) => {
      if(err)
        next(err);
      else
        document.password = hash;
    })
  } else {
    next()
  }
});

UserSchema.methods.usernameExists = async (username) => {

  try {
    let result = await mongoose.model('User').find({username: username});
    return result.length > 0;
  } catch (error) {
    return false;
  }
  
}

UserSchema.methods.isCorrectPassword = async (password, hash) => {

  try {
    const same = await bcrypt.compare(password, hash);
    return same;
  } catch (error) {
    return false;
  }
  
}