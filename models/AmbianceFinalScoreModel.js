const mongoose = require('mongoose');

const FinalScoreSchema = new mongoose.Schema({
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
    AtmosphereBrothelElectricAndJoyfulAtmosphere: {
        type: Number,
        default: 0
    },
    PerfectlyCoordinatedAndLivelyDanceChoreaEntertainment: {
        type: Number,
        default: 0
    },
    CoordinationDeployment: {
        type: Number,
        default: 0
    },
    FairPlayRespect: {
        type: Number,
        default: 0
    },
    QualityOfClearAndMelodiousSinging: {
        type: Number,
        default: 0
    },
    VisualQuality: {
        type: Number,
        default: 0
    },
    VisualQualityAndConcept: {
        type: Number,
        default: 0
    },
    RespectThePassageTimeOfOtherDelegations: {
        type: Number,
        default: 0
    },
    DynamicUse: {
        type: Number,
        default: 0
    },
    VisualFlagsTifo: {
        type: Number,
        default: 0
    },
    created_at: Date,
})

const finalScore = mongoose.model('ambianceFinalsScores', FinalScoreSchema);
module.exports = finalScore;
