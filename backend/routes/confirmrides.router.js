const express = require('express');
const router = express.Router();
const multer = require('multer')
const mongoose = require('mongoose');

const DIR = './public/'
let ConfirmRides = require('../model/confirmrides.model')

// router.post('/add-ride', async (req, res, next) => {
//   try {
//     const rideData = req.body;
//     console.log(rideData);
//     const newRide = new CreateRide(rideData);
//     const rideCreated = await newRide.save();
//     res.status(201).json({
//       message: 'Ride created successfully!',
//       rideCreated,
//   });
//   } catch (err) {
//       console.log(err);
//       res.status(500).json({
//           error: err,
//       });
//   }
// });
module.exports = router;