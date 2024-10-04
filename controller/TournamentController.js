const mongoose = require('mongoose');
const Match = require("../models/MatchModel");
const Team = require("../models/TeamModel");
const Sport = require("../models/SportModel");

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
        return null;
    } else if (score.team1Score > score.team2Score) {
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
        const sport = await Sport.findOne({ name: req.body.sport });
        const teams = await Team.find({ sport: sport._id });

        // creer un nb de poules en fonction du nb de teams
        const poules = createPoules(teams);

        // algo de creation de match pour chaque poule
        for (let poule in poules) {
            const teamsInPoule = poules[poule];
        
            for (let i = 0; i < teamsInPoule.length; i++) {
                for (let j = i + 1; j < teamsInPoule.length; j++) {
                    const match = {
                        team1: teamsInPoule[i].name,
                        team2: teamsInPoule[j].name,
                        sport: sport._id,
                        pool: poule
                    };
        
                    await Match.create(match);
                    console.log(`Match créé: ${match.team1} vs ${match.team2} dans ${poule}`);
                }
            }
        }
        return res.redirect(`/tournament/${sport.name}`);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de la création du tournoi.' });
    }
};

const update = async (req, res) => {
    const { team1, team2, score, time } = req.body;
    const sport = await Sport.findOne({ name: req.params.sport });
    const teamWinner = getTheWinner(team1, team2, score);

    try {
        const tournament = await Match.findOneAndUpdate(
            { team1: team1, team2: team2 },
            {
                score: {
                    team1Score: score.team1Score,
                    team2Score: score.team2Score
                },
                winnerTeam: teamWinner,
                sport: sport._id,
                time: time
            },
            { new: true }
        );
        
        return res.status(200).json(tournament);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du match.' });
    }
}

module.exports = {create, update};
