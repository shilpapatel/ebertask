// const cron = require('node-cron');
const cron = require('cron');
let DriverList = require('./model/list.model')
let RunningRequest = require('./model/runningrequest.model')
let CreateRide = require('./model/createride.model')

const configureSocket = (io) => {
  let activeDrivers = [];
  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('driverStatusUpdate', async (data) => {
      console.log(data);
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

      console.log(updatedDriver);
        // console.log(result);

        io.emit('driverUpdate', updatedDriver);

      } catch (err) {
        console.log(err);
        io.emit('driverStatusUpdateError', { error: err });
      }
    });


    socket.on('updateDriverType', async (data) => {

      console.log(data, "adsfdgfhjkjyhrtgfdasdfghmnbv");
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

    // cron.schedule('*/20 * * * * *', () => {
    //   console.log("cron start");
    //   socket.setMaxListeners(100);
    // });

    // const job = new cron.CronJob('*/20 * * * * *', () => {
    //   console.log('Cron job start');
    // });
    // job.start();


    socket.on('addDriverRide', async (data) => {
      try {

        const driverrideData = data;
        // console.log(driverrideData);
        const newDriverRide = new CreateRide(driverrideData);
        newDriverRide.driverId = null
        newDriverRide.assigned = "pending"
        const driverrideCreated = await newDriverRide.save();
        console.log(driverrideCreated, "sadfghjklljhgfdszcxvbnm");
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

    const job = new cron.CronJob('*/20 * * * * *', async () => {
      // console.log('Cron job start');
      const updatedDriverId = {
        driverId: null,
        assigned: 'timeout'
      };
  
      const result = await CreateRide.findOneAndUpdate({assigned: 'assigning'},updatedDriverId, { new: true });
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
    });
    job.start();

    socket.on('updatedriverride', async (data) => {
      console.log(data);
      try {
        const driverrideId = data.driverrideId;
        const updatedDriverId = {
          driverId: data.driverId,
          assigned: data.assignedvalue,
          created: data.created
        }
        const result = await CreateRide.findByIdAndUpdate(driverrideId, updatedDriverId, { new: true });

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
        io.emit('updatedriverrideError', { error: err });
      }
    });

    socket.on('deleteDriverRide', async (driverrideId) => {
      try {
        const updatedDriverId = {
          driverId: null,
          assigned: 'pending'
        };
    
        const result = await CreateRide.findByIdAndUpdate(driverrideId, updatedDriverId, { new: true });
        console.log(result, "updated result");
        console.log(result._id, "updated id");
    
        if (!result) {
          io.emit('deleteDriverRideError', { message: 'Driver not found' });
        } else {
          io.emit('driverRideDeleted', { message: 'Driver ride updated successfully' });
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
        }
      } catch (err) {
        console.log(err);
        io.emit('deleteDriverRideError', { error: err });
      }
    });

  

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });



};
module.exports = configureSocket;







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
