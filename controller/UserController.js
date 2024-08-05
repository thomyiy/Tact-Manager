const Formation = require("../models/FormationModel");
const User = require("../models/UserModel");
const mongoose = require('mongoose');
const path = require("path");
const {v4: uuidv4} = require('uuid');
const Product = require("../models/ProductModel");
const FILE_STORAGE_PATH = process.env.FILE_STORAGE_PATH


const create = async (req, res) => {
    var role = req.body.role
    var firstname = req.body.firstname
    var lastname = req.body.lastname
    var email = req.body.email
    var password = req.body.password

    var formdata = {
        role: role,
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
    };

    User.create(formdata, function (err, res) {
        if (err) {
            console.log(err, res);
            return res.status(500).send(err);
        }
    });

    return res.redirect('/user/management');
}
module.exports = {create}
