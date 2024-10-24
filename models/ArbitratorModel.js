const mongoose = require('mongoose');

const ArbitratorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    created_at: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
})

const arbitrator = mongoose.model('arbitrator', ArbitratorSchema);
module.exports = arbitrator;
