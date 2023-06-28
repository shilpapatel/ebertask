const express = require('express');
const router = express.Router();
const multer = require('multer')
const mongoose = require('mongoose');

const DIR = './public/'
let CreateRide = require('../model/createride.model')

router.post('/add-ride', async (req, res, next) => {
  try {
    const rideData = req.body;
    // console.log(rideData);
    const newRide = new CreateRide(rideData);
    const rideCreated = await newRide.save();
    res.status(201).json({
      message: 'Ride created successfully!',
      rideCreated,
  });
  } catch (err) {
      console.log(err);
      res.status(500).json({
          error: err,
      });
  }
});

router.get('/get-createride', async (req, res, next) => {
  try {
    const data = await CreateRide.aggregate([
      
      {
        $lookup: {
          from: 'cities',
          foreignField: '_id',
          localField: 'cityId',
          as: 'citydata'
        }
      },
      {
        $unwind: '$citydata'
      },
      {
        $lookup: {
          from: 'vehicletypes',
          foreignField: '_id',
          localField: 'vehicleTypeId',
          as: 'vehicletypedata'
        }
      },
      {
        $unwind: '$vehicletypedata'
      },
      {
        $lookup: {
          from: 'users',
          foreignField: '_id',
          localField: 'userId',
          as: 'userdata'
        }
      },
      {
        $unwind: '$userdata'
      }, 
      {
        $lookup: {
          from: 'driverlists',
          foreignField: '_id',
          localField: 'driverId',
          as: 'driverdata'
        }
      },
      {
        $unwind: '$driverdata'
      }
    ])
    console.log(data);
    // const data = await CreateRide.find();
    res.status(200).json({
      message: 'CreateRide retrieved successfully!',
      createridedata: data,
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;