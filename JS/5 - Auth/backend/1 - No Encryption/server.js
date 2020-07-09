/* Load in the dotenv config. It'll tell us what it loads in!*/
const express = require('express');
const parsed = require('dotenv').config();
const cors = require('cors');
const bodyparser = require('body-parser');
const db = require('./database');
const Notes = require('./models/note.schema');
const Passport = require('./passport');
const ObjectId = require('mongoose').Types.ObjectId;

console.log('Parsed the following from the .env file: ' + Object.keys(parsed.parsed).join(', '));

const port = process.env.PORT || 3030;
const app = express();
const passport = Passport.init(app);

app.use(bodyparser.json());
app.use(cors());

db.init();

app.post('/', async (req, res) => {
    try {
        /* We only want users to see *their* notes, not just everyones' */
        if (req.isAuthenticated() && req.user) {
            const usersNotes = Array();

            /* We have to use this special syntax in an async context - forEach will not work */
            for (let noteId of req.user.notes) {
                const note = await Notes.findById(noteId);
                usersNotes.append(note);
            }
            res.json(userNotes);
        } else {
            res.status(401).end();
        }
    } catch (ex) {
        console.error(ex);
        res.status(500).send({
            error: ex
        });
    }
});

app.put('/', async (req, res) => {
    try {
        /* We only want registered users making notes :) */
        if (req.user && req.isAuthenticated()) {
            const newNote = new Notes();
            newNote.name = req.body.name;
            newNote.body = req.body.note;
            await newNote.save();

            req.user.notes.push(newNote._id);
            await req.user.save();

            res.json({ new: newNote });
        } else {
            res.status(401).end();
        }
    } catch (ex) {
        console.error(ex);
        res.status(500).send({
            error: ex
        });
    }
});

app.delete('/', async (req, res) => {
    try {
        if (req.user && req.isAuthenticated()) {
            if (req.user.notes.includes(ObjectId(req.body._id))) {
                await Notes.findByIdAndDelete(req.body._id);

                /* This time, we also want to remove the note from the user's list of notes */
                req.user.notes = req.user.notes.filter(noteId => noteId != ObjectId(req.body._id));
                await req.user.save();

                res.status(200).end();
            } else {
                res.status(401).end();
            }
        }
    } catch (ex) {
        res.status(500).send({
            error: ex
        });
    }
});

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login?error',
}), async (req, res) => {
    res.redirect('/');
});

app.listen(port, () => {
    console.log('👍 server running on port ' + port.toString());
}).on('error', (err) => {
    console.error(err);
});