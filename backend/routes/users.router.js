const express = require('express');
const router = express.Router();
const multer = require('multer')
const mongoose = require('mongoose');
require('dotenv').config();
// const stripe = require('stripe')('sk_test_51NObn2BQlJgbeIPVzCyHaca669BS3YrGmlGoSQNFIahLk6xyFc1pH5utU9GO9a78duDiyPxiCD95SneKT1Utj5oD006hxweLrL');
// const accountSid = 'ACb44d005c170946735f2e9a3280b96aab';
// const authToken = 'db965c28b6ab4012ad67085ed3571f03';

const stripe = require('stripe')(process.env.STRIPESECRETEKEY);
// const accountSid = process.env.TWILIOACCOUNTSID;
// const authToken = process.env.TWILIOAUTHTOKEN;
// const client = require('twilio')(accountSid, authToken);
const nodemailer = require('nodemailer');
// const transporter = nodemailer.createTransport({
//   host: 'smtp.ethereal.email',
//   // service: 'Gmail', 
//   auth: {
//     user: process.env.NODEMAILEREMAIL,
//     pass: process.env.NODEMAILERPASSWORD,
//   },
// });
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  //  service: 'Gmail', 
  auth: {
    user: process.env.NODEMAILEREMAIL,
    pass: process.env.NODEMAILERPASSWORD,
  },
});

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
//   var upload = multer({
//     storage: storage,
// }) 

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
let User = require('../model/users.model')

router.post('/create-intent/:userId', async (req, res) => {
  try {
    let customer;
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user.stripeCustomerId) {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
      });
      user.stripeCustomerId = customer.id;
      await user.save();
      // return res.status(400).json({ error: 'User does not have a Stripe customer ID' });
    }
    // else{
    //   customer = await stripe.customers.retrieve(user.stripeCustomerId);
    // }
    const intent = await stripe.setupIntents.create({
      customer: user.stripeCustomerId,
      automatic_payment_methods: {enabled: true},
    });
    // console.log(intent);
    res.json({client_secret: intent.client_secret});
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create intent' });
  }
  });

  router.get('/get-card/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: 'User does not have a Stripe customer ID' });
    }

    const customer = await stripe.customers.retrieve(user.stripeCustomerId);
    const defaultCardId = customer.invoice_settings.default_payment_method;
    // if (!defaultCardId) {
    //       const firstCardId = customer.sources.data[0].id;
    //       await stripe.customers.update(user.stripeCustomerId, {
    //       invoice_settings: {default_payment_method: firstCardId,},
    //       });
    //     }
    //  console.log(defaultCardId,"custtttttttttt");
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: 'card',
    });
    const paymentMethodsData = paymentMethods.data.map((card) => ({
      ...card,
      isDefault: card.id === defaultCardId,
    }));

    res.json(paymentMethodsData);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to retrieve card details' });
  }
});

router.delete('/delete-card/:cardId', async (req, res) => {
  try {
    const cardId = req.params.cardId;
    const deletedCard = await stripe.paymentMethods.detach(cardId);

    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to delete card' });
  }
});

router.patch('/default-card/:customerId', async (req, res) => {
  try {
    const cardId = req.body.cardId;
    const customerId = req.params.customerId;
    console.log(cardId,"cardidddddddddd");
     await stripe.customers.update(customerId, {
       invoice_settings: {
         default_payment_method: cardId
       }
     });
 
     res.status(200).json({ message: 'Default card set successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to set default card' });
  }
});

router.post('/cut-payment/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const amount = req.body.amount;
    const user = await User.findById(userId);
    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: 'User does not have a Stripe customer ID' });
    }
    const customer = await stripe.customers.retrieve(user.stripeCustomerId);
    const defaultCardId = customer.invoice_settings.default_payment_method;

    if (!defaultCardId) {
      return res.status(400).json({ error: 'User does not have a default payment method' });
    }
     const charge = await stripe.charges.create({
      amount: amount,
      currency: 'usd',
      customer: user.stripeCustomerId,
      payment_method: defaultCardId,
      off_session: true, // Set to true for off-session payments
      confirm: true, // Confirm the charge immediately
    });

    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amount,
    //   currency: 'usd', // Change to your desired currency
    //   payment_method: defaultCardId,
    //   confirm: true, // Confirm the payment intent immediately
    // });

    res.json({ message: 'Payment cut successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to cut payment' });
  }
});


router.post('/add-user', upload.single('profile'), async (req, res, next) => {
  try {
      const url = req.protocol + '://' + req.get('host');
      let profileUrl = req.file ? url + '/public/' + req.body.profile : url + '/public/' + 'profile1.png';
      const user = new User({
        // _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        phone: req.body.code + req.body.phone,
        profile:profileUrl,
    });
    const userCreated = await user.save();

    // Compose the email message
    const mailOptions = {
      from: 'ari.hartmann@ethereal.email',
      to: userCreated.email,
      subject: 'Welcome to the company',
      text: 'Dear User, welcome to our company!',
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
      message: 'User registered successfully!',
      userCreated,
  });
  //  sendmessage();
  } catch (error) {
      console.log(error);
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
});

router.get('/get-users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const searchQuery = req.query.searchQuery || '';
    const sortField = req.query.sortField || 'name'; // Default sort field is 'name'
    const sortOrder = req.query.sortOrder || 'desc';
    let sortOptions = {};
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    const searchRegex = new RegExp(searchQuery, 'i');

    const data = await User.aggregate([
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
        $facet: {
          metadata: [
            { $count: 'total' }
          ],
          users: [
            { $sort: sortOptions },
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ]
        }
      }
    ]);

    const metadata = data[0].metadata[0];
    const totalDocuments = metadata ? metadata.total : 0;
    const totalPages = Math.ceil(totalDocuments / limit);
    const users = data[0].users;

    res.status(200).json({
      message: 'Users retrieved successfully!',
      userdata: users,
      totalPages: totalPages,
      currentPage: page,
      totalDocuments: totalDocuments
    });
    // sendmessage();
  } catch (error) {
    next(error);
  }
});



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
    res.status(400).json({ error: err });
  }
});

router.put('/update-user', upload.single('profile'), async (req, res, next) => {
  try {
    const url = req.protocol + '://' + req.get('host');
    let profileUrl = req.file ? url + '/public/' + req.body.profile : url + '/public/' + 'profile1.png';
    const userId = req.body.id;
    const updatedUser = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.code + req.body.phone,
      profile: profileUrl
    };
    const result = await User.findByIdAndUpdate(userId, updatedUser, { new: true });
    res.status(200).json({
      message: 'User updated successfully!',
      UserUpdated: result,
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
});

module.exports = router;

// API endpoint to delete a card from a user's account
// router.delete('/cards/:userId/:cardId', async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const cardId = req.params.cardId;
//     const user = await User.findById(userId);
//     const customerId = user.stripeCustomerId;
//     await stripe.customers.deleteSource(customerId, cardId);

//     res.status(200).json({ message: 'Card deleted successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(400).json({ error: 'Failed to delete card' });
//   }
// });

// router.get('/get-users', async (req, res, next) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 3;
//     const searchQuery = req.query.searchQuery || '';
//     const sortField = req.query.sortField || 'name'; // Default sort field is 'name'
//     const sortOrder = req.query.sortOrder || 'asc'; 
//     let sortOptions = {};
//     sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

//     const searchRegex = new RegExp(searchQuery, 'i');
//     const count = await User.countDocuments({$or: [{ name: searchRegex },{ email: searchRegex },{ phone: searchRegex }]});
//     const totalPages = Math.ceil(count / limit);
//     const skip = (page - 1) * limit;

//     const data = await User.find({ $or: [{ name: searchRegex },{ email: searchRegex },{ phone: searchRegex }] })
//       // .sort({ name: 1 })
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(limit);

//     res.status(200).json({
//       message: 'Users retrieved successfully!',
//       userdata: data,
//       totalPages: totalPages,
//       currentPage: page,
//     });
//   } catch (error) {
//     next(error);
//   }
// });





// try {
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: 1099,
//     currency: 'usd',
//     automatic_payment_methods: {enabled: true},
//     customer: '{{CUSTOMER_ID}}',
//     payment_method: '{{PAYMENT_METHOD_ID}}',
//     off_session: true,
//     confirm: true,
//   });
// } catch (err) {
//   // Error code will be authentication_required if authentication is needed
//   console.log('Error code is: ', err.code);
//   const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(err.raw.payment_intent.id);
//   console.log('PI retrieved: ', paymentIntentRetrieved.id);
// }
// const ctrlUser = require('../controllers/user.controller');
// const passport = require('passport');
// const jwtHelper = require('../config/jwtHelper');

// const paymentMethods = await stripe.paymentMethods.list({
  //   customer: '{{CUSTOMER_ID}}',
  //   type: 'card',
  // });
  // router.post('/create-intent', async (req, res) => {
  //   const intent = await stripe.setupIntents.create({
  //     customer: customer.id,
  //     automatic_payment_methods: {enabled: true},
  //   });
  //   res.json({client_secret: intent.client_secret});
  // });
  // router.post('/payment-intent', async (req, res) => {
  //   try {
  //     const paymentIntent = await stripe.paymentIntents.create({
  //       amount: 1000, // amount in cents
  //       currency: 'usd',
  //     });
  
  //     res.json({ clientSecret: paymentIntent.client_secret });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ error: 'Failed to create payment intent' });
  //   }
  // });

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

