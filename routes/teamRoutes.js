const express = require('express');
const TeamController = require("../controller/TeamController");
const Team = require("../models/TeamModel");
const School = require("../models/SchoolModel");
const Sport = require("../models/SportModel");
const route = express.Router();

module.exports = function (route) {
    route.get('/team/management', async (req, res, next) => {
        const user = {
            role: req.session.role,
            firstname: req.session.firstname,
            lastname: req.session.lastname,
        }
        const teams = await Team.find({})
        res.render('team-management', {user: user, teams: teams})
    })

    route.get('/team/getAll', async (req, res, next) => {
        const teams = await Team.find({}).populate('school').populate('sport').exec((err,teams)=>{
            if (err) {
                console.log(err, res);
                return res.status(500).send(err);
            }
            return res.send(teams)
        })
    })

    route.post('/team/create', TeamController.create)
}
