const express = require('express');
const TeamController = require("../controller/TeamController");
const Team = require("../models/TeamModel");
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

    route.get('/team/:sport', async (req, res, next) => {
        try {
            const sportName = req.params.sport;
            const sport = await Sport.findOne({ name: sportName });            
            const teams = await Team.find({ sport: sport._id }).populate('school sport');
            res.send(teams);
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur lors de la récupération des équipes de football');
        }
    });

    route.get('/team/:sport/getRanking/:number', async (req, res, next) => {
        try {
            const poolNumber = req.params.number;
            const poolWanted = "Poule " + poolNumber;
            const sportName = req.params.sport;
            const sport = await Sport.findOne({ name: sportName });
            const teams = await Team.find({ sport: sport._id, pool: poolWanted }).populate('school sport');
            
            res.send(teams);
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur lors de la récupération des équipes de football');
        }
    });

    route.post('/team/create', TeamController.create)
}
