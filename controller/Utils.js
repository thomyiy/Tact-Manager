const School = require("../models/SchoolModel");
const CheerleadingScore = require("../models/CheerleadingScoreModel");
const AmbianceScore = require("../models/AmbianceScoreModel");
const Match = require("../models/MatchModel");
const Team = require("../models/TeamModel");
const User = require("../models/UserModel");

const getGlobal = async (req) => {
    const user = req.session;
    var schools
    var cheerleadingSchools
    var ambianceSchools

    if (user.role === "Admin") {
        schools = await School.find({});
    } else if (user.role === "Arbitrator") {
        var matches = await Match.find({arbitrator: user.userid}).populate({path: "team1 team2"});
        matches = await Team.populate(matches, {path: "team1 team2 ", select: 'school'})
        matches = await School.populate(matches, {path: "team1.school team2.school", select: 'name'})
        matches = await User.populate(matches, {path: "arbitrator", select: 'firstname lastname'})

        var cheerleadingSchoolsId = await CheerleadingScore.find({arbitrator: user.userid}).distinct('school');
        cheerleadingSchools = await School.find({
            '_id': cheerleadingSchoolsId
        });
        var ambianceSchoolsId = await AmbianceScore.find({arbitrator: user.userid}).distinct('school');
        ambianceSchools = await School.find({
            '_id': ambianceSchoolsId
        });
    }

    return {user: user, schools: schools, cheerleadingSchools: cheerleadingSchools, ambianceSchools: ambianceSchools,matches:matches}
}
module.exports = {getGlobal}
