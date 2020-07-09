const passport = require('passport');
const LocalStrategy = require('passport-local');
const UserDB = require('./models/user.schema');
const e = require('express');

/**
 * 
 * @param {import('express').Application} app 
 */
module.exports.init = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(async (username, password, callback) => {
        try {
            const user = await UserDB.findOne({
                username: username
            });

            if (user) {
                if (user.password == password) {
                    return callback(null, user); /* Return with no errors and the user */
                } else {
                    return callback(null, false); /* Return with no errors but no user (pw doesn't match) */
                }
            } else {
                return callback(null, false);    /* Return with no errors but no user (user doesn't exist) */
            }
        } catch (ex) {
            console.error(ex);
            return callback(ex); /* Return with the error and *no* user */
        }
    }));

    /* Now we want to figur eout how to turn a user into a serialized version for submission over the web */
    passport.serializeUser((user, callback) => {
        callback(null, user.id);
    });

    passport.deserializeUser(async (id, callback) => {
        try {
            const user = await UserDB.findById(id);
            callback(null, user);
        } catch (ex) {
            callback(ex, null);
        }
    });

    return passport;
};