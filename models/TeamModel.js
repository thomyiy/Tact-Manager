const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "schools",
        required: true
    },
    sport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sports",
        required: true
    },
    created_at: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
})

const team = mongoose.model('teams', TeamSchema);
module.exports = team;
