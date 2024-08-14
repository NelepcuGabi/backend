const express = require('express');
const commentsController = require('../controllers/commentsController');
const { validateToken } = require('../controllers/jwtController.js');

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());


router.put('/:id', validateToken,commentsController.updateComment);
router.delete('/:id', validateToken,commentsController.deleteComment);
router.get('/:filename/comments', commentsController.getCommentsByFilename);
router.post('/:filename/comments',validateToken, commentsController.addComment);

module.exports = router;