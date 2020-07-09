/* Load in the dotenv config. It'll tell us what it loads in!*/
const express = require('express');
const parsed = require('dotenv').config();
const cors = require('cors');
const bodyparser = require('body-parser');
const fs = require('fs');

console.log('Parsed the following from the .env file: ' + Object.keys(parsed.parsed).join(', '));

const port = process.env.PORT || 3030;
const app = express();

app.use(bodyparser.json());
app.use(cors());


const read = () => {
    if (fs.existsSync('database.json')) {
        return JSON.parse(fs.readFileSync('database.json').toString());
    }
    return Array();
};

const write = (data) => {
    fs.writeFileSync('database.json', JSON.stringify(data));
};

let notes = read();

app.post('/', (req, res) => {
    res.json(notes);
});

app.put('/', (req, res) => {
    try {
        notes.push(req.body.note);
        res.json({ new: req.body.note });
        write(notes);
    } catch (ex) {
        console.error(ex);
        res.status(500).send();
    }
});

app.listen(port, () => {
    console.log('👍 server running on port ' + port.toString());
}).on('error', (err) => {
    console.error(err);
});