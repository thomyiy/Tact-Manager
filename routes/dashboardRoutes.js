const express = require('express');
const DashboardController = require("../controller/DashboardController");
const School = require("../models/SchoolModel");
const route = express.Router();
const utils = require("../controller/Utils")
module.exports = function (route) {
    route.get('/dashboard', async (req, res, next) => {
        try {
            const user = req.session
            var global = await utils.getGlobal(req)
            if (user.role === "Admin")
                res.render('dashboard-admin', {global:global});
            else if (user.role === "Arbitrator")
                res.render('dashboard-arbitrator', {global:global});
            else if (user.role === "User")
                res.render('dashboard-user', {global:global});

        } catch (err) {
            console.error(err);
            return res.status(500).json({error: 'Erreur serveur lors du chargement des routes.'});
        }
    });
}
