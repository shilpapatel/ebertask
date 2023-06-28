const mongoose = require("mongoose")
const express = require("express")
const { Schema } = mongoose;

const driverlistSchema = new mongoose.Schema({
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
    country_id:{type: Schema.Types.ObjectId,required:true},
    city_id:{type: Schema.Types.ObjectId,required:true},
    vehicletype_id:{type: Schema.Types.ObjectId},
    type: {type: String, default:'None' },
    rideStatus: { type: String, default:'Online'},
    status: { type: String, default:'Approved'},

    created:{
        type:Date,
       // required:true,
        default:Date.now
    }
})

//collection name always singular forn and first letter always capital
const DriverList = new mongoose.model("DriverList",driverlistSchema)
module.exports = DriverList;
