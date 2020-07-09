const mongoose = require('mongoose');

module.exports.init = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.MONGO_URL}/NoteApp?retryWrites=true&w=majority`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auth: {
                user: String(process.env.MONGO_USER),
                password: String(process.env.MONGO_PASS)
            }
        });

        console.log('DB Connected! 😄');

    } catch (ex) {
        console.log('DB Connection Failed 💩');
        console.error(ex);
        process.exit(1);
    }
}; 