const express = require('express');
const TournamentController = require("../controller/TournamentController");
const Match = require("../models/MatchModel");
const Sport = require("../models/SportModel");
const route = express.Router();

module.exports = function (route) {
    // route pour les tournois de foot, hand, basket
    route.get('/tournament/:sport/:sexe', async (req, res, next) => {
        try {
            const sport = req.params.sport;
            const sexe = req.params.sexe;
            const user = {
                role: req.session.role,
                firstname: req.session.firstname,
                lastname: req.session.lastname,
            }

            res.render('tournament-view', {user: user, sport: sport, sexe: sexe});
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur serveur lors du chargement des routes.' });
        }
    });

    route.get('/tournament/management', async (req, res, next) => {
        try {
            const sport = req.params.sport;
            const sexe = req.params.sexe;
            const user = {
                role: req.session.role,
                firstname: req.session.firstname,
                lastname: req.session.lastname,
            }

            res.render('tournament-management', {user: user, sport: sport, sexe: sexe});
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur serveur lors du chargement des routes.' });
        }
    });

    route.get('/tournament/:sport/:sexe/getAllMatches', async (req, res, next) => {
        try{
            const sportName = req.params.sport;
            const sexeType = req.params.sexe;
            const sport = await Sport.findOne({ name: sportName,  });
    
            const matches = await Match.find({ sport: sport._id, sexe: sexeType });
            res.json(matches);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur serveur lors de la recuperation des donnes de tournoi.' });
        }
    });

    route.get('/tournament/:sport/:sexe/getPoule/:number', async (req, res, next) => {
        try{
            const sportName = req.params.sport;
            const sexeType = req.params.sexe;
            const poolNumber = "Poule " + req.params.number;
            const sport = await Sport.findOne({ name: sportName });
    
            const matches = await Match.find({ sport: sport._id, sexe: sexeType, pool: poolNumber});
            res.json(matches);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur serveur lors de la recuperation des donnes de tournoi.' });
        }
    });

    route.post('/tournament/create/:sexe',TournamentController.create)
    
    route.post('/tournament/updateMatch/:sport/:sexe', TournamentController.update)

    route.delete('/tournament/delete/:sexe',TournamentController.deleteTournament)
}
