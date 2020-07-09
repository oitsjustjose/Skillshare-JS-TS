/* Load in the dotenv config. It'll tell us what it loads in!*/
const express = require('express');
const parsed = require('dotenv').config();
const cors = require('cors');
const bodyparser = require('body-parser');
const db = require('./database');
const Notes = require('./note.schema');

console.log('Parsed the following from the .env file: ' + Object.keys(parsed.parsed).join(', '));

const port = process.env.PORT || 3030;
const app = express();

app.use(bodyparser.json());
app.use(cors());

db.init();

app.post('/', (req, res) => {
    Notes.find().then((allNotes) => {
        res.json(allNotes);
    });
});

app.put('/', (req, res) => {
    try {
        const newNote = new Notes();
        newNote.name = req.body.name;
        newNote.body = req.body.note;

        newNote.save().then((note) => {
            res.json({ new: note });
        });
    } catch (ex) {
        console.error(ex);
        res.status(500).send({
            error: ex
        });
    }
});

app.delete('/', (req, res) => {
    Notes.findByIdAndDelete(req.body._id).then(() => {
        res.status(200).end();
    }).catch((ex) => {
        console.error(ex);
        res.status(500).send({
            error: ex
        });
    });
});

app.listen(port, () => {
    console.log('👍 server running on port ' + port.toString());
}).on('error', (err) => {
    console.error(err);
});