const express = require('express');
const UserController = require("../controller/UserController");
const User = require("../models/UserModel");
const School = require("../models/SchoolModel");
const route = express.Router();
const utils = require("../controller/Utils")

module.exports = function (route) {
    route.get('/user/management', async (req, res, next) => {

        const users = await User.find({})
        const  global = await utils.getGlobal(req)
        console.log(global)
        res.render('user-management', {global :global, users: users})
    })

    route.get('/user/getAll', async (req, res, next) => {
        const users = await User.find({});
        res.send(users)
    })

    route.post('/user/create',UserController.create)
}
