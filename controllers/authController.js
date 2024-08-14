const User = require('../models/userModel');
const { createToken } = require('../controllers/jwtController.js');
const createError = require('../utils/appError')
const bcrypt = require('bcryptjs');
//Register
exports.signup = async(req, res, next) => {
    try {
        const user = await User.findOne({email: req.body.email});

        if(user) {
            return next(new createError("User already exists!", 400))
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        
        const newUser = await User.create({
            ...req.body,
            password: hashedPassword,
        });

        //JWT Assignment
        const { accessToken, refreshToken } = createToken(newUser);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({
            status: 'success',
            message: 'Inregistrare reusita',
            
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                rank: newUser.rank,
                score: newUser.score,
            },
        });
        
    }catch(error) {
        next(error);
    }
};

//Login
exports.login = async(req, res, next) => {
    try{
        const {email, password} = req.body;

        const user = await User.findOne({ email });

        if(!user) return next(new createError('Incorrect email or password!', 404));

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            return next (new createError('Incorrect email or password!', 401));
        }

        const { accessToken, refreshToken } = createToken(user);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
        
        res.status(200).json({
            status: 'success',
            
            message: 'Autentificare reusita.',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                rank: user.rank,
                score: user.score,
            },
        });
    } catch(error) {
        next(error);
    }
};