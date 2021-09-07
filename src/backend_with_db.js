const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const userModel = require("./models/user");

const app = express();
const port = 3000;

app.use(express.json());

mongoose.connect(
    "mongodb+srv://"+process.env.MONGO_USER+":"+process.env.MONGO_PWD+"@csc307.7ijdm.mongodb.net/"+process.env.MONGO_DB+"?retryWrites=true&w=majority",
    /* 'mongodb://localhost:27017/users', */
    {
      useNewUrlParser: true, //useFindAndModify: false,
      useUnifiedTopology: true
    }
  ).catch(error => console.log(error));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/users', async (req, res) => {
    //res.send(users); //HTTP code 200 is set by default. See an alternative below
    //res.status(200).send(users);
    const name = req.query['name'];
    const job = req.query['job'];
    if (name === undefined && job === undefined){
        try {
            const users_from_db = await userModel.find();
            res.send({users_list: users_from_db});
        } catch(error){
            console.log(error);
            res.status(500).send('An error ocurred in the server.');
        }
    }
    else if (name && job === undefined) {
        let result = await userModel.findUserByName(name);
        result = {users_list: result}
        res.send(result);        
    }
    else if (job && name === undefined){
        let result = await userModel.findUserByJob(job);
        result = {users_list: result}
        res.send(result);    
    }
    else {
        let result = await userModel.findUserByNameAndJob(name, job);
        result = {users_list: result}
        res.send(result);    
    }
});

app.get('/users/:id', async (req, res) => {
    const id = req.params['id'];
    let result = await userModel.findUserById(id);
    if (result === undefined || result === null)
        res.status(404).send('Resource not found.');
    else {
        result = {users_list: result};
        res.send(result);
    }
});

app.delete('/users/:id', async (req, res) => {
    const id = req.params['id'];
    if (userModel.deleteUserById(id))
        res.status(204).end();
    else
        res.status(404).send('Resource not found.');
});

app.post('/users', async (req, res) => {
    const user = req.body;
    const addedUser = await userModel.addUser(user);
    if (addedUser)
        res.status(201).end();
    else
        res.status(500).end();
});

app.patch('/users/:id', async (req, res) => {
    const id = req.params['id'];
    const updatedUser = req.body;
    const result = await userModel.updateUser(id, updatedUser);
    if (result === 204)
        res.status(204).end();
    else if (result === 404)
        res.status(404).send('Resource not found.');
    else if (result === 500)
       res.status(500).send('An error ocurred in the server.');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});