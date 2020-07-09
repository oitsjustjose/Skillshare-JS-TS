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

app.post('/', async (req, res) => {
    /* If our database is fast or slow we don't know, so the speed / time at which
        all notes can be fetched is highly variable. Since other server things need
        to happen at the same time as fetching from the database (such as other users
        also asking for data from the database), an async function says "work on this 
        when you can, and when you're done I'll continue".
    */
    try {
        const notes = await Notes.find();
        res.json(notes);
    } catch (ex) {
        console.error(ex);
        res.status(500).send({
            error: ex
        });
    }
});

app.put('/', async (req, res) => {
    try {
        const newNote = new Notes();
        newNote.name = req.body.name;
        newNote.body = req.body.note;

        /* Saving to the database may take 5 minutes, 5 milliseconds or a minute.
          Since we don't know *how* long it'll take, we call this "async" and we
          want to "await" for its completion
        */
        await newNote.save();

        res.json({ new: newNote });
    } catch (ex) {
        console.error(ex);
        res.status(500).send({
            error: ex
        });
    }
});

app.delete('/', async (req, res) => {
    try {
        await Notes.findByIdAndDelete(req.body._id);
        res.status(200).end();
    } catch (ex) {
        res.status(500).send({
            error: ex
        });
    }
});

app.listen(port, () => {
    console.log('👍 server running on port ' + port.toString());
}).on('error', (err) => {
    console.error(err);
});