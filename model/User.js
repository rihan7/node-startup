const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const user = new Schema({
   method: [String],
   local: {
      email: String,
      password: String
   },
   google: {
      email: String,
      id: String
   },
   facebook: {
      id: String,
      email: String
   }
});


user.pre('save', async function (next) {
   if (this.local.password) {
      this.local.password = await bcrypt.hash(this.local.password, 10);
      next();
   }
   next();
});


user.methods.verifyPassword = async function (givenPassword) {
   return await bcrypt.compare(givenPassword, this.local.password);
}

module.exports = mongoose.model('User', user);
