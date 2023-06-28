const mongoose = require("mongoose")
const express = require("express")

const confirmridesSchema = new mongoose.Schema({
    // userId:{_id: mongoose.Schema.Types.ObjectId,type:String,required:true,ref:'User'},
    // cityId:{_id: mongoose.Schema.Types.ObjectId,type:String,required:true,ref:'City'},
    // vehicleTypeId:{_id: mongoose.Schema.Types.ObjectId,type:String,required:true,ref:'VehicleType'},
    // from:{ type:String, required:true},
    // to:{ type:String, required:true},
    // stops:[{ type:Object, required:true}],
    // totalDistance:{ type:String, required:true},
    // totalTime:{ type:String, required:true},
    // estimatePrice:{ type:String, required:true},
    // vehicleType:{ type:String, required:true},
    // paymentOption:{ type:String, required:true,},
    // datetime:{ type:String, required:true,},
})

//collection name always singular forn and first letter always capital
const ConfirmRides = new mongoose.model("ConfirmRides",confirmridesSchema)
module.exports = ConfirmRides;
