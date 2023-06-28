const mongoose = require("mongoose")
const express = require("express")
const { Schema } = mongoose;

const createrideSchema = new mongoose.Schema({
    // country_id:{type: Schema.Types.ObjectId,required:true},
    userId:{type: Schema.Types.ObjectId,required:true,ref:'User'},
    cityId:{type: Schema.Types.ObjectId,required:true,ref:'City'},
    vehicleTypeId:{type:Schema.Types.ObjectId,required:true,ref:'VehicleType'},
    driverId:{type:Schema.Types.ObjectId,ref:'DriverList'},
    from:{ type:String, required:true},
    to:{ type:String, required:true},
    stops:[{ type:Object, required:true}],
    totalDistance:{ type:String, required:true},
    totalTime:{ type:String, required:true},
    estimatePrice:{ type:String, required:true},
    vehicleType:{ type:String, required:true},
    paymentOption:{ type:String, required:true,},
    // bookRide:{ type:String, required:true,},
    datetime:{ type:String, required:true,},
    assigned:{ type:String, default:"pending"},
    created:{type:String,default:Date.now()}
})

//collection name always singular forn and first letter always capital
const CreateRide = new mongoose.model("CreateRide",createrideSchema)
module.exports = CreateRide;
