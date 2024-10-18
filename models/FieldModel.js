const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    created_at: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
})

const Field = mongoose.model('fields', FieldSchema);
module.exports = Field;
