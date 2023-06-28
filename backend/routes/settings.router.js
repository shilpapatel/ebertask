const express = require('express');
const router = express.Router();
const multer = require('multer')
const mongoose = require('mongoose');

const DIR = './public/'
const Settings = require('../model/settings.model');


async function createDefaultSettings() {
  try {
    const count = await Settings.countDocuments();
    if (count === 0) {
      const defaultSettings = new Settings();
      await defaultSettings.save();
      console.log('Default settings added successfully');
    }
  } catch (error) {
    console.error('Error creating default settings:', error);
  }
}
createDefaultSettings();

router.get('/get-settings', async (req, res, next) => {
    try {
      const data = await Settings.find();
      res.status(200).json({
        message: 'Settings retrieved successfully!',
        settingsdata: data,
      });
      // console.log(data);
    } catch (error) {
      next(error);
    }
  });

  router.put('/update-settings/:id', async (req, res, next) => {
    try {
      const settingsId = req.params.id;
      const updatedSettings = {
        requesttime: req.body.requesttime,
        maxstops: req.body.maxstops,
      };
      const result = await Settings.findByIdAndUpdate(settingsId, updatedSettings, { new: true });
      res.status(200).json({
        message: 'Settings updated successfully!',
        settingsUpdated: result,
      });
    } catch (err) {
      res.status(500).json({
        error: err,
      });
    }
  });
 
  module.exports = router;  
// router.post('/add-settings', async (req, res) => {
//     try {
//       console.log(req.body);
//       //   const url = req.protocol + '://' + req.get('host');
//         const settings = new Settings({
//             requesttime: req.body.requestTime,
//             maxstops: req.body.maxStops,
//       });
//       const settingsCreated = await settings.save();
//       // const VehicleTypCreated = await vehicletype.save();
//       res.status(201).json({
//         message: 'settingsCreated successfully!',
//         settingsCreated,
//     });
//   } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             error: err,
//         });
//     }
  
   
//   });

  // router.put('/update-settings/:id', async (req, res, next) => {
  //   try {
  //     const settingsId =req.params.id;
  //     const updatedSettings = {
  //       requesttime: req.body.requestTime,
  //       maxstops: req.body.maxStops,
        
  //     };
  //     const result = await Settings.findByIdAndUpdate(settingsId, updatedSettings, { new: true });
  //     res.status(200).json({
  //       message: 'Settings updated successfully!',
  //       settingsUpdated: result,
  //     });
  //   } catch (err) {
  //     // console.log(err);
  //     res.status(500).json({
  //       error: err,
  //     });
  //   }
  // });
