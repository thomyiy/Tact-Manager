const School = require("../models/SchoolModel");
const CheerleadingScore = require("../models/CheerleadingScoreModel");
const Match = require("../models/MatchModel");
const Team = require("../models/TeamModel");
const User = require("../models/UserModel");
const AmbianceCortegeScore = require("../models/AmbianceCortegeScoreModel");
const AmbianceOpeningScore = require("../models/AmbianceOpeningScoreModel");
const AmbianceMatchsScore = require("../models/AmbianceMatchsScoreModel");
const AmbianceStandsScore = require("../models/AmbianceStandsScoreModel");
const AmbianceFinalScore = require("../models/AmbianceFinalScoreModel");
const AmbianceHospitalityScore = require("../models/AmbianceHospitalityScoreModel");

const getGlobal = async (req) => {
    const user = req.session;
    var schools
    var cheerleadingSchools
    var ambianceSchools

    if (user.role === "Admin") {
        schools = await School.find({});
        return {user: user, schools: schools}
    } else if (user.role === "Arbitrator") {
        var matches = await Match.find({arbitrator: user.userid}).populate({path: "team1 team2"});
        matches = await Team.populate(matches, {path: "team1 team2 ", select: 'school'})
        matches = await School.populate(matches, {path: "team1.school team2.school", select: 'name'})
        matches = await User.populate(matches, {path: "arbitrator", select: 'firstname lastname'})

        var cheerleadingSchoolsId = await CheerleadingScore.find({arbitrator: user.userid}).distinct('school');
        cheerleadingSchools = await School.find({
            '_id': cheerleadingSchoolsId
        });
        var ambianceCortegeSchoolsId = await AmbianceCortegeScore.find({arbitrator: user.userid}).distinct('school');
        var ambianceOpeningSchoolsId = await AmbianceOpeningScore.find({arbitrator: user.userid}).distinct('school');
        var ambianceMatchsSchoolsId = await AmbianceMatchsScore.find({arbitrator: user.userid}).distinct('school');
        var ambianceStandsSchoolsId = await AmbianceStandsScore.find({arbitrator: user.userid}).distinct('school');
        var ambianceFinalSchoolsId = await AmbianceFinalScore.find({arbitrator: user.userid}).distinct('school');
        var ambianceHospitalitySchoolsId = await AmbianceHospitalityScore.find({arbitrator: user.userid}).distinct('school');

        var ambianceCortegeSchools = await School.find({'_id': ambianceCortegeSchoolsId});
        var ambianceOpeningSchools = await School.find({'_id': ambianceOpeningSchoolsId});
        var ambianceMatchsSchools = await School.find({'_id': ambianceMatchsSchoolsId});
        var ambianceStandsSchools = await School.find({'_id': ambianceStandsSchoolsId});
        var ambianceFinalSchools = await School.find({'_id': ambianceFinalSchoolsId});
        var ambianceHospitalitySchools = await School.find({'_id': ambianceHospitalitySchoolsId});

        return {user: user,
            schools: schools,
            cheerleadingSchools: cheerleadingSchools,
            ambianceCortegeSchools: ambianceCortegeSchools ,
            ambianceOpeningSchools: ambianceOpeningSchools ,
            ambianceMatchsSchools: ambianceMatchsSchools ,
            ambianceStandsSchools: ambianceStandsSchools ,
            ambianceFinalSchools: ambianceFinalSchools ,
            ambianceHospitalitySchools: ambianceHospitalitySchools ,
            matches:matches}
    }
}
module.exports = {getGlobal}
