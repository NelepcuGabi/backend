const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique:true,
        required: true,
    },
    role: {
        type: String,
        derfault: 'user',
    },
    password: {
        type:String,
        required: true,
    },
    rank: {
        type: String,
        default: 'Beginner', 
    },
    score: {
        type: Number,
        default: 0,
    },
});

const User = mongoose.model('User', userSchema);
module.exports = User;