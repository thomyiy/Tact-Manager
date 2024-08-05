const mongoose = require('mongoose');

const SportSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    created_at: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
})

const sport = mongoose.model('sports', SportSchema);
module.exports = sport;
