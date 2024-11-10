const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    arbitrator: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    }],
    team1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "team"
    },
    team2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "team"
    },
    score: {
        team1Score: {
            type: Number,
            default: null,
        },
        team2Score: {
            type: Number,
            default: null,
        },
    },
    winnerTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "team",
        default: undefined
    },
    sport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sport",
        required: true
    },
    pool: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pool",
        required: true
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "program",
        required: true
    },
    expectedTime: {
        type: Number
    },
    isFinished: {
        type: Boolean,
        default: false
    },
    field: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "field",
        // required: true
    },
    created_at: Date,
    updated_at: {
        type: Date
    },

})

const Match = mongoose.model('matches', MatchSchema);
module.exports = Match;
