const jwt = require('jsonwebtoken');
const User = require('../models/user');


// This function runs b/w the request comming to the server and 
// the router handlers defined by us
// has access to same features as the route handler
const auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({_id: decoded._id, 'tokens.token': token});
        if(!user){
            throw new Error();
        }

        // token = the token used to authenticate
        // So that we only logout from one device only at a time
        req.token = token;


        req.user = user;

        next();
    }
    catch(e){
        res.status(500).send({error :"Please authenticate"});
    }
} 

module.exports = auth;