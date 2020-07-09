const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = mongoose.Schema({
    username: String,
    password: String,
    notes: [{
        type: mongoose.Types.ObjectId
    }]
});


UserSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

UserSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, String(this.password));
};

UserSchema.methods.changePassword = function (password, newPassword) {
    if (bcrypt.compareSync(password, this.password)) {
        this.password = newPassword;
    }
};

module.exports = mongoose.model('users', UserSchema, 'users');
