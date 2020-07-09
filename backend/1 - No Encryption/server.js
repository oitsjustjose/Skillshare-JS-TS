/* Load in the dotenv config. It'll tell us what it loads in!*/
const express = require('express');
const parsed = require('dotenv').config();
const cors = require('cors');
const bodyparser = require('body-parser');
const db = require('./database');
const Notes = require('./models/note.schema');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const ObjectId = require('mongoose').Types.ObjectId;
const UserDB = require('./models/user.schema');

console.log('Parsed the following from the .env file: ' + Object.keys(parsed.parsed).join(', '));

const port = process.env.PORT || 3030;
const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(cors());

db.init();

/***********************\
|* INIT PASSPORT STUFF *|
\***********************/
app.use(passport.initialize());
app.use(passport.session());

/* We want to tell passport how to log in using our database! */

passport.use(new LocalStrategy((username, password, callback) => {
    UserDB.findOne({
        'username': username
    }, (err, user) => {
        if (err) {
            return callback(err);
        } else if (!user) {
            return callback(null, false);
        } else if (user.password != password) {
            return callback(null, false);
        }
        return callback(null, user);
    });
}));

/* Now we want to figure out how to turn a user into a serialized version for submission over the web */
passport.serializeUser((user, callback) => {
    callback(null, user.id);
});

passport.deserializeUser((id, callback) => {
    UserDB.findById(id, (err, user) => {
        callback(err, user);
    });
});

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


app.post('/login', async (req, res, next) => {
    await passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect(`${req.headers.origin}/login?error`);
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect(`${req.headers.origin}/`);
        });
    })(req, res, next);
});

app.listen(port, () => {
    console.log('👍 server running on port ' + port.toString());
}).on('error', (err) => {
    console.error(err);
});