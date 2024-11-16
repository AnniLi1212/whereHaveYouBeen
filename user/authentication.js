async function authenticateUser(req, res, next) {
    // const userId = req.header('X-User-ID');
    // if (!userId) {
    //     return res.status(401).json({ error:'User ID is required' });
    // }
    // const user = users.find(u => u.id === userId);
    // if (!user) {
    //     return res.status(403).json({ error:'User not authorized' });
    // }
    // req.user = user;
    next();
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