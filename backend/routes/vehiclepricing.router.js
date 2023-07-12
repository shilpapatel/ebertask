const express = require('express');
const router = express.Router();
const multer = require('multer')
const mongoose = require('mongoose');

let VehiclePricing = require('../model/vehiclepricing.model')
router.post('/add-vehicleprice', async (req, res) => {
  try {
    console.log(req.body);
    //   const url = req.protocol + '://' + req.get('host');
      const vehiclepricing = new VehiclePricing({
      country_id: req.body.country_id,
      city_id: req.body.city_id,
      vehicletype_id: req.body.vehicletype_id,
      driverprofit: req.body.driverprofit,
      minfare: req.body.minfare,
      distanceforbaseprice: req.body.distanceforbaseprice,
      baseprice: req.body.baseprice,
      priceperunitdistance: req.body.priceperunitdistance,
      priceperunittime: req.body.priceperunittime,
      maxspace: req.body.maxspace
    });
    const vehiclepricingCreated = await vehiclepricing.save();
    // const VehicleTypCreated = await vehicletype.save();
    res.status(201).json({
      message: 'VehiclePricingCreated successfully!',
      vehiclepricingCreated,
  });
} catch (err) {
      console.log(err);
      res.status(400).json({
          error: err,
      });
  }

 
});

router.get('/get-vehicleprice', async (req, res, next) => {
  try {
    const data = await VehiclePricing.aggregate([
      {
        $lookup: {
          from: 'countries',
          foreignField: '_id',
          localField: 'country_id',
          as: 'countrydata'
        }
      },
      {
        $lookup: {
          from: 'cities',
          foreignField: '_id',
          localField: 'city_id',
          as: 'citydata'
        }
      },
      {
        $lookup: {
          from: 'vehicletypes',
          foreignField: '_id',
          localField: 'vehicletype_id',
          as: 'vehicletypedata'
        }
      },
      {
        $unwind: '$countrydata'
      },
      {
        $unwind: '$citydata'
      },
      {
        $unwind: '$vehicletypedata'
      }
    ])
    res.status(200).json({
      message: 'Users retrieved successfully!',
      vehiclepricingdata: data,
    });
    // console.log(data);
  } catch (error) {
    next(error);
  }
});

router.delete('/delete-vehicleprice/:id', async (req, res, next) => {
  try {
    const vehiclepricingId = req.params.id;
    const result = await VehiclePricing.findByIdAndDelete(vehiclepricingId);
    if (!result) {
      return res.status(404).json({ message: 'VehiclePrice not found' });
    }
    res.status(200).json({ message: 'VehiclePrice deleted successfully' });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err });
  }
});
router.put('/update-vehicleprice/:id', async (req, res, next) => {
  try {
    const vehiclepricingId =req.params.id;
    const updatedVehiclePricing = {
      country_id: req.body.country_id,
      city_id: req.body.city_id,
      vehicletype_id: req.body.vehicletype_id,
      driverprofit: req.body.driverprofit,
      minfare: req.body.minfare,
      distanceforbaseprice: req.body.distanceforbaseprice,
      baseprice: req.body.baseprice,
      priceperunitdistance: req.body.priceperunitdistance,
      priceperunittime: req.body.priceperunittime,
      maxspace: req.body.maxspace,
    };
    const result = await VehiclePricing.findByIdAndUpdate(vehiclepricingId, updatedVehiclePricing, { new: true });
    res.status(200).json({
      message: 'VehiclePricing updated successfully!',
      vehiclepricingUpdated: result,
    });
  } catch (err) {
    // console.log(err);
    res.status(400).json({
      error: err,
    });
  }
});

module.exports = router;