const mongoose = require('mongoose');
const Match = require("../models/MatchModel");
const Team = require("../models/TeamModel");
const Sport = require("../models/SportModel");
const School = require("../models/SchoolModel");
const Program = require("../models/ProgramModel");
const Pool = require("../models/PoolModel");
const Arbitrator = require("../models/ArbitratorModel");
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

function areAllMatchesFinished(matchs) {
    return matchs.every(match => match.isFinished);
}

async function getTopTeams(pool, limit) {
    const poolTeams = await Team.find({ pool: pool._id });
    const bestTeams = [];

    for (const team of poolTeams) {
        const teamGA = await getTeamGoalAverage(team._id);
        bestTeams.push({ team, points: team.points, goalAverage: teamGA });
    }

    bestTeams.sort((a, b) => {
        if (b.points === a.points) {
            return b.goalAverage - a.goalAverage;
        }
        return b.points - a.points;
    });

    const allSamePoints = bestTeams.every(entry => entry.points === bestTeams[0].points);
    const allSameGA = allSamePoints && bestTeams.every(entry => entry.goalAverage === bestTeams[0].goalAverage);

    if (allSameGA) {
        const randomIndex = Math.floor(Math.random() * bestTeams.length);
        return [bestTeams[randomIndex].team];
    }

    return bestTeams.slice(0, limit).map(entry => entry.team);
}

function isSemiFinalOrFinal(pool) {
    return pool.name.includes('Demi-Finale') || pool.name.includes('Finale');
}

function isSemiFinal(pool) {
    return pool.name.includes('Demi-Finale');
}

async function findOrCreatePool(name, sport, program) {
    return await Pool.findOne({ name, sport: sport._id, program: program._id }) || await Pool.create({
        name,
        sport: sport._id,
        program: program._id
    });
}

async function assignTeamToSemiFinal(pool, team, sport, program) {
    try {
        let match = await Match.findOne({
            pool: pool._id,
            $or: [{ team1: null }, { team2: null }]
        });

        if (!match) {
            await Match.create({
                team1: team._id,
                team2: null,
                sport: sport._id,
                pool: pool._id,
                program: program._id
            });
        } else {
            const fieldToUpdate = !match.team1 ? 'team1' : 'team2';
            await Match.updateOne(
                { _id: match._id },
                { $set: { [fieldToUpdate]: team._id } }
            );
        }

        console.log(`${team.school.name} a été ajouté à la ${pool.name}.`);
    } catch (error) {
        console.error(`Erreur lors de l'ajout de l'équipe : ${error.message}`);
    }
}

async function updateTeamPools(ranking, pools, teamToUpdate = null) {
    if (teamToUpdate) {
        await Team.updateOne(
            { _id: teamToUpdate },
            { $set: { pool: pools } }
        );
        return;
    }

    let teamsToUpdate = [ranking['Winner 1']._id];

    if (ranking['Winner 2']) {
        teamsToUpdate.push(ranking['Winner 2']._id);
    }

    if (Array.isArray(pools)) {
        await Team.updateOne(
            { _id: ranking['Winner 1']._id },
            { $set: { pool: pools[0] } }
        );
        await Team.updateOne(
            { _id: ranking['Winner 2']._id },
            { $set: { pool: pools[1] } }
        );
    } else {
        await Team.updateMany(
            { _id: { $in: teamsToUpdate } },
            { $set: { pool: pools } }
        );
    }
}

async function getTeamGoalAverage(teamId) {
    const matches = await Match.find({ $or: [{ team1: teamId }, { team2: teamId }] });
    let goalsScored = 0;
    let goalsConceded = 0;

    for (const match of matches) {
        if (match.team1.toString() === teamId.toString()) {
            goalsScored += match.score.team1Score
            goalsConceded += match.score.team2Score
        } else if (match.team2.toString() === teamId.toString()) {
            goalsScored += match.score.team2Score;
            goalsConceded += match.score.team1Score;
        }
    }

    const goalAverage = goalsScored - goalsConceded;
    return goalAverage;
}

async function getBestSecond(sport, program) {
    const finalPool = await Pool.findOne({ name: "Finale", sport: sport._id, program: program._id });
    const semiFinal1Pool = await Pool.findOne({ name: "Demi-Finale 1", sport: sport._id, program: program._id });
    const semiFinal2Pool = await Pool.findOne({ name: "Demi-Finale 2", sport: sport._id, program: program._id });

    const poolsToExclude = [];
    if (finalPool) poolsToExclude.push(finalPool._id);
    if (semiFinal1Pool) poolsToExclude.push(semiFinal1Pool._id);
    if (semiFinal2Pool) poolsToExclude.push(semiFinal2Pool._id);

    const allTeams = await Team.find({ // recupere toutes les teams qui ne jouent ni demi-finale ni finale
        sport: sport._id,
        program: program._id,
        pool: { $nin: poolsToExclude }
    });

    var bestTeamPoints = -1;
    var bestTeamGA = 0;
    var bestTeam = null;

    for (const team of allTeams) {
        if (team.points > bestTeamPoints) { // compare les points
            bestTeamPoints = team.points;
            bestTeamGA = await getTeamGoalAverage(team._id);
            bestTeam = team;
        } else if (team.points == bestTeamPoints) { // compare le goal average
            const teamGA = await getTeamGoalAverage(team._id);
            if (teamGA > bestTeamGA) {
                bestTeamPoints = team.points;
                bestTeamGA = teamGA;
                bestTeam = team;
            } else if (teamGA == bestTeamGA) { // si pas suffisant, on prend un team au hasard
                const randomValue = Math.floor(Math.random() * 2);
                if (randomValue == 1) {
                    bestTeamPoints = team.points;
                    bestTeamGA = teamGA;
                    bestTeam = team;
                }
            }
        }
    }
    return bestTeam;
}

async function handleSemiFinalCreation(ranking, sport, program) {

    if (Object.keys(ranking).length == 1) { // si je dois recuperer que 1 team par poule
        if (poolsLenghts == 3) { // si il y a 3 poules

            const semiFinalPool1 = await findOrCreatePool('Demi-Finale 1', sport, program);
            var teamsinSemiFinal1 = await Team.count({ pool: semiFinalPool1._id });
    
            if (teamsinSemiFinal1 < 2) { // si il y a moins de deux equipes dans la premiere demi-finale
    
                await assignTeamToSemiFinal(semiFinalPool1, ranking['Winner 1'], sport, program);
                await updateTeamPools(ranking, semiFinalPool1._id);
    
            } else { // sinon, je cree deuxieme demi final
    
                const semiFinalPool2 = await findOrCreatePool('Demi-Finale 2', sport, program);
                await assignTeamToSemiFinal(semiFinalPool2, ranking['Winner 1'], sport, program);
                await updateTeamPools(ranking, semiFinalPool2._id);
    
                const bestSecond = await getBestSecond(sport, program); // je recupere la deuxieme meilleure team
                if (bestSecond) {
                    await assignTeamToSemiFinal(semiFinalPool2, bestSecond, sport, program);
                    await updateTeamPools(null, semiFinalPool2._id, bestSecond._id);
                }
            }
        } else if (poolsLenghts == 4) { // si il y a 4 poules
            const semiFinalPool1 = await findOrCreatePool('Demi-Finale 1', sport, program);

            var teamsinSemiFinal1 = await Team.count({ pool: semiFinalPool1._id });
            if (teamsinSemiFinal1 < 2) { // si il y a juste deux poules
                await assignTeamToSemiFinal(semiFinalPool1, ranking['Winner 1'], sport, program);
                await updateTeamPools(ranking, semiFinalPool1._id);
            } else {
                const semiFinalPool2 = await findOrCreatePool('Demi-Finale 2', sport, program);
                await assignTeamToSemiFinal(semiFinalPool2, ranking['Winner 1'], sport, program);
                await updateTeamPools(ranking, semiFinalPool2._id);
            }
        }
    } else if (Object.keys(ranking).length == 2) {
        const semiFinalPool1 = await findOrCreatePool('Demi-Finale 1', sport, program);
        const semiFinalPool2 = await findOrCreatePool('Demi-Finale 2', sport, program);

        await assignTeamToSemiFinal(semiFinalPool1, ranking['Winner 2'], sport, program);
        await assignTeamToSemiFinal(semiFinalPool2, ranking['Winner 1'], sport, program);

        await updateTeamPools(ranking, [semiFinalPool1._id, semiFinalPool2._id]);
    }
}

async function updateFinalTeamPool(team, finalPool) {
    await Team.updateOne({ _id: team._id }, { $set: { pool: finalPool._id } });
}

async function handleFinalCreation(bestTeam, sport, program, pool) {
    console.log(`Vérification pour une finale après la demi-finale ${pool.name}`);

    let finalPool = await findOrCreatePool('Finale', sport, program);

    const finalMatch = await Match.findOne({ pool: finalPool._id, team2: null });

    if (finalMatch) {
        await Match.updateOne({ _id: finalMatch._id }, { $set: { team2: bestTeam._id } });
        console.log(`L'équipe ${bestTeam.school.name} a été ajoutée à la finale.`);
    } else {
        await Match.create({
            team1: bestTeam._id,
            team2: null,
            sport: sport._id,
            pool: finalPool._id,
            program: program._id
        });
        console.log(`Finale créée avec ${bestTeam.school.name}, en attente du vainqueur de l'autre demi-finale.`);
    }

    await updateFinalTeamPool(bestTeam, finalPool);
}

async function checkPoolWinner(pool, sport, program) {
    try {
        const matchs = await Match.find({ pool: pool._id, sport: sport._id, program: program._id });

        if (areAllMatchesFinished(matchs)) {
            console.log("length : ", poolsLenghts);
            const ranking = await winnersFactory[poolsLenghts](pool);

            if (!isSemiFinalOrFinal(pool)) {
                await handleSemiFinalCreation(ranking, sport, program);
            } else if (isSemiFinal(pool)) {
                await handleFinalCreation(ranking['Winner 1'], sport, program, pool);
            }
        }
    } catch (err) {
        console.error('Erreur lors de la vérification des vainqueurs de la poule:', err);
    }
}

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

function createPoules(teams) {
    const randomTeams = teams.sort(() => 0.5 - Math.random());
    return pouleFactory[randomTeams.length](randomTeams);;
}

const create = async (req, res) => {
    try {
        const program = await Program.findOne({ name: req.params.program });
        const sports = await Sport.find();

        // algo de creation de match pour chaque poule en fonction du programme et pour chaque sport
        for (const sport of sports) {
            const teams = await Team.find({ sport: sport._id, program: program._id });
            if (teams.length == 0) {
                console.log(`Aucune équipe créée pour ${sport.name} ${program.name}`);
                return res.status(204).send();
            }                    
            // creer un nb de poules en fonction du nb de teams
            const poules = createPoules(teams);
            for (let poule in poules) {
                const teamsInPoule = poules[poule];
                const newPoule = await Pool.create({ name: poule, sport: sport._id, program: program._id });
                
                for (let i = 0; i < teamsInPoule.length; i++) {
                    for (let j = i + 1; j < teamsInPoule.length; j++) {
                        // TODO : remove random
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
                            timePlayed: 5,
                            sport: sport._id,
                            pool: newPoule._id,
                            program: program._id
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
                        const team1name = await School.findOne({ _id: teamsInPoule[i].school._id  });
                        const team2name = await School.findOne({ _id: teamsInPoule[j].school._id  });

                        console.log(`Match créé: ${team1name.name} vs ${team2name.name} dans ${newPoule.name}`);
                    }
                }
            }
        }
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
                isFinished: isFinished 
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
                isFinished: time > 0 ? true : false
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
                $unset: { winnerTeam: "" },
                sport: sport._id,
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
        
        return res.status(200).json({ message: 'Tous les matches ont été supprimés.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de la suppression des matches.' });
    }
}

// TODO: creer le systeme d'atribution de matchs a un arbitre
const assign = async (req, res) => {
    const { team1, team2, arbitrator } = req.body;

    const arbitratorRef = await Arbitrator.findOne({ name: arbitrator });
    const program = await Program.findOne({ name: req.params.program });
    const sport = await Sport.findOne({ name: req.params.sport });

    const school1Ref = await School.findOne({ name: team1 });
    const team1Ref = await Team.findOne({ school: school1Ref, sport: sport._id, program: program._id });
    const school2Ref = await School.findOne({ name: team2 });
    const team2Ref = await Team.findOne({ school: school2Ref, sport: sport._id, program: program._id });
    
    const pool = await Pool.findById(school1Ref.pool);

    const match = await Match.findOneAndUpdate(
        { team1: team1Ref._id, team2: team2Ref._id, pool: pool},
        { arbitrator: arbitratorRef._id },
        { new: true }
    );
    return res.status(200).json(match)
}

module.exports = {create, update, updateMatchStatus, deleteTournament, clear, assign};
