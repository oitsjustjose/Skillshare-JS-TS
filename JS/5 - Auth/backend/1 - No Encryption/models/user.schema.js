const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    username: String,
    password: String,
    notes: [{
        type: mongoose.Types.ObjectId
    }]
});

module.exports = mongoose.model('users', UserSchema, 'users');
