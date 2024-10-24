const School = require("../models/SchoolModel");
const Arbitrator = require("../models/ArbitratorModel");
const CheerleadingScore = require("../models/CheerleadingScoreModel");
const AmbianceScore = require("../models/AmbianceScoreModel");

const getGlobal = async (req) => {
    const user = req.session;
    var schools
    var cheerleadingSchools
    var ambianceSchools

    if (user.role === "Admin") {
        schools = await School.find({});
        arbitrators = await Arbitrator.find({});
    } else if (user.role === "Arbitrator") {

        var cheerleadingSchoolsId = await CheerleadingScore.find({arbitrator: user.userid}).distinct('school');
        cheerleadingSchools = await School.find({
            '_id': cheerleadingSchoolsId
        });
        var ambianceSchoolsId = await AmbianceScore.find({arbitrator: user.userid}).distinct('school');
        ambianceSchools = await School.find({
            '_id': ambianceSchoolsId
        });
    }

    return {user: user, schools: schools, arbitrators, cheerleadingSchools: cheerleadingSchools, ambianceSchools: ambianceSchools}
}
module.exports = {getGlobal}
