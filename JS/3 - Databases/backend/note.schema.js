const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    name: String,
    postedOn: {
        type: Number,
        default: Date.now()
    }, /* We'll use UNIX Timestamps */
    body: String
});

module.exports = mongoose.model('notes', NoteSchema, 'notes');
