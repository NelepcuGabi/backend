const Comment = require('../models/commentsModels.js');
const User = require('../models/userModel');
const mongoose = require('mongoose');
// Fetch comments by filename
exports.getCommentsByFilename = async (req, res) => {
    const { filename } = req.params;
    console.log(`Fetching comments for filename: ${filename}`);

    try {
        const comments = await Comment.find({ filename });
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving comments', error: err.message });
    }
};

// Add a new comment for a specific file
exports.addComment = async (req, res) => {
    console.log('Request body:', req.body); // Log the request body
    console.log('Authenticated user:', req.user); // Debug log

    const userId = new mongoose.Types.ObjectId(req.user.id); // Convert to ObjectId
    const user = await User.findById(userId);
    req.user.name = user.name;
    console.log('Fetched user name:', req.user.name);

    const { content, parentId } = req.body; // Get content and parentId from the request body
    const filename = req.params.filename; // Extract filename from URL params

    if (!content) {
        return res.status(400).json({ message: 'Content is required' });
    }
    if (!req.user) {
        return res.status(400).json({ message: 'User details are missing' });
    }
    if (!req.user.name) {
        return res.status(400).json({ message: 'User name is missing' });
    }
    if (!req.user.id) {
        return res.status(400).json({ message: 'User ID is missing' });
    }

    try {
        if (parentId) {
            // If parentId is provided, add the content as a reply to an existing comment
            const comment = await Comment.findById(parentId);
            if (!comment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }

            const reply = {
                userId: req.user.id,
                userName: req.user.name,
                content,
                createdAt: new Date(),
            };

            comment.replies.push(reply);
            const savedComment = await comment.save();
            res.status(201).json(savedComment);
        } else {
            // Otherwise, create a new top-level comment
            const newComment = new Comment({
                userId: req.user.id,           // Use authenticated user's ID
                userName: req.user.name,       // Use authenticated user's name
                content,                       // Comment content from the request body
                filename,                      // Filename from URL params
                createdAt: new Date(),         // Current date and time
                modifiedAt: new Date(),        // Current date and time
                replies: []                    // Initialize replies as an empty array
            });

            const savedComment = await newComment.save();
            res.status(201).json(savedComment);
        }
    } catch (err) {
        console.error('Error adding comment:', err); // Debug log
        res.status(500).json({ message: 'Error adding comment', error: err.message });
    }
};





exports.updateComment = async (req, res) => {
    const { id } = req.params;
    console.log('The ID extracted from req.params is:', id);
    const { content } = req.body;

    console.log('Update Comment ID:', id); // Debugging
    console.log('New Comment Content:', content); // Debugging

    // Ensure the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid comment ID' });
    }

    try {
        const updatedComment = await Comment.findByIdAndUpdate(
            id,
            { content, modifiedAt: new Date() },
            { new: true } // Return the updated document
        );

        if (!updatedComment) {
            console.log('Comment not found for ID:', id); // Debugging
            return res.status(404).json({ message: 'Comment not found' });
        }

        console.log('Updated Comment:', updatedComment); // Debugging
        res.status(200).json(updatedComment);
    } catch (err) {
        console.error('Error updating comment:', err); // Debugging
        res.status(500).json({ message: 'Error updating comment', error: err.message });
    }
};

// Șterge un comentariu după ID
exports.deleteComment = async (req, res) => {
    const { id } = req.params;
    console.log('The ID extracted from req.params is:', id);

    try {
        const deletedComment = await Comment.findByIdAndDelete(id);
        if (!deletedComment) {
            res.status(404).json({ message: 'Comment not found' });
        } else {
            res.status(204).send();
        }
    } catch (err) {
        res.status(500).json({ message: 'Error deleting comment', error: err.message });
    }
};

// exports.replyToComment = async (req, res) => {
//     const { id } = req.params;
//     const { content } = req.body;
//     const { userId, username } = req.user; // Assuming you attach user data to the request

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return res.status(400).json({ message: 'Invalid comment ID' });
//     }

//     try {
//         const comment = await Comment.findById(id);
//         if (!comment) {
//             return res.status(404).json({ message: 'Comment not found' });
//         }

//         const reply = {
//             userId,
//             username,
//             content,
//             createdAt: new Date()
//         };

//         comment.replies.push(reply);
//         await comment.save();

//         res.status(201).json(comment);
//     } catch (err) {
//         res.status(500).json({ message: 'Error adding reply', error: err.message });
//     }
// };