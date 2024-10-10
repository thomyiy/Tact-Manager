const { request } = require('express');
const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
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
    sexe: {
        type: String,
        required: true,
    },
    pool: {
        type: String,
        default: null
    },
    points: {
        type: Number,
        default: 0
    },
    created_at: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
})

const team = mongoose.model('teams', TeamSchema);
module.exports = team;
