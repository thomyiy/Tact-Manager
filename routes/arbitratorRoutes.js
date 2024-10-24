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

    route.get('/arbitrator/getAll', async (req, res, next) => {
        const arbitrators = await Arbitrator.find({});
        res.send(arbitrators)
    })

    route.post('/arbitrator/create', ArbitratorController.create)
}
