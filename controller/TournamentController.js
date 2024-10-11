const mongoose = require('mongoose');
const Match = require("../models/MatchModel");
const Team = require("../models/TeamModel");
const Sport = require("../models/SportModel");
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
        const sexe = req.params.sexe;
        const sports = await Sport.find(); 
        
        
        // algo de creation de match pour chaque poule en fonction du programme et pour chaque sport
        for (const sport of sports) {
            const teams = await Team.find({ sport: sport._id, sexe: sexe }).populate('school', 'name').exec();
            // creer un nb de poules en fonction du nb de teams
            const poules = createPoules(teams);
            for (let poule in poules) {
                const teamsInPoule = poules[poule];
                for (let i = 0; i < teamsInPoule.length; i++) {
                    for (let j = i + 1; j < teamsInPoule.length; j++) {
                        const match = {
                            team1: teamsInPoule[i].school.name,
                            team2: teamsInPoule[j].school.name,
                            sport: sport._id,
                            pool: poule,
                            sexe: sexe
                        };
            
                        await Match.create(match);
                        await Team.findOneAndUpdate(
                            { school: teamsInPoule[i].school._id, sport: sport._id, sexe: sexe },
                            { $set: { pool: poule } }
                        );
                        
                        await Team.findOneAndUpdate(
                            { school: teamsInPoule[j].school._id, sport: sport._id, sexe: sexe },
                            { $set: { pool: poule } }
                        );
    
                        console.log(`Match créé: ${match.team1} vs ${match.team2} dans ${poule}`);
                    }
                }
            }
        }
        return res.redirect(`/tournament/${sport.name}/${sexe}`);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de la création du tournoi.' });
    }
};

// met a jour le score d'un match et les points des participants
const update = async (req, res) => {
    const { team1, team2, score, time } = req.body;
    const sexe = req.params.sexe;
    const sport = await Sport.findOne({ name: req.params.sport });
    const winnerTeam = getTheWinner(team1, team2, score);
    const looserTeam = getTheLooser(team1, team2, score);

    try {
        // maj des points
        if (winnerTeam === "Match nul" && looserTeam === "Match nul") {
            await teamController.updatePoints({
                body: { teamName: team1, sexe: sexe, points: 1 }
            }, res);

            await teamController.updatePoints({
                body: { teamName: team2, sexe: sexe, points: 1 }
            }, res);
        } else {
            await teamController.updatePoints({
                body: { teamName: winnerTeam, sexe: sexe, points: 3 }
            }, res);

            await teamController.updatePoints({
                body: { teamName: looserTeam, sexe: sexe, points: 0 }
            }, res);
        }

        // maj des scores
        const tournament = await Match.findOneAndUpdate(
            { team1: team1, team2: team2, sexe: sexe },
            {
                score: {
                    team1Score: score.team1Score,
                    team2Score: score.team2Score
                },
                winnerTeam: winnerTeam,
                sport: sport._id,
                time: time
            },
            { new: true }
        );
        // check a la fin de l'update si tous les matchs de la poule des deux equipes sont fini pour le passage en demi-finale/finale 
        // checkPoolWinner();
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
            await Match.deleteMany({ sport: sport._id, sexe: req.params.sexe });
            await Team.updateMany(
                { sport: sport._id },
                { $set: { pool: null, points: 0 } }
            );  
            console.log(`Tous les matchs de ${sport.name} pour le programme ${req.params.sexe} ont été supprimés`);
        }
        return res.status(200).json({ message: 'Tous les matches ont été supprimés.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de la suppression des matches.' });
    }
}


module.exports = {create, update, deleteTournament};
