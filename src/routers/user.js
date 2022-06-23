const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const auth = require('../middleware/auth');
const User = require('../models/user');

const router = new express.Router();

//End points - user
//Sign up route
//Public
router.post('/users', async (req, res)=>{
    const user = new User(req.body);
    try{
        await user.save();
        const token = await user.generateAuthToken();
        res.send({user, token});
    }
    catch(e){
        res.status(500).send(e);
    }
})

//login route
//Public
router.post('/users/login', async (req, res)=>{
    try{
        //findByCredentials is a self defind function
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        //res.send({user: user.getPublicProfile() , token});
        res.send({user , token});
    }
    catch(e){
        res.status(400).send(e);
    }
})

//Private routes
//Using auth middleware to protect the routes
router.get('/users/me', auth,  async (req, res)=>{

    //No need to fetch user as auth middleware is used 
    //User is already present in req.user

    res.send(req.user);
})

// Logout from single device
router.post('/users/logout', auth, async (req, res)=>{
    try{
        //updating the tokens array
        req.user.tokens = req.user.tokens.filter((token)=>{
            // Return true for all tokens accept the one used to login from this device
            // token.token = value of thhe token object in the tokens array
            return token.token !== req.token;
        })
        await req.user.save();

        res.send();
    }
    catch(e){
        res.status(500).send();
    }
})

// Logout from all device
router.post('/users/logoutAll', auth, async (req, res)=>{
    try{
        //updating the tokens array
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }
    catch(e){
        res.status(500).send();
    }
})


router.patch('/users/me', auth, async (req, res)=>{

    //To restrict editing a property which does not exist in DB
    
    // Converting object into an array of properties 
    const updates = Object.keys(req.body);

    //Things which are allowed to be updated
    const allowedUpdates = ['name', 'email', 'password', 'age'];  

    //every is called for every item in the array
    //Returns true when we always get true as the return value
    //Returns false when any one is false
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: "Invalid update"})
    }

    try{
        // const user = await User.findById(req.params.id);
        const user = req.user;
        updates.forEach((update)=>user[update] = req.body[update]);

        await user.save();
        //Avoiding this syntax in order for the User middleware functions to execute
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})
        res.send(user);
    }
    catch(e){
        res.status(500).send(e);
    }
})


router.delete('/users/me',auth, async (req, res)=>{

    try{
        const user = await User.findByIdAndDelete(req.user._id);
        if(!user){
            return res.status(404).send();
        }
        
        // await req.user.remove();

        res.send(user);
    }
    catch(e){
        res.status(500).send(e);
    }
})

const upload = multer({
    //if we remove dest from here, it will send the file info to our router handler
    //To store binary data in db instead of storing the file in the folder
    //dest: './avatars',
    limits:{
        fileSize: 1000000
    },
    fileFilter: function(req, file, cb){
        if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
            cb(new Error('Please upload an image file'))
        }

        cb(null, true);
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res)=> {

    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;
    
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    //This callback is used to handle errors in express
    res.status(400).send({error: error.message});
})

router.delete('/users/me/avatar', auth, async (req, res)=>{
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})

router.get('/users/:id/avatar', async (req, res)=>{
    try{
        const user = await User.findById(req.params.id);

        if(!user || !user.avatar){
            throw new Error();
        }

        res.contentType('image/png');
        res.send(user.avatar);
    }
    catch(e){
        res.status(404).send();
    }
})

module.exports = router;