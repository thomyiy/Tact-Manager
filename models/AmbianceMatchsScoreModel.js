const mongoose = require('mongoose');

const MatchsScoreSchema = new mongoose.Schema({
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
    AnimationImprovisationsFunnySongsInteractionsWithTheMatch: {
        type: Number,
        default: 0
    },
    VisualAnimationsDuringTheSongs: {
        type: Number,
        default: 0
    },
    PerfectlyCoordinatedAndLivelyDanceChoreaEntertainment: {
        type: Number,
        default: 0
    },
    DiversityWideVarietyOfSongsWithoutRepetitions: {
        type: Number,
        default: 0
    },
    SustainedEnduranceThroughoutTheDurationOfTheCompetition: {
        type: Number,
        default: 0
    },
    FairPlayRespect: {
        type: Number,
        default: 0
    },
    Maestro : {
        type: Number,
        default: 0
    },
    QualityOfClearAndMelodiousSinging: {
        type: Number,
        default: 0
    },
    OwnStand: {
        type: Number,
        default: 0
    },
    created_at: Date,
})

const MatchsScore = mongoose.model('ambianceMatchsScores', MatchsScoreSchema);
module.exports = MatchsScore;
