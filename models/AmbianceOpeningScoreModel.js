const mongoose = require('mongoose');

const OpeningScoreSchema = new mongoose.Schema({
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
    CoordinationDeployment: {
        type: Number,
        default: 0
    },
    DiversityGreatVarietyOfDesignsAndColors: {
        type: Number,
        default: 0
    },
    InteractionWithAthletes: {
        type: Number,
        default: 0
    },
    NumberOfFlags: {
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
    SportsmansTour: {
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

const openingScore = mongoose.model('ambianceOpeningsScores', OpeningScoreSchema);
module.exports = openingScore;
