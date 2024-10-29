const mongoose = require('mongoose');

const SportSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    created_at: Date,

})

const sport = mongoose.model('sport', SportSchema);
module.exports = sport;
