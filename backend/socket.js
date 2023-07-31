 const cron = require('node-cron');
// const cron = require('cron');
const moment = require('moment');
let DriverList = require('./model/list.model')
let RunningRequest = require('./model/runningrequest.model')
let CreateRide = require('./model/createride.model')
const { mongoose } = require('mongoose')
let User = require('./model/users.model')
const twilio = require('twilio')
require('dotenv').config();
const Settings = require('./model/settings.model');
async function getSettingData() {
  const setting = await Settings.find()
  twilioacoountsid = setting[0].twilioacoountsid;
  twilioauthtoken = setting[0].twilioauthtoken;
  requesttime = setting[0].requesttime;
  stripesecretkey = setting[0].stripesecretkey;
}

getSettingData();
// const stripe = require('stripe')('sk_test_51NObn2BQlJgbeIPVzCyHaca669BS3YrGmlGoSQNFIahLk6xyFc1pH5utU9GO9a78duDiyPxiCD95SneKT1Utj5oD006hxweLrL');
// const accountSid = 'ACb44d005c170946735f2e9a3280b96aab';
// const authToken = 'db965c28b6ab4012ad67085ed3571f03';
const stripe = require('stripe')(process.env.STRIPESECRETEKEY);
// const accountSid = process.env.TWILIOACCOUNTSID;
// const authToken = process.env.TWILIOAUTHTOKEN;
// const client = require('twilio')(accountSid, authToken);

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  // service: 'Gmail', 
  auth: {
    user: process.env.NODEMAILEREMAIL,
    pass: process.env.NODEMAILERPASSWORD,
  },
});

async function sendmessage(rideassigned) {
  // console.log(rideassigned);
  try {
    const client = twilio(twilioacoountsid, twilioauthtoken);
    const message = await client.messages.create({
      body: rideassigned == 4?'driver accepted request':(rideassigned == 6?'ride started':'ridecompleted'),
      from: '+18145262612',
      to: '+918733930293'
    });
    console.log(message.sid, 'message');
  } catch (error) {
    console.log('Error sending message:', error);
  }
}

const configureSocket = (io) => {
  let activeDrivers = [];
  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('updateDriverStatus', async (data) => {
      // console.log(data);
      try {
        const driverId = data.driverId;
        const updatedStatus = {
          status: data.driverStatus
        }
        const result = await DriverList.findByIdAndUpdate(driverId, updatedStatus, { new: true });
        if (result.status === 'Approved') {
          result.rideStatus = 'Online';
        } else if (result.status === 'Declined') {
          result.rideStatus = 'Offline';
        }
        const updatedDriver = await result.save(); // Save the updated driver object

      // console.log(updatedDriver);
        // console.log(result);

        io.emit('driverStatusUpdated', updatedDriver);

      } catch (err) {
        console.log(err);
        io.emit('updateDriverStatusError', { error: err });
      }
    });

    socket.on('updateDriverType', async (data) => {

      // console.log(data, "adsfdgfhjkjyhrtgfdasdfghmnbv");
      try {
        const driverId = data.driverId;
        const updatedVehicleType = {
          // vehicletype: data.driverType
          vehicletype_id: data.driverType
        }
        // console.log(updatedVehicleType);
        const result = await DriverList.findByIdAndUpdate(driverId, updatedVehicleType, { new: true });
        // console.log(result);
        io.emit('driverTypeUpdated', result);

      } catch (err) {
        console.log(err);
        io.emit('updateDriverTypeError', { error: err });
      }
    });

    socket.on('getDriversWithoutPage', async () => {
      try {
        const driversData = await DriverList.aggregate([
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
          {
            $unwind: '$vehicletypedata'
          },
          // {
          //   $project: {
          //     _id: 1,
          //     name: 1,
          //     email: 1,
          //     phone: 1,
          //     profile: 1,
          //     country: 1,
          //     city: 1,
          //     type: 1,
          //     status: 1,
          //     cityId: { $arrayElemAt: ['$citydata._id', 0] },
          //     vehicleTypeId: { $arrayElemAt: ['$vehicletypedata._id', 0] }
          //   }
          // }
        ]);
        io.emit('driversAllData', driversData);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("emitridefordriverdata", async (data) => {
      //  console.log(data);
      try {
        const city_id = new mongoose.Types.ObjectId(data.cityId);
        const vehicletype_id = new mongoose.Types.ObjectId(data.vehicletypeId);

        let pricingQuery = DriverList.aggregate([
          // {
          //   $match: {
          //     status: true,
          //     city_id: city_id,
          //     assignService: assignService,
          //   },
          // },
          {
            $lookup: {
              from: "countries",
              foreignField: "_id",
              localField: "country_id",
              as: "countrydata",
            },
          },
          {
            $unwind: "$countrydata",
          },
          {
            $lookup: {
              from: "cities",
              foreignField: "_id",
              localField: "city_id",
              as: "citydata",
            },
          },
          {
            $unwind: "$citydata",
          },
          {
            $lookup: {
              from: "vehicletypes",
              foreignField: "_id",
              localField: "vehicletype_id",
              as: "vehicletypedata",
            },
          },
          {
            $unwind: {
              path: "$vehicletypedata",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              status: "Approved",
              city_id: city_id,
              vehicletype_id: vehicletype_id,
              assign: "0",
            },
          },
        ]);

        const assigndriverdata = await pricingQuery.exec();

        // console.log(driver);

        // Emit the 'assigndriverdatadata' event with the driver data to the client
        io.emit("assigndriverdata", assigndriverdata );
      } catch (error) {
        console.error(error);
      }
    });

    socket.on('addDriverRide', async (data) => {
      try {

        const driverrideData = data;
        const newDriverRide = new CreateRide(driverrideData);
        newDriverRide.driverId = null
        // newDriverRide.assigned = "pending"
        newDriverRide.assigned = 0
        const driverrideCreated = await newDriverRide.save();
        io.emit('driverRideCreated', {
          message: 'DriverRide created successfully!',
          driverrideCreated,
        });
        io.emit('driverrideupdated', driverrideCreated);

      } catch (err) {
        console.log(err);
        io.emit('addDriverRideError', { error: err });
      }
    });

    socket.on('getDriverRide', async (params) => {
      // console.log(params);
      try {

        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.pageSize) || 5;
        const searchQuery = params.searchQuery || '';
        const sortField = params.sortField || 'datetime'; // Default sort field is 'name'
        const sortOrder = params.sortOrder || 'asc';
        const statusFilter = params.statusFilter || '';
        const vehicleTypeFilter = params.vehicleTypeFilter || '';
        const fromFilter = params.fromFilter || '';
        const toFilter = params.toFilter || '';
        const startDateFilter = params.startDateFilter || '';
        const endDateFilter= params.endDateFilter || '';
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
          assigned:{ $in:[0,1,2,3,9]},
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
          },
          {
            $match: matchStage
            // $match: {
            //   $or: [
            //         { from: searchRegex },
            //         { to: searchRegex },
            //         { assigned: searchRegex },
            //         { estimatePrice: searchRegex }
            //       ],
            //   datetime: startDateTime && endDateTime ? { $gte: startDateTime, $lte: endDateTime } : { $exists: true }, 
            //   assigned:{$in:[0,1,2,3],$regex: statusFilter, $options: 'i'},
            //   // assigned:{$in:["pending", "timeout", "rejected", "assigning"],$regex: statusFilter, $options: 'i'},
            //   vehicleType: { $regex: vehicleTypeFilter, $options: 'i' },
            //   from: { $regex: fromFilter, $options: 'i' },
            //   to: { $regex: toFilter, $options: 'i' }
            // }
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
    io.emit('driverRideData', driverridedata,totalPages,page);
      } catch (error) {
        console.log(error);
        socket.emit('getDriverRideError', { error });
      }
    });

    socket.on('getDriverRideRunning', async () => {
      try {
        const driverridedata = await CreateRide.aggregate([
          {
            $match: {
              assigned:{ $in:[1,4,5,6,9]}
              // assigned:"assigning"
            }
          },
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
        ])
        // console.log(driverridedata,"running");
        io.emit('driverRideRunningData', driverridedata);

      } catch (error) {
        console.log(error);
        socket.emit('getDriverRideRunningError', { error });
      }
    });

    socket.on('getDriverRideHistory', async (params) => {
      try {
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.pageSize) || 3;
        const searchQuery = params.searchQuery || '';
        const sortField = params.sortField || 'datetime'; // Default sort field is 'name'
        const sortOrder = params.sortOrder || 'asc';
        const paymentFilter = params.paymentFilter || '';
        const statusFilter = params.statusFilter || '';
        const vehicleTypeFilter = params.vehicleTypeFilter || '';
        const fromFilter = params.fromFilter || '';
        const toFilter = params.toFilter || '';
        const startDateFilter = params.startDateFilter || '';
        const endDateFilter= params.endDateFilter || '';
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
        // $match: {
        //   $or: [
        //         { from: searchRegex },
        //         { to: searchRegex },
        //         { assigned: searchRegex },
        //         { estimatePrice: searchRegex }
        //       ],
        //   datetime: startDateTime && endDateTime ? { $gte: startDateTime, $lte: endDateTime } : { $exists: true },  
        //   assigned:{$in:["cancelled","completed"],$regex: statusFilter, $options: 'i'},
        //   // assigned:{$in:["pending", "timeout", "rejected", "accepted", "assigning"],$regex: statusFilter, $options: 'i'},
        //   // assigned:{$in:["cancelled","completed"]},
        //   paymentOption: { $regex: paymentFilter, $options: 'i' },
        //   vehicleType: { $regex: vehicleTypeFilter, $options: 'i' },
        //   from: { $regex: fromFilter, $options: 'i' },
        //   to: { $regex: toFilter, $options: 'i' }
        // }
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
    io.emit('driverRideHistoryData', driverridedata,totalPages,page);
  } catch (error) {
        console.log(error);
        socket.emit('getDriverRideHistoryError', { error });
      }
    });

 cron.schedule('*/30 * * * * *', async () => {
  const ride = await CreateRide.find({$or:[{ assigned: 1},{assigned: 9}]});
  if (ride.length > 0) {
    for (const ridedata of ride) {
      if (ridedata.nearest == false) {
        const currentTime = new Date();
        const elapsedTimeInSeconds = Math.floor((currentTime.getTime() - ridedata.created) / 1000);
        if (elapsedTimeInSeconds >= requesttime) {
          const result1 = await DriverList.findByIdAndUpdate(ridedata.driverId, { assign: "0" }, { new: true });
          io.emit('driverUpdated', result1);
          const result = await CreateRide.findByIdAndUpdate(ridedata._id, { driverId: null, assigned: 2 }, { new: true });
          io.emit('driverrideupdated', result);
        }
      }
      else {
        const currentTime = new Date();
        const elapsedTimeInSeconds = Math.floor((currentTime.getTime() - ridedata.created) / 1000);
        if (elapsedTimeInSeconds >= 30) {
          const city_id = new mongoose.Types.ObjectId(ridedata.cityId);
          const vehicle_id = new mongoose.Types.ObjectId(ridedata.vehicleTypeId);
          const assigneddrivers = [...new Set(ridedata.assigneddrivers)];
          let availdriverlist = DriverList.aggregate([
            {
              $match: {
                status: "Approved",
                city_id: city_id,
                vehicletype_id: vehicle_id,
                assign: "0",
                _id: { $nin: assigneddrivers }
              },
            },
          ]);

          const pendingdriver = await availdriverlist.exec();
          if (pendingdriver.length > 0) {
            const randomIndex = Math.floor(Math.random() * pendingdriver.length);
            const randomDriver = pendingdriver[randomIndex];
            const driver = await DriverList.findByIdAndUpdate(randomDriver._id, { assign: "1" }, { new: true });
            const driverdata = await DriverList.findByIdAndUpdate(ridedata.driverId, { assign: "0" }, { new: true });

            const result = await CreateRide.findByIdAndUpdate(ridedata._id, { $addToSet: { assigneddrivers: randomDriver._id }, created: Date.now(), driverId: randomDriver._id ,assigned:1}, { new: true });
            io.emit('driverUpdated', driverdata, driver);
            io.emit('driverrideupdated', result);
          }
          else {
            const city_id = new mongoose.Types.ObjectId(ridedata.cityId);
            const vehicle_id = new mongoose.Types.ObjectId(ridedata.vehicleTypeId);
            let assigndriverlist = DriverList.aggregate([
              {
                $match: {
                  status: "Approved",
                  city_id: city_id,
                  vehicletype_id: vehicle_id,
                  assign: "1",
                  _id: { $nin: assigneddrivers }
                },
              },
            ]);
            const assigndriver = await assigndriverlist.exec();
            // console.log(assigndriver);
            if (assigndriver.length > 0) {
              const result1 = await DriverList.findByIdAndUpdate(ridedata.driverId, { assign: "0" }, { new: true });
              io.emit('driverUpdated', result1);
              const result = await CreateRide.findByIdAndUpdate(ridedata._id, { assigned: 9, driverId: null, created: Date.now(), }, { new: true });
              io.emit('driverrideupdated', result);
            }else {
                const driverdata = await DriverList.findByIdAndUpdate(ridedata.driverId, { assign: "0" }, { new: true });
                const result = await CreateRide.findByIdAndUpdate(ridedata._id, { created: Date.now(), assigneddrivers: [], nearest: false, assigned: 2, driverId: null }, { new: true });
                io.emit('driverUpdated', driverdata);
                io.emit('driverrideupdated', result);
              }
          }
        }
      }
    }
  }
})
    // // // console.log('here');
    // cron.schedule('*/30 * * * * *', async () => {
    //   const ride = await CreateRide.find({ assigned: 1});
    //   if (ride.length > 0) {
    //     for (const ridedata of ride) {
    //       if (ridedata.nearest == false) {
    //         const currentTime = new Date();
    //         const elapsedTimeInSeconds = Math.floor((currentTime.getTime() - ridedata.created) / 1000);
    //         if (elapsedTimeInSeconds >= 10) {
    //           const result1 = await DriverList.findByIdAndUpdate(ridedata.driverId, { assign: "0" }, { new: true });
    //           io.emit('driverUpdated', result1);
    //           const result = await CreateRide.findByIdAndUpdate(ridedata._id, { driverId: null, assigned: 2 }, { new: true });
    //           io.emit('driverrideupdated', result);
    //         }
    //       }
    //       else {
    //         const currentTime = new Date();
    //         const elapsedTimeInSeconds = Math.floor((currentTime.getTime() - ridedata.created) / 1000);
    //         if (elapsedTimeInSeconds >= 10) {
    //           const city_id = new mongoose.Types.ObjectId(ridedata.cityId);
    //           const vehicle_id = new mongoose.Types.ObjectId(ridedata.vehicleTypeId);
    //           const assigneddrivers = [...new Set(ridedata.assigneddrivers)];
    //           let availdriverlist = DriverList.aggregate([
    //             {
    //               $match: {
    //                 status: "Approved",
    //                 city_id: city_id,
    //                 vehicletype_id: vehicle_id,
    //                 assign: "0",
    //                 _id: { $nin: assigneddrivers }
    //               },
    //             },
    //           ]);

    //           const pendingdriver = await availdriverlist.exec();
    //           if (pendingdriver.length > 0) {
    //             const randomIndex = Math.floor(Math.random() * pendingdriver.length);
    //             const randomDriver = pendingdriver[randomIndex];
    //             const driver = await DriverList.findByIdAndUpdate(randomDriver._id, { assign: "1" }, { new: true });
    //             const driverdata = await DriverList.findByIdAndUpdate(ridedata.driverId, { assign: "0" }, { new: true });

    //             const result = await CreateRide.findByIdAndUpdate(ridedata._id, { $addToSet: { assigneddrivers: randomDriver._id }, created: Date.now(), driverId: randomDriver._id }, { new: true });
    //             io.emit('driverUpdated', driverdata, driver);
    //             io.emit('driverrideupdated', result);
    //           }
    //           else {
    //             const driverdata = await DriverList.findByIdAndUpdate(ridedata.driverId, { assign: "0" }, { new: true });
    //             const result = await CreateRide.findByIdAndUpdate(ridedata._id, { created: Date.now(), assigneddrivers: [], nearest: false, assigned: 2, driverId: null }, { new: true });
    //             io.emit('driverUpdated', driverdata);
    //             io.emit('driverrideupdated', result);
    //           }
    //         }
    //       }
    //     }
    //   }
    // })

    socket.on('updatedriverride', async (data) => {
      // console.log(data);
      const _id = data.driverrideId;
      const driver_id = data.driverId;
      try {
        const driver = await DriverList.findByIdAndUpdate(driver_id, { assign: "1" }, { new: true });
        await driver.save();
        // console.log(driver);
        const ride = await CreateRide.findByIdAndUpdate(_id, { driverId: driver_id, assigned: 1,nearest: false, created: Date.now() }, { new: true })
        await ride.save()
        // console.log(ride);
        io.emit('driverUpdated', driver);
        io.emit('driverrideupdated', ride);
   
      } catch (error) {
        // console.log(error);
        socket.emit('updatedriverrideError', { error: err })
      }

    })

    socket.on("updatenearestdriverride", async (data) => {
      try {

        const cityId = new mongoose.Types.ObjectId(data.cityId);
        const vehicleTypeId = new mongoose.Types.ObjectId(data.vehicleTypeId);

        let availdriverlist = DriverList.aggregate([
          {
            $match: {
              status: "Approved",
              city_id: cityId,
              vehicletype_id: vehicleTypeId,
              assign: "0",
            },
          },
        ]);

        const driverdata = await availdriverlist.exec();
        const firstdriver = new mongoose.Types.ObjectId(driverdata[0]._id);
        const driver = await DriverList.findByIdAndUpdate(firstdriver._id, { assign: "1" }, { new: true });
        await driver.save();
         io.emit('driverUpdated', driver);
        const ride = await CreateRide.findByIdAndUpdate(data._id, { driverId: firstdriver._id, assigned: 1  ,  nearest: true, assigneddrivers: firstdriver._id, created: Date.now() }, { new: true })
        await ride.save()
        io.emit('driverrideupdated', ride);
      } catch (error) {
        console.error(error);
      }
    });

    socket.on('acceptDriverRide', async (data) => {
      try {
        // console.log(data,"daaaaaaaaaaaaaaaaaaaaaaa");
        const driverrideId = data.driverrideId;
        const driverId = data.driverId;
        // const driverrideId = data;   
        const result1 = await DriverList.findByIdAndUpdate(driverId, {assign: "2"}, { new: true });
        io.emit('driverUpdated', result1);

        const result = await CreateRide.findByIdAndUpdate(driverrideId, {assigned:4,driverId: data.driverId}, { new: true });
        io.emit('driverrideupdated', result);
        
        sendmessage(result.assigned)
      } catch (err) {
        console.log(err);
        io.emit('acceptDriverRideError', { error: err });
      }
    });

    socket.on('arriveDriverRide', async (data) => {
      try {
        const driverrideId = data.driverrideId;
        const driverId = data.driverId;
        // const driverrideId = data;   
        const result1 = await DriverList.findByIdAndUpdate(driverId, {assign: "2"}, { new: true });
        io.emit('driverUpdated', result1);
        // const result1 = await DriverList.findOneAndUpdate({ assign: '1' }, { assign: '0' }, { new: true });
        // io.emit('driverUpdated', result1);

        const result = await CreateRide.findByIdAndUpdate(driverrideId, { assigned: 5,driverId: data.driverId}, { new: true });
        io.emit('driverrideupdated', result);
      } catch (err) {
        console.log(err);
        io.emit('arriveDriverRideError', { error: err });
      }
    });
    
    socket.on('startDriverRide', async (data) => {
      try {
        const driverrideId = data.driverrideId;
        const driverId = data.driverId;
        // const driverrideId = data;   
        const result1 = await DriverList.findByIdAndUpdate(driverId, {assign: "2"}, { new: true });
        io.emit('driverUpdated', result1);
        // const result1 = await DriverList.findOneAndUpdate({ assign: '1' }, { assign: '0' }, { new: true });
        // io.emit('driverUpdated', result1);

        const result = await CreateRide.findByIdAndUpdate(driverrideId, { assigned: 6,driverId: data.driverId }, { new: true });
        io.emit('driverrideupdated', result);

        sendmessage(result.assigned)
      } catch (err) {
        console.log(err);
        io.emit('startDriverRideError', { error: err });
      }
    });
    
    socket.on('completeDriverRide', async (data) => {
      console.log(data);
      try {
        const driverrideId = data._id;
        const driverId = data.driverId;  
        const result1 = await DriverList.findByIdAndUpdate(driverId, {assign: "0"}, { new: true });
        io.emit('driverUpdated', result1);
        const result = await CreateRide.findByIdAndUpdate(driverrideId, { assigned: 7}, { new: true });
        io.emit('driverrideupdated', result);

        sendmessage(result.assigned)

        const exchangeRate = 75;
        const user = await User.findById(result.userId);
        if (!user.stripeCustomerId) {
          return res.status(400).json({ error: 'User does not have a Stripe customer ID' });
        }
        const customer = await stripe.customers.retrieve(user.stripeCustomerId);
        const defaultCardId = customer.invoice_settings.default_payment_method;
        
        const estimatePriceUSD = result.estimatePrice / exchangeRate;
        const amountInCents = Math.round(estimatePriceUSD * 100);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'usd', 
          customer: user.stripeCustomerId,
          payment_method: defaultCardId,
          off_session: true,
          confirm: true
        });

        //  const charge = await stripe.charges.create({
        //   amount: estimatePriceUSD,
        //   currency: 'usd', 
        //   customer: user.stripeCustomerId,
        //   payment_method: defaultCardId,
        //   off_session: true, 
        //   confirm: true, 
        // });

        const mailOptions = {
          from: 'ari.hartmann@ethereal.email',
          to: data.userdata.email,
          subject: 'Welcome to the company',
          text: 'Dear driver, welcome to our company!',
          html:`
          <html lang="en">
           <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <style>
              @import url(https://fonts.googleapis.com/css?family=Roboto:100,300,400,900,700,500,300,100);
              * {margin: 0; box-sizing: border-box;}
              body {background: #E0E0E0; font-family: 'Roboto', sans-serif; background-image: url(''); background-repeat: repeat-y; background-size: 100%;}
              ::selection {background: #f31544; color: #FFF;}
              ::moz-selection {background: #f31544; color: #FFF;}
              h1 {font-size: 1.5em; color: #222;}
              h2 {font-size: .9em}
              h2 {font-size: 1.2em; font-weight: 300; line-height: 2em;}
              p  {font-size: .7em; color: #666; line-height: 1.2em;}
              #invoiceholder {width: 100%; hieght: 100%; padding-top: 50px;}
              #headerimage {z-index: -1; position: relative; top: -50px; height: 350px;
                -webkit-box-shadow: inset 0 2px 4px rgba(0, 0, 0, .15), inset 0 -2px 4px rgba(0, 0, 0, .15);
                -moz-box-shadow: inset 0 2px 4px rgba(0, 0, 0, .15), inset 0 -2px 4px rgba(0, 0, 0, .15);
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, .15), inset 0 -2px 4px rgba(0, 0, 0, .15);
                overflow: hidden; background-attachment: fixed; background-size: 1920px 80%; background-position: 50% -90%;}
              #invoice {position: relative; top: -290px; margin: 0 auto; width: 700px; background: #FFF;}
              [id*='invoice-'] {border-bottom: 1px solid #EEE; padding: 30px;}
              #invoice-top {min-height: 120px;}
              #invoice-mid {min-height: 120px;}
              #invoice-bot {min-height: 250px;}
              .logo {float: left; height: 60px; width: 60px; background: url(http://michaeltruong.ca/images/logo1.png) no-repeat; background-size: 60px 60px;}
              .clientlogo {float: left; height: 60px; width: 60px; background: url(http://michaeltruong.ca/images/client.jpg) no-repeat; background-size: 60px 60px; border-radius: 50px;}
              .info {display: block; float: left; margin-left: 20px;}
              .title {float: right;}
              .title p {text-align: right;}
              #project {margin-left: 52%;}
              table {width: 100%; border-collapse: collapse;}
              td {padding: 5px 0 5px 15px; border: 1px solid #EEE}
              .tabletitle {padding: 5px; background: #EEE;}
    
            .service {
                border: 1px solid #EEE;
            }
    
            .item {
                width: 25%;
            }
            .Hours {
                width: 20%;
            }
            .Rate {
                width: 15%;
            }
            .subtotal{
                width: 25%;
            }
            /* .item {
                width: 50%;
            } */
            
            
    
            .itemtext {
                font-size: .9em;
            }
    
            #legalcopy {
                margin-top: 30px;
            }
    
            form {
                float: right;
                margin-top: 30px;
                text-align: right;
            }
    
    
            .effect2 {
                position: relative;
            }
    
            .effect2:before,
            .effect2:after {
                z-inId	RideId	Driver Name	From	To	VehicleType	TotalDistance	TotalTime	EstimatePrice	Ride Status	Action
                1	64be16431f5a6ef53c46e5af	null	Rajkot, Gujarat, India	Jamnagar, Gujarat, India	Suv	92.23 km	1 hr 46 minutes	1039	hold	￼Reject
                2	64be168b1f5a6ef53c4705ab	null	Rajkot, Gujarat, India	Mehsana bus terminus, Ashapuri Society, Sukheshwar Society, Mehsana, Gujarat, India	Suv	250.44 km	5 hr 16 minutes	2831	hold	￼Reject
                3	64be19cf1f5a6ef53c48ba84	ankit	Rajkot, Gujarat, India	Junagadh, Gujarat, India	Hatchback	102.86 km	2 hr 7 minutes	1166	Started	￼Complete￼Reject
                4	64bf477d0821d50943a9ad5a	null	Rajkot, Gujarat, India	Porbandar, Gujarat, India	Suv	180.44 km	3 hr 10 minutes	2005	hold	￼Reject
                dex: -1;
                position: absolute;
                content: "";
                bottom: 15px;
                left: 10px;
                width: 50%;
                top: 80%;
                max-width: 300px;
                background: #777;
                -webkit-box-shadow: 0 15px 10px #777;
                -moz-box-shadow: 0 15px 10px #777;
                box-shadow: 0 15px 10px #777;
                -webkit-transform: rotate(-3deg);
                -moz-transform: rotate(-3deg);
                -o-transform: rotate(-3deg);
                -ms-transform: rotate(-3deg);
                transform: rotate(-3deg);
            }
    
            .effect2:after {
                -webkit-transform: rotate(3deg);
                -moz-transform: rotate(3deg);
                -o-transform: rotate(3deg);
                -ms-transform: rotate(3deg);
                transform: rotate(3deg);
                right: 10px;
                left: auto;
            }
    
    
    
            .legal {
                width: 70%;
            }
        </style>
    </head>
    
    <body>
        <div id="invoiceholder">
    
            <div id="headerimage"></div>
            <div id="invoice" class="effect2">
    
                <div id="invoice-top">
                    <div class="logo"></div>
                    <div class="info">
                        <h2>Shilpa Patel</h2>
                        <p> shilpa@gmail.com </br>
                            9824457460
                        </p>
                    </div><!--End Info-->
                    <div class="title">
                        <h1>Invoice #1069</h1>
                        <!-- <p>Issued: May 27, 2015</br>
                            Payment Due: June 27, 2015
                        </p> -->
                    </div><!--End Title-->
                </div><!--End InvoiceTop-->
    
                <div id="invoice-mid">
    
                    <div class="clientlogo"></div>
                    <div class="info">
                        <h2>${data.userdata.name}</h2>
                        <p>${data.userdata.email}</br>
                        ${data.userdata.phone}</br>
                    </div>
    
                    <div id="project">
                        <h2>Ride Description</h2>
                        <p>This is the receipt for a payment of<span>$</span> ${estimatePriceUSD.toFixed(3)} you complete your ride.</p>
                    </div>
    
                </div><!--End Invoice Mid-->
    
                <div id="invoice-bot">
    
                    <div id="table">
                        <table>
                            <tr class="tabletitle">
                                <td class="item">
                                    <h2>From Location</h2>
                                </td>
                                <td class="item">
                                    <h2>To Location</h2>
                                </td>
                                <td class="Hours">
                                    <h2>Time</h2>
                                </td>
                                <td class="Rate">
                                    <h2>Distance</h2>
                                </td>
                                <td class="subtotal">
                                    <h2>Amount</h2>
                                </td>
                            </tr>
    
                            <tr class="service">
                                <td class="tableitem">
                                    <p class="itemtext">${data.from}</p>
                                </td>
                                <td class="tableitem">
                                    <p class="itempaymentIntenttext">${data.to}</p>
                                </td>
                                <td class="tableitem">
                                    <p class="itemtext">${data.totalTime}</p>
                                </td>
                                <td class="tableitem">
                                    <p class="itemtext">${data.totalDistance}</p>
                                </td>
                                <td class="tableitem">
                                    <p class="itemtext"><span>$</span>${estimatePriceUSD.toFixed(3)}</p>
                                </td>
                            </tr>
    
                            <tr class="tabletitle">
                                <td></td>
                                <td></td>
                                <td></td>
                                <td class="Rate">
                                    <h2>Total</h2>
                                </td>
                                <td class="payment">
                                    <h2><span>$</span>${estimatePriceUSD.toFixed(3)}</h2>
                                </td>
                            </tr>
    
                        </table>
                    </div><!--End Table-->
    
                    <!--  <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                        <input type="hidden" name="cmd" value="_s-xclick">
                        <input type="hidden" name="hosted_button_id" value="QRZ7QTM9XRPJ6">
                        <input type="image" src="http://michaeltruong.ca/images/paypal.png" border="0" name="submit"
                            alt="PayPal - The safer, easier way to pay online!">
                    </form>   -->
    
    
                    <div id="legalcopy">
                        <p class="legal"><strong>Thank you for your business!</strong>  Payment is expected within 31 days;
                            please process this invoice within that time. There will be a 5% interest charge per month on
                            late invoices.
                        </p>
                    </div>
    
                </div><!--End InvoiceBot-->
            </div><!--End Invoice-->
        </div><!-- End Invoice Holder-->
    </body>
    
    </html>`
    
        
        };
    
        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
                console.log('Error sending email:', error);
          } else {
                console.log('Email sent:', info.response);
          }
        });

      } catch (err) {
        console.log(err);
        io.emit('completeDriverRideError', { error: err });
      }
    });

    socket.on('deleteDriverRide', async (driverrideId) => {
      try {
        const ride = await CreateRide.findById(driverrideId)
        driverId = ride.driverId

        const result1 = await DriverList.findByIdAndUpdate(driverId, { assign: '0' }, { new: true });
        await result1.save()
        io.emit('driverUpdated', result1);

        if(ride.nearest == false){
        const result = await CreateRide.findByIdAndUpdate(ride._id, {
          driverId: null,
          assigned: 3,
          assigneddrivers:[]
        }, { new: true });
        io.emit('driverrideupdated', result);
        }
        else {
          let alldrivers = DriverList.aggregate([
            {
              $match: {
                status: "Approved",
                city_id: ride.cityId,
                vehicletype_id: ride.vehicleTypeId,
                assign: "0",
                _id: { $nin: ride.assigneddrivers }
              },
            },
          ]);

          const pendingdriver = await alldrivers.exec();
          if (pendingdriver.length > 0) {
            const result = await CreateRide.findByIdAndUpdate(ride._id, { $addToSet: { assigneddrivers: pendingdriver[0]._id }, driverId: pendingdriver[0]._id }, { new: true });
            io.emit('driverrideupdated', result);
          } else {

            let assigndriverlist = DriverList.aggregate([
              {
                $match: {
                  status: "Approved",
                  city_id: ride.cityId,
                  vehicletype_id: ride.vehicleTypeId,
                  assign: "1",
                  _id: { $nin: ride.assigneddrivers}
                },
              },
            ]);
            const assigndriver = await assigndriverlist.exec();
            // console.log(assigndriver);
            if (assigndriver.length > 0) {
              const result1 = await DriverList.findByIdAndUpdate(driverId, { assign: "0" }, { new: true });
              io.emit('driverUpdated', result1);
              const result = await CreateRide.findByIdAndUpdate(ride._id, { assigned: 9, driverId: null, created: Date.now(), }, { new: true });
              io.emit('driverrideupdated', result);
            } else {
              const result1 = await DriverList.findByIdAndUpdate(driverId, { assign: '0' }, { new: true });
              io.emit('driverUpdated', result1);
              const result = await CreateRide.findByIdAndUpdate(ride._id, { driverId: null, assigned: 3, assigneddrivers: [] }, { new: true });
              io.emit('driverrideupdated', result);
            }
          }
        }


      } catch (err) {
        console.log(err);
        io.emit('deleteDriverRideError', { error: err });
      }
    });

    socket.on('deleteConfirmRide', async (driverrideId) => {
      try {

        const result = await CreateRide.findByIdAndUpdate(driverrideId, { assigned: 8}, { new: true });
        io.emit('driverrideupdated', result);

      } catch (err) {
        console.log(err);
        io.emit('deleteConfirmRideError', { error: err });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

};
module.exports = configureSocket;





 // cron.schedule('*/30 * * * * *', async () => {
    //   const rides = await CreateRide.find({ assigned: 1 });
    
    //   for (const ride of rides) {
    //     if (ride.nearest === false ) {
    //       const currentTime = new Date();
    //       const elapsedTimeInSeconds = Math.floor((currentTime.getTime() - ride.created) / 1000);
    //       if(elapsedTimeInSeconds >= 10){
    //         const result1 = await DriverList.findByIdAndUpdate(ridedata.driverId, { assign: "0" }, { new: true });
    //         io.emit('driverUpdated', result1);
    //         const result = await CreateRide.findByIdAndUpdate(ridedata._id, { driverId: null, assigned: 2 }, { new: true });
    //         io.emit('driverrideupdated', result);
    //       }
         
    //     } else if (ride.nearest === true) {
    //       const currentTime = new Date();
    //       const elapsedTimeInSeconds = Math.floor((currentTime.getTime() - ride.created) / 1000);
    //       if (elapsedTimeInSeconds >= 10) {
    //         const city_id = new mongoose.Types.ObjectId(ride.cityId);
    //         const vehicle_id = new mongoose.Types.ObjectId(ride.vehicleTypeId);
    //         const assigneddrivers = [...new Set(ridedata.assigneddrivers)];
    //         const availdriverlist = await DriverList.aggregate([
    //           {
    //             $match: {
    //               status: "Approved",
    //               city_id: city_id,
    //               vehicletype_id: vehicle_id,
    //               assign: "0",
    //               _id: { $nin: assigneddrivers }
    //             },
    //           },
    //         ]).exec();

    //         if (availdriverlist.length > 0) {
    //           const randomIndex = Math.floor(Math.random() * availdriverlist.length);
    //           const randomDriver = availdriverlist[randomIndex];
    //           const driver = await DriverList.findByIdAndUpdate(randomDriver._id, { assign: "1" }, { new: true });
    //           const driverdata = await DriverList.findByIdAndUpdate(ride.driverId, { assign: "0" }, { new: true });

    //           const result = await CreateRide.findByIdAndUpdate(ride._id, { $addToSet: { assigneddrivers: randomDriver._id }, created: Date.now(), driverId: randomDriver._id }, { new: true });

    //           io.emit('driverUpdated', driverdata, driver);
    //           io.emit('driverrideupdated', result);
    //         } else {
    //           const driverdata = await DriverList.findByIdAndUpdate(ride.driverId, { assign: "0" }, { new: true });
    //           const result = await CreateRide.findByIdAndUpdate(ride._id, { created: Date.now(), assigneddrivers: [], nearest: false, assigned: 2, driverId: null }, { new: true });

    //           io.emit('driverUpdated', driverdata);
    //           io.emit('driverrideupdated', result);
    //         }
    //       }
    //     }
    //   }
    // });
    

// cron.schedule('* * * * * *', async () => {
//   // var date =new Date()
//   //  console.log(date);
  
//   const ride = await CreateRide.find({ assigned: 1 ,  nearest: false });
//   const ridenearestdata = await CreateRide.find({ assigned: 1 , nearest: true });

//   if (ride.length > 0) {
//     for (const data of ride) {
//       if (data.created) {
//         // if (data.nearest == false) {
//         const currentTime = new Date();
//         const elapsedTimeInSeconds = Math.floor((currentTime.getTime() - data.created) / 1000);
//         if (elapsedTimeInSeconds >= 10) {
//           const result1 = await DriverList.findByIdAndUpdate(data.driverId, { assign: "0" }, { new: true });
//           io.emit('driverUpdated', result1);
//           const result = await CreateRide.findByIdAndUpdate(data._id, { driverId: null, assigned: 2 }, { new: true });
//           io.emit('driverrideupdated', result);
//           // console.log('Cron job ended.');
//         }
//       }

//     }
//   }

//   if (ridenearestdata.length > 0) {
//     // console.log('hellooooooooo');
//     for (const data of ridenearestdata) {
//       const currentTime = new Date();
//       const elapsedTimeInSeconds = Math.floor((currentTime.getTime() - data.created) / 1000);
//       if (elapsedTimeInSeconds >= 10) {
//         const city_id = new mongoose.Types.ObjectId(data.cityId);
//         const vehicle_id = new mongoose.Types.ObjectId(data.vehicleTypeId);
//         const assigneddrivers = [...new Set(data.assigneddrivers)];
//         let alldrivers = DriverList.aggregate([
//           {
//             $match: {
//               status: "Approved",
//               city_id: city_id,
//               vehicletype_id: vehicle_id,
//               assign: "0",
//               _id: { $nin: assigneddrivers }
//             },
//           },
//         ]);

//         const pendingdriver = await alldrivers.exec();
//         if (pendingdriver.length > 0) {
//           const randomIndex = Math.floor(Math.random() * pendingdriver.length);
//           const randomObject = pendingdriver[randomIndex];
//           const driver = await DriverList.findByIdAndUpdate(randomObject._id, { assign: "1" }, { new: true });
//           const driverdata = await DriverList.findByIdAndUpdate(data.driverId, { assign: "0" }, { new: true });

//           const result = await CreateRide.findByIdAndUpdate(data._id, { $addToSet: { assigneddrivers: randomObject._id }, created: Date.now(), driverId: randomObject._id }, { new: true });
//           // console.log(result);
//           // io.emit('driverUpdated', driver );
//           io.emit('driverUpdated', driverdata, driver);
//           io.emit('driverrideupdated', result);
//         }
//         else {

//           const driverdata = await DriverList.findByIdAndUpdate(data.driverId, { assign: "0" }, { new: true });
//           const result = await CreateRide.findByIdAndUpdate(data._id, { created: Date.now(), assigneddrivers: [], nearest: false, assigned: 2, driverId: null }, { new: true });
//           io.emit('driverUpdated', driverdata);
//           io.emit('driverrideupdated', result);
//         }
//       }
//     }
//   }
  
// })
// job.stop()
