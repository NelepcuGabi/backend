const {sign, verify} = require('jsonwebtoken');

const createToken = (user) => {
    const accessToken = sign(
        { username: user.username, id: user._id },
        "jwttelecomauth", 
        { expiresIn: '30d' }
        
    );
    const refreshToken = sign(
        { username: user.username, id: user._id },
        "jwttelecomauth", 
        { expiresIn: '30d' }
    );

    return { accessToken, refreshToken };
}

const validateToken = (req, res, next) => {
    
    const accessToken = (req.headers["authorization"] || "" ).split('Bearer ')[1];
  
    if(!accessToken) 
        return res.status(400).json({error : "Token not found"});
    
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
const refreshToken = async (req, res, next) => {
    const refreshToken= (req.headers["authorization"] || "" ).split('Bearer ')[1];

    if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token provided" });
    }

    try {
        const validatedToken = verify(refreshToken, "jwttelecomauth");
        const user = await user.findById(validatedToken.id); // Fetch user from DB

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        const tokens = createToken(user);
        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30 * 1000 // 30 days
        });

        res.status(200).json({
            status: 'success',
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (err) {
        console.error('Token refresh error:', err);
        return res.status(401).json({ error: "Invalid refresh token" });
    }
}
module.exports = { createToken, validateToken,refreshToken}