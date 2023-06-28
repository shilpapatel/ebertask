const mongoose = require("mongoose")
const express = require("express")
const { Schema } = mongoose;

const vehiclepricingSchema = new mongoose.Schema({

    country_id:{type: Schema.Types.ObjectId,required:true},
    city_id:{type: Schema.Types.ObjectId,required:true},
    vehicletype_id:{type: Schema.Types.ObjectId,required:true},
    // country: { type: String, required: true },
    // city: { type: String, required: true },
    // vehicletype: { type: String, required: true },
    driverprofit: { type: String, required: true },
    minfare: { type: String, required: true },
    distanceforbaseprice: { type: String, required: true },
    baseprice: { type: String, required: true },
    priceperunitdistance: { type: String, required: true },
    priceperunittime: { type: String, required: true },
    maxspace: { type: String, required: true }
});
vehiclepricingSchema.index({ city_id: 1, vehicletype_id: 1 }, { unique: true });

//collection name always singular forn and first letter always capital
const VehiclePricing = new mongoose.model("VehiclePricing", vehiclepricingSchema)
module.exports = VehiclePricing;
