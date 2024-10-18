const { request } = require('express');
const mongoose = require('mongoose');

const PoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    sport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sport",
        required: true
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "program",
        required: true
    },
    created_at: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
})

const pool = mongoose.model('pool', PoolSchema);
module.exports = pool;
