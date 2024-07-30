const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    title: String,
    description: String,
    filename: String,
    difficulty: String,
    type: String,
    // Adăugăm și metadata pentru fișiere
    metadata: {
        title: String,
        description: String,
        name: String,
        userId: mongoose.Schema.Types.ObjectId,
        createdOn: { type: Date, default: Date.now },
        createdAt: { type: Date, default: Date.now },
        modifiedOn: { type: Date, default: Date.now },
    }
});

const File = mongoose.model('File', fileSchema);
module.exports = File;
