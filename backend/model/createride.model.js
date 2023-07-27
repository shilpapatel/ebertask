const mongoose = require("mongoose")
const express = require("express")
const { Schema } = mongoose;

// Define the enum object for ride status
// const RideStatus = Object.freeze({
//     "0":"pending",
//     "1":"assigning",
//     "2":"timeout",
//     "3":"rejected",
//     "4":"accepted",
//     "5":"arrived",
//     "6":"started",
//     "7":"completed",
//     "8":"cancelled"
//     // Pending: 0,
//     // assigning: 1,
//     // timeout: 2,
//     // rejected:3,
//     // accepted:4,
//     // arrived:5,
//     // started:6,
//     // completed:7,
//     // cancelled:8
        // hold:9

// });

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
    // assigned:{ type:String, default:"pending"},
    // assigned: { type: Number}
    assigned: { type: Number, enum:[0,1,2,3,4,5,6,7,8,9]},
    created:{type:String,default:Date.now()},
    nearest:{type:Boolean},
    assigneddrivers:{type:Array , unique : true },
    feedback:{type:String}

})

//collection name always singular forn and first letter always capital
const CreateRide = new mongoose.model("CreateRide",createrideSchema)
module.exports = CreateRide;
