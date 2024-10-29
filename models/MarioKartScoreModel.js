const mongoose = require('mongoose');

const MarioKartScoreSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "schools",
        required: true
    },
    // TODO: arbitre
    // TODO: liste des elements a noter
    created_at: Date,
})

const MarioKartScore = mongoose.model('marioKartScores', MarioKartScoreSchema);
module.exports = MarioKartScore;
