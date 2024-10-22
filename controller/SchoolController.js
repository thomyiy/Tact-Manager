const mongoose = require('mongoose');
const path = require("path");
const {v4: uuidv4} = require('uuid');
const School = require("../models/SchoolModel");
const CheerleadingScore = require("../models/CheerleadingScoreModel");
const FILE_STORAGE_PATH = process.env.FILE_STORAGE_PATH

const create = async (req, res) => {
    var name = req.body.name

    var formdata = {
        name: name,
    };

    School.create(formdata, function (err, res) {
        if (err) {
            console.log(err, res);
            return res.status(500).send(err);
        }
    });

    return res.redirect('/school/management');
}
module.exports = {create}
