const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');


const userShema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name!'],
        minLength: [5, "Your name must be at least 5 chars!"],
        trim: true
    },
    email : { 
        type: String, 
        required: [true, 'Please enter your email!'], 
        minLength: [15, 'Your E-mail length is very short!'],
        trim: true,
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password : { 
        type: String, 
        required: [true, 'Please enter your password!'], 
        trim: true,
        minLength: [6, 'The Minium password length 6 characters']
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Using bcrypt to password hashing
userShema.pre('save', async function (next) {
    const user = this;
    const salt = await bcrypt.genSalt(10);
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, salt);
    }
    next();
});

// Statics method to login user
userShema.statics.login = async function (email, password) {
    const user = await this.findOne({ email });
    if(user){
        const auth = await bcrypt.compare(password, user.password);
        if(auth){
            return user;
        }
        throw Error('incorrect password');
    }
        throw Error('incorrect email');
}

const User = mongoose.model("user", userShema);


// Usage example email
const user = new User({
    email: 'example@email.com'
  });
  
  // Validate the email length
  const validationError = user.validateSync();
  if (validationError) {
    console.log(validationError.errors['email']);
  } else {
    console.log('Email length is valid!');
  }

  
module.exports = User;

