// const cron = require('node-cron');
const cron = require('cron');
const moment = require('moment');
let DriverList = require('./model/list.model')
let RunningRequest = require('./model/runningrequest.model')
let CreateRide = require('./model/createride.model')
const { mongoose } = require('mongoose')
let User = require('./model/users.model')
const stripe = require('stripe')('sk_test_51NObn2BQlJgbeIPVzCyHaca669BS3YrGmlGoSQNFIahLk6xyFc1pH5utU9GO9a78duDiyPxiCD95SneKT1Utj5oD006hxweLrL');

    // cron.schedule('*/20 * * * * *', () => {
    //   console.log("cron start");
    //   socket.setMaxListeners(100);
    // });

    // const job = new cron.CronJob('*/20 * * * * *', () => {
    //   console.log('Cron job start');
    // });
    // job.start();


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
          assigned:{ $in:[0,1,2,3]},
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
              assigned:{ $in:[1,4,5,6]}
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

    // const job = new cron.CronJob('* * * * * *', async () => {
    //   // console.log('Cron job start');
    //   const pendingRides = await CreateRide.find({ assigned: 1 }).exec();
    //   // console.log(pendingRides,"pendingggggggggggggggg");
    //   const currentTime = Date.now();
    //   const timeoutDuration = 20000; // 20 seconds

    //     for (const ride of pendingRides) {
    //     const rideTime = ride.created;
    //     const elapsedTime = currentTime - rideTime;

    //     if (elapsedTime >= timeoutDuration) {
    //       const updatedDriverId = {
    //         driverId: null,
    //         assigned: 2
    //       };
    //       const result1 = await DriverList.findOneAndUpdate({ assign: '1' }, { assign: '0' }, { new: true });
    //       io.emit('driverUpdated', result1);
          
    //       const result = await CreateRide.findOneAndUpdate({ _id: ride._id }, updatedDriverId, { new: true });
    //       io.emit('driverrideupdated', result);
    //     }
    //   };

    // });
    // job.start()

    // const job = cron.schedule('     ', async () => {


    //   const ride = await createrideModel.find({ assigned: "assigning", nearest: false });
    //   const ridenearestdata = await createrideModel.find({ assigned: "assigning", nearest: true });
    //   if (ride.length > 0) {
    //     console.log("hellodfvgbhnjmkmn");
    //     for (const data of ride) {
    //       if (data.created) {
    //         job.start();
    //         console.log('Cron job started.');
    //         const currentTime = new Date();
    //         // console.log(currentTime.getTime());
    //         const elapsedTimeInSeconds = Math.floor((currentTime.getTime() - data.created) / 1000);
    //         console.log(elapsedTimeInSeconds);
    //         if (elapsedTimeInSeconds >= 10) {
    //           const result1 = await driverModel.findByIdAndUpdate(data.driver_id, { assign: "0" }, { new: true });
    //           io.emit('riderejected', result1);


    //           const result = await createrideModel.findByIdAndUpdate(data._id, { driver_id: null, assigned: "pending" }, { new: true });
    //           io.emit('riderejected', result);
    //           console.log('Cron job ended.');

    //         } else {
    //           console.log("hello");
    //         }
    //       }
    //     }
    //   }
    //   if (ridenearestdata.length > 0) {
    //     console.log("nearestdata");
    //     for (const data of ridenearestdata) {
    //       const currentTime = new Date();
    //       // console.log(data.created);
    //       // console.log(currentTime.getTime());
    //       const elapsedTimeInSeconds = Math.floor((currentTime.getTime() - data.created) / 1000);
    //       console.log(elapsedTimeInSeconds);
    //       if (elapsedTimeInSeconds >= 10) {
    //         console.log("hello");
    //         const city_id = new mongoose.Types.ObjectId(data.city_id);
    //         const vehicle_id = new mongoose.Types.ObjectId(data.vehicle_id);
    //         const assigneddrivers = [...new Set(data.assigndriverarray)];
    //         let alldrivers = driverModel.aggregate([
    //           {
    //             $match: {
    //               status: true,
    //               city_id: city_id,
    //               assignService: vehicle_id,
    //               assign: "0",
    //               _id: { $nin: assigneddrivers }
    //             },
    //           },
    //         ]);

    //         const pendingdriver = await alldrivers.exec();
    //         // console.log(pendingdriver.length);
    //         // const array = pendingdriver

    //         if (pendingdriver.length > 0) {
    //           const randomIndex = Math.floor(Math.random() * pendingdriver.length);
    //           const randomObject = pendingdriver[randomIndex];

    //           console.log(randomObject._id);
    //           const driver = await driverModel.findByIdAndUpdate(randomObject._id, { assign: "1" }, { new: true });

    //           const ride = await createrideModel.findByIdAndUpdate(data._id, { $addToSet: { assigndriverarray: randomObject._id }, created: Date.now() }, { new: true });
    //           // console.log(ride);
    //           io.emit('afterselectdriver' ,driver ,ride  )
    //         }
    //         else {
    //           console.log("pendingdrivers updatesssssssssssssssssssssssssssssssss ");
    //           const city_id = new mongoose.Types.ObjectId(data.city_id);
    //           const vehicle_id = new mongoose.Types.ObjectId(data.vehicle_id);
    //           const assigneddrivers = [...new Set(data.assigndriverarray)];
    //           let alldriversdatasdfghjkmnjhg = driverModel.aggregate([
    //             {
    //               $match: {
    //                 status: true,
    //                 city_id: city_id,
    //                 assignService: vehicle_id,
    //                 assign: "1",
    //               },
    //             },
    //           ]);

    //           const pendingdriverdfghjksdfghj = await alldriversdatasdfghjkmnjhg.exec();
    //           // console.log(pendingdriverdfghjksdfghj);
    //           for (const data of pendingdriverdfghjksdfghj) 
    //           { 
    //             const afterarraynulldriver = await driverModel.findByIdAndUpdate(data._id, { assign: "0" }, { new: true });
    //            }


    //           const afterarraynullride = await createrideModel.findByIdAndUpdate(data._id, { created: Date.now(), assigndriverarray: [], nearest: false, assigned: "pending", driver_id: null }, { new: true });

    //           io.emit('afternulldriverdata',  afterarraynulldriver ,  afterarraynullride )
    //         }
    //       }


    //     }
    //   }
    // })

    const job = new cron.CronJob('* * * * * *', async () => {
      // console.log('Cron job start');
      const pendingRides = await CreateRide.find({ assigned: 1 });
      //  console.log(pendingRides,"pendingggggggggggggggg");
      let currentTime;
      const timeoutDuration = 7000; // 20 seconds

        for (const ride of pendingRides) {

          if(ride.nearest == false){
            currentTime = Date.now();
            const rideTime = ride.created;
            const elapsedTime = currentTime - rideTime;
    
            if (elapsedTime >= timeoutDuration) {
              const updatedDriverId = {
                driverId: null,
                assigned: 2
              };
              const result1 = await DriverList.findOneAndUpdate({ assign: '1' }, { assign: '0' }, { new: true });
              io.emit('driverUpdated', result1);
              const result = await CreateRide.findOneAndUpdate({ _id: ride._id }, updatedDriverId, { new: true });
              io.emit('driverrideupdated', result);
            
            }
          }
          else{
            currentTime = Date.now();
            const rideTime = ride.created;
            const elapsedTime = currentTime - rideTime;
            if (elapsedTime >= timeoutDuration) {
                  const city_id = new mongoose.Types.ObjectId(ride.cityId);
                  const assignService = new mongoose.Types.ObjectId(ride.vehicleTypeId);
                  // const assigneddrivers = ride.assigneddrivers
                  const assigneddrivers = [...new Set(ride.assigneddrivers)];
                  let matchDrivers = await DriverList.aggregate([
                    {
                      $match: {
                        status: "Approved",
                        city_id: city_id,
                        vehicletype_id: assignService,
                        assign: "0",
                        _id: {$nin: assigneddrivers}
                      },
                    }
                  ]).exec();
                 
                  if (matchDrivers.length === 0){
                    console.log("true==============");
                    const updatedDriverId = {
                      driverId: null,
                      assigned: 2,
                      assigneddrivers: [],
                      nearest: false
                      // created:Date.now()
      
                    };
                    // const query = { assign: { $in: ride.assigneddrivers } };
                    // const result1 = await DriverList.find(query, { assign: '0' }, { new: true });
                    const result2 =  await DriverList.findByIdAndUpdate(ride.driverId, { assign: "0" }, { new: true });
                    io.emit('driverUpdated', result2);
                    // const result1 = await DriverList.updateMany({ _id: { $in: ride.assigneddrivers } },{ assign: "0" }, { new: true });
                    // io.emit('driverUpdated', result1);
                    
                    const result = await CreateRide.findOneAndUpdate({ _id: ride._id },updatedDriverId, { new: true });
                    io.emit('driverrideupdated', result);
                  }
                  else{
                    // console.log("false==============");
                    const randomIndex = Math.floor(Math.random() * matchDrivers.length);
                    // console.log(randomIndex);
                    const randomDriver = matchDrivers[randomIndex];
                    // console.log(randomDriver,"randomDriverrrrrrrrrr");
                    const updatedDriverId = {
                      driverId: randomDriver._id,
                      assigned: 1,
                      // nearest:true,
                      created: Date.now(),
                      // $push: { assigneddrivers: randomDriver._id }
                    };
                    const result1 = await DriverList.findByIdAndUpdate(randomDriver._id, { assign: "1" }, { new: true });
                    io.emit('driverUpdated', result1);
                    // console.log('ppppppppppppppppppppp');
                    const result2 =  await DriverList.findByIdAndUpdate(ride.driverId, { assign: "0" }, { new: true });
                    io.emit('driverUpdated', result2);
                    const result = await CreateRide.findByIdAndUpdate(ride._id ,{ $addToSet: { assigneddrivers: randomDriver._id }, $set: updatedDriverId }, { new: true });
                    io.emit('driverrideupdated', result);
                  } 
                }  
          }
        
      };

    });
    job.start()


    socket.on('updatenearestdriverride', async (data) => {
      try {
        const driverrideId = data.driverrideId;
        const driverdata = data.driverdata;
        const driverId = new mongoose.Types.ObjectId(driverdata[0]._id);
        // console.log(driverdata,"driverdataaaaaaaaa");
        // let currentDriverIndex = 0;
        // const assignDriverWithDelay = async (driver) => {
        // const driverId = driver._id;
        const updatedDriverId = {
            driverId: driverId,
            assigned: 1,
            nearest:true,
            created: Date.now(),
            // $push: { assigneddrivers: driverId}
          };
    
          const result1 = await DriverList.findByIdAndUpdate(driverId, { assign: "1" }, { new: true });
          io.emit('driverUpdated', result1);
          // const result2 =  await DriverList.findByIdAndUpdate(ride.driverId, { assign: "0" }, { new: true });
          // io.emit('driverUpdated', result2);
    
          const result = await CreateRide.findByIdAndUpdate(driverrideId, { $addToSet: { assigneddrivers: driverId }, $set: updatedDriverId }, { new: true });
         console.log(driverId,"iddddddddddddddd");
          io.emit('driverrideupdated', result);
          

      } catch (err) {
        console.log(err);
        io.emit('updatenearestdriverrideError', { error: err });
      }
    });

    // socket.on("assignnearestdriverdata", async (data) => {
    //   console.log(data);
    //   try {
    //     const city_id = new mongoose.Types.ObjectId(data.cityId);
    //     const assignService = new mongoose.Types.ObjectId(data.assignService);

    //     let assignnearestdriverdata = driverModel.aggregate([
    //       {
    //         $match: {
    //           status: true,
    //           city_id: city_id,
    //           assignService: assignService,
    //           assign: "0"

    //         },
    //       },
    //     ]);

    //     const driverdata = await assignnearestdriverdata.exec();

    //     // console.log(driverdata);
    //     const firstdriver = driverdata[0]
    //     console.log(firstdriver._id);

    //     const driver = await driverModel.findByIdAndUpdate(firstdriver._id, { assign: "1" }, { new: true });
    //     await driver.save();
    //     // // console.log(driver);
    //     const ride = await createrideModel.findByIdAndUpdate(data._id, { driver_id: firstdriver._id, assigned: "assigning", nearest: true, assigndriverarray: firstdriver._id, created: Date.now() }, { new: true })
    //     await ride.save()


    //     // Emit the 'assigndriverdatadata' event with the driver data to the client
    //     io.emit("afterassignnearestdriverdata", { driverdata });
    //   } catch (error) {
    //     console.error(error);
    //   }
    // });

    socket.on('updatedriverride', async (data) => {
      try {
        const driverrideId = data.driverrideId;
        const driverId = data.driverId;
        const updatedDriverId = {
          driverId: data.driverId,
          assigned: 1,
          nearest:false,
          // assigned: data.assignedvalue,
          created: data.created,
        }
        const result1 = await DriverList.findByIdAndUpdate(driverId, {assign: "1"}, { new: true });
        io.emit('driverUpdated', result1);
        const result = await CreateRide.findByIdAndUpdate(driverrideId, updatedDriverId, { new: true });
        io.emit('driverrideupdated', result);

      } catch (err) {
        console.log(err);
        io.emit('updatedriverrideError', { error: err });
      }
    });

    socket.on('acceptDriverRide', async (data) => {
      try {
        // console.log(data,"daaaaaaaaaaaaaaaaaaaaaaa");
        const driverrideId = data.driverrideId;
        const driverId = data.driverId;
        // const driverrideId = data;   
        const result1 = await DriverList.findByIdAndUpdate(driverId, {assign: "1"}, { new: true });
        io.emit('driverUpdated', result1);

        const result = await CreateRide.findByIdAndUpdate(driverrideId, {assigned:4,driverId: data.driverId}, { new: true });
        io.emit('driverrideupdated', result);
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
        const result1 = await DriverList.findByIdAndUpdate(driverId, {assign: "1"}, { new: true });
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
        const result1 = await DriverList.findByIdAndUpdate(driverId, {assign: "1"}, { new: true });
        io.emit('driverUpdated', result1);
        // const result1 = await DriverList.findOneAndUpdate({ assign: '1' }, { assign: '0' }, { new: true });
        // io.emit('driverUpdated', result1);

        const result = await CreateRide.findByIdAndUpdate(driverrideId, { assigned: 6,driverId: data.driverId }, { new: true });
        io.emit('driverrideupdated', result);
      } catch (err) {
        console.log(err);
        io.emit('startDriverRideError', { error: err });
      }
    });
    
    socket.on('completeDriverRide', async (data) => {
      
      try {
        const driverrideId = data.driverrideId;
        const driverId = data.driverId;
        
        // const driverrideId = data;   
        const result1 = await DriverList.findByIdAndUpdate(driverId, {assign: "0"}, { new: true });
        io.emit('driverUpdated', result1);
        // const result1 = await DriverList.findOneAndUpdate({ assign: '0' }, { assign: '1' }, { new: true });
        // io.emit('driverUpdated', result1);
        const result = await CreateRide.findByIdAndUpdate(driverrideId, { assigned: 7,driverId: null }, { new: true });
        io.emit('driverrideupdated', result);
        // console.log(result,"rideresult");

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

      } catch (err) {
        console.log(err);
        io.emit('completeDriverRideError', { error: err });
      }
    });

    socket.on('deleteDriverRide', async (driverrideId) => {
      try {
        const updatedDriverId = {
          driverId: null,
          assigned: 3
        };
        const result1 = await DriverList.findOneAndUpdate({ assign: '1' }, { assign: '0' }, { new: true });
          io.emit('driverUpdated', result1);

         const result = await CreateRide.findOneAndUpdate({ assigned: 1 }, updatedDriverId, { new: true });
        io.emit('driverrideupdated', result);
      } catch (err) {
        console.log(err);
        io.emit('deleteDriverRideError', { error: err });
      }
    });

    socket.on('deleteConfirmRide', async (driverrideId) => {
      try {
        const updatedDriverId = {
          // driverId: null,
          assigned: 8
        };
    
        // const result1 = await DriverList.findOneAndUpdate({ assign: '1' }, { assign: '0' }, { new: true });
        //   io.emit('driverUpdated', result1);
          // console.log(result1);
          const result = await CreateRide.findByIdAndUpdate(driverrideId, updatedDriverId, { new: true });
        //  const result = await CreateRide.findOneAndUpdate({ assigned: 'assigning' }, updatedDriverId, { new: true });
        io.emit('driverrideupdated', result);
        // if (!result) {
        //   io.emit('deleteDriverRideError', { message: 'Driver not found' });
        // } else {
        //   io.emit('driverRideDeleted', { message: 'Driver ride updated successfully' });
      // }
      
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


          // const driverridedata = await CreateRide.aggregate([
          //   {
          //     $match: {
          //       assigned: {
          //         $in: ["pending", "timeout", "rejected", "accepted", "assigning"]
          //       }
          //     }
          //   },
          //   {
          //     $lookup: {
          //       from: 'cities',
          //       foreignField: '_id',
          //       localField: 'cityId',
          //       as: 'citydata'
          //     }
          //   },
          //   {
          //     $unwind: '$citydata'
          //   },
          //   {
          //     $lookup: {
          //       from: 'vehicletypes',
          //       foreignField: '_id',
          //       localField: 'vehicleTypeId',
          //       as: 'vehicletypedata'
          //     }
          //   },
          //   {
          //     $unwind: '$vehicletypedata'
          //   },
          //   {
          //     $lookup: {
          //       from: 'users',
          //       foreignField: '_id',
          //       localField: 'userId',
          //       as: 'userdata'
          //     }
          //   },
          //   {
          //     $unwind: '$userdata'
          //   },
          //   {
          //     $lookup: {
          //       from: 'driverlists',
          //       foreignField: '_id',
          //       localField: 'driverId',
          //       as: 'driverdata'
          //     }
          //   },
          //   {
          //     $unwind: {
          //     path: '$driverdata',
          //     preserveNullAndEmptyArrays:true
          //   }
          // } 
          // ])
          // io.emit('driverRideData', driverridedata);

 // const job = new cron.CronJob('*/20 * * * * *', async () => {

    //   console.log('Cron job start');
    //     const pendingRides = await CreateRide.find({ assigned: 'assigning' }).exec();
    // console.log(pendingRides,"pendingrides");
    //     const currentTime = Date.now();
    //     const timeoutDuration = 20000; // 20 seconds
    
    //     pendingRides.forEach(async (ride) => {
    //       const rideTime = ride.created
    //       console.log(rideTime);
    //       const elapsedTime = currentTime - rideTime;
    //       console.log(elapsedTime,"elapsedtime");
    
    //       if (elapsedTime >= timeoutDuration) {
    //         const updatedDriverId = {
    //     driverId: null,
    //     assigned: 'timeout'
    //   };
    //         const result1 = await DriverList.findOneAndUpdate({assign: '1'},{assign: '0'}, { new: true });
    //         io.emit('driverUpdated', result1);
    //         const result = await CreateRide.findOneAndUpdate({assigned: 'assigning'},updatedDriverId, { new: true });
    //         console.log(result);
    //         io.emit('driverrideupdated', result);
    //       }
    //     });
    //   // console.log('Cron job start');
    //   // const updatedDriverId = {
    //   //   driverId: null,
    //   //   assigned: 'timeout'
    //   // };
    //   // const result1 = await DriverList.findOneAndUpdate({assign: '1'},{assign: '0'}, { new: true });
    //   // io.emit('driverUpdated', result1);
    //   // const result = await CreateRide.findOneAndUpdate({assigned: 'assigning'},updatedDriverId, { new: true });
    //   // // io.emit('driverrideupdated', result);
    //   const driverridedata = await CreateRide.aggregate([
    //     {
    //       $lookup: {
    //         from: 'cities',
    //         foreignField: '_id',
    //         localField: 'cityId',
    //         as: 'citydata'
    //       }
    //     },
    //     {
    //       $unwind: '$citydata'
    //     },
    //     {
    //       $lookup: {
    //         from: 'vehicletypes',
    //         foreignField: '_id',
    //         localField: 'vehicleTypeId',
    //         as: 'vehicletypedata'
    //       }
    //     },
    //     {
    //       $unwind: '$vehicletypedata'
    //     },
    //     {
    //       $lookup: {
    //         from: 'users',
    //         foreignField: '_id',
    //         localField: 'userId',
    //         as: 'userdata'
    //       }
    //     },
    //     {
    //       $unwind: '$userdata'
    //     },
    //     {
    //       $lookup: {
    //         from: 'driverlists',
    //         foreignField: '_id',
    //         localField: 'driverId',
    //         as: 'driverdata'
    //       }
    //     },
    //     {
    //       $unwind: {
    //       path: '$driverdata',
    //       preserveNullAndEmptyArrays:true
    //     }
    //   } 
    //   ])
    //   io.emit('driverRideData', driverridedata);
     
    // });
    // job.start();


 // console.log(result, "updated result");
      // console.log(result._id, "updated id");
    //   try {
    //     console.log('Cron job start');
    //     const pendingRides = await CreateRide.find({ assigned: 'pending' }).exec();
    // console.log(pendingRides,"pendingrides");
    //     const currentTime = Date.now();
    //     const timeoutDuration = 20000; // 20 seconds
    
    //     pendingRides.forEach(async (ride) => {
    //       const rideTime = ride.created
    //       const elapsedTime = currentTime - rideTime;
    
    //       if (elapsedTime >= timeoutDuration) {
    //         const timeoutResult = await CreateRide.findByIdAndUpdate(
    //           ride._id,
    //           { driverId: null, assigned: 'timeout' },
    //           { new: true }
    //         );
    //         console.log(timeoutResult);
    //         io.emit('driverridetimeout', timeoutResult);
    //       }
    //     });
    //   } catch (err) {
    //     console.log(err);
    //   }


    // socket.on('addDriverRide', async (data) => {
    //   try {
    //     const driverrideData = data;
    //     // console.log(driverrideData);
    //     const newDriverRide = new RunningRequest(driverrideData);
    //     const driverrideCreated = await newDriverRide.save();
    //     console.log(driverrideCreated,"sadfghjklljhgfdszcxvbnm");
    //     io.emit('driverRideCreated', {
    //       message: 'DriverRide created successfully!',
    //       driverrideCreated,
    //     });

    //     const updatedDriverrideData = await RunningRequest.find();
    //     io.emit('updateDriverRideData', updatedDriverrideData);

    //     // Emit timeout event after 20 seconds

    //     setTimeout( async() => {
    //       io.emit('timeout', driverrideCreated._id);
    //       const removedRide = await RunningRequest.findByIdAndRemove(driverrideCreated._id);
    //       const driverridedata = await RunningRequest.find();
    //       io.emit('driverRideData', driverridedata);
    //       if (removedRide) {
    //         // console.log('Timeout: Removed ride', removedRide);
    //         // io.emit('updateAssignedDriverName', driverrideCreated._id, 'Assign Driver');
    //         console.log(driverrideCreated._id,"driverrideCreatedid");

    //       } else {
    //         console.log('Timeout: Ride not found');
    //       }

    //     }, 10000);

    //   } catch (err) {
    //     console.log(err);
    //     io.emit('addDriverRideError', { error: err });
    //   }
    // });


 //   socket.on('getDriverRideHistory', async (params) => {
  //     console.log(params);
  //     try {
  //       const page = parseInt(params.page) || 1;
  //       const limit = parseInt(params.pageSize) || 3;
  //       const searchQuery = params.searchQuery || '';
  //       const sortField = params.sortField || 'datetime'; // Default sort field is 'name'
  //       const sortOrder = params.sortOrder || 'asc';

  //       const paymentFilter = params.paymentFilter || '';
  //       const vehicleTypeFilter = params.vehicleTypeFilter || '';
  //       const fromFilter = params.fromFilter || '';
  //       const toFilter = params.toFilter || '';
  //       // const startDate = params.startDate || '';
  //       // const endDate= params.endDate || '';
  //       // const startDateTime = startDate ? new Date(startDate) : null;
  //       // const endDateTime = endDate ? new Date(endDate) : null;
  //       // console.log(startDateTime);
  //       // console.log(endDateTime);
  //   let sortOptions = {};
  //   sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

  //   const searchRegex = new RegExp(searchQuery, 'i');
  //   const countPipeline = [
  //     {
  //       $match: {
  //         // $and: [
  //         //   { datetime: { $gte: startDateTime } },
  //         //   { datetime: { $lte: endDateTime } }
  //         // ],
  //         $or: [
  //           { from: searchRegex },
  //           { to: searchRegex },
  //           { assigned: searchRegex },
  //           { estimatePrice: searchRegex }
  //         ],
  //         assigned:{$in:["cancelled","completed"]},
  //         paymentOption: { $regex: paymentFilter, $options: 'i' },
  //         vehicleType: { $regex: vehicleTypeFilter, $options: 'i' },
  //         from: { $regex: fromFilter, $options: 'i' },
  //         to: { $regex: toFilter, $options: 'i' }
  //       }
  //     }
  //     // ,
  //     // {
  //     //   $count: 'total'
  //     // }
  //   ];

  //   const countResult = await CreateRide.aggregate(countPipeline);
  //   const count = countResult.length > 0 ? countResult[0].total : 0;
  //   //  const count = await DriverList.countDocuments({ $or: [{ from: searchRegex }, { to: searchRegex }, {assigned: searchRegex }],assigned:{$in:["cancelled","completed"]},paymentOption: { $regex: paymentFilter, $options: 'i' },
  //         //  vehicleType: { $regex: vehicleTypeFilter, $options: 'i' },
  //         //  from: { $regex: fromFilter, $options: 'i' },
  //         //  to: { $regex: toFilter, $options: 'i' }});
  //   console.log(count);
  //   const totalPages = Math.ceil(count / limit);
  //   const skip = (page - 1) * limit;
  //   const pipeline = [
  //     {
  //     $lookup: {
  //       from: 'cities',
  //       foreignField: '_id',
  //       localField: 'cityId',
  //       as: 'citydata'
  //     }
  //   },
  //   {
  //     $unwind: '$citydata'
  //   },
  //   {
  //     $lookup: {
  //       from: 'vehicletypes',
  //       foreignField: '_id',
  //       localField: 'vehicleTypeId',
  //       as: 'vehicletypedata'
  //     }
  //   },
  //   {
  //     $unwind: '$vehicletypedata'
  //   },
  //   {
  //     $lookup: {
  //       from: 'users',
  //       foreignField: '_id',
  //       localField: 'userId',
  //       as: 'userdata'
  //     }
  //   },
  //   {
  //     $unwind: '$userdata'
  //   },
  //   {
  //     $lookup: {
  //       from: 'driverlists',
  //       foreignField: '_id',
  //       localField: 'driverId',
  //       as: 'driverdata'
  //     }
  //   },
  //   {
  //     $unwind: {
  //     path: '$driverdata',
  //     preserveNullAndEmptyArrays:true
  //   }
  //   },
  //   {
  //     $match: {
  //       $or: [
  //         { from: searchRegex },
  //         { to: searchRegex },
  //         { assigned: searchRegex },
  //         { estimatePrice: searchRegex },
  //       ],
  //       assigned:{$in:["cancelled","completed"]},
  //       paymentOption: { $regex: paymentFilter, $options: 'i' },
  //         vehicleType: { $regex: vehicleTypeFilter, $options: 'i' },
  //         from: { $regex: fromFilter, $options: 'i' },
  //         to: { $regex: toFilter, $options: 'i' }
  //     }
  //   },
  //   {
  //     $sort: sortOptions
  //   },
  //   {
  //     $skip: skip
  //   },
  //   {
  //     $limit: limit
  //   }, 
  // ]
  // const driverridedata = await CreateRide.aggregate(pipeline);
  // // console.log(driverridedata);
       
  //       io.emit('driverRideHistoryData', driverridedata,totalPages,page);

  //     } catch (error) {
  //       console.log(error);
  //       socket.emit('getDriverRideHistoryError', { error });
  //     }
  //   });




// socket.on('getDriverRide', async () => {
    //   try {
    //     const driverridedata = await RunningRequest.find();
    //     socket.emit('driverRideData', driverridedata);

    //   } catch (error) {
    //     console.log(error);
    //     socket.emit('getDriverRideError', { error });
    //   }
    // });




    // socket.on('updateAssignedDriverName', (rideId, assignedDriverName) => {
    //   io.emit('assignedDriverNameUpdated', rideId, assignedDriverName);
    // });

  // socket.on('deleteDriverRide', async (driverrideId) => {
    //   try {
    //     const result = await CreateRide.findByIdAndDelete(driverrideId);
    //     console.log(result,"delete result");
    //     console.log(result._id,"deletedid");
    //     // io.emit('updateAssignedDriverName', result._id, 'Assign Driver');
    //     if (!result) {
    //       io.emit('deleteDriverRideError', { message: 'Driver not found' });
    //     } else {
    //       io.emit('driverRideDeleted', { message: 'Driver deleted successfully' });
    //       const driverridedata = await CreateRide.find();
    //       socket.emit('driverRideData', driverridedata);

    //     }
    //   } catch (err) {
    //     console.log(err);
    //     io.emit('deleteDriverRideError', { error: err });
    //   }
    // });


    // socket.on('updateAssignedDriverName', (data) => {
    //   try {
    //     const { rideId, driverName } = data;

    //     const ride = this.driverridedata.find((ride) => ride._id === rideId);
    //     if (ride) {
    //       ride.assignedDriverName = driverName;
    //     }
    //     io.emit('assignedDriverNameUpdate', { rideId, driverName });
    //   } catch (err) {
    //     console.log(err);
    //   }
    // });
