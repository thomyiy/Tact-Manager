const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    created_at: Date,

})

const school = mongoose.model('school', SchoolSchema);
module.exports = school;
