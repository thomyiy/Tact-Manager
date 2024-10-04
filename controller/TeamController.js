const mongoose = require('mongoose');
const path = require("path");
const {v4: uuidv4} = require('uuid');
const Team = require("../models/TeamModel");
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

const updatePoints = async (req, res) => {
    const { teamName, points } = req.body;

    try {
        const updatedTeam = await Team.findOneAndUpdate(
            { name: teamName },
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
