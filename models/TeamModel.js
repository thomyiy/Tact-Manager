const { request } = require('express');
const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "school",
        required: true
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
    pool: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pool"
    },
    created_at: Date,

})

const team = mongoose.model('team', TeamSchema);
module.exports = team;
