const mongoose = require('mongoose');
const Match = require("../models/MatchModel");
const Team = require("../models/TeamModel");
const Sport = require("../models/SportModel");

function getTheWinner(team1, team2, score) {
    if (score.team1Score == score.team2Score || score.team1Score == undefined || score.team2Score == undefined) {
        return null;
    } else if (score.team1Score > score.team2Score) {
        return team1;
    }
    return team2;
}

function createPoules(teams) {
    let poules = new Map();
    const randomTeams = teams.sort(() => 0.5 - Math.random());
    let pouleIndex = 1

    while (randomTeams.length > 0) {
        let pouleName = pouleIndex;
        let poule = randomTeams.splice(0, 2);
        poules.set(pouleName, poule);
        pouleIndex++;
    }

    return poules;
}

const create = async (req, res) => {
    try {
        const sport = await Sport.findOne({ name: req.body.sport });
        const teams = await Team.find({ sport: sport._id });

        const allMatches = createPoules(teams);

        for (const [pouleName, teams] of allMatches) {
            for (let i = 0; i < teams.length; i++) {
                for (let j = i + 1; j < teams.length; j++) {
                    const match = {
                        team1: teams[i].name,
                        team2: teams[j].name,
                        sport: sport._id,
                        pool: pouleName
                    };
                    await Match.create(match);
                    console.log(`Match créé: ${match.team1} vs ${match.team2} dans ${match.poule}`);
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
