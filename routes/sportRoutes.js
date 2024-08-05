const express = require('express');
const SportController = require("../controller/SportController");
const Sport = require("../models/SportModel");
const User = require("../models/UserModel");
const route = express.Router();

module.exports = function (route) {
    route.get('/sport/management', async (req, res, next) => {
        const user = {
            role: req.session.role,
            firstname: req.session.firstname,
            lastname: req.session.lastname,
        }
        const sports = await Sport.find({})
        res.render('sport-management', {user: user, sports: sports})
    })

    route.get('/sport/getAll', async (req, res, next) => {
        const sports = await Sport.find({})
        res.send(sports)
    })

    route.post('/sport/create',SportController.create)
}
