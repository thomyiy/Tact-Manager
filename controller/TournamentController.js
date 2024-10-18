const mongoose = require('mongoose');
const Match = require("../models/MatchModel");
const Team = require("../models/TeamModel");
const Sport = require("../models/SportModel");
const School = require("../models/SchoolModel");
const Program = require("../models/ProgramModel");
const Pool = require("../models/PoolModel");
const teamController = require("./TeamController");

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

function areAllMatchesFinished(matchs) {
    return matchs.every(match => match.isFinished);
}

async function getTopTwoTeams(pool) {
    return await Team.find({ pool: pool._id })
        .sort({ points: -1 })
        .limit(2);
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

async function assignTeamToSemiFinal(pool, team, sport, program, teamIndex) {
    let match = await Match.findOne({ pool: pool._id, $or: [{ team1: null }, { team2: null }] });

    if (!match) {
        match = await Match.create({
            team1: teamIndex === 1 ? team._id : null,
            team2: teamIndex === 0 ? team._id : null,
            sport: sport._id,
            pool: pool._id,
            program: program._id
        });
    } else {
        const fieldToUpdate = !match.team1 ? 'team1' : 'team2';
        await Match.updateOne({ _id: match._id }, { $set: { [fieldToUpdate]: team._id } });
    }

    console.log(`${team.school.name} a été ajouté à la ${pool.name}.`);
}

async function updateTeamPools(ranking, pools) {
    await Team.updateMany(
        { _id: { $in: [ranking[0]._id, ranking[1]._id] } },
        { $set: { pool: { $in: pools } } }
    );
}

async function handleSemiFinalCreation(ranking, sport, program) {
    console.log("Création des demi-finales");

    const semiFinalPool1 = await findOrCreatePool('Demi-Finale 1', sport, program);
    const semiFinalPool2 = await findOrCreatePool('Demi-Finale 2', sport, program);

    await assignTeamToSemiFinal(semiFinalPool1, ranking[1], sport, program, 1);
    await assignTeamToSemiFinal(semiFinalPool2, ranking[0], sport, program, 0);

    await updateTeamPools(ranking, [semiFinalPool1._id, semiFinalPool2._id]);
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
            const ranking = await getTopTwoTeams(pool);

            if (!isSemiFinalOrFinal(pool)) {
                await handleSemiFinalCreation(ranking, sport, program);
            } else if (isSemiFinal(pool)) {
                await handleFinalCreation(ranking[0], sport, program, pool);
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
    return pouleFactory[randomTeams.length](randomTeams);
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
                        const match = {
                            team1: teamsInPoule[i]._id,
                            team2: teamsInPoule[j]._id,
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
            { team1: team1Ref._id, team2: team2Ref._id, program: program._id, pool: teamReference.pool },
            {
                score: {
                    team1Score: null,
                    team2Score: null
                },
                $unset: { winnerTeam: "" },
                sport: sport._id,
                timePlayed: time
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

module.exports = {create, update, deleteTournament, clear};
