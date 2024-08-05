const express = require('express');
const FormationController = require("../controller/FormationController");
const UserController = require("../controller/UserController");
const Formation = require("../models/FormationModel");
const User = require("../models/UserModel");
const route = express.Router();

module.exports = function (route) {

    route.get('/formation/management', async (req, res, next) => {
        const user = {
            role: req.session.role,
            firstname: req.session.firstname,
            lastname: req.session.lastname,
        }
        res.render('formation-management', {user: user})
    })

    route.get('/formation/create', async (req, res, next) => {
        const user = {
            role: req.session.role,
            firstname: req.session.firstname,
            lastname: req.session.lastname,
        }
        res.render('formation-create', {user: user})
    })

    route.get('/formation/getAll', async (req, res, next) => {
        const formations = await Formation.find({})
        res.send(formations)
    })

    route.post('/formation/create',FormationController.create)

}
