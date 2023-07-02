const express = require('express');
const router = express.Router();
const multer = require('multer')
const mongoose = require('mongoose');

const DIR = './public/'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR)
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-')
    req.body.vehicleimg = fileName
    cb(null, fileName)
  },
})

// Multer Mime Type Validation
var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg'
    ) {
      cb(null, true)
    } else {
      cb(null, false)
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'))
    }
  },
})

// var upload = multer({
//     storage: storage,
//     limits: {
//       fileSize: 1024 * 1024 * 5,
//     },
//     fileFilter: (req, file, cb) => {
//       if (
//         file.mimetype == 'image/png' ||
//         file.mimetype == 'image/jpg' ||
//         file.mimetype == 'image/jpeg'
//       ) {
//         cb(null, true)
//       } else {
//         cb(null, false)
//         return cb(new Error('Only .png, .jpg and .jpeg format allowed!'))
//       }
//     },
//   })

let VehicleType = require('../model/vehicletype.model')

router.post('/create-vehicletype', upload.single('vehicleimg'), async (req, res, next) => {
  try {
    const url = req.protocol + '://' + req.get('host');
    let vehicleUrl = req.file ? url + '/public/' + req.body.vehicleimg : url + '/public/'+  'car3.jpg';
    const vehicletype = new VehicleType({
      _id: new mongoose.Types.ObjectId(),
      vehicletype: req.body.vehicletype,
      vehicleimg: vehicleUrl,
    });
    const VehicleTypCreated = await vehicletype.save();
    res.status(201).json({
      message: 'Vehicle Type successfully!',
      VehicleTypCreated,
    });
  } catch (error) {
      console.log(error);
      res.status(500).json({
          error: error,
      });
    }
})
router.get('/get-vehicletype', (req, res, next) => {
  VehicleType.find().then((data) => {
    res.status(200).json({
      message: 'Users retrieved successfully!',
      vehicletype: data,
    })
    // console.log(data);
  })
})

router.put('/update-vehicletype', upload.single('vehicleimg'), async (req, res, next) => {
  try {
    const url = req.protocol + '://' + req.get('host');
    const vehicleId = req.body.id;
    const updatedVehicle = {
      vehicletype: req.body.vehicletype,
      vehicleimg: url + '/public/' + req.file.filename,
    };
    const result = await VehicleType.findByIdAndUpdate(vehicleId, updatedVehicle, { new: true });
    res.status(200).json({
      message: 'Vehicle updated successfully!',
      VehicleTypeUpdated: result,
    });
  } catch (err) {
    // console.log(err);
    res.status(500).json({
      error: err,
    });
  }
});
// router.get('/:id', async (req, res, next) => {
//   try {
//     const data = await VehicleType.findById(req.params.id);
//     if (data) {
//       res.status(200).json(data);
//     } else {
//       res.status(404).json({
//         message: 'User not found!',
//       });
//     }
//   } catch (error) {
//     next(error);
//   }
// });

// router.get('/all', async (req, res, next) => {
//   try {
//     const data = await VehicleType.findById(req.params.id);
//     if (data) {
//       res.status(200).json(data);
//     } else {
//       res.status(404).json({
//         message: 'User not found!',
//       });
//     }
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = router;