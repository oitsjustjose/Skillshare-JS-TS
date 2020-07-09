/* Load in the dotenv config. It'll tell us what it loads in!*/
const express = require('express');
const parsed = require('dotenv').config();

console.log('Parsed the following from the .env file: ' + Object.keys(parsed.parsed).join(', '));

const port = process.env.PORT || 3030;
const app = express();


app.get('/', (request, response) => {
    response.send('Hello World!');
});

app.post('/', (request, response) => {
    response.send('Hello from post!');
});

app.put('/', (req, res) => {
    res.send('Hello from put!');
});

app.delete('/', (req, res) => {
    res.send('Hello from delete');
});

app.listen(port, () => {
    console.log('👍 server running on port ' + port.toString());
}).on('error', (err) => {
    console.error(err);
});