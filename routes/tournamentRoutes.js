const express = require('express');
const TournamentController = require("../controller/TournamentController");
const Match = require("../models/MatchModel");
const Sport = require("../models/SportModel");
const Team = require("../models/TeamModel");
const Field = require("../models/FieldModel");
const School = require("../models/SchoolModel");
const Pool = require("../models/PoolModel");
const Program = require("../models/ProgramModel");
const route = express.Router();
const utils = require("../controller/Utils")
const User = require("../models/UserModel");
var ObjectId = require('mongoose').Types.ObjectId;


module.exports = function (route) {
    route.get('/tournament/:pool/getAllMatches', async (req, res, next) => {
        try {
            const pool = await Pool.findOne({name: req.params.pool});
            const matches = await Match.find({sport: pool.sport, program: pool.program, pool: pool._id})
                .populate({
                    path: 'team1 team2 winnerTeam',
                    populate: {path: 'school', select: 'name'}
                })
                .populate('sport pool program')
                .populate('arbitrator', 'name');
            res.json(matches);
        } catch (err) {
            console.error(err);
            return res.status(500).json({error: 'Erreur serveur lors de la recuperation des donnes de tournoi.'});
        }
    });

    // route pour les tournois de foot, hand, basket
    route.get('/tournament/:sport/:program', async (req, res, next) => {
        try {
            const sport = await Sport.findOne({name: req.params.sport});
            const program = await Program.findOne({name: req.params.program});

            const global = await utils.getGlobal(req)
            //const pools = await Pool.find({sport: sport._id, program: program._id}).populate('team')

            var pools = await Pool.aggregate([
                {
                    $match: {sport: sport._id, program: program._id},
                },
                {
                    $lookup: {
                        from: "teams",
                        localField: "_id",
                        foreignField: "pool",
                        as: "teams",
                    },
                }, {
                    $lookup: {
                        from: "matches",
                        localField: "_id",
                        foreignField: "pool",
                        as: "matches",
                    },
                },
                {
                    $lookup: {
                        from: "teampoints",
                        localField: "teams._id",
                        foreignField: "team",
                        as: "teamPoints",
                    },
                },
            ]);

            pools = await Team.populate(pools, {path: "matches.team1 matches.team2 teamPoints.team", select: 'school'})
            pools = await School.populate(pools, {path: "matches.team1.school matches.team2.school", select: 'name'})
            pools = await School.populate(pools, {path: "teams.school teamPoints.team.school", select: 'name'})
            pools = await User.populate(pools, {path: "matches.arbitrator", select: 'firstname lastname'})
            pools = await Field.populate(pools, {path: "matches.field", select: 'name'})

            res.render('tournament-viewV2', {
                global: global,
                sport: sport,
                program: program,
                pools: pools
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({error: 'Erreur serveur lors du chargement des routes.'});
        }
    });

    route.get('/tournament/management', async (req, res, next) => {
        try {
            const football = await Sport.findOne({name: "Football"});
            const field1 = await Field.findOne({name: "Principale"});
            const field2 = await Field.findOne({name: "Annexe"});
            const teams = await Team.find({});
            const matchsField1 = await Match.find({field: field1._id, sport: football._id})
            .populate({
                path: 'team1 team2',
                populate: {path: 'school', select: 'name'}
            })
            .populate('sport pool program');

            const matchsField2 = await Match.find({field: field2._id, sport: football._id})
            .populate({
                path: 'team1 team2',
                populate: {path: 'school', select: 'name'}
            })
            .populate('sport pool program');

            const global = await utils.getGlobal(req)

            res.render('tournament-management', {global: global, teams: teams, matchsField1: matchsField1, matchsField2: matchsField2});
        } catch (err) {
            console.error(err);
            return res.status(500).json({error: 'Erreur serveur lors du chargement des routes.'});
        }
    });


    route.get('/tournament/:sport/:program/getPoule/:name', async (req, res, next) => {
        try {
            const sportName = req.params.sport;
            const programParam = req.params.program;

            const sport = await Sport.findOne({name: sportName});
            const program = await Program.findOne({name: programParam});
            const pool = await Pool.findOne({name: req.params.name, sport: sport._id, program: program._id});
            // pool vaut rien si aucun match n'a été crée
            if (pool) {
                const matches = await Match.find({sport: sport._id, program: program._id, pool: pool._id})
                    .populate({
                        path: 'team1 team2 winnerTeam',
                        populate: {path: 'school', select: 'name'}
                    })
                    .populate('sport pool program')
                    .populate('arbitrator', 'name');
                res.json(matches);
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({error: 'Erreur serveur lors de la récupération des données de tournoi.'});
        }
    });

    route.post('/tournament/assign/:sport/:program', TournamentController.assign)

    route.post('/tournament/create', TournamentController.create)

    route.post('/tournament/updateMatch/:sport/:program', TournamentController.update)

    route.post('/tournament/updateMatchStatus/:sport/:program', TournamentController.updateMatchStatus)

    route.post('/tournament/clearMatch/:sport/:program', TournamentController.clear)

    route.delete('/tournament/delete', TournamentController.deleteTournament)
}
