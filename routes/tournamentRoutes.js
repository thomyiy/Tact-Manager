const express = require('express');
const TournamentController = require("../controller/TournamentController");
const Match = require("../models/MatchModel");
const Sport = require("../models/SportModel");
const route = express.Router();

module.exports = function (route) {
    // route pour les tournois de foot, hand, basket
    route.get('/tournament/:sport', async (req, res, next) => {
        try {
            const user = {
                role: req.session.role,
                firstname: req.session.firstname,
                lastname: req.session.lastname,
            }
            
            const sport = req.params.sport;

            res.render('tournament-management', {user: user, sport: sport});
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur serveur lors du chargement des routes.' });
        }
    });

    route.get('/tournament/:sport/getAllMatches', async (req, res, next) => {
        try{
            const sportName = req.params.sport;
            const sport = await Sport.findOne({ name: sportName });
    
            const matches = await Match.find({ sport: sport._id });
            res.json(matches);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur serveur lors de la recuperation des donnes de tournoi.' });
        }
    });

    route.get('/tournament/:sport/getPoule/:number', async (req, res, next) => {
        try{
            const sportName = req.params.sport;
            const poolNumber = "Poule " + req.params.number;
            const sport = await Sport.findOne({ name: sportName });
    
            const matches = await Match.find({ sport: sport._id, pool: poolNumber});
            res.json(matches);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur serveur lors de la recuperation des donnes de tournoi.' });
        }
    });


    route.post('/tournament/:sport/updateMatch', TournamentController.update)
    
    route.post('/tournament/create',TournamentController.create)
}
