const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },
    age: {
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error('Age must be greater than 0');
            }
        }
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid');
            }
        }
    },
    password:{
        type: String,
        required: true,
        minLength: 6,
        trim: true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot contain "password"');
            }
        }
    },
    tokens: [{
        //sub documents
        token: {
            type: String,
            required: true
        }
    }],
    avatar:{
        type: Buffer
    }
}, {
    timestamps: true
})

// Defining a virtual property tasks
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

//Schema Statics are methods that can be invoked
// directly by a Model unlike Schema Methods,
// which need to be invoked by an instance of a
// Mongoose document

//Function to generate user auth token
// Not using arrow functions because we want to use this keyword inside
userSchema.methods.generateAuthToken = async function (){
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

// userSchema.methods.getPublicProfile = function (){
userSchema.methods.toJSON = function (){
    const user = this;

    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}

//Adding custom function to find user using email ID
userSchema.statics.findByCredentials = async (email, password)=>{
    const user = await User.findOne({email});

    if(!user){
        throw new Error('Login Failed!');
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if(!isMatched){
        throw new Error('Login Failed!');
    }

    return user;
};

// Using middleware to encrypt the password just 
// before saving or updating the user
userSchema.pre('save', async function(next){
    const user = this;

    //isModified checks if the password is modified
    //Works for both create and update
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }

    // console.log("Called before save!!!!")

    next();
})


//Middleware
//Delete user tasks when user is deleted
userSchema.pre('remove', async function(next){
    const user = this;
    await Task.deleteMany({owner: user_id});
    next();
})


// Defining a model
const User = mongoose.model('User', userSchema);


module.exports = User; 