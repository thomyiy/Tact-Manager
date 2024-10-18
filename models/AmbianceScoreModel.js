const mongoose = require('mongoose');

const AmbianceScoreSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "schools",
        required: true
    },
    // TODO: arbitre
    // TODO: liste des elements a noter
    created_at: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
})

const AmbianceScore = mongoose.model('ambianceScores', AmbianceScoreSchema);
module.exports = AmbianceScore;
