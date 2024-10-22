const mongoose = require('mongoose');

const AmbianceScoreSchema = new mongoose.Schema({
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
    auditoryAnimations: {
        type: Number,
        default:0
    },
    visualAnimationsDuringTheSongs: {
        type: Number,
        default:0
    },
    maestro: {
        type: Number,
        default:0
    },
    interactionWithFans: {
        type: Number,
        default:0
    },
    sportsmansTour: {
        type: Number,
        default:0
    },
    arrivalWithAllTheDelegation: {
        type: Number,
        default:0
    },
    organizationOfTheProcession: {
        type: Number,
        default:0
    },
    pyrotechnics: {
        type: Number,
        default:0
    },
    registrationAndPresenceOfTheDean: {
        type: Number,
        default:0
    },
    registrationAndPresenceOf5Alumni: {
        type: Number,
        default:0
    },
    bringBackAsMuchSupportAsPossibleOnDDay1stPlaceOutOf8: {
        type: Number,
        default:0
    },
    theDelegationRegistered10PeopleInTheSupporterTicketOffice: {
        type: Number,
        default:0
    },
    theDelegationRegistered20PeopleInTheSupporterTicketOffice: {
        type: Number,
        default:0
    },
    theDelegationRegistered40PeopleInTheSupporterTicketOffice: {
        type: Number,
        default:0
    },
    theDelegationRegistered80PeopleInTheSupporterTicketOffice: {
        type: Number,
        default:0
    },
    firstDelegationToRegister100PeopleInTheSupporterTicketOffice: {
        type: Number,
        default:0
    },
    firstDelegationToRegister200PeopleInTheSupporterTicketOffice: {
        type: Number,
        default:0
    },
    sportyAndGoodNaturedAttitude: {
        type: Number,
        default:0
    },
    totalRespectAndMutualEncouragement: {
        type: Number,
        default:0
    },
    totalRespectOfTheAllottedTimes: {
        type: Number,
        default:0
    },
    noDropImpeccableStand: {
        type: Number,
        default:0
    },
    flagDiversity: {
        type: Number,
        default:0
    },
    flagNumberOfFlags: {
        type: Number,
        default:0
    },
    flagVisualQuality: {
        type: Number,
        default:0
    },
    flagUse: {
        type: Number,
        default:0
    },
    standOriginality: {
        type: Number,
        default:0
    },
    standBuildQuality: {
        type: Number,
        default:0
    },
    standVisualQuality: {
        type: Number,
        default:0
    },
    tifosDeploymentCoordination: {
        type: Number,
        default:0
    },
    tifosVeryOriginalConcept: {
        type: Number,
        default:0
    },
    tifosImpressiveAndHighQuality: {
        type: Number,
        default:0
    },
    songsRelatedToTheTheme: {
        type: Number,
        default:0
    },
    costumesAndMakeup: {
        type: Number,
        default:0
    },
    perfectlyDecoratedAndInTuneStand: {
        type: Number,
        default:0
    },
    strongAndConsistentVisualDistribution: {
        type: Number,
        default:0
    },
    tribuneSongsDiversity: {
        type: Number,
        default:0
    },
    tribuneSongsEndurance: {
        type: Number,
        default:0
    },
    tribuneQualityOfSongs: {
        type: Number,
        default:0
    },
    tribuneFanfareCoordinationWithSupporters: {
        type: Number,
        default:0
    },
    tribuneFanfareInstruments: {
        type: Number,
        default:0
    },
    tribuneFanfareRhythmic: {
        type: Number,
        default:0
    },
    tribuneFervorJoyfulElectricAtmosphere: {
        type: Number,
        default:0
    },
    tribuneFervorDanceChoreEntertainment: {
        type: Number,
        default:0
    },

    created_at: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
})

const AmbianceScore = mongoose.model('ambianceScores', AmbianceScoreSchema);
module.exports = AmbianceScore;
