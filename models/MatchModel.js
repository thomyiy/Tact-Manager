const mongoose = require('mongoose');
const { sassNull } = require('sass');

const MatchSchema = new mongoose.Schema({
    team1: {
        type: String,
        required: true
    },
    team2: {
        type: String,
        required: true
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
        type: String,
        default: null
    },
    sport: {
        type: String,
        required: true,
    },
    pool: {
        type: String,
        required: true,
    },
    time: {
        type: Number,
        default: 0
    },

    created_at: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
})

const Match = mongoose.model('matchs', MatchSchema);
module.exports = Match;
