const mongoose = require('mongoose');
const Match = require("../models/MatchModel");
const Team = require("../models/TeamModel");
const Sport = require("../models/SportModel");
const School = require("../models/SchoolModel");
const Program = require("../models/ProgramModel");
const Field = require("../models/FieldModel");
const Pool = require("../models/PoolModel");
const TeamPoint = require("../models/TeamPointModel");
const teamController = require("./TeamController");

var poolsLenghts = 0;

const pouleFactory = {
    8: function(teams) {
        let poules = {};
        poules[`Poule 1`] = teams.slice(0, 4);
        poules[`Poule 2`] = teams.slice(4, 8);
        return poules;
    },
    9: function(teams) {
        let poules = {};
        poules[`Poule 1`] = teams.slice(0, 3);
        poules[`Poule 2`] = teams.slice(3, 6);
        poules[`Poule 3`] = teams.slice(6, 9);
        return poules;
    },
    10: function(teams) {
        let poules = {};
        poules[`Poule 1`] = teams.slice(0, 4);
        poules[`Poule 2`] = teams.slice(4, 7);
        poules[`Poule 3`] = teams.slice(7, 10);
        return poules;
    },
    11: function(teams) {
        let poules = {};
        poules[`Poule 1`] = teams.slice(0, 4);
        poules[`Poule 2`] = teams.slice(4, 8);
        poules[`Poule 3`] = teams.slice(8, 11);
        return poules;
    },
    12: function(teams) {
        let poules = {};
        poules[`Poule 1`] = teams.slice(0, 3);
        poules[`Poule 2`] = teams.slice(3, 6);
        poules[`Poule 3`] = teams.slice(6, 9);
        poules[`Poule 4`] = teams.slice(9, 12);
        return poules;
    },
    13: function(teams) {
        let poules = {};
        poules[`Poule 1`] = teams.slice(0, 3);
        poules[`Poule 2`] = teams.slice(3, 6);
        poules[`Poule 3`] = teams.slice(6, 9);
        poules[`Poule 4`] = teams.slice(9, 13);
        return poules;
    },
    14: function(teams) {
        let poules = {};
        poules[`Poule 1`] = teams.slice(0, 3);
        poules[`Poule 2`] = teams.slice(3, 6);
        poules[`Poule 3`] = teams.slice(6, 10);
        poules[`Poule 4`] = teams.slice(10, 14);
        return poules;
    },
    15: function(teams) {
        let poules = {};
        poules[`Poule 1`] = teams.slice(0, 4);
        poules[`Poule 2`] = teams.slice(4, 8);
        poules[`Poule 3`] = teams.slice(8, 12);
        poules[`Poule 4`] = teams.slice(12, 15);
        return poules;
    },
    16: function(teams) {
        let poules = {};
        poules[`Poule 1`] = teams.slice(0, 4);
        poules[`Poule 2`] = teams.slice(4, 8);
        poules[`Poule 3`] = teams.slice(8, 12);
        poules[`Poule 4`] = teams.slice(12, 16);
        return poules;
    }
};

const winnersFactory = {
    2: async function(pool) {
        let winners = {};
        const topTeams = await getTopTeams(pool, 2);
        winners[`Winner 1`] = topTeams[0];
        winners[`Winner 2`] = topTeams[1];
        return winners;
    },
    3: async function(pool) {
        let winners = {};
        const topTeams = await getTopTeams(pool, 1);
        winners[`Winner 1`] = topTeams[0];
        return winners;
    },
    4: async function(pool) {
        let winners = {};
        const topTeams = await getTopTeams(pool, 1);
        winners[`Winner 1`] = topTeams[0];
        return winners;
    },
};

function getTheWinner(team1, team2, score) {
    if (score.team1Score == score.team2Score || score.team1Score == undefined || score.team2Score == undefined) {
        return "Match nul";
    } else if (score.team1Score > score.team2Score) {
        return team1;
    }
    return team2;
}

function getTheLooser(team1, team2, score) {
    if (score.team1Score == score.team2Score || score.team1Score == undefined || score.team2Score == undefined) {
        return "Match nul";
    } else if (score.team1Score < score.team2Score) {
        return team1;
    }
    return team2;
}

function getRegularTimeOfPool(teams) {
    return 30 / (teams.length - 1);
}

function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function createPoules(teams, seed) {
    const shuffledTeams = teams.slice();
    for (let i = shuffledTeams.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed) * (i + 1));
        [shuffledTeams[i], shuffledTeams[j]] = [shuffledTeams[j], shuffledTeams[i]];
    }

    return pouleFactory[shuffledTeams.length](shuffledTeams);
}

async function getMatchsOnField(field, sport, program) {
    const matches = await Match.find({ field: field._id, sport: sport._id, program: program._id })
        .populate({
            path: 'team1 team2',
            populate: { path: 'school', select: 'name' }
        })
        .populate({
            path: 'field',
            select: 'name'
        })
        .populate({
            path: 'pool',
            select: 'name regularTime'
        })
        .populate({
            path: 'program',
            select: 'name'
        });

    return matches;
}

function assignTimeToMatch(match, timeInMinutes) {
    let today = new Date();
    let hours = Math.floor(timeInMinutes / 60);
    let minutes = timeInMinutes % 60;

    let matchStartTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);

    Match.findOneAndUpdate({ _id: match._id }, { startTime: matchStartTime }).exec();
}    

function assignSlotsToMatchs(matchsOnField, poolStart) {
    let startTime = 11 * 60;
    let finalTable = [];
    let numberOfPools = new Set(matchsOnField.map(match => match.pool.name)).size; // nombre de poules différentes sur le terrain
    let poolCheck = poolStart;

    let lastProgram = null;

    while (matchsOnField.length > 0) {
        let matchToAssign = null;

        for (const match of [...matchsOnField]) {
            let poolOfMatch = match.pool.name;
            if (poolOfMatch === "Poule " + poolCheck && match.program.name !== lastProgram) {
                matchToAssign = match;
                break;
            }
        }

        if (!matchToAssign) {
            for (const match of [...matchsOnField]) {
                let poolOfMatch = match.pool.name;
                if (poolOfMatch === "Poule " + poolCheck) {
                    matchToAssign = match;
                    break;
                }
            }
        }

        if (matchToAssign) {
            assignTimeToMatch(matchToAssign, startTime);
            startTime += (matchToAssign.pool.regularTime + 5);
            finalTable.push(matchToAssign);
            matchsOnField.splice(matchsOnField.indexOf(matchToAssign), 1);
            lastProgram = matchToAssign.program.name;
        }

        poolCheck = (poolCheck % numberOfPools) + 1;
    }
}

async function handleSlots(sports) {
    let fields = await Field.find();
    let programs = await Program.find();

    for (const sport of sports) {
        let matchsMasculinOnField1 = await getMatchsOnField(fields[0], sport, programs[0]);
        let matchsMasculinOnField2 = await getMatchsOnField(fields[1], sport, programs[0]);
        let matchsFemininOnField1 = await getMatchsOnField(fields[0], sport, programs[1]);
        let matchsFemininOnField2 = await getMatchsOnField(fields[1], sport, programs[1]);

        let mergedField1 = matchsMasculinOnField1.concat(matchsFemininOnField1); // concatène les matchs masculins et féminins
        let mergedField2 = matchsMasculinOnField2.concat(matchsFemininOnField2); // concatène les matchs masculins et féminins

        assignSlotsToMatchs(mergedField1, 1); // 1 représente la première poule a commencer sur le terrain 1
        assignSlotsToMatchs(mergedField2, 2); // pareil pour 2
    }
}

async function createTournamentOfProgram(program, sports) {

    const field1 = await Field.findOne({ name: "Field 1" });
    const field2 = await Field.findOne({ name: "Field 2" });
    
    
    // algo de creation de match pour chaque poule en fonction du programme et pour chaque sport
    for (const sport of sports) {
        let seed = Math.floor(Math.random() * 1000);

        const teams = await Team.find({ sport: sport._id, program: program._id });
        if (teams.length == 0) {
            console.log(`Aucune équipe créée pour ${sport.name} ${program.name}`);
            return res.status(204).send();
        }

        // creer un nb de poules en fonction du nb de teams
        const poules = createPoules(teams, seed);
        for (let poule in poules) {
            const teamsInPoule = poules[poule];
            const newPoule = await Pool.create({ name: poule, sport: sport._id, program: program._id, regularTime: getRegularTimeOfPool(teamsInPoule) });

            for (let i = 0; i < teamsInPoule.length; i++) {
                var currentField;
                await TeamPoint.create({ team: teamsInPoule[i]._id, pool: newPoule._id });
                for (let j = i + 1; j < teamsInPoule.length; j++) {

                    let matchsInPoule = await Match.count({ pool: newPoule._id });
                    if (matchsInPoule == 0 || matchsInPoule == 2 || matchsInPoule == 5)
                        currentField = field1;
                    else
                        currentField = field2;

                    // TODO : remove random score
                    const randomScore1 = Math.floor(Math.random() * 5);
                    const randomScore2 = Math.floor(Math.random() * 5);

                    const match = {
                        team1: teamsInPoule[i]._id,
                        team2: teamsInPoule[j]._id,
                        // TODO : remove score
                        score: {
                            team1Score: randomScore1,
                            team2Score: randomScore2,
                        },
                        sport: sport._id,
                        pool: newPoule._id,
                        program: program._id,
                        field: currentField._id
                    };

                    await Match.create(match);

                    await Team.findOneAndUpdate(
                        { _id: teamsInPoule[i]._id, sport: sport._id, program: program._id },
                        { $set: { pool: newPoule._id } }
                    );

                    await Team.findOneAndUpdate(
                        { _id: teamsInPoule[j]._id, sport: sport._id, program: program._id },
                        { $set: { pool: newPoule._id } }
                    );

                    const team1name = await School.findOne({ _id: teamsInPoule[i].school._id });
                    const team2name = await School.findOne({ _id: teamsInPoule[j].school._id });

                    console.log(`Match créé: ${team1name.name} vs ${team2name.name} sur ${currentField.name} dans ${newPoule.name} pour le programme ${program.name}`);
                }
            }
        }
    }
}

const create = async (req, res) => {
    try {
        const programs = await Program.find();
        const sports = await Sport.find();

        for (const program of programs) {
            await createTournamentOfProgram(program, sports);
        }

        await handleSlots(sports);
        return res.status(200).json();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de la création du tournoi.' });
    }
};

// met a jour le score d'un match et les points des participants
const updateMatchStatus = async (req, res) => {
    const { team1, team2, isFinished } = req.body;

    try {
        // Récupération du programme, du sport et des équipes en fonction des noms fournis
        const program = await Program.findOne({ name: req.params.program });
        const sport = await Sport.findOne({ name: req.params.sport });

        // Récupération des informations sur les équipes
        const school1Ref = await School.findOne({ name: team1 });
        const team1Ref = await Team.findOne({ school: school1Ref._id, sport: sport._id, program: program._id });

        const school2Ref = await School.findOne({ name: team2 });
        const team2Ref = await Team.findOne({ school: school2Ref._id, sport: sport._id, program: program._id });

        // Récupération de la poule via l'équipe 1 (tu peux ajuster si nécessaire)
        const pool = await Pool.findById(team1Ref.pool);

        if (!pool) {
            return res.status(404).json({ error: 'Poule non trouvée.' });
        }

        // Mise à jour du champ isFinished à true pour le match dans la poule spécifique
        const match = await Match.findOneAndUpdate(
            { team1: team1Ref._id, team2: team2Ref._id, program: program._id, pool: pool._id },
            {
                isFinished: isFinished,
                updated_at: Date.now()
            },
            { new: true }
        );

        if (!match) {
            return res.status(404).json({ error: 'Match non trouvé.' });
        }
        if (isFinished)
            console.log(`match entre ${team1} et ${team2} déclaré comme fini`)
        else
            console.log(`match entre ${team1} et ${team2} déclaré comme pas fini`)

        return res.status(200).json(match);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du statut du match.' });
    }
};


// met a jour le score d'un match et les points des participants
const update = async (req, res) => {
    const { team1, team2, score, time } = req.body;
    const program = await Program.findOne({ name: req.params.program });
    const sport = await Sport.findOne({ name: req.params.sport });
    const winnerTeam = getTheWinner(team1, team2, score);
    const looserTeam = getTheLooser(team1, team2, score);
    let school;
    if (winnerTeam == "Match nul") {
        school = await School.findOne({ name: team1 });
    } else {
        school = await School.findOne({ name: winnerTeam });
    }
    // teamReference sert juste a recuperer la poule
    const teamReference = await Team.findOne({ school: school._id, sport: sport, program: program._id });
    poolsLenghts = await Pool.count({ sport: sport._id, program: program._id, name: { $nin: ["Finale", "Demi-Finale 1", "Demi-Finale 2"] }});
    const pool = await Pool.findById(teamReference.pool);

    try {
        // maj des points
        if (winnerTeam === "Match nul" && looserTeam === "Match nul") {
            await teamController.updatePoints({
                body: { teamName: team1, program: program._id, pool: pool._id, points: 1 }
            }, res);

            await teamController.updatePoints({
                body: { teamName: team2, program: program._id, pool: pool._id, points: 1 }
            }, res);
        } else {
            await teamController.updatePoints({
                body: { teamName: winnerTeam, program: program._id,
                    pool: pool._id, points: 3 }
            }, res);

            await teamController.updatePoints({
                body: { teamName: looserTeam, program: program._id, pool: teamReference.pool, points: 0 }
            }, res);
        }

        // maj des scores
        const school1Ref = await School.findOne({ name: team1 });
        const team1Ref = await Team.findOne({ school: school1Ref, sport: sport._id, program: program._id });
        const school2Ref = await School.findOne({ name: team2 });
        const team2Ref = await Team.findOne({ school: school2Ref, sport: sport._id, program: program._id });
        const schoolWinnerRef = await School.findOne({ name: winnerTeam });
        const winnerTeamRef = await Team.findOne({ school: schoolWinnerRef, sport: sport._id, program: program._id });

        const tournament = await Match.findOneAndUpdate(
            { team1: team1Ref, team2: team2Ref, program: program._id },
            {
                score: {
                    team1Score: score.team1Score,
                    team2Score: score.team2Score
                },
                winnerTeam: winnerTeamRef ? winnerTeamRef._id : null,
                sport: sport._id,
                timePlayed: time,
                isFinished: time > 0 ? true : false,
                updated_at: Date.now()
            },
            { new: true }
        );
        // check a la fin de l'update si tous les matchs de la poule des deux equipes sont fini pour le passage en demi-finale/finale
        checkPoolWinner(pool, sport, program);
        return res.status(200).json(tournament);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du match.' });
    }
}

// reinitialiser les points et le score d'un match au cas ou quelqu'un s'est trompé
const clear = async (req, res) => {
    const { team1, team2, score, time } = req.body;
    const program = await Program.findOne({ name: req.params.program });
    const sport = await Sport.findOne({ name: req.params.sport });
    const winnerTeam = getTheWinner(team1, team2, score);
    const looserTeam = getTheLooser(team1, team2, score);
    let school;
    if (winnerTeam == "Match nul") {
        school = await School.findOne({ name: team1 });
    } else {
        school = await School.findOne({ name: winnerTeam });
    }
    // teamReference sert juste a recuperer la poule
    const teamReference = await Team.findOne({ school: school._id, sport: sport, program: program });
    const pool = await Pool.findById(teamReference.pool);

    try {
        // maj des points
        if (winnerTeam === "Match nul" && looserTeam === "Match nul") {
            await teamController.updatePoints({
                body: { teamName: team1, program: program._id, pool:  pool._id, points: -1 }
            }, res);

            await teamController.updatePoints({
                body: { teamName: team2, program: program._id, pool: pool._id, points: -1 }
            }, res);
        } else {
            await teamController.updatePoints({
                body: { teamName: winnerTeam, program: program._id, pool: pool._id, points: -3 }
            }, res);
        }

        const school1Ref = await School.findOne({ name: team1 });
        const team1Ref = await Team.findOne({ school: school1Ref, sport: sport._id, program: program._id });
        const school2Ref = await School.findOne({ name: team2 });
        const team2Ref = await Team.findOne({ school: school2Ref, sport: sport._id, program: program._id });

        // maj des scores
        const tournament = await Match.findOneAndUpdate(
            { team1: team1Ref._id, team2: team2Ref._id, pool: teamReference.pool },
            {
                score: {
                    team1Score: null,
                    team2Score: null
                },
                $unset: {
                    winnerTeam: "",
                    arbitrator: ""
                },                sport: sport._id,
                timePlayed: time,
                isFinished: false
            },
            { new: true }
        );
        return res.status(200).json(tournament);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du match.' });
    }
}

const deleteTournament = async (req, res) => {
    try {
        const sports = await Sport.find();

        for (const sport of sports) {
            await Team.updateMany(
                { sport: sport._id },
                { $set: { pool: null, points: 0 } }
            );
        }

        await Match.deleteMany({});
        console.log(`Tous les matchs ont été supprimés`);

        await Pool.deleteMany({});
        console.log(`Toutes les pools ont été supprimées.`);

        await TeamPoint.deleteMany({});
        console.log(`Toutes les scores ont été supprimées.`);

        return res.status(200).json({ message: 'Tous les matches ont été supprimés.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de la suppression des matches.' });
    }
}

// TODO: creer le systeme d'atribution de matchs a un arbitre
const assign = async (req, res) => {
    const { team1, team2, arbitratorName } = req.body;

    const arbitratorRef = await Arbitrator.findOne({ name: arbitratorName });
    const program = await Program.findOne({ name: req.params.program });
    const sport = await Sport.findOne({ name: req.params.sport });

    const school1Ref = await School.findOne({ name: team1 });
    const team1Ref = await Team.findOne({ school: school1Ref, sport: sport._id, program: program._id });
    const school2Ref = await School.findOne({ name: team2 });
    const team2Ref = await Team.findOne({ school: school2Ref, sport: sport._id, program: program._id });
    const pool = await Pool.findById(team1Ref.pool);

    const match = await Match.findOneAndUpdate(
        { team1: team1Ref._id, team2: team2Ref._id, pool: pool},
        { arbitrator: arbitratorRef._id },
        { new: true }
    );
    console.log(`${arbitratorName} a bien été ajouté comme arbitre au match de ${team1}-${team2}, ${req.params.sport}, ${req.params.program}`)
    return res.status(200).json(match)
}

module.exports = {create, update, updateMatchStatus, deleteTournament, clear, assign};