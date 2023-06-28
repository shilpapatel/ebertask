const mongoose = require("mongoose")
const express = require("express")

const runningrequestSchema = new mongoose.Schema({

    filteredRides:[{ type:Object, required:true}],
    selectedDriver:[{ type:Object, required:true}],
    
})

//collection name always singular forn and first letter always capital
const RunningRequest = new mongoose.model("RunningRequest",runningrequestSchema)
module.exports = RunningRequest;
