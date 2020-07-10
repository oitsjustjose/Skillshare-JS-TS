/* Load in the dotenv config. It'll tell us what it loads in!*/
const express = require('express');
const parsed = require('dotenv').config();
const cors = require('cors');
const bodyparser = require('body-parser');
const db = require('./database');
const Notes = require('./models/note.schema');
const Users = require('./models/user.schema');
const Tokens = require('./models/tokens.schema');
const ObjectId = require('mongoose').Types.ObjectId;
const crypto = require('crypto');
const AuthMw = require('./middleware');

console.log('Parsed the following from the .env file: ' + Object.keys(parsed.parsed).join(', '));

const port = process.env.PORT || 3030;
const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(cors());
app.use(AuthMw);

db.init();

/***********************\
|*     INIT ROUTES     *|
\***********************/
app.post('/', async (req, res) => {
    try {
        /* We only want users to see *their* notes, not just everyones' */
        if (req.isAuthenticated() && req.user) {
            const usersNotes = Array();

            /* We have to use this special syntax in an async context - forEach will not work */
            for (let noteId of req.user.notes) {
                const note = await Notes.findById(noteId);
                usersNotes.push(note);
            }
            res.json(usersNotes);
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

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await Users.findOne({
            username: username
        });

        if (user) {
            /*  Because the password *is not* plain text anymore,
                  we want to check the encrypted password
            */
            if (user.validPassword(password)) {
                const authToken = crypto.randomBytes(128).toString('hex');

                const token = new Tokens();
                token.val = authToken;
                token.userid = user._id;
                await token.save();

                req.user = user;

                res.json({
                    token: authToken
                });
            } else {
                res.status(401).send({
                    error: 'Wrong Password'
                });
            }
        } else {
            res.status(401).send({
                error: 'User Doesn\'t Exist'
            });
        }
    } catch (ex) {
        console.error(ex);
        res.status(500).send({
            error: ex
        });
    }
});

app.post('/logout', async (req, res) => {
    try {
        await Tokens.findOneAndDelete({
            val: req.body.AuthToken
        });
        res.status(200).end();
    } catch (ex) {
        console.error(ex);
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