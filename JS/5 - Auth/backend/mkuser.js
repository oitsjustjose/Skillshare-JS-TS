require('dotenv').config();
const User = require('./1 - No Encryption/models/user.schema');
const mongoose = require('mongoose');

const init = async () => {
    mongoose.connect(`mongodb+srv://${process.env.MONGO_URL}/NoteApp?retryWrites=true&w=majority`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        auth: {
            user: String(process.env.MONGO_USER),
            password: String(process.env.MONGO_PASS)
        }
    });

    const me = new User();
    me.username = 'oitsjustjose';
    me.password = 'password123';
    await me.save();
};

init().then(() => {
    console.log('User Created!');
    process.exit(1);
});