const express = require('express');
const SchoolController = require("../controller/SchoolController");
const School = require("../models/SchoolModel");
const Teams = require("../models/TeamModel");
const route = express.Router();

module.exports = function (route) {
    route.get('/school/management', async (req, res, next) => {
        const user = {
            role: req.session.role,
            firstname: req.session.firstname,
            lastname: req.session.lastname,
        }
        const schools = await School.find({});
        const teams = await Teams.find({});
        res.render('school-management', {user: user, schools: schools, teams: teams})
    })

    route.get('/school/getAll', async (req, res, next) => {
        const schools = await School.find({});
        res.send(schools)
    })

    route.post('/school/create',SchoolController.create)
}
