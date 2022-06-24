//Entry file
//Express and http endpoints
const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();

//Get port for heroku or get localhost port
const port = process.env.PORT;

// This function runs b/w the request comming to the server and 
// the router handler
// has access to same features as the route handler
// app.use((req, res, next)=>{
//     //console.log(req.method, req.path);
//     if(req.method === 'GET'){
//         res.send('GET requests are disabled');
//     }
//     else{
//         next();
//     }

//     //To execute router handler after this function
//     //next();
// })

//Parses incoming json to an object so we can access it in our http requests
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, ()=>{
    console.log("Server is running on port", + port);
})
