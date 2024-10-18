const express = require('express');
const CheerleadingController = require("../controller/CheerleadingController");
const School = require("../models/SchoolModel");
const route = express.Router();

module.exports = function (route) {
    route.get('/cheerleading/:school', async (req, res, next) => {
        try {
            const user = {
                role: req.session.role,
                firstname: req.session.firstname,
                lastname: req.session.lastname,
            }
            const schools = await School.find({});
            const sessionSchool = await School.findOne({ name: req.params.school });
            res.render('cheerleading-management', {user: user, schools: schools, sessionSchool: sessionSchool});
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur serveur lors du chargement des routes.' });
        }
    });

}
