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
const CheerleadingScore = require("../models/CheerleadingScoreModel");

module.exports = function (route) {

    route.get('/esport/fifa/', async (req, res, next) => {
        var global = await utils.getGlobal(req)
        var schools = await School.find();
        res.render('esport/fifa-management', {
            global: global,
            schools: schools
        });
    })
    route.get('/esport/mk/', async (req, res, next) => {
        var global = await utils.getGlobal(req)
        var schools = await School.find();
        res.render('esport/mk-management', {
            global: global,
            schools: schools
        });
    })
    route.post('/esport/fifa/update/', async (req, res, next) => {
        School.findByIdAndUpdate(req.body._id, req.body,
            function (err, docs) {
                if (err) {
                    console.log(err)
                    res.sendStatus(500);
                } else {
                    res.sendStatus(200);
                }
            });
    });

    route.post('/esport/mk/update/', async (req, res, next) => {
        School.findByIdAndUpdate(req.body._id, req.body,
            function (err, docs) {
                if (err) {
                    console.log(err)
                    res.sendStatus(500);
                } else {
                    res.sendStatus(200);
                }
            });
    });
}
