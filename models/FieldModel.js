const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    created_at: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
})

const field = mongoose.model('field', FieldSchema);
module.exports = field;
