

const express = require('express');
const router = express.Router();
const multer = require('multer')
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// Create a transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  // service: 'Gmail', // e.g., 'Gmail', 'Outlook'
  auth: {
    user: 'ari.hartmann@ethereal.email',
    pass: 'mEgbgUtBfUpZkZVbmd',
  },
});



// const io = require('../app');
const DIR = './public/'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR)
  },
  filename: (req, file, cb) => {
    console.log(req.body);
    const fileName = file.originalname.toLowerCase().split(' ').join('-')
    req.body.profile = fileName;
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
    let profileUrl = req.file ? url + '/public/' + req.body.profile : url + '/public/' + 'profile1.png';
    console.log(req.body);
    const driver = new DriverList({
      // _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      email: req.body.email,
      phone: req.body.code + req.body.phone,
      profile: profileUrl,
      country_id: req.body.country_id,
      city_id: req.body.city_id,
      vehicletype_id: this.vehicletype_id,
      rideStatus: this.rideStatus,
      status: this.status
    });
    const driverCreated = await driver.save();

    // Compose the email message
    const mailOptions = {
      from: 'ari.hartmann@ethereal.email',
      to: driverCreated.email,
      subject: 'Welcome to the company',
      text: 'Dear driver, welcome to our company!',
      html:`< !DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Document</title>
              <style>
              body{margin-top:20px;
                background:#87CEFA;
                }
                
                .card-footer-btn {
                    display: flex;
                    align-items: center;
                    border-top-left-radius: 0!important;
                    border-top-right-radius: 0!important;
                }
                .text-uppercase-bold-sm {
                    text-transform: uppercase!important;
                    font-weight: 500!important;
                    letter-spacing: 2px!important;
                    font-size: .85rem!important;
                }
                .hover-lift-light {
                    transition: box-shadow .25s ease,transform .25s ease,color .25s ease,background-color .15s ease-in;
                }
                .justify-content-center {
                    justify-content: center!important;
                }
                .btn-group-lg>.btn, .btn-lg {
                    padding: 0.8rem 1.85rem;
                    font-size: 1.1rem;
                    border-radius: 0.3rem;
                }
                .btn-dark {
                    color: #fff;
                    background-color: #1e2e50;
                    border-color: #1e2e50;
                }
                
                .card {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    word-wrap: break-word;
                    background-color: #fff;
                    background-clip: border-box;
                    border: 1px solid rgba(30,46,80,.09);
                    border-radius: 0.25rem;
                    box-shadow: 0 20px 27px 0 rgb(0 0 0 / 5%);
                }
                
                .p-5 {
                    padding: 3rem!important;
                }
                .card-body {
                    flex: 1 1 auto;
                    padding: 1.5rem 1.5rem;
                }
                
                tbody, td, tfoot, th, thead, tr {
                    border-color: inherit;
                    border-style: solid;
                    border-width: 0;
                }
                
                .table td, .table th {
                    border-bottom: 0;
                    border-top: 1px solid #edf2f9;
                }
                .table>:not(caption)>*>* {
                    padding: 1rem 1rem;
                    background-color: var(--bs-table-bg);
                    border-bottom-width: 1px;
                    box-shadow: inset 0 0 0 9999px var(--bs-table-accent-bg);
                }
                .px-0 {
                    padding-right: 0!important;
                    padding-left: 0!important;
                }
                .table thead th, tbody td, tbody th {
                    vertical-align: middle;
                }
                tbody, td, tfoot, th, thead, tr {
                    border-color: inherit;
                    border-style: solid;
                    border-width: 0;
                }
                
                .mt-5 {
                    margin-top: 3rem!important;
                }
                
                .icon-circle[class*=text-] [fill]:not([fill=none]), .icon-circle[class*=text-] svg:not([fill=none]), .svg-icon[class*=text-] [fill]:not([fill=none]), .svg-icon[class*=text-] svg:not([fill=none]) {
                    fill: currentColor!important;
                }
                .svg-icon>svg {
                    width: 1.45rem;
                    height: 1.45rem;
                }
                </style>
            </head>
            <body>
            <div class="container mt-6 mb-7">
            <div class="row justify-content-center">
              <div class="col-lg-12 col-xl-7">
                <div class="card">
                  <div class="card-body p-5">
                    <h2>
                      Hey Anna,
                    </h2>
                    <p class="fs-sm">
                      This is the receipt for a payment of <strong>$312.00</strong> (USD) you made to Spacial Themes.
                    </p>
        
                    <div class="border-top border-gray-200 pt-4 mt-4">
                      <div class="row">
                        <div class="col-md-6">
                          <div class="text-muted mb-2">Payment No.</div>
                          <strong>#88305</strong>
                        </div>
                        <div class="col-md-6 text-md-end">
                          <div class="text-muted mb-2">Payment Date</div>
                          <strong>Feb/09/20</strong>
                        </div>
                      </div>
                    </div>
        
                    <div class="border-top border-gray-200 mt-4 py-4">
                      <div class="row">
                        <div class="col-md-6">
                          <div class="text-muted mb-2">Client</div>
                          <strong>
                            John McClane
                          </strong>
                          <p class="fs-sm">
                            989 5th Avenue, New York, 55832
                            <br>
                            <a href="#!" class="text-purple">john@email.com
                            </a>
                          </p>
                        </div>
                        <div class="col-md-6 text-md-end">
                          <div class="text-muted mb-2">Payment To</div>
                          <strong>
                            Themes LLC
                          </strong>
                          <p class="fs-sm">
                            9th Avenue, San Francisco 99383
                            <br>
                            <a href="#!" class="text-purple">themes@email.com
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
        
                    <table class="table border-bottom border-gray-200 mt-3">
                      <thead>
                        <tr>
                          <th scope="col" class="fs-sm text-dark text-uppercase-bold-sm px-0">Description</th>
                          <th scope="col" class="fs-sm text-dark text-uppercase-bold-sm text-end px-0">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td class="px-0">Theme customization</td>
                          <td class="text-end px-0">$60.00</td>
                        </tr>
                        <tr>
                          <td class="px-0">Website design</td>
                          <td class="text-end px-0">$80.00</td>
                        </tr>
                      </tbody>
                    </table>
        
                    <div class="mt-5">
                      <div class="d-flex justify-content-end">
                        <p class="text-muted me-3">Subtotal:</p>
                        <span>$390.00</span>
                      </div>
                      <div class="d-flex justify-content-end">
                        <p class="text-muted me-3">Discount:</p>
                        <span>-$40.00</span>
                      </div>
                      <div class="d-flex justify-content-end mt-3">
                        <h5 class="me-3">Total:</h5>
                        <h5 class="text-success">$399.99 USD</h5>
                      </div>
                    </div>
                  </div>
                  <a href="#!" class="btn btn-dark btn-lg card-footer-btn justify-content-center text-uppercase-bold-sm hover-lift-light">
                    <span class="svg-icon text-white me-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><title>ionicons-v5-g</title><path d="M336,208V113a80,80,0,0,0-160,0v95" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"></path><rect x="96" y="208" width="320" height="272" rx="48" ry="48" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"></rect></svg>
                    </span>
                    Pay Now
                  </a>
                </div>
              </div>
            </div>
          </div>
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


          res.status(201).json({
            message: 'Driver registered successfully!',
          driverCreated,
    });
  } catch (error) {
    if (error.keyPattern.email) {
      return res.status(409).send({
            success: false,
          message: "email already exist"
      })
    }
          if (error.keyPattern.phone) {
      return res.status(409).send({
            success: false,
          message: "phone no already exist"
      })
    }
          res.status(400).send(error);
  }
  // } catch (error) {
            //   console.log(error.message);
            //   res.status(500).json({
            //     error: error.message,
            //   });
            // }
          });


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
          let sortOptions = { };
          sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

          const searchRegex = new RegExp(searchQuery, 'i');
    // const count = await DriverList.countDocuments({$or: [{name: searchRegex }, {email: searchRegex }, {phone: searchRegex }] });
          // const totalPages = Math.ceil(count / limit);
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
          {
            $unwind: {
            path: '$vehicletypedata',
          preserveNullAndEmptyArrays: true
        }
      },
          {
            $match: {
            $or: [
          {name: searchRegex },
          {email: searchRegex },
          {phone: searchRegex }
          ]
        }
      },
          {
            $facet: {
            paginatedResults: [
          {$sort: sortOptions },
          {$skip: skip },
          {$limit: limit }
          ],
          totalCount: [
          {$count: 'count' }
          ]
        }
      }
      // ,
      // {
      //   $project: {
      //     data: '$paginatedResults',
      //     totalCount: {$arrayElemAt: ['$totalCount.count', 0] },
      //     totalPages: {$ceil: {$divide: [{$arrayElemAt: ['$totalCount.count', 0] }, limit] } }
      //   }
      // }
    ];
          const data = await DriverList.aggregate(pipeline);

          const metadata = data[0].totalCount[0];
          const totalDocuments = metadata ? metadata.count : 0;
          const totalPages = Math.ceil(totalDocuments / limit);
          const drivers = data[0].paginatedResults;
          // console.log('Data:', drivers);
          // console.log('Total Count:', totalDocuments);
          // console.log('Total Pages:', totalPages);
          res.status(200).json({
            message: 'Drivers retrieved successfully!',
          driverlistdata: drivers,
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
            //     const count = await DriverList.countDocuments({ $or: [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }] });
            //     const totalPages = Math.ceil(count / limit);
            //     const skip = (page - 1) * limit;
            //     const pipeline = [
            //       {
            //         $lookup: {
            //           from: 'countries',
            //           foreignField: '_id',
            //           localField: 'country_id',
            //           as: 'countrydata'
            //         }
            //       },
            //       {
            //         $unwind: '$countrydata'
            //       },
            //       {
            //         $lookup: {
            //           from: 'cities',
            //           foreignField: '_id',
            //           localField: 'city_id',
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
            //           localField: 'vehicletype_id',
            //           as: 'vehicletypedata'
            //         }
            //       },
            //       {
            //         $unwind: {
            //           path: '$vehicletypedata',
            //           preserveNullAndEmptyArrays: true
            //         }
            //       },
            //       {
            //         $match: {
            //           $or: [
            //             { name: searchRegex },
            //             { email: searchRegex },
            //             { phone: searchRegex }
            //           ]
            //         }
            //       },
            //       {
            //         $sort: sortOptions
            //       },
            //       {
            //         $skip: skip
            //       },
            //       {
            //         $limit: limit
            //       },
            //     ];
            //     const data = await DriverList.aggregate(pipeline);

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
                res.status(400).json({ error: err });
              }
            });
router.put('/update-driver', upload.single('profile'), async (req, res, next) => {
  try {
    const url = req.protocol + '://' + req.get('host');
          let profileUrl = req.file ? url + '/public/' + req.body.profile : url + '/public/' + 'profile1.png';
          const driverId = req.body.id;
          const updatedDriver = {
            name: req.body.name,
          email: req.body.email,
          phone: req.body.code + req.body.phone,
          profile: profileUrl,
          country_id: req.body.country_id,
          city_id: req.body.city_id,
      // type:req.body.type,
      //  status:req.body.status
    };
          const result = await DriverList.findByIdAndUpdate(driverId, updatedDriver, {new: true });
          // io.emit('driverUpdate', result);

          res.status(200).json({
            message: 'Driver updated successfully!',
          driverUpdated: result,
    });
  } catch (error) {
    if (error.keyPattern.email) {
      return res.status(409).send({
            success: false,
          message: "email already exist"
      })
    }
          if (error.keyPattern.phone) {
      return res.status(409).send({
            success: false,
          message: "phone no already exist"
      })
    }
          res.status(400).send(error);
  }
  // } catch (err) {
            //    console.log(err);
            //   res.status(500).json({
            //     error: err,
            //   });
            // }
          });

router.put('/update-status/:id', async (req, res) => {
  try {
    const driverId = req.params.id;
          // console.log(req.body);
          const updatedstatus = {
            status: req.body.driverstatus
    }
          const result = await DriverList.findByIdAndUpdate(driverId, updatedstatus, {new: true });
          // io.emit('driverUpdate', result);
          res.status(200).json({
            message: 'Driver status updated successfully!',
          driverStatusUpdated: result,

    });

  } catch (err) {
            console.log(err);
          res.status(400).json({
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
          const result = await DriverList.findByIdAndUpdate(driverId, updatedvehicetype, {new: true });
          res.status(200).json({
            message: 'Driver type updated successfully!',
          driverTypeUpdated: result,

    });

  } catch (err) {
            console.log(err);
          res.status(400).json({
            error: err,
    });
  }
});



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


// The error message suggests that Gmail requires an application-specific password instead of your account's regular password. This is likely because you have two-factor authentication enabled for your Gmail account. Here's how you can generate an application-specific password:

// Go to your Google Account settings.
// Navigate to the "Security" section.
// Look for the "App Passwords" option.
// Generate a new app password for Nodemailer.
// Replace the regular password in your code with the newly generated app password.
// Update your code with the app password:

// javascript
// Copy code
// const nodemailer = require('nodemailer');

// // Create a transporter
// const transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   auth: {
//     user: 'your_email@gmail.com',
//     pass: 'your_app_password',
//   },
// });
// Replace 'your_email@gmail.com' with your Gmail address and 'your_app_password' with the app password you generated.

// By using the application-specific password, you should be able to authenticate with Gmail successfully and send emails using Nodemailer.