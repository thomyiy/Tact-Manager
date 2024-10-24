const express = require('express');
const SchoolController = require("../controller/SchoolController");
const School = require("../models/SchoolModel");
const Teams = require("../models/TeamModel");
const utils = require("../controller/Utils");
const route = express.Router();

module.exports = function (route) {
    route.get('/school/management', async (req, res, next) => {
        const user = {
            role: req.session.role,
            firstname: req.session.firstname,
            lastname: req.session.lastname,
        }
        const teams = await Teams.find({});
        const  global = await utils.getGlobal(req)
        res.render('school-management', {global: global, teams: teams})
    })

    route.get('/school/getAll', async (req, res, next) => {
        const schools = await School.find({});
        res.send(schools)
    })

    route.post('/school/create',SchoolController.create)
}
