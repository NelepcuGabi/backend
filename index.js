require('dotenv').config();


const express = require ('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRouter = require('./routes/authRoute.js')
const fileRouter = require('./routes/fileRoute.js');
const userRouter = require('./routes/userRoute.js');
const cookieParser = require('cookie-parser');
const commentsRouter = require('./routes/commentsRoute.js');


const app = express();
// Adaugă această linie înainte de `mongoose.connect()`
const MongoDB_URI = process.env.MONGODB_URI
console.log('MongoDB URI:', process.env.MONGODB_URI); 
 // Verifică toate variabilele de mediu

 //MiddleWares
 app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

 //Routes
 app.use('/api/user', userRouter);
app.use ('/api/auth', authRouter);
app.use('/api/files', fileRouter);
app.use('/api/comments',commentsRouter);


 //MongoDB Connection
mongoose
    .connect(MongoDB_URI)
    .then(() => console.log('Connected to MongoDB!'))
    .catch((error)=>console.error("Failed to connect to MongoDB:", error));

 //Error Handling
app.use((err, req, res, next) =>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    })
});

 //Server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`App running on ${PORT}`);
});