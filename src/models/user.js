const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  job: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value.length < 2) throw new Error("Invalid job.");
    },
  },
}, {collection : 'users_list'});

const User = mongoose.model("User", UserSchema);

//module.exports = User;
module.exports = User;

module.exports.addUser = async (user) => {
  try{
      const userToAdd = new User(user);
      const addedUser = await userToAdd.save();
      return addedUser;
  }catch(error) {
      console.log(error);
      return false;
  }   
}

module.exports.deleteUserById = async (id) => {
  try{
      if (await User.findByIdAndDelete(id))
          return true;
  }catch(error) {
      console.log(error);
      return false;
  }
}

module.exports. updateUser = async (id, updatedUser) => {
  try{
      const result = await User.findByIdAndUpdate(id, updatedUser, {runValidators: true});
      //Line below, if you don't want Mongoose to enforce schema constraints on updates. It's off by default.
      //const result = await User.findByIdAndUpdate(id, updatedUser); 
      if (result)
          return 204;
      else 
          return 404;
  }catch (error){
      console.log(error);
      return 500;
  }
}

module.exports.findUserById = async (id) => {
  try{
      return await User.findById(id);
  }catch(error) {
      console.log(error);
      return undefined;
  }
}

module.exports.findUserByName = async (name) => {
  return await User.find({'name':name});
}

module.exports.findUserByJob = async (job) => {
  return await User.find({'job':job});
}

module.exports.findUserByNameAndJob = async (name, job) => {
  return await User.find({'name':name, 'job': job});
}