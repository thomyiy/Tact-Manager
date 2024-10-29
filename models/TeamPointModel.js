const mongoose = require('mongoose');

const TeamPointSchema = new mongoose.Schema({

    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "team"
    },
    pool: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "pool",
        required: true
    },
    points: {
        type: Number,
        default: 0
    },
    goal: {
        type: Number,
        default: 0
    },
    goalAverage: {
        type: Number,
        default: 0
    },
    random: {
        type: Number,
        default: 0
    },
    created_at: Date,
    updated_at: {
        type: Date
    },
})

const TeamPoint = mongoose.model('teamPoints', TeamPointSchema);
module.exports = TeamPoint;
