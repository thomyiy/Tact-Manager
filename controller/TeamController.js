const mongoose = require('mongoose');
const path = require("path");
const {v4: uuidv4} = require('uuid');
const Team = require("../models/TeamModel");
const Sport = require("../models/SportModel");
const School = require("../models/SchoolModel");
const FILE_STORAGE_PATH = process.env.FILE_STORAGE_PATH

const create = async (req, res) => {
    var name = req.body.name
    var sportId = req.body.sportId
    var schoolId = req.body.schoolId

    var formdata = {
        name: name,
        sport: sportId,
        school: schoolId
    };

    Team.create(formdata, function (err, res) {
        if (err) {
            console.log(err, res);
            return res.status(500).send(err);
        }
    });

    return res.redirect('/team/management');
}
module.exports = {create}
