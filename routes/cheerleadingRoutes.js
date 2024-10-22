const express = require('express');
const CheerleadingController = require("../controller/CheerleadingController");
const School = require("../models/SchoolModel");
const User = require("../models/UserModel");
const CheerleadingScore = require("../models/CheerleadingScoreModel");
const mongoose = require("mongoose");
const route = express.Router();
const utils = require("../controller/Utils")

module.exports = function (route) {
    route.get('/cheerleading/:school', async (req, res, next) => {
        try {
            var global = await utils.getGlobal(req)

            const sessionSchool = await School.findOne({name: req.params.school});
            const cheerleadingScores = await CheerleadingScore.find({school: sessionSchool._id});
            const cheerleadingScore = {
                stuntDifficulty: cheerleadingScores.reduce((total, next) => total + next.stuntDifficulty, 0) / cheerleadingScores.length,
                stuntExecution: cheerleadingScores.reduce((total, next) => total + next.stuntExecution, 0) / cheerleadingScores.length,
                stuntSynchronization: cheerleadingScores.reduce((total, next) => total + next.stuntSynchronization, 0) / cheerleadingScores.length,
                stuntSecurity: cheerleadingScores.reduce((total, next) => total + next.stuntSecurity, 0) / cheerleadingScores.length,
                choreographySynchronization: cheerleadingScores.reduce((total, next) => total + next.choreographySynchronization, 0) / cheerleadingScores.length,
                choreographyRythme: cheerleadingScores.reduce((total, next) => total + next.choreographyRythme, 0) / cheerleadingScores.length,
                choreographyFluidity: cheerleadingScores.reduce((total, next) => total + next.choreographyFluidity, 0) / cheerleadingScores.length,
                tumblingDifficulty: cheerleadingScores.reduce((total, next) => total + next.tumblingDifficulty, 0) / cheerleadingScores.length,
                tumblingExecution: cheerleadingScores.reduce((total, next) => total + next.tumblingExecution, 0) / cheerleadingScores.length,
                tumblingSecurity: cheerleadingScores.reduce((total, next) => total + next.tumblingSecurity, 0) / cheerleadingScores.length,
                jumpDifficulty: cheerleadingScores.reduce((total, next) => total + next.jumpDifficulty, 0) / cheerleadingScores.length,
                jumpExecution: cheerleadingScores.reduce((total, next) => total + next.jumpExecution, 0) / cheerleadingScores.length,
                jumpSynchronization: cheerleadingScores.reduce((total, next) => total + next.jumpSynchronization, 0) / cheerleadingScores.length,
                interractionCreativity: cheerleadingScores.reduce((total, next) => total + next.interractionCreativity, 0) / cheerleadingScores.length,
                interractionReaction: cheerleadingScores.reduce((total, next) => total + next.interractionReaction, 0) / cheerleadingScores.length,
                fairplayAttitude: cheerleadingScores.reduce((total, next) => total + next.fairplayAttitude, 0) / cheerleadingScores.length,
                fairplayrespect: cheerleadingScores.reduce((total, next) => total + next.fairplayrespect, 0) / cheerleadingScores.length,
            }
            const affectedArbitratorsId = await CheerleadingScore.find({school: sessionSchool._id}).distinct('arbitrator')
            const affectedArbitrators = await User.find({
                '_id': affectedArbitratorsId
            });
            const arbitrators = await User.find({role: "Arbitrator"})

            res.render('cheerleading-average', {
                global: global,
                arbitrators: arbitrators,
                affectedArbitrators: affectedArbitrators,
                sessionSchool: sessionSchool,
                cheerleadingScore: cheerleadingScore
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({error: 'Erreur serveur lors du chargement des routes.'});
        }
    });

    route.get('/cheerleadingform/:school', async (req, res, next) => {
        try {
            var global = await utils.getGlobal(req)

            const sessionSchool = await School.findOne({name: req.params.school});
            var cheerleadingScore = await CheerleadingScore.findOne({arbitrator: req.session.userid});

            res.render('cheerleading-form', {
                global: global,
                sessionSchool: sessionSchool,
                cheerleadingScore: cheerleadingScore
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({error: 'Erreur serveur lors du chargement des routes.'});
        }
    });

    route.post('/cheerleading/update', async (req, res, next) => {
        CheerleadingScore.findByIdAndUpdate(req.body._id, req.body,
            function (err, docs) {
                if (err) {
                    console.log(err)
                    res.sendStatus(500);
                } else {
                    res.sendStatus(200);
                }
            });
    });

    route.post('/cheerleading/affectarbitrator', async (req, res, next) => {
        var formdata = {
            school: req.body.schoolId,
            arbitrator: req.body.arbitratorId,
        };
        const school = await School.findOne({_id: req.body.schoolId})
        await CheerleadingScore.create(formdata, function (err, res) {
            if (err) {
                console.log(err, res);
                return res.status(500).send(err);
            }
        });
        return res.redirect("/cheerleading/" + school.name)
    });

    route.post('/cheerleading/removearbitrator', async (req, res, next) => {
        CheerleadingScore.deleteOne({
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
