const express = require('express');
const commentController = require('../controllers/commentsController.js');

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.get('/comments', commentController.getComments);
router.post('/comments', commentController.addComment);
router.get('/comments/:id', commentController.getCommentById);
router.put('/comments/:id', commentController.updateComment);
router.delete('/comments/:id', commentController.deleteComment);

module.exports = router;
