const mongoose = require('mongoose');
const path = require("path");
const {v4: uuidv4} = require('uuid');
const Arbitrator = require("../models/ArbitratorModel");
const CheerleadingScore = require("../models/CheerleadingScoreModel");
const FILE_STORAGE_PATH = process.env.FILE_STORAGE_PATH

// TODO: creer le systeme d'atribution de matchs a un arbitre
const create = async (req, res) => {
    var name = req.body.name

    var formdata = {
        name: name,
    };

    Arbitrator.create(formdata, function (err, res) {
        if (err) {
            console.log(err, res);
            return res.status(500).send(err);
        }
    });

    return res.redirect('/arbitrator/management');
}
module.exports = {create}
