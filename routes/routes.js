const express = require('express');
const route = express.Router();
const path = require('path');
const fs = require('fs');

const AuthController = require("../controller/AuthController");
const User = require("../models/UserModel");
const School = require("../models/SchoolModel");
const mongoose = require("mongoose");
const uuid = require("uuid");
const jwt = require('jsonwebtoken')
const utils = require("../controller/Utils");
const CheerleadingScore = require("../models/CheerleadingScoreModel");
const AmbianceCortegeScore = require("../models/AmbianceCortegeScoreModel");
const AmbianceOpeningScore = require("../models/AmbianceOpeningScoreModel");
const AmbianceMatchsScore = require("../models/AmbianceMatchsScoreModel");
const AmbianceStandsScore = require("../models/AmbianceStandsScoreModel");
const AmbianceFinalScore = require("../models/AmbianceFinalScoreModel");
const AmbianceHospitalityScore = require("../models/AmbianceHospitalityScoreModel");
const Team = require('../models/TeamModel');
const Sport = require('../models/SportModel');
const Pool = require('../models/PoolModel');
const Match = require('../models/MatchModel');
const Program = require('../models/ProgramModel');
const TeamPoint = require('../models/TeamPointModel');

module.exports = function (route) {
    route.use((req, res, next) => {
        var uemail = req.session.useremail;
        const allowUrls = ["/public-data", "/login", "/auth-validate", "/register", "/signup", "/forgotpassword", "/sendforgotpasswordlink", "/resetpassword", "/error", "/changepassword"];

        if (allowUrls.indexOf(req.path) !== -1) {
            if (uemail != null && uemail != undefined) {
                return res.redirect('/');
            }
        } else if (!uemail) {
            return res.redirect('/login');
        }
        next();
    })

    route.get('/auth-confirm-mail', (req, res, next) => {
        res.render('auth-confirm-mail', {layout: 'layout/layout-without-nav'});
    })
    route.get('/auth-email-verification', (req, res, next) => {
        res.render('auth-email-verification', {layout: 'layout/layout-without-nav'});
    })
    route.get('/auth-lock-screen', (req, res, next) => {
        res.render('auth-lock-screen', {layout: 'layout/layout-without-nav'});
    })
    route.get('/auth-login', (req, res, next) => {
        res.render('auth-login', {layout: 'layout/layout-without-nav'});
    })
    route.get('/auth-logout', (req, res, next) => {
        res.render('auth-logout', {layout: 'layout/layout-without-nav'});
    })
    route.get('/auth-recoverpw', (req, res, next) => {
        res.render('auth-recoverpw', {layout: 'layout/layout-without-nav'});
    })
    route.get('/auth-register', (req, res, next) => {
        res.render('auth-register', {layout: 'layout/layout-without-nav'});
    })
    route.get('/auth-two-step-verification', (req, res, next) => {
        res.render('auth-two-step-verification', {layout: 'layout/layout-without-nav'});
    })

    route.get('/', async (req, res, next) => {
        res.redirect('/dashboard');
    })

    route.get('/index', (req, res, next) => {
        res.redirect('/dashboard');
    })

    route.get('/layouts-vertical', (req, res, next) => {
        res.render('layouts-vertical');//, {layout: 'layout/layout-vertical'});
    })

    // Auth
    route.get('/login', (req, res, next) => {
        res.render('auth/login', {
            title: 'Login',
            layout: 'layout/layout-without-nav',
            'message': req.flash('message'),
            error: req.flash('error')
        })
    })

    // validate login form
    route.post("/auth-validate", AuthController.validate)

    // logout
    route.get("/logout", AuthController.logout);

    route.get('/register', (req, res, next) => {
        res.render('auth/register', {
            title: 'Register',
            layout: 'layout/layout-without-nav',
            'message': req.flash('message'),
            'error': req.flash('error')
        })
    })

    // validate register form
    route.post("/signup", AuthController.signup)


    route.get('/forgotpassword', (req, res, next) => {
        res.render('auth/forgotpassword', {
            title: 'Forgot password',
            layout: 'layout/layout-without-nav',
            message: req.flash('message'),
            error: req.flash('error')
        })
    })

    // send forgot password link on user email
    route.post("/sendforgotpasswordlink", AuthController.forgotpassword)

    // reset password
    route.get("/resetpassword", AuthController.resetpswdview);
    // Change password
    route.post("/changepassword", AuthController.changepassword);

    //500
    route.get('/error', (req, res, next) => {
        res.render('auth/auth-500', {title: '500 Error', layout: 'layout/layout-without-nav'});
    })

    route.get('/faq', async (req, res, next) => {
        const global = await utils.getGlobal(req)

        if (req.session.role === "Admin")
            res.render('pages-faqs-admin', {global: global})
        else if (req.session.role === "Arbitrator")
            res.render('pages-faqs-arbitrator', {global: global})
    })

    route.get('/public-data', (req, res, next) => {
        res.render('public-data', {
            title: 'public-data',
            layout: 'layout/layout-without-nav'
        })
    })

    route.get('/ranking', async (req, res, next) => {
        await School.updateMany({}, { totalPoints: 0 });
        
        const global = await utils.getGlobal(req)

        let fifa = await School.find({}, null, {sort: {fifaPosition: 1}})
        let mk = await School.find({}, null, {sort: {mkPosition: 1}})
        
        assignBonusPointsBYGame(fifa, mk);

        let cheerleading = await orderCheerleading()
        let ambiance = await orderAmbiance()
        
        let futsalMaleRanking = await orderSportRanking("Football", "Masculin");
        futsalMaleRankingTempValues = await rankPoints(futsalMaleRanking);

        let futsalFemaleRanking = await orderSportRanking("Football", "Féminin");
        futsalFemaleRankingTempValues = await rankPoints(futsalFemaleRanking);

        await assignBonusPointsBySport(futsalMaleRankingTempValues, futsalFemaleRankingTempValues);

        let basketballMaleRanking = await orderSportRanking("Basketball", "Masculin");
        basketballMaleRankingTempValues = await rankPoints(basketballMaleRanking);

        let basketballFemaleRanking = await orderSportRanking("Basketball", "Féminin");
        basketballFemaleRankingTempValues = await rankPoints(basketballFemaleRanking);

        await assignBonusPointsBySport(basketballMaleRankingTempValues, basketballFemaleRankingTempValues);

        let handballMaleRanking = await orderSportRanking("Handball", "Masculin");
        handballMaleRankingTempValues = await rankPoints(handballMaleRanking);

        let handballFemaleRanking = await orderSportRanking("Handball", "Féminin");
        handballFemaleRankingTempValues = await rankPoints(handballFemaleRanking);

        await assignBonusPointsBySport(handballMaleRankingTempValues, handballFemaleRankingTempValues);

        let globalRanking = await orderGlobalRanking();
        
        res.render('ranking', {
            global: global,
            fifa: fifa,
            mk: mk,
            cheerleading: cheerleading,
            ambiance: ambiance,
            futsalMaleRanking: futsalMaleRankingTempValues,
            futsalFemaleRanking: futsalFemaleRankingTempValues,
            basketballMaleRanking: basketballMaleRankingTempValues,
            basketballFemaleRanking: basketballFemaleRankingTempValues,
            handballMaleRanking: handballMaleRankingTempValues,
            handballFemaleRanking: handballFemaleRankingTempValues,
            globalRanking: globalRanking
        })
    })

    async function assignBonusPointsBYGame(fifa, mk) {
        if (fifa[0].totalPoints > 0)
            await School.updateOne({ name: fifa[0].name }, { $inc: { totalPoints: 50 } });

        if (mk[0].totalPoints > 0)
            await School.updateOne({ name: mk[0].name }, { $inc: { totalPoints: 50 } });
    }

    async function assignBonusPointsBySport(MaleRanking, FemaleRanking) {

        if (MaleRanking.length == 0 || FemaleRanking.length == 0) {
            return;
        }

        let schoolScores = [];

        for (let i = 0; i < MaleRanking.length; i++) {
            let school = MaleRanking[i].team;
    
            for (let j = 0; j < FemaleRanking.length; j++) {
                if (school == FemaleRanking[j].team) {
                    let totalPoints = MaleRanking[i].pointsToShow + FemaleRanking[j].pointsToShow;
    
                    schoolScores.push({
                        school: school,
                        points: totalPoints,
                    });
                }
            }
        }
    
        schoolScores.sort((a, b) => b.points - a.points);

        await School.updateOne({ name: schoolScores[0].school }, { $inc: { totalPoints: 20 } });
        await School.updateOne({ name: schoolScores[1].school }, { $inc: { totalPoints: 10 } });
        await School.updateOne({ name: schoolScores[2].school }, { $inc: { totalPoints: 5 } });
    
        return schoolScores.slice(0, 3);
    }
    
    async function rankPoints(data) {
        let tempValues = [];
        for (let i = 0; i < data.length; i++) {
            let points;
            let pointOfTeam = data[i].points;

            if (i === 0) points = 60; 
            else if (i === 1) points = 40;
            else if (i === 2 || i === 3) points = 25;
            else {
                if (pointOfTeam == 0) points = 5;
                else if (pointOfTeam == 1) points = 10;
                else if (pointOfTeam >= 3) points = 15;
            }

            tempValues.push({team: data[i].team.school.name, pointsToShow: points});

            await School.updateOne({ _id: data[i].team.school._id }, { $inc: { totalPoints: points } });
        }
        return tempValues;
    }

    async function orderGlobalRanking() {
        let result = [];

        const schools = await School.find();
        result.push(...schools);
        result = result.sort(sortSchoolPoint);

        return result;
    }

    async function orderSportRanking(sportName, programName) {
        let result = [];

        const sport = await Sport.findOne({ name: sportName });
        const program = await Program.findOne({ name: programName });
        
        const finalPool = await Pool.findOne({ name: "Final" , sport: sport._id, program: program._id });
        if (finalPool == null || !finalPool.isFinished) {
            return result;
        }

        const teamPoints = await TeamPoint.find({ pool: finalPool._id }).populate({
            path: 'team',
            populate: {path: 'school', select: 'name totalPoints'}
        });

        result = teamPoints.sort(sortTeamPoint);

        const semiFinalPool = await Pool.find({
            $or:[ {'name': "Demi-Finale 1"}, {'name': "Demi-Finale 2"} ],
            sport: sport._id,
            program: program._id
        });

        const semiFinalTP = await TeamPoint.find({pool: {$in: semiFinalPool.map(pool => pool._id)}, team: {$nin: result.map(teamPoint => teamPoint.team)} })
        .populate({
            path: 'team',
            populate: {path: 'school', select: 'name totalPoints'}
        });
        result = result.concat(semiFinalTP.sort(sortTeamPoint));

        const otherPools = await Pool.find({
            sport: sport._id,
            program: program._id,
            name: { $nin: ["Final", "Demi-finale 1", "Demi-finale 2"] }
        });

        const otherPoolsTP = await TeamPoint.find({pool: {$in: otherPools.map(pool => pool._id)}, team: {$nin: result.map(teamPoint => teamPoint.team)} })
        .populate({
            path: 'team',
            populate: {path: 'school', select: 'name totalPoints'}
        });
        result = result.concat(otherPoolsTP.sort(sortTeamPoint));

        return result;
    }

    function sortSchoolPoint(a, b) {
        if (b.totalPoints < a.totalPoints) return -1;
        if (b.totalPoints > a.totalPoints) return 1;
        return 0;
    }

    function sortTeamPoint(a, b) {
        if (b.points < a.points) return -1;
        if (b.points > a.points) return 1;
        if (b.goalAverage < a.goalAverage) return -1;
        if (b.goalAverage > a.goalAverage) return 1;
        if (b.goal < a.goal) return -1;
        if (b.goal > a.goal) return 1;
        if (b.random < a.random) return -1;
        if (b.random > a.random) return 1;
        return 0;
    }

    async function orderCheerleading() {
        let result = [];

        const schools = await School.find();
        for (let i = 0; i < schools.length; i++) {
            let school = schools[i];
            const cheerleadingScores = await CheerleadingScore.find({school: school._id});
            const cheerleadingScore = {
                name: school.name,
                score:
                    cheerleadingScores.reduce((total, next) => total + next.stuntDifficulty, 0) / cheerleadingScores.length +
                    cheerleadingScores.reduce((total, next) => total + next.stuntExecution, 0) / cheerleadingScores.length +
                    cheerleadingScores.reduce((total, next) => total + next.stuntSynchronization, 0) / cheerleadingScores.length +
                    cheerleadingScores.reduce((total, next) => total + next.stuntSecurity, 0) / cheerleadingScores.length +
                    cheerleadingScores.reduce((total, next) => total + next.choreographySynchronization, 0) / cheerleadingScores.length +
                    cheerleadingScores.reduce((total, next) => total + next.choreographyRythme, 0) / cheerleadingScores.length +
                    cheerleadingScores.reduce((total, next) => total + next.choreographyFluidity, 0) / cheerleadingScores.length +
                    cheerleadingScores.reduce((total, next) => total + next.tumblingDifficulty, 0) / cheerleadingScores.length +
                    cheerleadingScores.reduce((total, next) => total + next.tumblingExecution, 0) / cheerleadingScores.length +
                    cheerleadingScores.reduce((total, next) => total + next.tumblingSecurity, 0) / cheerleadingScores.length +
                    cheerleadingScores.reduce((total, next) => total + next.jumpDifficulty, 0) / cheerleadingScores.length +
                    cheerleadingScores.reduce((total, next) => total + next.jumpExecution, 0) / cheerleadingScores.length +
                    cheerleadingScores.reduce((total, next) => total + next.jumpSynchronization, 0) / cheerleadingScores.length +
                    cheerleadingScores.reduce((total, next) => total + next.interractionCreativity, 0) / cheerleadingScores.length +
                    cheerleadingScores.reduce((total, next) => total + next.interractionReaction, 0) / cheerleadingScores.length +
                    cheerleadingScores.reduce((total, next) => total + next.fairplayAttitude, 0) / cheerleadingScores.length +
                    cheerleadingScores.reduce((total, next) => total + next.fairplayrespect, 0) / cheerleadingScores.length
            }
            if (!cheerleadingScore.score) cheerleadingScore.score = 0
            await School.updateOne({ _id: school._id }, { $inc: { totalPoints: cheerleadingScore.score } });

            result.push(cheerleadingScore)
        }

        result.sort(function (x, y) {
            if (x.score < y.score) {
                return 1;
            }
            if (x.score > y.score) {
                return -1;
            }
            return 0;
        });
        return result;
    }

    async function orderAmbiance() {
        let result = [];
        const schools = await School.find();
        for (let i = 0; i < schools.length; i++) {
            let school = schools[i];

            const ambianceCortegeScores = await AmbianceCortegeScore.find({school: school._id});
            let ambianceCortegeScore = ambianceCortegeScores.reduce((total, next) => total + next.ArrivalWithTheEntireDelegationVeryGoodCoordination, 0) / ambianceCortegeScores.length +
                ambianceCortegeScores.reduce((total, next) => total + next.Songs, 0) / ambianceCortegeScores.length +
                ambianceCortegeScores.reduce((total, next) => total + next.CoordinationPerfectSynchronization, 0) / ambianceCortegeScores.length +
                ambianceCortegeScores.reduce((total, next) => total + next.CostumeMakeup, 0) / ambianceCortegeScores.length +
                ambianceCortegeScores.reduce((total, next) => total + next.WideVarietyOfInstruments, 0) / ambianceCortegeScores.length +
                ambianceCortegeScores.reduce((total, next) => total + next.OrganizationOfTheProcession, 0) / ambianceCortegeScores.length +
                ambianceCortegeScores.reduce((total, next) => total + next.ClearAndCatchyRhythm, 0) / ambianceCortegeScores.length +
                ambianceCortegeScores.reduce((total, next) => total + next.OverviewSpectacularAndSecure, 0) / ambianceCortegeScores.length
            if (!ambianceCortegeScore) ambianceCortegeScore = 0

            const ambianceOpeningScores = await AmbianceOpeningScore.find({school: school._id});
            let ambianceOpeningScore = ambianceOpeningScores.reduce((total, next) => total + next.CoordinationDeployment, 0) / ambianceOpeningScores.length +
                ambianceOpeningScores.reduce((total, next) => total + next.DiversityGreatVarietyOfDesignsAndColors, 0) / ambianceOpeningScores.length +
                ambianceOpeningScores.reduce((total, next) => total + next.InteractionWithAthletes, 0) / ambianceOpeningScores.length +
                ambianceOpeningScores.reduce((total, next) => total + next.NumberOfFlags, 0) / ambianceOpeningScores.length +
                ambianceOpeningScores.reduce((total, next) => total + next.VisualQuality, 0) / ambianceOpeningScores.length +
                ambianceOpeningScores.reduce((total, next) => total + next.VisualQualityAndConcept, 0) / ambianceOpeningScores.length +
                ambianceOpeningScores.reduce((total, next) => total + next.RespectThePassageTimeOfOtherDelegations, 0) / ambianceOpeningScores.length +
                ambianceOpeningScores.reduce((total, next) => total + next.SportsmansTour, 0) / ambianceOpeningScores.length +
                ambianceOpeningScores.reduce((total, next) => total + next.DynamicUse, 0) / ambianceOpeningScores.length +
                ambianceOpeningScores.reduce((total, next) => total + next.VisualFlagsTifo, 0) / ambianceOpeningScores.length
            if (!ambianceOpeningScore) ambianceOpeningScore = 0

            const ambianceMatchsScores = await AmbianceMatchsScore.find({school: school._id});
            let ambianceMatchsScore = ambianceMatchsScores.reduce((total, next) => total + next.AtmosphereBrothelElectricAndJoyfulAtmosphere, 0) / ambianceMatchsScores.length +
                ambianceMatchsScores.reduce((total, next) => total + next.AnimationImprovisationsFunnySongsInteractionsWithTheMatch, 0) / ambianceMatchsScores.length +
                ambianceMatchsScores.reduce((total, next) => total + next.VisualAnimationsDuringTheSongs, 0) / ambianceMatchsScores.length +
                ambianceMatchsScores.reduce((total, next) => total + next.PerfectlyCoordinatedAndLivelyDanceChoreaEntertainment, 0) / ambianceMatchsScores.length +
                ambianceMatchsScores.reduce((total, next) => total + next.DiversityWideVarietyOfSongsWithoutRepetitions, 0) / ambianceMatchsScores.length +
                ambianceMatchsScores.reduce((total, next) => total + next.SustainedEnduranceThroughoutTheDurationOfTheCompetition, 0) / ambianceMatchsScores.length +
                ambianceMatchsScores.reduce((total, next) => total + next.FairPlayRespect, 0) / ambianceMatchsScores.length +
                ambianceMatchsScores.reduce((total, next) => total + next.Maestro, 0) / ambianceMatchsScores.length +
                ambianceMatchsScores.reduce((total, next) => total + next.QualityOfClearAndMelodiousSinging, 0) / ambianceMatchsScores.length +
                ambianceMatchsScores.reduce((total, next) => total + next.OwnStand, 0) / ambianceMatchsScores.length
            if (!ambianceMatchsScore) ambianceMatchsScore = 0

            const ambianceStandsScores = await AmbianceStandsScore.find({school: school._id});
            let ambianceStandsScore = ambianceStandsScores.reduce((total, next) => total + next.OriginalityConcept, 0) / ambianceStandsScores.length +
                ambianceStandsScores.reduce((total, next) => total + next.SolidWellThoughtOutAndSecureBuildQuality, 0) / ambianceStandsScores.length +
                ambianceStandsScores.reduce((total, next) => total + next.VisualQuality, 0) / ambianceStandsScores.length +
                ambianceStandsScores.reduce((total, next) => total + next.Stand, 0) / ambianceStandsScores.length
            if (!ambianceStandsScore) ambianceStandsScore = 0

            const ambianceFinalScores = await AmbianceFinalScore.find({school: school._id});
            let ambianceFinalScore = ambianceFinalScores.reduce((total, next) => total + next.AtmosphereBrothelElectricAndJoyfulAtmosphere, 0) / ambianceFinalScores.length +
                ambianceFinalScores.reduce((total, next) => total + next.PerfectlyCoordinatedAndLivelyDanceChoreaEntertainment, 0) / ambianceFinalScores.length +
                ambianceFinalScores.reduce((total, next) => total + next.CoordinationDeployment, 0) / ambianceFinalScores.length +
                ambianceFinalScores.reduce((total, next) => total + next.FairPlayRespect, 0) / ambianceFinalScores.length +
                ambianceFinalScores.reduce((total, next) => total + next.QualityOfClearAndMelodiousSinging, 0) / ambianceFinalScores.length +
                ambianceFinalScores.reduce((total, next) => total + next.VisualQuality, 0) / ambianceFinalScores.length +
                ambianceFinalScores.reduce((total, next) => total + next.VisualQualityAndConcept, 0) / ambianceFinalScores.length +
                ambianceFinalScores.reduce((total, next) => total + next.RespectThePassageTimeOfOtherDelegations, 0) / ambianceFinalScores.length +
                ambianceFinalScores.reduce((total, next) => total + next.DynamicUse, 0) / ambianceFinalScores.length +
                ambianceFinalScores.reduce((total, next) => total + next.VisualFlagsTifo, 0) / ambianceFinalScores.length
            if (!ambianceFinalScore) ambianceFinalScore = 0

            const ambianceHospitalityScores = await AmbianceHospitalityScore.find({school: school._id});
            let ambianceHospitalityScore = ambianceHospitalityScores.reduce((total, next) => total + next.RegistrationAndPresenceOf5Alumni, 0) / ambianceHospitalityScores.length +
                ambianceHospitalityScores.reduce((total, next) => total + next.RegistrationAndPresenceOfTheDean, 0) / ambianceHospitalityScores.length
            if (!ambianceHospitalityScore) ambianceHospitalityScore = 0

            const ambianceScore = {
                name: school.name,
                score: ambianceCortegeScore +
                    ambianceOpeningScore +
                    ambianceMatchsScore +
                    ambianceStandsScore +
                    ambianceFinalScore +
                    ambianceHospitalityScore
            }
            await School.updateOne({ _id: school._id }, { $inc: { totalPoints: ambianceScore.score } });

            result.push(ambianceScore)
        }

        result.sort(function (x, y) {
            if (x.score < y.score) {
                return 1;
            }
            if (x.score > y.score) {
                return -1;
            }
            return 0;
        });
        return result;
    }
}
