// const cron = require('node-cron');
const cron = require('cron');
let DriverList = require('./model/list.model')
let RunningRequest = require('./model/runningrequest.model')
let CreateRide = require('./model/createride.model')

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

    // socket.on('updateDriver', async (data) => {
    //   console.log(data,"dfghjkjhggfggf");
    //   try {
    //     const url = socket.request.headers.origin;
    //     let profileUrl = data.profile ? url + '/public/' + data.profile : url + '/public/'+  'profile1.png';
    //     const driverId = data.id;
    //     const updatedDriver = {
    //       name: data.name,
    //       email: data.email,
    //       phone: data.code + data.phone,
    //       profile: profileUrl,
    //       country_id: data.country_id,
    //       city_id: data.city_id,
    //     };
    //     const result = await DriverList.findByIdAndUpdate(driverId, updatedDriver, { new: true });
    //     socket.emit('driverUpdated', result);

    //     // socket.emit(200).json({
    //     //   message: 'Driver updated successfully!',
    //     //   driverUpdated: result,
    //     // });
    //   } catch (err) {
    //     console.log(err);
    //     socket.emit(500).json({
    //       error: err,
    //     });
    //   }
    // });

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
        // console.log(driverrideData);
        const newDriverRide = new CreateRide(driverrideData);
        newDriverRide.driverId = null
        newDriverRide.assigned = "pending"
        const driverrideCreated = await newDriverRide.save();
        // console.log(driverrideCreated, "sadfghjklljhgfdszcxvbnm");
        io.emit('driverRideCreated', {
          message: 'DriverRide created successfully!',
          driverrideCreated,
        });

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
        ])
        io.emit('driverRideData', driverridedata);
      } catch (err) {
        console.log(err);
        io.emit('addDriverRideError', { error: err });
      }
    });

    socket.on('getDriverRide', async () => {
      try {
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
        ])
        io.emit('driverRideData', driverridedata);

      } catch (error) {
        console.log(error);
        socket.emit('getDriverRideError', { error });
      }
    });

    socket.on('getDriverRideHistory', async (params) => {
      console.log(params);
      try {
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.pageSize) || 3;
        const searchQuery = params.searchQuery || '';
        const sortField = params.sortField || 'datetime'; // Default sort field is 'name'
        const sortOrder = params.sortOrder || 'asc';
        // const startDate = params.startDate || '';
        // const endDate= params.endDate || '';
        // const startDateTime = startDate ? new Date(startDate) : null;
        // const endDateTime = endDate ? new Date(endDate) : null;
        // console.log(startDateTime);
        // console.log(endDateTime);
    let sortOptions = {};
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    const searchRegex = new RegExp(searchQuery, 'i');
    const countPipeline = [
      {
        $match: {
          // $and: [
          //   { datetime: { $gte: startDateTime } },
          //   { datetime: { $lte: endDateTime } }
          // ],
          $or: [
            { from: searchRegex },
            { to: searchRegex },
            { assigned: searchRegex },
            { estimatePrice: searchRegex }
          ],
          assigned:{$in:["cancelled","completed"]}
        }
      },
      {
        $count: 'total'
      }
    ];

    const countResult = await CreateRide.aggregate(countPipeline);
    const count = countResult.length > 0 ? countResult[0].total : 0;
    //  const count = await DriverList.countDocuments({ $or: [{ from: searchRegex }, { to: searchRegex }, {assigned: searchRegex }],assigned:{$in:["cancelled","completed"]}});
    const totalPages = Math.ceil(count / limit);
    const skip = (page - 1) * limit;
    const pipeline = [
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
      $match: {
        $or: [
          { from: searchRegex },
          { to: searchRegex },
          { assigned: searchRegex },
          { estimatePrice: searchRegex },
        ],
        assigned:{$in:["cancelled","completed"]}
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
  ]
  const driverridedata = await CreateRide.aggregate(pipeline);
  // console.log(driverridedata);
       
        io.emit('driverRideHistoryData', driverridedata,totalPages,page);

      } catch (error) {
        console.log(error);
        socket.emit('getDriverRideHistoryError', { error });
      }
    });


    const job = new cron.CronJob('* * * * * *', async () => {
      // console.log('Cron job start');
      const pendingRides = await CreateRide.find({ assigned: 'assigning' }).exec();
      // console.log(pendingRides, "pendingrides");
      const currentTime = Date.now();
      // console.log(currentTime);
      const timeoutDuration = 20000; // 20 seconds
    
      // await Promise.all(pendingRides.map(async (ride) => {
        for (const ride of pendingRides) {
        const rideTime = ride.created;
        // console.log(rideTime);
        const elapsedTime = currentTime - rideTime;
        // console.log(elapsedTime, "elapsedtime");
    
        if (elapsedTime >= timeoutDuration) {
          // console.log("sdfdhgjerrt");
          const updatedDriverId = {
            driverId: null,
            assigned: 'timeout'
          };
          const result1 = await DriverList.findOneAndUpdate({ assign: '1' }, { assign: '0' }, { new: true });
          io.emit('driverUpdated', result1);
          const result = await CreateRide.findOneAndUpdate({ _id: ride._id }, updatedDriverId, { new: true });
          // console.log(result);
          io.emit('driverrideupdated', result);
        }
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
            preserveNullAndEmptyArrays: true
          }
        }
      ]);
      io.emit('driverRideData', driverridedata);
    });
    job.start()
    
    // const timeoutPromise = new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     reject(new Error('Timeout'));
    //   }, 20000);
    // });
    
    // Promise.race([job.start(), timeoutPromise])
    //   .catch((error) => {
    //     console.log('Job execution timed out:', error);
    //   });
    
    socket.on('updatenearestdriverride', async (data) => {
      try {
        const driverrideId = data.driverrideId;
        const driverdata = data.driverdata;
        let currentDriverIndex = 0;
        // console.log(driverdata);
        // const driverId = data.driverId;
    
        const assignDriverWithDelay = async (driver) => {
          const driverId = driver._id;
          const updatedDriverId = {
            driverId: driverId,
            assigned: data.assignedvalue,
            created: data.created,
          };
    
          const result1 = await DriverList.findByIdAndUpdate(driverId, { assign: "1" }, { new: true });
          io.emit('driverUpdated', result1);
    
          const result = await CreateRide.findByIdAndUpdate(driverrideId, updatedDriverId, { new: true });
          io.emit('driverrideupdated', result);

          currentDriverIndex++;
          // if (currentDriverIndex < driverdata.length) {
          //   const nextDriver = driverdata[currentDriverIndex];
          //   // setTimeout(() => assignDriverWithDelay(nextDriver), 20000); // Delay assignment by 20 seconds
          //   assignDriverWithDelay(nextDriver);
          // }

              // Schedule cron job to run every 20 seconds
          const job = new cron.CronJob('*/20 * * * * *', async () => {
              if (currentDriverIndex < driverdata.length) {
                const driver = driverdata[currentDriverIndex];
                assignDriverWithDelay(driver);
            }
          });
          job.start();
        };
    
        // Start the loop with the first driver
        if (driverdata.length > 0) {
          const firstDriver = driverdata[0];
          assignDriverWithDelay(firstDriver);
        }
    
          // const createdTime = new Date(data.created); // Convert created time to Date object
          // const currentTime = new Date(); // Get current time
          // const timeDifference = currentTime - createdTime; // Calculate time difference in milliseconds
          // const timeDifferenceInSec = timeDifference / 1000;
    
          // Rest of your code for time difference calculation
    
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
          ]);
          io.emit('driverRideData', driverridedata);
    
          
      
      } catch (err) {
        console.log(err);
        io.emit('updatenearestdriverrideError', { error: err });
      }
    });
    
    socket.on('updatedriverride', async (data) => {
      //  console.log(data);
      try {
        const driverrideId = data.driverrideId;
        const driverId = data.driverId;
        const updatedDriverId = {
          driverId: data.driverId,
          assigned: data.assignedvalue,
          created: data.created,
        }
        const result1 = await DriverList.findByIdAndUpdate(driverId, {assign: "1"}, { new: true });

        io.emit('driverUpdated', result1);
        const result = await CreateRide.findByIdAndUpdate(driverrideId, updatedDriverId, { new: true });
        
        // console.log(result);
        io.emit('driverrideupdated', result);

        const createdTime = new Date(data.created); // Convert created time to Date object
        const currentTime = new Date(); // Get current time
        const timeDifference = currentTime - createdTime; // Calculate time difference in milliseconds
        const timeDifferenceInSec= timeDifference / 1000; 
        

    // console.log('Time difference (in milliseconds):', timeDifferenceInSec);

        // if(data.driverId != null){
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
        ])
        io.emit('driverRideData', driverridedata);
      // }
      } catch (err) {
        console.log(err);
        io.emit('updatedriverrideError', { error: err });
      }
    });

    socket.on('acceptDriverRide', async (data) => {
        console.log(data);
      try {
        const driverrideId = data;
        console.log(driverrideId);
        // const driverId = data.driverId;
        // const updatedDriverId = {
        //   driverId: data.driverId,
        //   assigned: data.assignedvalue,
        //   created: data.created,
        // }
        // const result1 = await DriverList.findByIdAndUpdate(driverId, {assign: "1"}, { new: true });

        // io.emit('driverUpdated', result1);
        const result = await CreateRide.findByIdAndUpdate(driverrideId, {assigned:"Accepted"}, { new: true });
        
         console.log(result);
        io.emit('driverrideupdated', result);

        // if(data.driverId != null){
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
        ])
        io.emit('driverRideData', driverridedata);
      // }
      } catch (err) {
        console.log(err);
        io.emit('acceptDriverRideError', { error: err });
      }
    });

    socket.on('deleteDriverRide', async (driverrideId) => {
      try {
        const updatedDriverId = {
          driverId: null,
          assigned: 'rejected'
        };
    
        const result1 = await DriverList.findOneAndUpdate({ assign: '1' }, { assign: '0' }, { new: true });
          io.emit('driverUpdated', result1);
          console.log(result1);
          // const result = await CreateRide.findByIdAndUpdate(driverrideId, updatedDriverId, { new: true });
         const result = await CreateRide.findOneAndUpdate({ assigned: 'assigning' }, updatedDriverId, { new: true });
        io.emit('driverrideupdated', result);
        // console.log(result, "updated result");
        // console.log(result._id, "updated id");
    
        // if (!result) {
        //   io.emit('deleteDriverRideError', { message: 'Driver not found' });
        // } else {
        //   io.emit('driverRideDeleted', { message: 'Driver ride updated successfully' });
      // }
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
          ])
          io.emit('driverRideData', driverridedata);
      } catch (err) {
        console.log(err);
        io.emit('deleteDriverRideError', { error: err });
      }
    });

    socket.on('deleteConfirmRide', async (driverrideId) => {
      try {
        const updatedDriverId = {
          // driverId: null,
          assigned: 'cancelled'
        };
    
        // const result1 = await DriverList.findOneAndUpdate({ assign: '1' }, { assign: '0' }, { new: true });
        //   io.emit('driverUpdated', result1);
          // console.log(result1);
          const result = await CreateRide.findByIdAndUpdate(driverrideId, updatedDriverId, { new: true });
        //  const result = await CreateRide.findOneAndUpdate({ assigned: 'assigning' }, updatedDriverId, { new: true });
        io.emit('driverrideupdated', result);
        // console.log(result, "updated result");
        // console.log(result._id, "updated id");
    
        // if (!result) {
        //   io.emit('deleteDriverRideError', { message: 'Driver not found' });
        // } else {
        //   io.emit('driverRideDeleted', { message: 'Driver ride updated successfully' });
      // }
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
          ])
          io.emit('driverRideData', driverridedata);
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
