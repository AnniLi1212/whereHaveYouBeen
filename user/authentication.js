const { UserKeyError } = require('../middleware/error_handler');
const {validateKey} = require('./loginService');

async function authenticateUser(req, res, next) {
    try {
        const user_key = req.header('X-User-Key');
        if (!user_key) {
            throw new UserKeyError('please provide a user key');
        }
        const user_id = await validateKey(user_key);
        req.user_id = user_id;
        next();
    } catch (error) {
        next(error);
    }
}

function authorizeUser(requiredPermission) {
    return (req, res, next) => {
        // const userRole = roles.find(r => r.id === req.user.roleId);
        // if (!userRole || !userRole.permissions.includes(requiredPermission)) {
        //     return res.status(403).json({ error:'Insufficient permissions' });
        // }
        next();
    };
}

module.exports = {
    authenticateUser,
    authorizeUser,
};