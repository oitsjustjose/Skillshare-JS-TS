const mongoose = require('mongoose');

const TokenSchema = mongoose.Schema({
    val: String,
    userid: mongoose.Types.ObjectId,
    createdOn: {
        type: Number,
        default: Date.now()
    }
});

module.exports = mongoose.model('tokens', TokenSchema, 'tokens');
