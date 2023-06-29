const express = require('express');
const router = express.Router();
const multer = require('multer')
const mongoose = require('mongoose');

// const io = require('../app');
const DIR = './public/'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR)
  },
  filename: (req, file, cb) => {
    console.log(req.body);
    const fileName = file.originalname.toLowerCase().split(' ').join('-')
    req.body.profile= fileName;
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
      // cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  },
})

// const fileSaver = (req, res, next) => {
//   upload.single('profile')(req, res, function (error) {
//     // if (error instanceof multer.MulterError) {
//     //   console.log('MulterError occurred');
//     //   return res.status(400).json({ error: error.message });
//     // } 
//     if (error && error.message === 'Only .png, .jpg and .jpeg format allowed!') {
//       console.log(error.message );
//       return res.status(400).json({ message: 'Only .png, .jpg and .jpeg format allowed!' });
//     }
//     // } else if (error) {
//     //   console.log('Unknown error occurred during file upload');
//     //   return res.status(500).json({ error: error.message });
//     // }
//     // console.log('File was uploaded successfully');
//     next();
//   });
// };

let DriverList = require('../model/list.model')
router.post('/add-driver', upload.single('profile'), async (req, res, next) => {
  try {
    const url = req.protocol + '://' + req.get('host');
    let profileUrl = req.file ? url + '/public/' + req.body.profile : url + '/public/'+  'profile1.png';
    console.log(req.body);
    const driver = new DriverList({
      // _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      email: req.body.email,
      phone: req.body.code + req.body.phone,
      profile:  profileUrl,
      country_id: req.body.country_id,
      city_id: req.body.city_id,
      vehicletype_id: this.vehicletype_id,
      rideStatus: this.rideStatus,
      status: this.status
    });
    const driverCreated = await driver.save();
    // const VehicleTypCreated = await vehicletype.save();
    res.status(201).json({
      message: 'Driver registered successfully!',
      driverCreated,
      // : {
      //     // _id: result._id,
      //     name: result.name,
      //     email: result.email,
      //     phone: result.phone,
      //     profile: result.profile,
      // },
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      error: error.message,
    });
  }
});

// router.get('/get-driverswithoutpage', async (req, res, next) => {
//   try {
//     const data = await DriverList.find();
//     res.status(200).json({
//       message: 'Drivers retrieved successfully!',
//       driverlistalldata: data,
//     });
//     console.log(data);
//   } catch (error) {
//     next(error);
//   }
// });

router.get('/get-driverswithoutpage', async (req, res, next) => {
  try {
    const data = await DriverList.aggregate([
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
    ]);

    res.status(200).json({
      message: 'Drivers retrieved successfully!',
      driverlistalldata: data
    });

    // console.log(data);
  } catch (error) {
    next(error);
  }
});

router.get('/get-drivers', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const searchQuery = req.query.searchQuery || '';
    const sortField = req.query.sortField || 'name'; // Default sort field is 'name'
    const sortOrder = req.query.sortOrder || 'asc';
    let sortOptions = {};
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    const searchRegex = new RegExp(searchQuery, 'i');
    const count = await DriverList.countDocuments({ $or: [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }] });
    const totalPages = Math.ceil(count / limit);
    const skip = (page - 1) * limit;

    const pipeline = [
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
        $unwind: '$citydata'
      },
      {
        $lookup: {
          from: 'vehicletypes',
          foreignField: '_id',
          localField: 'vehicletype_id',
          as: 'vehicletypedata'
        }
      },

      // {
      //   $addFields: {
      //     unwoundField: {
      //       $cond: [
      //         { $ifNull: ['$vehicletype_id', false] },
      //         '$vehicletypedata',
      //         '$type'
      //       ]
      //     }
      //   }
      // },
      // {
      //   $unwind: {
      //     path: '$unwoundField',
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      {
        $unwind: {
          path: '$vehicletypedata',
          preserveNullAndEmptyArrays: true
        }
      },
      // {
      //   $addFields: {
      //     type: {
      //       $cond: [
      //         { $eq: ['$vehicletype_id', null] },
      //         '$$REMOVE',
      //         '$type'
      //       ]
      //     }
      //   }
      // },
      {
        $match: {
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex }
          ]
        }
      },
      {
        $sort: sortOptions
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
    ];
    const data = await DriverList.aggregate(pipeline);
    // const data = await DriverList.find({$or: [{ name: searchRegex },{ email: searchRegex },{ phone: searchRegex }]})

    // // .sort({ name: 1 })
    //   .sort(sortOptions)
    //   .skip(skip)
    //   .limit(limit);
    // console.log(data);

    res.status(200).json({
      message: 'Drivers retrieved successfully!',
      driverlistdata: data,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
});

// router.get('/get-drivers', async (req, res, next) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 3;
//     const searchQuery = req.query.searchQuery || '';
//     const sortField = req.query.sortField || 'name'; // Default sort field is 'name'
//     const sortOrder = req.query.sortOrder || 'asc'; 
//     let sortOptions = {};
//     sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

//     const searchRegex = new RegExp(searchQuery, 'i');
//     const count = await DriverList.countDocuments({$or: [{ name: searchRegex },{ email: searchRegex },{ phone: searchRegex }]});
//     const totalPages = Math.ceil(count / limit);
//     const skip = (page - 1) * limit;

//     const data = await DriverList.find({$or: [{ name: searchRegex },{ email: searchRegex },{ phone: searchRegex }]})

//     // .sort({ name: 1 })
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(limit);

//     res.status(200).json({
//       message: 'Drivers retrieved successfully!',
//       driverlistdata: data,
//       totalPages: totalPages,
//       currentPage: page,
//     });
//   } catch (error) {
//     next(error);
//   }
// });


router.delete('/delete-driver/:id', async (req, res, next) => {
  try {
    const driverId = req.params.id;
    const result = await DriverList.findByIdAndDelete(driverId);
    if (!result) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.status(200).json({ message: 'Driver deleted successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});
router.put('/update-driver', upload.single('profile'), async (req, res, next) => {
  try {
    const url = req.protocol + '://' + req.get('host');
    const driverId = req.body.id;
    const updatedDriver = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.code + req.body.phone,
      profile: url + '/public/' + req.file.filename,
      country_id: req.body.country_id,
      city_id: req.body.city_id,
      // type:req.body.type,
      //  status:req.body.status
    };
    const result = await DriverList.findByIdAndUpdate(driverId, updatedDriver, { new: true });
    // io.emit('driverUpdate', result);

    res.status(200).json({
      message: 'Driver updated successfully!',
      driverUpdated: result,
    });
  } catch (err) {
    // console.log(err);
    res.status(500).json({
      error: err,
    });
  }
});

router.put('/update-status/:id', async (req, res) => {
  try {
    const driverId = req.params.id;
    // console.log(req.body);
    const updatedstatus = {
      status: req.body.driverstatus
    }
    const result = await DriverList.findByIdAndUpdate(driverId, updatedstatus, { new: true });
    // io.emit('driverUpdate', result);
    res.status(200).json({
      message: 'Driver status updated successfully!',
      driverStatusUpdated: result,

    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
});

router.put('/update-type/:id', async (req, res) => {
  try {
    const driverId = req.params.id;
    console.log(req.body);
    const updatedvehicetype = {
      vehicletype_id: req.body.vehicletype_id
    }
    const result = await DriverList.findByIdAndUpdate(driverId, updatedvehicetype, { new: true });
    res.status(200).json({
      message: 'Driver type updated successfully!',
      driverTypeUpdated: result,

    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
});

// router.get('/drivers/:cityId/:vehicleTypeId', async (req, res) => {
//   try {
//     const cityId = req.params.cityId;
//     const vehicleTypeId = req.params.vehicleTypeId;

//     const drivers = await DriverList.find({ cityId: cityId, vehicleTypeId: vehicleTypeId });
//     // console.log(drivers);

//     res.status(200).json({
//       driverlistdata: drivers,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       error: err,
//     });
//   }
// });

module.exports = router;



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