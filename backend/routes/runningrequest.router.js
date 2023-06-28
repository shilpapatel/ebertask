const express = require('express');
const router = express.Router();
const multer = require('multer')
const mongoose = require('mongoose');

const DIR = './public/'
let RunningRequest = require('../model/runningrequest.model')

router.post('/add-driverride', async (req, res, next) => {
  try {
    const driverrideData = req.body;
    console.log(ridedriverData);
    const newDriverRide = new RunningRequest(driverrideData);
    const driverrideCreated = await newDriverRide.save();
    res.status(201).json({
      message: 'DriverRide created successfully!',
      driverrideCreated,
  });
  } catch (err) {
      console.log(err);
      res.status(500).json({
          error: err,
      });
  }
});


router.get('/get-driverride', async (req, res, next) => {
  try {
    const data = await RunningRequest.find();
    res.status(200).json({
      message: 'DriverRide retrieved successfully!',
      driverridedata: data,
    });
    console.log(data);
  } catch (error) {
    next(error);
  }
});

router.delete('/delete-driverride/:id', async (req, res, next) => {
  try {
    const driverId = req.params.id;
    const result = await RunningRequest.findByIdAndDelete(driverId);
    if (!result) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.status(200).json({ message: 'Driver deleted successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});
module.exports = router;