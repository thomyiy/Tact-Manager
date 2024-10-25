const express = require('express');
const ArbitratorController = require("../controller/ArbitratorController");
const Arbitrator = require("../models/ArbitratorModel");
const Teams = require("../models/TeamModel");
const utils = require("../controller/Utils");
const route = express.Router();

module.exports = function (route) {
    route.get('/arbitrator/management', async (req, res, next) => {
        const user = {
            role: req.session.role,
            firstname: req.session.firstname,
            lastname: req.session.lastname,
        }
        const teams = await Teams.find({});
        const  global = await utils.getGlobal(req)
        res.render('arbitrator-management', {global: global, teams: teams})
    })

    route.get('/arbitrator/exist/:arbitratorName', async (req, res, next) => {
        try {
            const arbitrator = await Arbitrator.findOne({ name: req.params.arbitratorName });
            
            if (arbitrator) {
                return res.status(200).json({ exists: true });
            } else {
                return res.status(200).json({ exists: false });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur serveur lors de la vérification de l\'arbitre.' });
        }
    });

    route.get('/arbitrator/getAll', async (req, res, next) => {
        const arbitrators = await Arbitrator.find({});
        res.send(arbitrators)
    })

    route.post('/arbitrator/create', ArbitratorController.create)
}
