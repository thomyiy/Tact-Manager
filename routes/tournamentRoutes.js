 const express = require('express');
const TournamentController = require("../controller/TournamentController");
const Match = require("../models/MatchModel");
const Sport = require("../models/SportModel");
const Teams = require("../models/TeamModel");
const School = require("../models/SchoolModel");
const Pool = require("../models/PoolModel");
const Program = require("../models/ProgramModel");
const route = express.Router();
const utils = require("../controller/Utils")

module.exports = function (route) {
    // route pour les tournois de foot, hand, basket
    route.get('/tournament/:sport/:program', async (req, res, next) => {
        try {
            const sport = req.params.sport;
            const program = req.params.program;

            const teams = await Teams.find({});

            const  global = await utils.getGlobal(req)
            res.render('tournament-view', {global: global, sport: sport, program: program, teams: teams});
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur serveur lors du chargement des routes.' });
        }
    });

    route.get('/tournament/management', async (req, res, next) => {
        try {
            // const sport = req.params.sport;
            // const program = req.params.program;
            // const user = {
            //     role: req.session.role,
            //     firstname: req.session.firstname,
            //     lastname: req.session.lastname,
            // }
            const schools = await School.find({});
            const teams = await Teams.find({});
            // res.render('tournament-management', {user: user, sport: sport, program: program});
            const  global = await utils.getGlobal(req)

            res.render('tournament-management', {global: global, teams: teams});
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur serveur lors du chargement des routes.' });
        }
    });

    route.get('/tournament/:sport/:program/getAllMatches', async (req, res, next) => {
        try{
            const program = await Program.findOne({ name: req.params.program });
            const sport = await Sport.findOne({ name: req.params.sport  });

            const matches = await Match.find({ sport: sport._id, program: program._id })
            .populate({
                path: 'team1 team2 winnerTeam',
                populate: { path: 'school', select: 'name' }
            })
            .populate('sport pool program');
            res.json(matches);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur serveur lors de la recuperation des donnes de tournoi.' });
        }
    });

    route.get('/tournament/:sport/:program/getPoule/:name', async (req, res, next) => {
        try {
            const sportName = req.params.sport;
            const programParam = req.params.program;

            const sport = await Sport.findOne({ name: sportName });
            const program = await Program.findOne({ name: programParam });
            const pool = await Pool.findOne({ name: req.params.name, sport: sport._id, program: program._id });
            // pool vaut rien si aucun match n'a été crée
            if (pool) {
                const matches = await Match.find({ sport: sport._id, program: program._id, pool: pool._id })
                .populate({
                        path: 'team1 team2 winnerTeam',
                        populate: { path: 'school', select: 'name' }
                    })
                    .populate('sport pool program')
                    .populate('arbitrator', 'name');
                res.json(matches);
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur serveur lors de la récupération des données de tournoi.' });
        }
    });

    route.post('/tournament/assign/:sport/:program',TournamentController.assign)

    route.post('/tournament/create/:program',TournamentController.create)
    
    route.post('/tournament/updateMatch/:sport/:program', TournamentController.update)
    
    route.post('/tournament/updateMatchStatus/:sport/:program', TournamentController.updateMatchStatus)

    route.post('/tournament/clearMatch/:sport/:program', TournamentController.clear)

    route.delete('/tournament/delete',TournamentController.deleteTournament)
}
