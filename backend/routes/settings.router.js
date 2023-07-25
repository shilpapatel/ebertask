const express = require('express');
const router = express.Router();
const multer = require('multer')
const mongoose = require('mongoose');

const DIR = './public/'
const Settings = require('../model/settings.model');
const fs = require('fs');
const dotenv = require('dotenv');


// async function createDefaultSettings() {
//   try {
//     const count = await Settings.countDocuments();
//     if (count === 0) {
//       const defaultSettings = new Settings();
//       await defaultSettings.save();
//       console.log('Default settings added successfully');
//     }
//   } catch (error) {
//     console.error('Error creating default settings:', error);
//   }
// }
// createDefaultSettings();

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
      dotenv.config(); // Load the current .env file
      process.env.TWILIOACCOUNTSID = req.body.twilioacoountsid;
      process.env.TWILIOAUTHTOKEN = req.body.twilioauthtoken;
      process.env.NODEMAILEREMAIL = req.body.nodemaileremail;
      process.env.NODEMAILERPASSWORD = req.body.nodemailerpassword;
      process.env.STRIPEPUBLICKEY = req.body.stripepublickey;
      process.env.STRIPESECRETEKEY = req.body.stripesecretkey;
      const envData = `TWILIOAUTHTOKEN=${process.env.TWILIOAUTHTOKEN}\nTWILIOACCOUNTSID=${process.env.TWILIOACCOUNTSID}\nNODEMAILEREMAIL=${process.env.NODEMAILEREMAIL}\nNODEMAILERPASSWORD=${process.env.NODEMAILERPASSWORD}\nSTRIPEPUBLICKEY=${process.env.STRIPEPUBLICKEY}\nSTRIPESECRETEKEY=${process.env.STRIPESECRETEKEY}`;
      fs.writeFileSync('.env', envData, 'utf8');
      const updatedSettings = {
        requesttime: req.body.requesttime,
        maxstops: req.body.maxstops,
        twilioacoountsid: req.body.twilioacoountsid,
        twilioauthtoken:req.body.twilioauthtoken,
        nodemaileremail: req.body.nodemaileremail,
        nodemailerpassword:req.body.nodemailerpassword,
        stripepublickey: req.body.stripepublickey,
        stripesecretkey:req.body.stripesecretkey
      };
      const result = await Settings.findByIdAndUpdate(settingsId, updatedSettings, { new: true });
      res.status(200).json({
        message: 'Settings updated successfully!',
        settingsUpdated: result,
      });
    } catch (err) {
      res.status(400).json({
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
