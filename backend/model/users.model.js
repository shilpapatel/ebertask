const mongoose = require("mongoose")
const express = require("express")

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        // lowercase:true,
         required:true,
         unique:true,
         trim:true
        // validate: {
        //     validator: function (v) {
        //       return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        //     },
        //     message: '{VALUE} is not a valid email!'
        //   }
    },
    phone:{
        type:String,
        required:true,
        unique:[true,'phone number already exists']
      //   validate: {
      //       validator: function (v) {
      //         return /^[0-9]{10}/.test(v);
      //       },
      //       message: '{VALUE} is not a valid 10 digit number!'
      //     }

    },
    profile:{
        type:String,
        default:'img3.jpg'
        
    },
    created:{
        type:Date,
       // required:true,
        default:Date.now
    },
    stripeCustomerId:{
        type:String
    }
})

//collection name always singular forn and first letter always capital
const User = new mongoose.model("User",userSchema)
module.exports = User;
