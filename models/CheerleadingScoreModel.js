const mongoose = require('mongoose');

const CheerleadingScoreSchema = new mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "schools",
        required: true
    },
    arbitrator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    stuntDifficulty: {
        type: Number,
        default:0
    },
    stuntExecution: {
        type: Number,
        default:0
    },
    stuntSynchronization: {
        type: Number,
        default:0
    },
    stuntSecurity: {
        type: Number,
        default:0
    },
    choreographySynchronization: {
        type: Number,
        default:0
    },
    choreographyRythme: {
        type: Number,
        default:0
    },
    choreographyFluidity: {
        type: Number,
        default:0
    },
    tumblingDifficulty: {
        type: Number,
        default:0
    },
    tumblingExecution: {
        type: Number,
        default:0
    },
    tumblingSecurity: {
        type: Number,
        default:0
    },
    jumpDifficulty: {
        type: Number,
        default:0
    },
    jumpExecution: {
        type: Number,
        default:0
    },
    jumpSynchronization: {
        type: Number,
        default:0
    },
    interractionCreativity: {
        type: Number,
        default:0
    },
    interractionReaction: {
        type: Number,
        default:0
    },
    fairplayAttitude: {
        type: Number,
        default:0
    },
    fairplayrespect: {
        type: Number,
        default:0
    },

    created_at: Date,
})

const CheerleadingScore = mongoose.model('cheerleadingScores', CheerleadingScoreSchema);
module.exports = CheerleadingScore;
