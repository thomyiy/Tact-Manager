const express = require('express');
const UserController = require("../controller/UserController");
const User = require("../models/UserModel");
const School = require("../models/SchoolModel");
const route = express.Router();

module.exports = function (route) {
    route.get('/user/management', async (req, res, next) => {
        const user = {
            role: req.session.role,
            firstname: req.session.firstname,
            lastname: req.session.lastname,
        }
        const users = await User.find({})
        const schools = await School.find({});
        res.render('user-management', {user: user, users: users, schools: schools})
    })

    route.get('/user/getAll', async (req, res, next) => {
        const users = await User.find({});
        res.send(users)
    })

    route.post('/user/create',UserController.create)
}
