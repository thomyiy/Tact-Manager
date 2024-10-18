const express = require('express');
const TeamController = require("../controller/TeamController");
const Team = require("../models/TeamModel");
const School = require("../models/SchoolModel");
const Sport = require("../models/SportModel");
const Pool = require("../models/PoolModel");
const Program = require("../models/ProgramModel");
const { get } = require('browser-sync');
const route = express.Router();

module.exports = function (route) {
    route.get('/team/management', async (req, res, next) => {
        const user = {
            role: req.session.role,
            firstname: req.session.firstname,
            lastname: req.session.lastname,
        }
        const teams = await Team.find({}).populate('school sport program');
        const schools = await School.find({});
        res.render('team-management', {user: user, teams: teams, schools: schools})
    })

    route.get('/team/getAll', async (req, res, next) => {
        try {
            const teams = await Team.find().populate('school sport program');
            res.send(teams);
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur lors de la récupération des équipes de football');
        }
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

    route.get('/team/:sport/:program/getRanking/:name', async (req, res, next) => {
        try {
            const program = await Program.findOne({ name: req.params.program });
            const sport = await Sport.findOne({ name: req.params.sport });
            const pool = await Pool.findOne({ name: req.params.name, sport: sport._id });
            // pool vaut rien si aucun match n'a été crée
            if (pool) {
                const teams = await Team.find({ sport: sport._id, pool: pool._id, program: program._id })
                .populate('school sport pool');
    
                res.send(teams);
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur lors de la récupération des équipes de football');
        }
    });

    route.post('/team/create', TeamController.create)
}
