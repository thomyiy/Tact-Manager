const express = require('express');
const CheerleadingController = require("../controller/CheerleadingController");
const School = require("../models/SchoolModel");
const User = require("../models/UserModel");
const CheerleadingScore = require("../models/CheerleadingScoreModel");
const mongoose = require("mongoose");
const route = express.Router();
const utils = require("../controller/Utils")
const Match = require("../models/MatchModel");
const Pool = require("../models/PoolModel");
const Sport = require("../models/SportModel");
const Program = require("../models/ProgramModel");
const Team = require("../models/TeamModel");
const TeamPoint = require("../models/TeamPointModel");

module.exports = function (route) {
    route.get('/match/:id', async (req, res, next) => {
        try {
            const global = await utils.getGlobal(req)
            var match = await Match.findById(req.params.id).populate({
                path: 'team1 team2 winnerTeam',
                populate: {path: 'school', select: 'name'}
            })
                .populate('sport pool program');

            match = await User.populate(match, {path: "arbitrator", select: 'firstname lastname'})

            const arbitrators = await User.find({role: "Arbitrator", _id: {$nin: match.arbitrator.map(a => a._id)}})

            res.render('match-detail', {
                global: global,
                match: match,
                arbitrators: arbitrators
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({error: 'Erreur serveur lors du chargement des routes.'});
        }
    });
    route.get('/match', async (req, res, next) => {
        const global = await utils.getGlobal(req)

        res.render('match-arbitrator-list', {
            global: global,

        });

    })

    route.post('/match/affectarbitrator', async (req, res, next) => {
        const arbitrator = await User.findOne({_id: req.body.arbitratorId})

        const match = await Match.findById(req.body.matchId)
        match.arbitrator.push(arbitrator)
        match.save()

        return res.redirect("/match/" + req.body.matchId)
    });

    route.post('/match/removearbitrator', async (req, res, next) => {

        const arbitrator = await User.findOne({_id: req.body.arbitratorId})

        const match = await Match.findById(req.body.matchId)
        match.arbitrator.pull(arbitrator)
        match.save()

        return res.redirect("/match/" + req.body.matchId)
    });

    route.post('/match/update', async (req, res, next) => {

        Match.findByIdAndUpdate(req.body._id, req.body,
            function (err, docs) {
                if (err) {
                    console.log(err)
                    res.sendStatus(500);
                } else {
                    res.sendStatus(200);
                }
            });
    });

    route.post('/match/validatePool', async (req, res, next) => {

        var pool = await Pool.aggregate([
            {
                $match: {_id: mongoose.Types.ObjectId(req.body.poolId)},
            },
            {
                $lookup: {
                    from: "matches",
                    localField: "_id",
                    foreignField: "pool",
                    as: "matches",
                },
            },
            {
                $lookup: {
                    from: "teams",
                    localField: "_id",
                    foreignField: "pool",
                    as: "teams",
                },
            }
        ]);

        pool = pool[0]

        pool = await Sport.populate(pool, 'sport')
        pool = await Program.populate(pool, 'program')

        const matchIds = pool.matches.map(e => e._id.toString())

        Pool.updateOne({'_id': {$in: req.body.poolId}}, {$set: {isFinished: true}}, async function (err, docs) {
            if (err) {
                console.log(err)
                res.sendStatus(500);
            } else {
                await Match.updateMany({'_id': {$in: matchIds}}, {$set: {isFinished: true}});
                for (const t of pool.teams) {
                    await TeamPoint.findOneAndUpdate({team: t._id, pool: pool._id}, {
                        $set: {
                            points: 0,
                            goal: 0,
                            goalAverage: 0
                        }
                    });
                }
                for (const match of pool.matches) {

                    // Calculate score
                    if (match.score.team1Score === match.score.team2Score) {
                        await TeamPoint.findOneAndUpdate({team: match.team1, pool: pool._id}, {$inc: {points: 1}})
                        await TeamPoint.findOneAndUpdate({team: match.team2, pool: pool._id}, {$inc: {points: 1}})
                    } else if (match.score.team1Score > match.score.team2Score) {
                        await TeamPoint.findOneAndUpdate({team: match.team1, pool: pool._id}, {$inc: {points: 3}})
                    } else if (match.score.team1Score < match.score.team2Score) {
                        await TeamPoint.findOneAndUpdate({team: match.team2, pool: pool._id}, {$inc: {points: 3}})
                    }
                }

                // Calculate number of goal and goal average
                var teamPointsPool = await TeamPoint.find({pool: pool._id})
                const randomNumber = generateRandomNumbers(teamPointsPool.length, 1, teamPointsPool.length)

                for (var i = 0; i < teamPointsPool.length; i++) {
                    const teamPointPool = teamPointsPool[i]
                    var ga = 0;
                    var goal = 0
                    var matchsAsTeam1 = await Match.find({team1: teamPointPool.team})
                    matchsAsTeam1.forEach(mat1 => {
                        ga += mat1.score.team1Score - mat1.score.team2Score
                        goal += mat1.score.team1Score
                    })
                    var matchsAsTeam2 = await Match.find({team2: teamPointPool.team})
                    matchsAsTeam2.forEach(mat2 => {
                        ga += mat2.score.team2Score - mat2.score.team1Score
                        goal += mat2.score.team2Score
                    })
                    await TeamPoint.findOneAndUpdate({_id: teamPointPool._id}, {
                        $set: {
                            goalAverage: ga,
                            goal: goal,
                            random: randomNumber[i]
                        }
                    })
                }

                //const pools = await Pool.find({sport: pool.sport._id, program: pool.program._id})
                var pools = await Pool.aggregate([
                    {
                        $match: {sport: pool.sport._id, program: pool.program._id},
                    },
                    {
                        $lookup: {
                            from: "teampoints",
                            localField: "_id",
                            foreignField: "pool",
                            as: "teampoints",
                        },
                    }
                ]);

                if (pools.every(v => v.isFinished === true)) {
                    if (!pools.some((obj) => obj.name === "Demi-Finale 1")) {
                        const demi1 = await Pool.create({
                            name: "Demi-Finale 1",
                            sport: pool.sport._id,
                            program: pool.program._id
                        });
                        const demi2 = await Pool.create({
                            name: "Demi-Finale 2",
                            sport: pool.sport._id,
                            program: pool.program._id
                        });
                        if (pools.length === 2) {
                            var pool1 = pools[0].teampoints.sort(sortTeamPoint)
                            var pool2 = pools[1].teampoints.sort(sortTeamPoint)
                            await Match.create({
                                team1: pool1[0].team,
                                team2: pool2[1].team,
                                sport: pool.sport,
                                pool: demi1._id,
                                program: pool.program
                            });
                            await TeamPoint.create({team: pool1[0].team, pool: demi1._id})
                            await TeamPoint.create({team: pool2[1].team, pool: demi1._id})
                            await Match.create({
                                team1: pool1[1].team,
                                team2: pool2[0].team,
                                sport: pool.sport,
                                pool: demi2._id,
                                program: pool.program
                            });
                            await TeamPoint.create({team: pool1[1].team, pool: demi2._id})
                            await TeamPoint.create({team: pool2[0].team, pool: demi2._id})
                        } else if (pools.length === 3) {
                            var pool1 = pools[0].teampoints.sort(sortTeamPoint)
                            var pool2 = pools[1].teampoints.sort(sortTeamPoint)
                            var pool3 = pools[2].teampoints.sort(sortTeamPoint)

                            var seconds = [
                                pools[0].teampoints[1],
                                pools[1].teampoints[1],
                                pools[2].teampoints[1]
                            ]
                            seconds = seconds.sort(sortTeamPoint)

                            if (seconds[0].pool.toString() === pools[0]._id.toString()) {
                                await Match.create({
                                    team1: pool2[0].team,
                                    team2: seconds[0].team,
                                    sport: pool.sport,
                                    pool: demi1._id,
                                    program: pool.program
                                });
                                await TeamPoint.create({team: pool2[0].team, pool: demi1._id})
                                await TeamPoint.create({team: seconds[0].team, pool: demi1._id})

                                await Match.create({
                                    team1: pool1[0].team,
                                    team2: pool3[0].team,
                                    sport: pool.sport,
                                    pool: demi2._id,
                                    program: pool.program
                                });
                                await TeamPoint.create({team: pool1[0].team, pool: demi2._id})
                                await TeamPoint.create({team: pool3[0].team, pool: demi2._id})
                            } else if (seconds[0].pool.toString() === pools[1]._id.toString()) {
                                await Match.create({
                                    team1: pool1[0].team,
                                    team2: seconds[0].team,
                                    sport: pool.sport,
                                    pool: demi1._id,
                                    program: pool.program
                                });
                                await TeamPoint.create({team: pool1[0].team, pool: demi1._id})
                                await TeamPoint.create({team: seconds[0].team, pool: demi1._id})
                                await Match.create({
                                    team1: pool1[0].team,
                                    team2: pool2[0].team,
                                    sport: pool.sport,
                                    pool: demi2._id,
                                    program: pool.program
                                });
                                await TeamPoint.create({team: pool1[0].team, pool: demi2._id})
                                await TeamPoint.create({team: pool2[0].team, pool: demi2._id})
                            }
                        } else if (pools.length === 4) {
                            var pool1 = pools[0].teampoints.sort(sortTeamPoint)
                            var pool2 = pools[1].teampoints.sort(sortTeamPoint)
                            var pool3 = pools[2].teampoints.sort(sortTeamPoint)
                            var pool4 = pools[3].teampoints.sort(sortTeamPoint)

                            await Match.create({
                                team1: pool1[0].team,
                                team2: pool2[0].team,
                                sport: pool.sport,
                                pool: demi1._id,
                                program: pool.program
                            });
                            await TeamPoint.create({team: pool1[0].team, pool: demi1._id})
                            await TeamPoint.create({team: pool2[0].team, pool: demi1._id})
                            await Match.create({
                                team1: pool3[0].team,
                                team2: pool4[0].team,
                                sport: pool.sport,
                                pool: demi2._id,
                                program: pool.program
                            });
                            await TeamPoint.create({team: pool3[0].team, pool: demi2._id})
                            await TeamPoint.create({team: pool4[0].team, pool: demi2._id})
                        }
                    } else {
                        const final = await Pool.create({
                            name: "Final",
                            sport: pool.sport._id,
                            program: pool.program._id
                        });
                        var poolDemi = await Pool.aggregate([
                            {
                                $match: {
                                    sport: pool.sport._id,
                                    program: pool.program._id,
                                    $or: [{name: "Demi-Finale 1"}, {name: "Demi-Finale 2"}]
                                },
                            },
                            {
                                $lookup: {
                                    from: "teampoints",
                                    localField: "_id",
                                    foreignField: "pool",
                                    as: "teampoints",
                                },
                            },
                        ])
                        var pool1 = poolDemi[0].teampoints.sort(sortTeamPoint)
                        var pool2 = poolDemi[1].teampoints.sort(sortTeamPoint)

                        await Match.create({
                            team1: pool1[0].team,
                            team2: pool2[0].team,
                            sport: pool.sport,
                            pool: final._id,
                            program: pool.program
                        });
                        await TeamPoint.create({team: pool1[0].team, pool: final._id})
                        await TeamPoint.create({team: pool2[0].team, pool: final._id})
                    }
                }
                return res.redirect("/tournament/" + pool.sport.name + "/" + pool.program.name + "/#" + pool.name)
            }
        });
    });


    function sortTeamPoint(a, b) {
        if (b.points < a.points) return -1;
        if (b.points > a.points) return 1;
        if (b.goalAverage < a.goalAverage) return 1;
        if (b.goalAverage > a.goalAverage) return -1;
        if (b.goal < a.goal) return 1;
        if (b.goal > a.goal) return -1;
        if (b.random < a.random) return 1;
        if (b.random > a.random) return -1;
    }

    function generateRandomNumbers(count, min, max) {
        // 1: Create a `Set` object
        let uniqueNumbers = new Set();
        while (uniqueNumbers.size < count) {
            // 2: Generate each random number
            uniqueNumbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        // 3: Immediately insert them numbers into the Set...
        return Array.from(uniqueNumbers);
    }
}
