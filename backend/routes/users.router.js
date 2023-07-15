const express = require('express');
const router = express.Router();
const multer = require('multer')
const mongoose = require('mongoose');
const stripe = require('stripe')('sk_test_51NObn2BQlJgbeIPVzCyHaca669BS3YrGmlGoSQNFIahLk6xyFc1pH5utU9GO9a78duDiyPxiCD95SneKT1Utj5oD006hxweLrL');
const accountSid = 'ACb44d005c170946735f2e9a3280b96aab';
const authToken = 'db965c28b6ab4012ad67085ed3571f03';
const client = require('twilio')(accountSid, authToken);



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

// router.post('/cards', async (req, res) => {
//   try {
//     const { paymentMethod } = req.body;

//     // Create a customer in Stripe
//     const customer = await stripe.customers.create();

//     // Attach the payment method to the customer
//     await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });

//     // Save the payment method details to your database
//     const card = {
//       cardName: paymentMethod.card.brand,
//       cardLastFour: paymentMethod.card.last4,
//       customerId: customer.id,
//     };

//     // Save the card details to your database
//     const savedCard = await Card.create(card);

//     // Return the saved card details
//     res.status(201).json(savedCard);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to save card' });
//   }
// });

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
    // console.log(userId,"sdfjkljhgfdfsdfj");
    const user = await User.findById(userId);
    if (!user.stripeCustomerId) {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
      });
      // Associate the Stripe customer ID with the user in your database
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
    // console.log(customer,"custtttttttttt");
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: 'card',
    });
    // console.log(paymentMethods,"paymentMethods");
    res.json(paymentMethods.data );
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to retrieve card details' });
  }
});

router.delete('/delete-card/:cardId', async (req, res) => {
  try {
    const cardId = req.params.cardId;

    // Delete the card using the Stripe API
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
  
     // Retrieve the customer from Stripe
    //  const customer = await stripe.customers.retrieve(customerId);

     // Set the default payment method for the customer
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

router.post('/add-user', upload.single('profile'), async (req, res, next) => {
  try {
      const url = req.protocol + '://' + req.get('host');
      let profileUrl = req.file ? url + '/public/' + req.body.profile : url + '/public/' + 'profile1.png';
      // console.log(req.body.code);
      const user = new User({
        // _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        phone: req.body.code + req.body.phone,
        profile:profileUrl,
    });
    const userCreated = await user.save();

    // Create a customer in Stripe
    // const customer = await stripe.customers.create({
    //   email: userCreated.email,
    //   name: userCreated.name,
    //   // Add any additional customer information here
    // });

    // // Associate the Stripe customer ID with the user in your database
    // userCreated.stripeCustomerId = customer.id;
    // await userCreated.save();
    res.status(201).json({
      message: 'User registered successfully!',
      userCreated,

  });
   
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
      // res.status(500).json({
      //     error: err,
      // });
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
    // console.log(err);
    // res.status(500).json({
    //   error: err,
    // });
  }
});



// API endpoint to delete a card from a user's account
router.delete('/cards/:userId/:cardId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const cardId = req.params.cardId;

    // Retrieve the user from the database
    const user = await User.findById(userId);

    // Retrieve the Stripe customer ID associated with the user
    const customerId = user.stripeCustomerId;

    // Delete the card from the customer in Stripe
    await stripe.customers.deleteSource(customerId, cardId);

    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to delete card' });
  }
});

module.exports = router;


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

