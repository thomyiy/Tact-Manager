const express = require('express');
const School = require("../models/SchoolModel");
const User = require("../models/UserModel");
const AmbianceCortegeScore = require("../models/AmbianceCortegeScoreModel");
const AmbianceOpeningScore = require("../models/AmbianceOpeningScoreModel");
const AmbianceMatchsScore = require("../models/AmbianceMatchsScoreModel");
const AmbianceStandsScore = require("../models/AmbianceStandsScoreModel");
const AmbianceFinalScore = require("../models/AmbianceFinalScoreModel");
const AmbianceHospitalityScore = require("../models/AmbianceHospitalityScoreModel");
const mongoose = require("mongoose");
const route = express.Router();
const utils = require("../controller/Utils")

module.exports = function (route) {

    function getModelType(type) {
        switch (type) {
            case 'cortege':
                return AmbianceCortegeScore
            case 'opening':
                return AmbianceOpeningScore
            case 'matchs':
                return AmbianceMatchsScore
            case 'stands':
                return AmbianceStandsScore
            case 'final':
                return AmbianceFinalScore
            case 'hospitality':
                return AmbianceHospitalityScore
        }
    }

    route.get('/ambiance/global', async (req, res, next) => {

        let global = await utils.getGlobal(req)
        let schools = await School.find()

        res.render('ambiance/ambiance-global', {
            global: global,
            schools:schools
        });
    })

    route.get('/ambiance/:school/:type', async (req, res, next) => {

        const sessionSchool = await School.findOne({name: req.params.school});
        const type = req.params.type
        let ambianceModel = getModelType(type)

        if (ambianceModel != null) {
            const ambianceScores = await ambianceModel.find({school: sessionSchool._id}).populate("arbitrator");

            var global = await utils.getGlobal(req)

            if (global.user.role === "Admin") {

                const affectedArbitratorsId = await ambianceModel.find({school: sessionSchool._id}).distinct('arbitrator')
                const affectedArbitrators = await User.find({
                    '_id': affectedArbitratorsId
                });
                const arbitrators = await User.find({
                    role: "Arbitrator",
                    _id: {$nin: affectedArbitratorsId.map(a => a._id)}
                })

                res.render('ambiance/ambiance-admin', {
                    global: global,
                    arbitrators: arbitrators,
                    affectedArbitrators: affectedArbitrators,
                    sessionSchool: sessionSchool,
                    ambianceScores: ambianceScores,
                    type: type
                });
            } else {
                console.log(global.user)
                const ambianceScore = await ambianceModel.findOne({
                    arbitrator: global.user.userid,
                    school: sessionSchool._id
                }).populate("arbitrator");

                res.render('ambiance/ambiance-arbitrator', {
                    global: global,
                    sessionSchool: sessionSchool,
                    ambianceScore: ambianceScore,
                    ambianceScores: ambianceScores,
                    type: type
                });
            }
        }
    })

    route.post('/ambiance/:type/update', async (req, res, next) => {
        const type = req.params.type
        let ambianceModel = getModelType(type)

        if (ambianceModel != null) {
            ambianceModel.findByIdAndUpdate(req.body._id, req.body,
                function (err, docs) {
                    if (err) {
                        console.log(err)
                        res.sendStatus(500);
                    } else {
                        res.sendStatus(200);
                    }
                });
        } else {
            res.sendStatus(500);
        }
    })

    route.post('/ambiance/:type/affectarbitrator', async (req, res, next) => {
        const type = req.params.type
        let ambianceModel = getModelType(type)
        const school = await School.findOne({_id: req.body.schoolId})

        if (ambianceModel != null) {
            var formdata = {
                school: req.body.schoolId,
                arbitrator: req.body.arbitratorId,
            };
            await ambianceModel.create(formdata, function (err, res) {
                if (err) {
                    console.log(err, res);
                    return res.status(500).send(err);
                }
            });
        }
        return res.redirect("/ambiance/" + school.name + "/" + type)
    })

    route.post('/ambiance/:type/removearbitrator', async (req, res, next) => {
        const type = req.params.type
        let ambianceModel = getModelType(type)
        if (ambianceModel != null) {
            ambianceModel.deleteOne({
                school: req.body.schoolId,
                arbitrator: req.body.arbitratorId
            }, function (err, result) {
                if (err) {
                    console.log(err, result);
                    res.status(500).send(err);
                } else
                    res.sendStatus(200)
            });
        } else {
            res.sendStatus(500);
        }
    })

    route.get('/ambiance/:school', async (req, res, next) => {
        try {
            var global = await utils.getGlobal(req)

            const sessionSchool = await School.findOne({name: req.params.school});
            const ambianceCortegeScore = await AmbianceCortegeScore.find({school: sessionSchool._id});
            const ambianceOpeningScore = await AmbianceOpeningScore.find({school: sessionSchool._id});
            const ambianceMatchsScore = await AmbianceMatchsScore.find({school: sessionSchool._id});
            const ambianceStandsScore = await AmbianceStandsScore.find({school: sessionSchool._id});
            const ambianceFinalScore = await AmbianceFinalScore.find({school: sessionSchool._id});
            const ambianceHospitalityScore = await AmbianceHospitalityScore.find({school: sessionSchool._id});

            res.render('ambiance/ambiance-average', {
                global: global,
                sessionSchool: sessionSchool,
                ambianceCortegeScore: ambianceCortegeScore,
                ambianceOpeningScore: ambianceOpeningScore,
                ambianceMatchsScore: ambianceMatchsScore,
                ambianceStandsScore: ambianceStandsScore,
                ambianceFinalScore: ambianceFinalScore,
                ambianceHospitalityScore: ambianceHospitalityScore
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({error: 'Erreur serveur lors du chargement des routes.'});
        }
    });
}
