const express = require('express');
const router = express.Router();
const multer = require('multer')
const mongoose = require('mongoose');

const DIR = './public/'
const Country = require('../model/country.model');

router.post('/country', async (req, res, next) => {
  try {
      
      const countrydata = new Country({
        // _id: new mongoose.Types.ObjectId(),
        country: req.body.country,
        timezone: req.body.timezone,
        currency: req.body.currency,
        code: req.body.code,
       flag: req.body.flag,
    });
    const countryAdded = await countrydata.save();
    // res.setHeader('Access-Control-Allow-Origin', '*');
    // const VehicleTypCreated = await vehicletype.save();
    res.status(201).json({
      message: 'Country Added successfully!',
      countryAdded,
  });
   
  }
  catch (error) {
    console.error(error);
    if (error.keyPattern.country) {
      return res.status(409).send({
        success: false,
        message: "country already exist" 
      })
    } 
    res.status(400).send(error);
  }
});


router.get('/country', async (req, res, next) => {
  // const searchQuery = req.query.searchQuery || '';
  try {
    const searchQuery = req.query.searchQuery || '';
    const searchRegex = new RegExp(searchQuery, 'i');
    const count = await Country.countDocuments({ country: searchRegex });
    const data = await Country.find({ country: searchRegex });
    res.status(200).json({
      message: 'Users retrieved successfully!',
      countrydata: data,
    });
    // console.log(data);
  } catch (error) {
    next(error);
  }
});

// router.post('/country', async (req, res) => {
//   try {
//     const countrydata = new Country(req.body);
//     // console.log(req.body);
//     const countryAdded= await countrydata.save();
//     res.status(200).json(countryAdded);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send(err);
//   }
// });

// router.get('/country', (req, res, next) => {
//   Country.find().then((data) => {
//   res.status(200).json({
//     message: 'Users retrieved successfully!',
//     countrydata: data,
//   })
//   console.log(data);
// })
// })

// router.get('/countries/:name', (req, res) => {
//     const name = req.params.name;
//     Country.find({ name: { $regex: name, $options: 'i' } }, (err, countries) => {
//       if (err) {
//         console.error(err);
//         res.status(500).send(err);
//       } else {
//         res.status(200).send(countries);
//       }
//     });
//   });


module.exports = router;