const express = require('express');
const fileController = require('../controllers/fileController.js'); // Asigură-te că calea este corectă
const { validateToken } = require('../controllers/jwtController.js');

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.post('/upload', validateToken, fileController.uploadFile);
router.get('/files', fileController.getFiles);
router.get('/:filename', fileController.getFileByName);
router.get('/files/:id', fileController.getFileById);

// Ruta pentru actualizare fișiere
router.put('/files/:id', validateToken, fileController.updateFile);

module.exports = router;
