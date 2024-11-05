const mongoose = require('mongoose');

const CortegeScoreSchema = new mongoose.Schema({
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
    ArrivalWithTheEntireDelegationVeryGoodCoordination: {
        type: Number,
        default: 0
    },
    Songs: {
        type: Number,
        default: 0
    },
    CoordinationPerfectSynchronization: {
        type: Number,
        default: 0
    },
    CostumeMakeup: {
        type: Number,
        default: 0
    },
    WideVarietyOfInstruments: {
        type: Number,
        default: 0
    },
    OrganizationOfTheProcession: {
        type: Number,
        default: 0
    },
    ClearAndCatchyRhythm: {
        type: Number,
        default: 0
    },
    OverviewSpectacularAndSecure: {
        type: Number,
        default: 0
    },
    created_at: Date,
})

const cortegeScore = mongoose.model('ambianceCortegeScores', CortegeScoreSchema);
module.exports = cortegeScore;
