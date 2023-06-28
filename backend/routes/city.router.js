const express = require('express');
const router = express.Router();
const multer = require('multer')
const mongoose = require('mongoose');

const DIR = './public/'
const City = require('../model/city.model');

router.post('/city', async (req, res) => {
  try {
    const citydata = new City(req.body);
    // console.log(req.body);
    await citydata.save();
    res.status(200).json({
      message: 'City Added successfully!',
      citydata
    });
  } catch (error) {
    console.error(error);
    if (error.keyPattern.city) {
      return res.status(500).send({
        success: false,
        message: "city already exist" 
      })
    } 
    res.status(500).send(error);
  }
});

router.get('/city', async (req, res, next) => {
    try {
      // const data = await City.find();
      const data = await City.aggregate([
        {
          $lookup: {
            from: 'countries',
            foreignField: '_id',
            localField: 'country_id',
            as: 'countrydata'
          }
        },
        {
          $unwind: '$countrydata'
        }
      ])
      res.status(200).json({
        message: 'Users retrieved successfully!',
        citydata: data,
      });
      // console.log(data);
    //   console.log(data);
    } catch (error) {
      next(error);
    }
  });

  router.put('/city/:id', async (req, res) => {
    try {
      const cityId = req.params.id;
      const updatedCity = req.body;
      const result = await City.findByIdAndUpdate(cityId, updatedCity, { new: true });
      // console.log(result);
      res.status(200).json({ 
        message: 'City Updated successfully!',
        citydata: result });
    } catch (error) {
      console.error(error);
      if (error.keyPattern.city) {
        return res.status(500).send({
          success: false,
          message: "city already exist" 
        })
      } 
      res.status(500).send(error);
    }
  });
  module.exports = router;