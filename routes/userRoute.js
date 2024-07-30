const express = require('express');
const { validateToken } = require('../controllers/jwtController.js'); 
const User = require('../models/userModel.js'); 

const router = express.Router();

// Route to get current user details
router.get('/me', validateToken, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password'); // Exclude password field

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
});

module.exports = router;