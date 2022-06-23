const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth')

const router = express.Router();

//Endpoint to create a Task
router.post('/tasks', auth, async (req, res)=> {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try{
        await task.save()
        res.send(task);
    }
    catch(e){
        res.status(500).send(e);
    }
    // task.save()
    //     .then(()=>{
    //         res.status(201).send(task);
    //     })
    //     .catch((error)=>{
    //         res.status(500).send(error);
    //     })
})

//Get /tasks?completed=true
//Get /tasks?limit=10&skip=10
router.get("/tasks", auth, async (req, res)=> {

    const match = {}
    const sort = {}
    //If there is no query param completed, then match remains empty
    if(req.query.completed){
        //Setting completed to true if req.query.completed === 'true'
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1  
    }

    try{
        // const tasks = await Task.find({owner: req.user._id});
        await req.user.populate({
            path: 'tasks',
            //Match property is used for filtering
            match,
            //Options property is used for pagination
            options : {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        });
        res.send(req.user.tasks);
        // res.send(tasks);
    }
    catch(e){
        res.status(500).send(e);
    }

    // Task.find()
    //     .then((tasks)=> {
    //         res.send(tasks);
    //     })
    //     .catch((e)=>{
    //         res.status(404).send(e);
    //     })
})

router.get('/task/:id', auth, async (req, res)=>{
    const _id = req.params.id;

    try{
        // const task = await Task.findById(_id);

        //Limit the user to only find his own tasks
        const task = await Task.findOne({_id, owner: req.user._id});
        if(!task){
            return res.status(404).send();
        }
        else{
            res.send(task);
        }
       
    }
    catch(e){
        res.status(500).send(e);
    }

    // Task.findById(_id)
    //     .then((task)=> {
    //         if(!task){
    //             return res.status(404).send();
    //         }

    //         res.send(task);
    //     })
    //     .catch((e)=>{
    //         res.status(500).send(e);
    //     })
})


router.patch('/tasks/:id', auth,  async (req, res)=>{

    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];

    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    
    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid Update'});
    }
    
    try{

        // const task = await Task.findById(req.params.id);
        const task = await Task.findOne({_id : req.params.id, owner: req.user._id});
        
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        if(!task){
            return res.status(404).send()
        }

        updates.forEach((update)=> task[update] = req.body[update]);
        await task.save(); 

        res.send(task);
    }
    catch(e){
        res.status(500).send(e);
    }
})

router.delete('/tasks/:id',auth,  async (req, res)=>{

    try{
        //const task = await Task.findByIdAndDelete(req.params.id);
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    }
    catch(e){
        res.status(500).send(e);
    }
})



module.exports = router;