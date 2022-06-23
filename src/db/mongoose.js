// File to build connection to the DB using mongoose
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL);
// mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api')
