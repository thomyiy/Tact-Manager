const db = require("../models");
const Project = db.projets;

// create
const create = async (req, res) => {
    var name = req.body.name;

    var formdata = {
        name: name,
    };
    Project.create(formdata, function (err, res) {
        console.log(err, res);
    });
    req.flash("message", "Project creation successfull.");
    return res.redirect("/register");
}

module.exports = {create}