const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const user = new Schema({
   email: { type: String, required: true },
   password: { type: String, required: true }
});


user.pre('save', async function (next) {
   this.password = await bcrypt.hash(this.password, 10);
   next();
});


user.methods.verifyPassword = async function (givenPassword) {
   return await bcrypt.compare(givenPassword, this.password);
}

module.exports = mongoose.model('User', user);
