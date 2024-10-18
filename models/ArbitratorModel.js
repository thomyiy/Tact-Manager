const { request } = require('express');
const mongoose = require('mongoose');

const ArbitratorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    matches: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Match'
        }
    ],
    created_at: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
})

const arbitrator = mongoose.model('arbitrators', ArbitratorSchema);
module.exports = arbitrator;
