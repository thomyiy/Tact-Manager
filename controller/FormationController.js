const Formation = require("../models/FormationModel");
const User = require("../models/UserModel");
const mongoose = require('mongoose');
const path = require("path");
const {v4: uuidv4} = require('uuid');
const FILE_STORAGE_PATH = process.env.FILE_STORAGE_PATH

const create = async (req, res) => {
    console.log(req.body)
    var name = req.body.name
    var pub = req.body.public
    var mode = req.body.mode
    var description = req.body.description

    var formdata = {
        name: name,
        public: pub,
        mode: mode,
        description: description,
    };

    Formation.create(formdata, function (err, res) {
        if (err) {
            console.log(err, res);
            return res.status(500).send(err);
        }
    });

    return res.redirect('/formation/management');
}

module.exports = {create}
