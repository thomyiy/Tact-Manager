const mongoose = require('mongoose');

const FifaScoreSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "schools",
        required: true
    },
    // TODO: arbitre
    // TODO: liste des elements a noter
    created_at: Date,
})

const FifaScore = mongoose.model('fifasScores', FifaScoreSchema);
module.exports = FifaScore;
