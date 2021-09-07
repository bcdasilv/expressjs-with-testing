const userModel = require('./user');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll( async () => {
    
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    const mongooseOpts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
 
    await mongoose.connect(uri, mongooseOpts);

});

afterAll( async () => {
    //mongoose.connection.close();
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();    
});

beforeEach(async () => {
    const dummyUser = {
        name : 'Chuck Norris',
        job : 'Highlander'
    };
    const result = new userModel(dummyUser);
    await result.save();
});

afterEach(async () => {
    await userModel.deleteMany();
});

test('Fetching all users', async () => {
    const users = await userModel.find();
    expect(users).toBeDefined();
    expect(users.length).toBeGreaterThan(0);
});

test('Fetching users by name', async () => {
    const dummyName = 'Chuck Norris';
    const users = await userModel.findUserByName(dummyName);
    expect(users).toBeDefined();
    expect(users.length).toBeGreaterThan(0);
    users.forEach(user => expect(user.name).toBe(dummyName));
});

test('Fetching users by job', async () => {
    const dummyJob = 'Highlander';
    const users = await userModel.findUserByJob(dummyJob);
    expect(users).toBeDefined();
    expect(users.length).toBeGreaterThan(0);
    users.forEach(user => expect(user.job).toBe(dummyJob));
});

test('Fetching by name and job', async () => {
    const dummyName = 'Chuck Norris';
    const dummyJob = 'Highlander';
    const users = await userModel.findUserByNameAndJob(dummyName, dummyJob);
    expect(users).toBeDefined();
    expect(users.length).toBeGreaterThan(0);
    users.forEach(user => (expect(user.name).toBe(dummyName) && expect(user.job).toBe(dummyJob)));
});

test('Fetching by invalid id', async () => {
    const anyId = '123';
    const user = await userModel.findUserById(anyId);
    expect(user).toBeUndefined();
});

test('Fetching by valid id and finding', async () => {
    const dummyUser = {
        name : 'Harry Potter',
        job : 'Young wizard'
    };
    const result = new userModel(dummyUser);
    const addedUser = await result.save();
    const foundUser = await userModel.findUserById(addedUser.id);
    expect(foundUser).toBeDefined();
    expect(foundUser.id).toBe(addedUser.id);
    expect(foundUser.name).toBe(addedUser.name);
    expect(foundUser.job).toBe(addedUser.job);
});

test('Fetching by valid id and not finding', async () => {
    const wellFormattedId = '6132b9d47cefd0cc1916b6a9';
    const foundUser = await userModel.findUserById(wellFormattedId);
    expect(foundUser).toBeNull();
});

test('Deleting a user by Id -- successful path', async () => {
    const dummyUser = {
        name : 'Harry Potter',
        job : 'Young wizard'
    };
    const result = new userModel(dummyUser);
    const addedUser = await result.save();
    const deleteResult = await userModel.deleteUserById(addedUser.id);
    expect(deleteResult).toBeTruthy();
});

test('Deleting a user by Id -- failure path', async () => {
    const dummyUserId = '6132b9d47cefd0cc1916b6a9';
    const deleteResult = await userModel.deleteUserById(dummyUserId);
    expect(deleteResult).toBeFalsy();
});

test('Deleting a user by Id -- failure path with invalid id', async () => {
    const dummyUserId = '123';
    const deleteResult = await userModel.deleteUserById(dummyUserId);
    expect(deleteResult).toBeFalsy();
});

test('Adding user -- successful path', async () => {
    const dummyUser = {
        name : 'Harry Potter',
        job : 'Young wizard'
    };
    const result = await userModel.addUser(dummyUser);
    expect(result).toBeTruthy();
    expect(result.name).toBe(dummyUser.name);
    expect(result.job).toBe(dummyUser.job);
    expect(result).toHaveProperty('_id');
});

test('Adding user -- failure path with invalid id', async () => {
    const dummyUser = {
        _id: '123',
        name : 'Harry Potter',
        job : 'Young wizard'
    };
    const result = await userModel.addUser(dummyUser);
    expect(result).toBeFalsy();
});

test('Adding user -- failure path with already taken id', async () => {
    const dummyUser = {
        name : 'Harry Potter',
        job : 'Young wizard'
    };
    const addedUser = await userModel.addUser(dummyUser);

    const anotherDummyUser = {
        _id : addedUser.id,
        name : 'Ron',
        job : 'Young wizard'
    };
    const result = await userModel.addUser(anotherDummyUser);
    expect(result).toBeFalsy();
});

test('Adding user -- failure path with invalid job length', async () => {
    const dummyUser = {
        name : 'Harry Potter',
        job : 'Y'
    };
    const result = await userModel.addUser(dummyUser);
    expect(result).toBeFalsy();
});

test('Adding user -- failure path with no job', async () => {
    const dummyUser = {
        name : 'Harry Potter'
    };
    const result = await userModel.addUser(dummyUser);
    expect(result).toBeFalsy();
});

test('Adding user -- failure path with no name', async () => {
    const dummyUser = {
        job : 'Young wizard'
    };
    const result = await userModel.addUser(dummyUser);
    expect(result).toBeFalsy();
});

test('Updating user -- successful path', async () => {
    const dummyUser = {
        name : 'Harry Potter',
        job : 'Young wizard'
    };
    const result = new userModel(dummyUser);
    const addedUser = await result.save();

    const update = {
        name: 'Harry P.'
    };

    const updateResult = await userModel.updateUser(addedUser.id, update);
    expect(updateResult).toBe(204);    
});

test('Updating user -- failure path with invalid name', async () => {
    const dummyUser = {
        name : 'Harry Potter',
        job : 'Young wizard'
    };
    const result = new userModel(dummyUser);
    const addedUser = await result.save();

    const update = {
        name: ''
    };

    const updateResult = await userModel.updateUser(addedUser.id, update);
    expect(updateResult).toBe(500);    
});

test('Updating user -- failure path with invalid job length', async () => {
    const dummyUser = {
        name : 'Harry Potter',
        job : 'Young wizard'
    };
    const result = new userModel(dummyUser);
    const addedUser = await result.save();

    const update = {
        job: 'Y'
    };

    const updateResult = await userModel.updateUser(addedUser.id, update);
    expect(updateResult).toBe(500);    
});

test('Updating user -- failure path with empty job', async () => {
    const dummyUser = {
        name : 'Harry Potter',
        job : 'Young wizard'
    };
    const result = new userModel(dummyUser);
    const addedUser = await result.save();

    const update = {
        job: ''
    };

    const updateResult = await userModel.updateUser(addedUser.id, update);
    expect(updateResult).toBe(500);    
});

test('Updating user -- failure path with invalid id', async () => {
    const update = {
        name: 'Harry P.'
    };

    const updateResult = await userModel.updateUser('123', update);
    expect(updateResult).toBe(500);    
});

test('Updating user -- sucessful path with not found id', async () => {
    const update = {
        name: 'Harry P.'
    };

    const dummyId = '6132b9d47cefd0cc1916b6a9';

    const updateResult = await userModel.updateUser(dummyId, update);
    expect(updateResult).toBe(404);    
});