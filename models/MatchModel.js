const mongoose = require('mongoose');
const { sassNull } = require('sass');
const arbitrator = require('./ArbitratorModel');

const MatchSchema = new mongoose.Schema({
    arbitrator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "arbitrator"
    },
    // TODO: arbitre
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
    timePlayed: {
        type: Number,
        default: 0
    },
    isFinished: {
        type: Boolean,
        default: false
    },
    field: {
        type: String,
        default: null
    },
    created_at: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
})

const Match = mongoose.model('matches', MatchSchema);
module.exports = Match;
