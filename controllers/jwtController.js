const {sign, verify} = require('jsonwebtoken');

const createToken = (user) => {
    const accessToken = sign(
        { username: user.username, id: user._id },
        "jwttelecomauth", 
        { expiresIn: '30d' }
    );

    return accessToken;
}

const validateToken = (req, res, next) => {
    const accessToken = req.cookies["accessToken"]
    
    if(!accessToken) 
        return res.status(400).json({error : "User not Authenticated!"});
    
    try {
        const validatedToken = verify(accessToken, "jwttelecomauth");
        req.user = validatedToken; // Attach the decoded token to req.user
        req.authenticated = true;
        return next();
    } catch (err) {
        console.error('Token validation error:', err);
        return res.status(400).json({ error: err.message });
    }
}
module.exports = { createToken, validateToken }