const mongoose = require('mongoose');

const StandsScoreSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "schools",
        required: true
    },
    arbitrator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    OriginalityConcept: {
        type: Number,
        default: 0
    },
    SolidWellThoughtOutAndSecureBuildQuality: {
        type: Number,
        default: 0
    },
    VisualQuality: {
        type: Number,
        default: 0
    },
    Stand: {
        type: Number,
        default: 0
    },
    created_at: Date,
})

const standsScore = mongoose.model('ambianceStandsScores', StandsScoreSchema);
module.exports = standsScore;
