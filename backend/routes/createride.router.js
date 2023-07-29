const express = require('express');
const router = express.Router();
const multer = require('multer')
const mongoose = require('mongoose');
const accountSid = 'ACb44d005c170946735f2e9a3280b96aab';
const authToken = 'db965c28b6ab4012ad67085ed3571f03';
const client = require('twilio')(accountSid, authToken);
// const webpush = require('web-push');

const DIR = './public/'
let CreateRide = require('../model/createride.model')
let User = require('../model/users.model')

async function sendmessage() {
  try {
    const message = await client.messages.create({
      body: 'ride created',
      from: '+18145262612',
      to: '+918733930293'
    });
    console.log(message.sid, 'message');
  } catch (error) {
    console.log('Error sending message:', error);
  }
}

router.put('/update-ridefeedback', async (req, res, next) => {
  try {
    // console.log(req.body);
    const rideId = req.body.rideId;
    const updatedRide = {
      feedback: req.body.feedback,
    };
    const result = await CreateRide.findByIdAndUpdate(rideId, updatedRide, { new: true });
    res.status(200).json({
      message: 'Ride updated successfully!',
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/get-userdetails', async (req, res, next) => {
  try {
console.log(req.query);
const phone = req.query.phone
const user = await User.findOne({ phone: phone });
if (!user) {
  return res.status(404).json({
    message: 'User not found!',
  });
}
    res.status(200).json({
      // message: 'Users retrieved successfully!',
      userdetails: user,
    });
    //  console.log(user);
  } catch (error) {
    next(error);
  }
});


router.get('/get-ridehistory', async (req, res, next) => {
  // console.log(req.query)
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.pageSize) || 3;
    const searchQuery =req.query.searchQuery || '';
    const sortField = req.query.sortField || 'datetime'; // Default sort field is 'name'
    const sortOrder =req.query.sortOrder || 'asc';
    const paymentFilter = req.query.paymentFilter || '';
    const statusFilter = req.query.statusFilter || '';
    const vehicleTypeFilter = req.query.vehicleTypeFilter || '';
    const fromFilter = req.query.fromFilter || '';
    const toFilter = req.query.toFilter || '';
    const startDateFilter = req.query.startDateFilter || '';
    const endDateFilter= req.query.endDateFilter || '';
    const startDateTime = startDateFilter ? moment(startDateFilter).format('DD-MMM-YYYY hh:mm A') : null;
    const endDateTime = endDateFilter ? moment(endDateFilter).format('DD-MMM-YYYY hh:mm A') : null;
  
    let sortOptions = {};
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1; 
    const searchRegex = new RegExp(searchQuery, 'i');
    const skip = (page - 1) * limit;
    const matchStage = {
      $or: [
        { from: searchRegex },
        { to: searchRegex },
        { estimatePrice: searchRegex }
      ],
      datetime: startDateTime && endDateTime ? { $gte: startDateTime, $lte: endDateTime } : { $exists: true },
      assigned:{$in:[7,8]},
      paymentOption: { $regex: paymentFilter, $options: 'i' },
      vehicleType: { $regex: vehicleTypeFilter, $options: 'i' },
      from: { $regex: fromFilter, $options: 'i' },
      to: { $regex: toFilter, $options: 'i' }
  
    };
  
    if (statusFilter !== '') {
      const assignedFilter = parseInt(statusFilter);
      matchStage.assigned = assignedFilter;
    }
  
    if (searchQuery !== '') {
      matchStage.$or.push({ assigned: searchRegex });
    }
    const data = await CreateRide.aggregate([
      {
        $lookup: {
          from: 'cities',
          foreignField: '_id',
          localField: 'cityId',
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
          localField: 'vehicleTypeId',
          as: 'vehicletypedata'
        }
      },
      {
        $unwind: '$vehicletypedata'
      },
      {
        $lookup: {
          from: 'users',
          foreignField: '_id',
          localField: 'userId',
          as: 'userdata'
        }
      },
      {
        $unwind: '$userdata'
      },
      {
        $lookup: {
          from: 'driverlists',
          foreignField: '_id',
          localField: 'driverId',
          as: 'driverdata'
        }
      },
      {
        $unwind: {
        path: '$driverdata',
        preserveNullAndEmptyArrays:true
      }
      }
      ,
  {
    $match: matchStage
  },
  {
    $facet: {
      paginatedResults: [
        { $sort: sortOptions },
        { $skip: skip },
        { $limit: limit }
      ],
      totalCount: [
        { $count: 'count' }
      ]
    }
  } 
  ])
  
  const metadata = data[0].totalCount[0];
  const totalDocuments = metadata ? metadata.count : 0;
  const totalPages = Math.ceil(totalDocuments / limit);
  const driverridedata = data[0].paginatedResults;
  // console.log(driverridedata)
      res.status(200).json({
        message: 'CreateRide retrieved successfully!',
        driverridedata,
        totalPages,page

      });
      //  sendmessage();
    } catch (error) {
      next(error);
    }
  });


  router.get('/get-ridehistorywithoutpaginaton', async (req, res, next) => {
  // console.log(req.query)
  try {
    const matchStage = {
      assigned:{$in:[7,8]},
    };
    const driverridedata = await CreateRide.aggregate([
      {
        $lookup: {
          from: 'cities',
          foreignField: '_id',
          localField: 'cityId',
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
          localField: 'vehicleTypeId',
          as: 'vehicletypedata'
        }
      },
      {
        $unwind: '$vehicletypedata'
      },
      {
        $lookup: {
          from: 'users',
          foreignField: '_id',
          localField: 'userId',
          as: 'userdata'
        }
      },
      {
        $unwind: '$userdata'
      },
      {
        $lookup: {
          from: 'driverlists',
          foreignField: '_id',
          localField: 'driverId',
          as: 'driverdata'
        }
      },
      {
        $unwind: {
        path: '$driverdata',
        preserveNullAndEmptyArrays:true
      }
      }
      ,
  {
    $match: matchStage
  }
  ])
  
  //  console.log(driverridedata,"driverridedataaaaaaaaaaaaaaaaaaaa")
      res.status(200).json({
        message: 'CreateRide retrieved successfully!',
        driverridedata,

      });
      //  sendmessage();
    } catch (error) {
      next(error);
    }
  });

// router.post('/add-ride', async (req, res, next) => {
//   try {
//     const rideData = req.body;
//     // console.log(rideData);
//     const newRide = new CreateRide(rideData);
//     const rideCreated = await newRide.save();
    
//     res.status(201).json({
//       message: 'Ride created successfully!',
//       rideCreated,
//   });
//   // sendmessage();
//   } catch (err) {
//       console.log(err);
//       res.status(400).json({
//           error: err,
//       });
//   }
// });

// router.get('/get-createride', async (req, res, next) => {
//   try {
//     const data = await CreateRide.aggregate([
      
//       {
//         $lookup: {
//           from: 'cities',
//           foreignField: '_id',
//           localField: 'cityId',
//           as: 'citydata'
//         }
//       },
//       {
//         $unwind: '$citydata'
//       },
//       {
//         $lookup: {
//           from: 'vehicletypes',
//           foreignField: '_id',
//           localField: 'vehicleTypeId',
//           as: 'vehicletypedata'
//         }
//       },
//       {
//         $unwind: '$vehicletypedata'
//       },
//       {
//         $lookup: {
//           from: 'users',
//           foreignField: '_id',
//           localField: 'userId',
//           as: 'userdata'
//         }
//       },
//       {
//         $unwind: '$userdata'
//       }, 
//       {
//         $lookup: {
//           from: 'driverlists',
//           foreignField: '_id',
//           localField: 'driverId',
//           as: 'driverdata'
//         }
//       },
//       {
//         $unwind: '$driverdata'
//       }
//     ])
   
//     // console.log(data);
//     // const data = await CreateRide.find();
//     res.status(200).json({
//       message: 'CreateRide retrieved successfully!',
//       createridedata: data,
//     });
//     //  sendmessage();
//   } catch (error) {
//     next(error);
//   }
// });
module.exports = router;

// const vapidKeys = {
//   publicKey: 'BLo5yAihTwpr_AeGvSCOKivWuqVA9gRxTAeickA1FXNkGbAShUoOfmZ5URUK3Ao0KKxpVYBABEdTkt4cktVxQ2U',
//   privateKey: 'C5XWKafVNAm_LwHRjt2Z42UvSPAKJZiaFH5z5Z8ohZI'
// };
// webpush.setVapidDetails(
//   'mailto:shilpa.elluminati@gmail.com',
//   vapidKeys.publicKey,
//   vapidKeys.privateKey
// );
// // Route to send a push notification to the admin when a driver is not found
// router.post('/api/send-notification', (req, res) => {
//   const notificationPayload = {
//     title: 'Driver Not Found',
//     body: 'A driver could not be assigned to the ride',
//     icon: 'path_to_icon',
//     data: {
//       rideId: req.body.rideId
//     }
//   };
//    // Retrieve the admin's subscription details from your database or wherever you saved it
//   // You can send the notification to multiple admins by iterating over their subscriptions
//   const adminSubscription = getAdminSubscription();

//   webpush.sendNotification(adminSubscription, JSON.stringify(notificationPayload))
//     .then(() => {
//       res.status(200).json({ message: 'Notification sent successfully' });
//     })
//     .catch(error => {
//       console.error('Error sending notification:', error);
//       res.status(500).json({ error: 'An error occurred while sending the notification' });
//     });
// });

