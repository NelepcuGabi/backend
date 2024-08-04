const Comment = require('../models/commentsModels.js');
const User = require('../models/userModel'); // Asigură-te că acest model este corect

// Obține toate comentariile
exports.getComments = async (req, res) => {
    try {
        const comments = await Comment.find();
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving comments', error: err.message });
    }
};

// Adaugă un nou comentariu
exports.addComment = async (req, res) => {
    const { userId, content } = req.body;

    if (!userId || !content) {
        return res.status(400).json({ message: 'userId and content are required' });
    }

    try {
        // Caută utilizatorul pentru a obține numele și email-ul
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newComment = new Comment({
            userId,
            userName: user.name, // presupunem că modelul User are câmpul 'name'
            userEmail: user.email, // presupunem că modelul User are câmpul 'email'
            content,
            createdAt: new Date(),
            modifiedAt: new Date()
        });

        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
    } catch (err) {
        res.status(500).json({ message: 'Error adding comment', error: err.message });
    }
};

// Obține un comentariu după ID
exports.getCommentById = async (req, res) => {
    const { id } = req.params;

    try {
        const comment = await Comment.findById(id);
        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
        } else {
            res.status(200).json(comment);
        }
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving comment', error: err.message });
    }
};

// Actualizează un comentariu după ID
exports.updateComment = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    try {
        const updatedComment = await Comment.findByIdAndUpdate(
            id,
            { content, modifiedAt: new Date() },
            { new: true }
        );
        if (!updatedComment) {
            res.status(404).json({ message: 'Comment not found' });
        } else {
            res.status(200).json(updatedComment);
        }
    } catch (err) {
        res.status(500).json({ message: 'Error updating comment', error: err.message });
    }
};

// Șterge un comentariu după ID
exports.deleteComment = async (req, res) => {
    const { id } = req.params;

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
