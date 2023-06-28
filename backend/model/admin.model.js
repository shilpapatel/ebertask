
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

var adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'Full name can\'t be empty'
    },
    email: {
        type: String,
        required: 'Email can\'t be empty',
        unique: true
    },
    password: {
        type: String,
        required: 'Password can\'t be empty',
        minlength : [4,'Password must be atleast 4 character long']
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }] ,
    saltSecret: String
});

// Custom validation for email
adminSchema.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

adminSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
      } catch (error) {
        return next(error);
      }
    }
    next();
  });

  // Methods
  adminSchema.methods.verifyPassword = function (password) {
      return bcrypt.compareSync(password, this.password);
  };
  
adminSchema.methods.generateAuthToken = async function(){
   console.log(this._id);
    try{
        const token = await jwt.sign({_id:this._id.toString()},process.env.JWT_SECRET)
        this.tokens = this.tokens.concat({token:token})
        await this.save();
        return token;
        //const userVerification = jwt.verify(token,"secretkeyischaracterlongormorethanthat")
    }catch(e)
    {
        // res.send(e)
        console.log(e)
    }
}



const Admin = mongoose.model('Admin', adminSchema); 
module.exports = Admin;

