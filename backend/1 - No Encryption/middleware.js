const Users = require('./models/user.schema');
const Tokens = require('./models/tokens.schema');

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
module.exports = async (req, res, next) => {
    let tokenObj = null;

    if (req.headers.authorization) {
        tokenObj = await Tokens.findOne({
            val: req.headers.authorization
        });

        if (tokenObj && shouldExpire(tokenObj)) {
            await Tokens.findByIdAndDelete(tokenObj._id);
            tokenObj = null;
        }

        if (tokenObj) {
            req.user = await Users.findById(tokenObj.userid);
        } else {
            req.user = null;
        }
    }

    req.isAuthenticated = () => {
        return tokenObj != null;
    };

    next();
};

/**
 * 
 * @param {Model} token 
 */
const shouldExpire = (token) => {
    const ageInHrs = (((Date.now() - token.createdOn) / 1000) / 60) / 60;
    return ageInHrs > parseInt(process.env.TOKEN_MAX_AGE);
};