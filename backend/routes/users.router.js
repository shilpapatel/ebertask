const express = require('express');
const router = express.Router();
const multer = require('multer')
const mongoose = require('mongoose');

// const ctrlUser = require('../controllers/user.controller');
// const passport = require('passport');
// const jwtHelper = require('../config/jwtHelper');

const DIR = './public/'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, DIR)
    },
    filename: (req, file, cb) => {
      const fileName = file.originalname.toLowerCase().split(' ').join('-')
      cb(null, fileName)
      },
  })

  // Multer Mime Type Validation
  var upload = multer({
    storage: storage,
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
let User = require('../model/users.model')
router.post('/add-user', upload.single('profile'), async (req, res, next) => {
  try {
      const url = req.protocol + '://' + req.get('host');
      // console.log(req.body.code);
      const user = new User({
        // _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        phone: req.body.code + req.body.phone,
        profile:url + '/public/' + req.file.filename,
    });
    const userCreated = await user.save();
    // const VehicleTypCreated = await vehicletype.save();
    res.status(201).json({
      message: 'User registered successfully!',
      userCreated,
      // : {
      //     // _id: result._id,
      //     name: result.name,
      //     email: result.email,
      //     phone: result.phone,
      //     profile: result.profile,
      // },
  });
   
  } catch (err) {
      console.log(err);
      res.status(500).json({
          error: err,
      });
  }
});

// router.get('/get-users', async (req, res, next) => {
//   try {
//     const data = await User.find();
//     res.status(200).json({
//       message: 'Users retrieved successfully!',
//       userdata: data,
//     });
//     console.log(data);
//   } catch (error) {
//     next(error);x
//   }
// });
router.get('/get-users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const searchQuery = req.query.searchQuery || '';
    const sortField = req.query.sortField || 'name'; // Default sort field is 'name'
    const sortOrder = req.query.sortOrder || 'asc'; 
    let sortOptions = {};
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    const searchRegex = new RegExp(searchQuery, 'i');
    const count = await User.countDocuments({$or: [{ name: searchRegex },{ email: searchRegex },{ phone: searchRegex }]});
    const totalPages = Math.ceil(count / limit);
    const skip = (page - 1) * limit;

    const data = await User.find({ $or: [{ name: searchRegex },{ email: searchRegex },{ phone: searchRegex }] })
      // .sort({ name: 1 })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: 'Users retrieved successfully!',
      userdata: data,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
});


// router.get('/get-users', async (req, res, next) => {
//   try {

//     const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 10;
//   const searchText = req.query.searchText || '';

//   // Logic to fetch users from the database based on the provided page, limit, and searchText
//   // You can use libraries like Mongoose, Sequelize, or raw SQL queries to perform the database operations

//   // Example logic using Mongoose with MongoDB
//   const query = { name: { $regex: searchText, $options: 'i' } };
//   const skip = (page - 1) * limit;

//   User.find(query)
//     .skip(skip)
//     .limit(limit)
//     .exec((err, users) => {
//       if (err) {
//         return res.status(500).json({ error: 'Internal server error' });
//       }

//       User.countDocuments(query, (err, count) => {
//         if (err) {
//           return res.status(500).json({ error: 'Internal server error' });
//         }

//         const totalPages = Math.ceil(count / limit);
//         res.json({ users, totalPages });
//       });
//     });
//     // const data = await User.find();
//     // res.status(200).json({
//     //   message: 'Users retrieved successfully!',
//     //   userdata: data,
//     // });
//     // console.log(data);
//   } catch (error) {
//     next(error);
//   }
// });
router.delete('/delete-user/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const result = await User.findByIdAndDelete(userId);
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

router.put('/update-user', upload.single('profile'), async (req, res, next) => {
  try {
    const url = req.protocol + '://' + req.get('host');
    const userId = req.body.id;
    const updatedUser = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.code + req.body.phone,
      profile: url + '/public/' + req.file.filename,
    };
    const result = await User.findByIdAndUpdate(userId, updatedUser, { new: true });
    res.status(200).json({
      message: 'User updated successfully!',
      UserUpdated: result,
    });
  } catch (err) {
    // console.log(err);
    res.status(500).json({
      error: err,
    });
  }
});

module.exports = router;