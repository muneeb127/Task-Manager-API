// A dummy file to connect to DB
// Shows how to create models and send data to DB
// We broke this file into multiple components for actual use
// This is just for remembering purpose

const mongoose = require('mongoose');
const validator = require('validator');

mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api')

//Defining a model
const User = mongoose.model('User', {
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
    }
})

// //Creating an instance of a model
// const me = new User({
//     name: '      Saad ',
//     email: 'saad@gmail.com       ',
//     password: 'hello jee'
// })

// //Saving the model to DB
// me.save()
//     .then((result)=>{
//         console.log(result);
//     })
//     .catch((error)=>{
//         console.log(error);
//     })



const Task = mongoose.model('Task', {
    description:{
        type: String,
        trim: true,
        required: true
    },
    completed:{
        type: Boolean,
        default: false
    }
})

const task = new Task({
    description: '          Node Course',
    completed: true
})

task.save()
    .then((result)=>{
        console.log(result);
    })
    .catch((error)=>{
        console.log(error);
    })