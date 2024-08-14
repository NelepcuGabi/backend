require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient, GridFSBucket } = require('mongodb');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const User = require('../models/userModel');

const mongoURI = process.env.MONGODB_URI;

// Define client and db variables
let client;
let db;
let gfsBucket;

const initMongo = async () => {
    client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        db = client.db('test');
        gfsBucket = new GridFSBucket(db, { bucketName: 'uploads' });
        console.log('Connected to MongoDB and GridFSBucket initialized');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
};

initMongo();

// Function to get the files collection
const getFilesCollection = () => {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db.collection('uploads.files');
};


exports.uploadFile = async (req, res) => {
    // Add logging to check if req.user is available
    console.log('User information in uploadFile:', req.user);
    if (!req.user) {
        return res.status(400).json({ error: 'User not authenticated' });
    }

    // Fetch user details if not present in req.user
    if (!req.user.name) {
        try {
            const userId = new mongoose.Types.ObjectId(req.user.id); // Convert to ObjectId
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            req.user.name = user.name;
            console.log('Fetched user name:', req.user.name); // Log fetched user name
        } catch (err) {
            console.error('Error fetching user details:', err);
            return res.status(500).json({ error: 'An error occurred while fetching user details' });
        }
    }
    const storage = new GridFsStorage({
        url: mongoURI,
        options: { useNewUrlParser: true, useUnifiedTopology: true },
        file: (req, file) => {
            // Add logging here to check if req.user is available inside file function
            console.log('User information in GridFsStorage file function:', req.user);
            if (!req.user || !req.user.id) {
                throw new Error('User not authenticated');
            }
            const currentDate = new Date();
            return {
                bucketName: 'uploads', // Collection name in MongoDB
                filename: `${Date.now()}-${file.originalname}`,
                metadata: {
                    title: req.body.title,
                    type: req.body.type,
                    difficulty: req.body.difficulty,
                    description: req.body.description,
                    name: req.user.name,
                    userId: req.user.id,
                    createdAt: currentDate,
                    modifiedOn: currentDate
                }
            };
        }
    });

    const upload = multer({ storage }).single('file');

    upload(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err); // Log error details
            return res.status(500).json({ error: 'An error occurred while uploading the file', details: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file was uploaded' });
        }

        console.log('Uploaded file:', req.file); // Log file details for debugging
        return res.status(201).json({ message: 'File uploaded successfully', file: req.file });
    });
};

exports.getFiles = async (req, res) => {
    try {
        const files = await gfsBucket.find().toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ message: 'No files available' });
        }
        res.status(200).json(files);
    } catch (err) {
        console.error('Error retrieving files:', err);
        res.status(500).json({ error: 'An error occurred while retrieving files' });
    }
};

exports.getFileByName = async (req, res) => {
    const { filename } = req.params;

    if (!gfsBucket) {
        return res.status(500).json({ error: 'GridFSBucket is not initialized' });
    }

    try {
        const files = await gfsBucket.find({ filename }).toArray();

        if (!files || files.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        const file = files[0];
        const readstream = gfsBucket.openDownloadStream(file._id);

        res.setHeader('Content-Type', file.contentType);
        res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`); // inline for preview

        readstream.on('error', (err) => {
            res.status(500).json({ error: 'An error occurred while streaming the file' });
        });

        readstream.pipe(res);
    } catch (err) {
        console.error('Error finding file:', err);
        res.status(500).json({ error: 'An error occurred while retrieving the file' });
    }
};

exports.getFileById = async (req, res) => {
    const { id } = req.params;

    if (!gfsBucket) {
        return res.status(500).json({ error: 'GridFSBucket is not initialized' });
    }

    try {
        // Convert id to ObjectId if necessary
        const objectId = new mongoose.Types.ObjectId(id);

        // Find the file by its ObjectId
        const files = await gfsBucket.find({ _id: objectId }).toArray();

        if (files.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Send file metadata
        const file = files[0];
        res.status(200).json({
            id: file._id,
            filename: file.filename,
            contentType: file.contentType,
            length: file.length,
            uploadDate: file.uploadDate,
            metadata: file.metadata // Ensure metadata is included
        });
    } catch (err) {
        console.error('Error finding file:', err);
        res.status(500).json({ error: 'An error occurred while retrieving the file' });
    }
};
exports.updateFile = async (req, res) => {
    const { id } = req.params;
    const { title, description, difficulty, type } = req.body;

    try {
        const objectId = new mongoose.Types.ObjectId(id);

        // Găsește documentul fișierului în colecția 'uploads.files'
        const filesCollection = getFilesCollection();
        const file = await filesCollection.findOne({ _id: objectId });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Actualizează metadatele fișierului
        await filesCollection.updateOne(
            { _id: objectId },
            {
                $set: {
                    'metadata.title': title || file.metadata?.title,
                    'metadata.description': description || file.metadata?.description,
                    'metadata.difficulty': difficulty || file.metadata?.difficulty,
                    'metadata.type': type || file.metadata?.type,
                    'metadata.modifiedOn': new Date()
                }
            }
        );

        // Returnează mesajul de succes
        const updatedFile = await filesCollection.findOne({ _id: objectId });
        res.status(200).json({ message: 'File updated successfully', file: updatedFile });
    } catch (error) {
        console.error('Error updating file:', error);
        res.status(500).json({ message: 'Failed to update file', error: error.message });
    }
};
exports.getUserFiles = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(400).json({ error: 'User not authenticated' });
    }

    try {
    
        const userId = req.user.id.toString();
        // console.log('User ID:', userId); // Debugging log

        const files = await gfsBucket.find({ 'metadata.userId': userId }).toArray();

        if (files.length === 0) {
            console.log('No files found for the current user'); // Debugging log
            return res.status(404).json({ message: 'No files found for the current user' });
        }

        res.status(200).json(files);
    } catch (err) {
        console.error('Error retrieving user files:', err);
        // Ensure only one response is sent
        if (!res.headersSent) {
            res.status(500).json({ error: 'An error occurred while retrieving user files' });
        }
    }
};