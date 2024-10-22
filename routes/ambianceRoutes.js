const express = require('express');
const School = require("../models/SchoolModel");
const User = require("../models/UserModel");
const AmbianceScore = require("../models/AmbianceScoreModel");
const mongoose = require("mongoose");
const route = express.Router();
const utils = require("../controller/Utils")

module.exports = function (route) {
    route.get('/ambiance/:school', async (req, res, next) => {
        try {
            var global = await utils.getGlobal(req)

            const sessionSchool = await School.findOne({name: req.params.school});
            const ambianceScores = await AmbianceScore.find({school: sessionSchool._id});

            const ambianceScore = {
                auditoryAnimations: ambianceScores.reduce((total, next) => total + next.auditoryAnimations, 0) / ambianceScores.length,
                visualAnimationsDuringTheSongs: ambianceScores.reduce((total, next) => total + next.visualAnimationsDuringTheSongs, 0) / ambianceScores.length,
                maestro: ambianceScores.reduce((total, next) => total + next.maestro, 0) / ambianceScores.length,
                interactionWithFans: ambianceScores.reduce((total, next) => total + next.interactionWithFans, 0) / ambianceScores.length,
                sportsmansTour: ambianceScores.reduce((total, next) => total + next.sportsmansTour, 0) / ambianceScores.length,
                arrivalWithAllTheDelegation: ambianceScores.reduce((total, next) => total + next.arrivalWithAllTheDelegation, 0) / ambianceScores.length,
                organizationOfTheProcession: ambianceScores.reduce((total, next) => total + next.organizationOfTheProcession, 0) / ambianceScores.length,
                pyrotechnics: ambianceScores.reduce((total, next) => total + next.pyrotechnics, 0) / ambianceScores.length,
                registrationAndPresenceOfTheDean: ambianceScores.reduce((total, next) => total + next.registrationAndPresenceOfTheDean, 0) / ambianceScores.length,
                registrationAndPresenceOf5Alumni: ambianceScores.reduce((total, next) => total + next.registrationAndPresenceOf5Alumni, 0) / ambianceScores.length,
                bringBackAsMuchSupportAsPossibleOnDDay1stPlaceOutOf8: ambianceScores.reduce((total, next) => total + next.bringBackAsMuchSupportAsPossibleOnDDay1stPlaceOutOf8, 0) / ambianceScores.length,
                theDelegationRegistered10PeopleInTheSupporterTicketOffice: ambianceScores.reduce((total, next) => total + next.theDelegationRegistered10PeopleInTheSupporterTicketOffice, 0) / ambianceScores.length,
                theDelegationRegistered20PeopleInTheSupporterTicketOffice: ambianceScores.reduce((total, next) => total + next.theDelegationRegistered20PeopleInTheSupporterTicketOffice, 0) / ambianceScores.length,
                theDelegationRegistered40PeopleInTheSupporterTicketOffice: ambianceScores.reduce((total, next) => total + next.theDelegationRegistered40PeopleInTheSupporterTicketOffice, 0) / ambianceScores.length,
                theDelegationRegistered80PeopleInTheSupporterTicketOffice: ambianceScores.reduce((total, next) => total + next.theDelegationRegistered80PeopleInTheSupporterTicketOffice, 0) / ambianceScores.length,
                firstDelegationToRegister100PeopleInTheSupporterTicketOffice: ambianceScores.reduce((total, next) => total + next.firstDelegationToRegister100PeopleInTheSupporterTicketOffice, 0) / ambianceScores.length,
                firstDelegationToRegister200PeopleInTheSupporterTicketOffice: ambianceScores.reduce((total, next) => total + next.firstDelegationToRegister200PeopleInTheSupporterTicketOffice, 0) / ambianceScores.length,
                sportyAndGoodNaturedAttitude: ambianceScores.reduce((total, next) => total + next.sportyAndGoodNaturedAttitude, 0) / ambianceScores.length,
                totalRespectAndMutualEncouragement: ambianceScores.reduce((total, next) => total + next.totalRespectAndMutualEncouragement, 0) / ambianceScores.length,
                totalRespectOfTheAllottedTimes: ambianceScores.reduce((total, next) => total + next.totalRespectOfTheAllottedTimes, 0) / ambianceScores.length,
                noDropImpeccableStand: ambianceScores.reduce((total, next) => total + next.noDropImpeccableStand, 0) / ambianceScores.length,
                flagDiversity: ambianceScores.reduce((total, next) => total + next.flagDiversity, 0) / ambianceScores.length,
                flagNumberOfFlags: ambianceScores.reduce((total, next) => total + next.flagNumberOfFlags, 0) / ambianceScores.length,
                flagVisualQuality: ambianceScores.reduce((total, next) => total + next.flagVisualQuality, 0) / ambianceScores.length,
                flagUse: ambianceScores.reduce((total, next) => total + next.flagUse, 0) / ambianceScores.length,
                standOriginality: ambianceScores.reduce((total, next) => total + next.standOriginality, 0) / ambianceScores.length,
                standBuildQuality: ambianceScores.reduce((total, next) => total + next.standBuildQuality, 0) / ambianceScores.length,
                standVisualQuality: ambianceScores.reduce((total, next) => total + next.standVisualQuality, 0) / ambianceScores.length,
                tifosDeploymentCoordination: ambianceScores.reduce((total, next) => total + next.tifosDeploymentCoordination, 0) / ambianceScores.length,
                tifosVeryOriginalConcept: ambianceScores.reduce((total, next) => total + next.tifosVeryOriginalConcept, 0) / ambianceScores.length,
                tifosImpressiveAndHighQuality: ambianceScores.reduce((total, next) => total + next.tifosImpressiveAndHighQuality, 0) / ambianceScores.length,
                songsRelatedToTheTheme: ambianceScores.reduce((total, next) => total + next.songsRelatedToTheTheme, 0) / ambianceScores.length,
                costumesAndMakeup: ambianceScores.reduce((total, next) => total + next.costumesAndMakeup, 0) / ambianceScores.length,
                perfectlyDecoratedAndInTuneStand: ambianceScores.reduce((total, next) => total + next.perfectlyDecoratedAndInTuneStand, 0) / ambianceScores.length,
                strongAndConsistentVisualDistribution: ambianceScores.reduce((total, next) => total + next.strongAndConsistentVisualDistribution, 0) / ambianceScores.length,
                tribuneSongsDiversity: ambianceScores.reduce((total, next) => total + next.tribuneSongsDiversity, 0) / ambianceScores.length,
                tribuneSongsEndurance: ambianceScores.reduce((total, next) => total + next.tribuneSongsEndurance, 0) / ambianceScores.length,
                tribuneQualityOfSongs: ambianceScores.reduce((total, next) => total + next.tribuneQualityOfSongs, 0) / ambianceScores.length,
                tribuneFanfareCoordinationWithSupporters: ambianceScores.reduce((total, next) => total + next.tribuneFanfareCoordinationWithSupporters, 0) / ambianceScores.length,
                tribuneFanfareInstruments: ambianceScores.reduce((total, next) => total + next.tribuneFanfareInstruments, 0) / ambianceScores.length,
                tribuneFanfareRhythmic: ambianceScores.reduce((total, next) => total + next.tribuneFanfareRhythmic, 0) / ambianceScores.length,
                tribuneFervorJoyfulElectricAtmosphere: ambianceScores.reduce((total, next) => total + next.tribuneFervorJoyfulElectricAtmosphere, 0) / ambianceScores.length,
                tribuneFervorDanceChoreEntertainment: ambianceScores.reduce((total, next) => total + next.tribuneFervorDanceChoreEntertainment, 0) / ambianceScores.length,
            }
            const affectedArbitratorsId = await AmbianceScore.find({school: sessionSchool._id}).distinct('arbitrator')
            const affectedArbitrators = await User.find({
                '_id': affectedArbitratorsId
            });
            const arbitrators = await User.find({role: "Arbitrator"})

            res.render('ambiance-average', {
                global: global,
                arbitrators: arbitrators,
                affectedArbitrators: affectedArbitrators,
                sessionSchool: sessionSchool,
                ambianceScore: ambianceScore
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({error: 'Erreur serveur lors du chargement des routes.'});
        }
    });

    route.get('/ambianceform/:school', async (req, res, next) => {
        try {
            var global = await utils.getGlobal(req)

            const sessionSchool = await School.findOne({name: req.params.school});
            var ambianceScore = await AmbianceScore.findOne({arbitrator: req.session.userid});

            res.render('ambiance-form', {
                global: global,
                sessionSchool: sessionSchool,
                ambianceScore: ambianceScore
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({error: 'Erreur serveur lors du chargement des routes.'});
        }
    });

    route.post('/ambiance/update', async (req, res, next) => {
        AmbianceScore.findByIdAndUpdate(req.body._id, req.body,
            function (err, docs) {
                if (err) {
                    console.log(err)
                    res.sendStatus(500);
                } else {
                    res.sendStatus(200);
                }
            });
    });

    route.post('/ambiance/affectarbitrator', async (req, res, next) => {
        var formdata = {
            school: req.body.schoolId,
            arbitrator: req.body.arbitratorId,
        };
        const school = await School.findOne({_id: req.body.schoolId})
        await AmbianceScore.create(formdata, function (err, res) {
            if (err) {
                console.log(err, res);
                return res.status(500).send(err);
            }
        });
        return res.redirect("/ambiance/" + school.name)
    });

    route.post('/ambiance/removearbitrator', async (req, res, next) => {
        AmbianceScore.deleteOne({
            school: req.body.schoolId,
            arbitrator: req.body.arbitratorId
        }, function (err, result) {
            if (err) {
                console.log(err, result);
                res.status(500).send(err);
            } else
                res.sendStatus(200)
        });
    });
}
