const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    fifaPosition: {
        type: Number,
        default: 0
    },
    mkPosition: {
        type: Number,
        default: 0
    },
    created_at: Date,
})

const school = mongoose.model('school', SchoolSchema);
module.exports = school;
