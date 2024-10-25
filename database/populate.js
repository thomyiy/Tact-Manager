const Arbitrator = require("../models/ArbitratorModel");
const User = require("../models/UserModel");
const Sport = require("../models/SportModel");
const Program = require("../models/ProgramModel");
const Field = require("../models/FieldModel");
const School = require("../models/SchoolModel");
const Team = require("../models/TeamModel");
const mongoose = require("mongoose");
const populate = async (req, res) => {

    await createAdmin()
    await createSports()
    await createPrograms()
    await createFields()

    await createSchools()
    await createTeams()
}

async function createAdmin() {
    // creer admin
    if (process.env.ADMIN_NAME
        && process.env.ADMIN_EMAIL
        && process.env.ADMIN_PASSWORD
        && process.env.ADMIN_FIRSTNAME
        && process.env.ADMIN_LASTNAME) {
        var user = await User.count({email: process.env.ADMIN_EMAIL})
        if (user === 0) {
            try {
                var formdata = {
                    name: process.env.ADMIN_NAME,
                    email: process.env.ADMIN_EMAIL,
                    password: process.env.ADMIN_PASSWORD,
                    firstname: process.env.ADMIN_FIRSTNAME,
                    lastname: process.env.ADMIN_LASTNAME,
                    role: "Admin"
                };

                await User.create(formdata, function (err, res) {
                    if (err)
                        console.log(err);
                    console.log("Admin user created")
                });

            } catch (error) {
                console.error(error.message);
            }
        } else
            console.log("Admin user already exist")
    }
}

async function createSports() {
    // creer 3 sports
    const sportTable = ["Football", "Basketball", "Handball"];

    for (let i = 0; i < sportTable.length; i++) {
        var sport = await Sport.count({name: sportTable[i]});
        if (sport === 0) {
            try {
                var formdata = {
                    name: sportTable[i]
                };

                await Sport.create(formdata, function (err, res) {
                    console.log("Sport ", sportTable[i], " created.")
                });

            } catch (error) {
                console.error(error.message);
            }
        } else {
            console.log("Sport ", sportTable[i], " already exists.")
        }
    }
}

async function createPrograms() {
    // creer les programmes
    const programTable = ["Masculin", "Féminin"];

    for (let i = 0; i < programTable.length; i++) {
        var program = await Program.count({name: programTable[i]});
        if (program === 0) {
            try {
                var formdata = {
                    name: programTable[i]
                };

                await Program.create(formdata, function (err, res) {
                    console.log("Program ", programTable[i], " created.")
                });

            } catch (error) {
                console.error(error.message);
            }
        } else {
            console.log("Program ", programTable[i], " already exists.")
        }
    }
}

async function createFields() {
    // creer les terrains
    const fieldTable = ["Field 1", "Field 2"];

    for (let i = 0; i < fieldTable.length; i++) {
        var fields = await Field.count({name: fieldTable[i]});
        if (fields === 0) {
            try {
                var formdata = {
                    name: fieldTable[i]
                };

                await Field.create(formdata, function (err, res) {
                    console.log("Field ", fieldTable[i], " created.")
                });

            } catch (error) {
                console.error(error.message);
            }
        } else {
            console.log("Field ", fieldTable[i], " already exists.")
        }
    }
}

async function createSchools() {
    // creer les terrains
    const schoolTable = ["School1", "School2", "School3", "School4", "School5", "School6", "School7", "School8", "School9", "School10", "School11", "School12", "School13", "School14", "School15", "School16"];

    for (let i = 0; i < schoolTable.length; i++) {
        var schools = await School.count({name: schoolTable[i]});
        if (schools === 0) {
            try {
                var formdata = {
                    name: schoolTable[i]
                };

                await School.create(formdata, function (err, res) {
                    console.log("School ", schoolTable[i], " created.")
                });

            } catch (error) {
                console.error(error.message);
            }
        } else {
            console.log("School ", schoolTable[i], " already exists.")
        }
    }
}

async function createTeams() {
    // creer les terrains
    const schoolTable = ["School1", "School2", "School3", "School4", "School5", "School6", "School7", "School8", "School9", "School10", "School11", "School12", "School13", "School14", "School15", "School16"];
    const programTable = ["Masculin", "Féminin"];
    const sportTable = ["Football", "Basketball", "Handball"];

    for (let i = 0; i < schoolTable.length; i++) {
        var school = await School.findOne({name: schoolTable[i]});
        if (school) {
            for (let x = 0; x < programTable.length; x++) {
                var program = await Program.findOne({name: programTable[x]});
                if (program) {
                    for (let y = 0; y < sportTable.length; y++) {
                        var sport = await Sport.findOne({name: sportTable[y]});

                        if (sport) {
                            var formdata = {
                                school: school._id,
                                program: program._id,
                                sport: sport._id
                            };
                            var teams = await Team.count(formdata);
                            if (teams === 0) {
                                try {
                                    await Team.create(formdata, function (err, res) {
                                        console.log("Team ", schoolTable[i] + " " + programTable[x] + " " + sportTable[y], " created.")
                                    });
                                } catch (error) {
                                    console.error(error.message);
                                }
                            }else {
                                console.log("Team ", schoolTable[i] + " " + programTable[x] + " " + sportTable[y], " already exists.")
                            }
                        }
                    }
                }
            }
        }
    }
}

module.exports = {populate}
