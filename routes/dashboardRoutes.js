const express = require('express');
const DashboardController = require("../controller/DashboardController");
const School = require("../models/SchoolModel");
const route = express.Router();

module.exports = function (route) {
    route.get('/dashboard', async (req, res, next) => {
        try {
            const user = {
                role: req.session.role,
                firstname: req.session.firstname,
                lastname: req.session.lastname,
            }
            const schools = await School.find({});
            res.render('dashboard-management', {user: user, schools: schools});
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur serveur lors du chargement des routes.' });
        }
    });
}
