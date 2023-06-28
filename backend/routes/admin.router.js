const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Admin = require('../model/admin.model');
const bcrypt = require('bcryptjs');

router.post('/signup', async (req, res, next) => {
    // console.log(req.body)
    try {
        const admin = new Admin({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })
        const token = await admin.generateAuthToken();
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 30000),
            httpOnly: true
        })
        const admins = await admin.save();
        res.status(201).send(admins)
    } catch (e) {
        //res.status(400).send(e)
        if (e.code == 11000)
            res.status(422).send(['Duplicate email adrress found.']);
        else
            return next(e);
    }
})
router.post('/signin', async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
    
        const adminemail = await Admin.findOne({ email: email })
        const isMatch = await bcrypt.compare(password, adminemail.password)
        const token = await adminemail.generateAuthToken();
        res.cookie("jwt", token, {
            // expires:new Date(Date.now() + 30000),
            httpOnly: true
        })
        if (isMatch) {
            res.status(200).json({ "token": token });
        } else {
            res.send("password not match")
        }
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
});
// router.get('/userProfile',jwtHelper.verifyJwtToken, ctrlUser.userProfile);

module.exports = router;



 