const mongoose = require('mongoose');

const HospitalityScoreSchema = new mongoose.Schema({
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
    RegistrationAndPresenceOf5Alumni: {
        type: Number,
        default: 0
    },
    RegistrationAndPresenceOfTheDean: {
        type: Number,
        default: 0
    },
    created_at: Date,
})

const hospitalityScore = mongoose.model('ambianceHospitalitysScores', HospitalityScoreSchema);
module.exports = hospitalityScore;
