const mongoose = require('mongoose');
const {v4: uuidv4} = require('uuid');
const path = require("path");
const School = require("../models/SchoolModel");
const Team = require("../models/TeamModel");
const Sport = require("../models/SportModel")
const FILE_STORAGE_PATH = process.env.FILE_STORAGE_PATH

const create = async (req, res) => {
    var schoolId = req.body.schoolId
    var sexe = req.body.sexeType;

    const football = await Sport.findOne({ name: "Football" });
    const basketball = await Sport.findOne({ name: "Basketball" });
    const handball = await Sport.findOne({ name: "Handball" });

    const footballId = football._id;
    const basketballId = basketball._id;
    const handballId = handball._id;


    Team.create({sport: footballId, school: schoolId, sexe: sexe}, function (err, res) {
        if (err) {
            console.log(err, res);
            return res.status(500).send(err);
        }
    });
    Team.create({sport: basketballId, school: schoolId, sexe: sexe}, function (err, res) {
        if (err) {
            console.log(err, res);
            return res.status(500).send(err);
        }
    });
    Team.create({sport: handballId, school: schoolId, sexe: sexe}, function (err, res) {
        if (err) {
            console.log(err, res);
            return res.status(500).send(err);
        }
    });

    return res.redirect('/team/management');
}

const updatePoints = async (req, res) => {
    const { teamName, points, sexe } = req.body;
    const school = await School.findOne({ name: teamName });

    try {
        const updatedTeam = await Team.findOneAndUpdate(
            { school: school._id, sexe: sexe },
            { $inc: { points: points } },
            { new: true }
        );

        if (!updatedTeam) {
            return res.status(404).json({ error: "Équipe non trouvée" });
        }
        console.log("Team ", teamName, " mise à jour :", points);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur serveur lors de la mise à jour des points de l'équipe." });
    }
};

module.exports = {create, updatePoints}
