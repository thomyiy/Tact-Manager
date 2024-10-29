const { request } = require('express');
const mongoose = require('mongoose');

const ProgramSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    created_at: Date,

})

const program = mongoose.model('program', ProgramSchema);
module.exports = program;
