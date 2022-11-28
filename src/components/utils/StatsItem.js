import { pad, replaceItemInArray } from './Utils'

const kSkillServe = 1
const kSkillPass = 2
const kSkillSet = 3
const kSkillSpike = 4
const kSkillBlock = 5
const kSkillDefense = 6
const kSkillFreeball = 7
const kSkillCover = 7
const kSkillCoachTag = 8
const kSkillEndOfSet = 9
const kSkillTransitionSO = 10
const kSkillTransitionPovar = 11
const kSkillPointWonServe = 12
const kSkillPointLostServe = 13
const kSkillPointWonReceive = 14
const kSkillPointLostReceive = 15
const kSkilliCodaAttack = 16
const kSkilliCodaDefense = 17
const kSkillCodeError = 18
const kSkillOppositionError = 19
const kSkillSettersCall = 20
const kSkillSpeedServe = 30
const kSkillLift = 40

const kOppositionScore = 100
const kOppositionError = 101
const kOppositionHitKill = 102
const kOppositionHitError = 103
const kOppositionServeError = 104
const kOppositionServeAce = 105
const kSkillCommentary = 200
const kSkillTimeout = 201
const kSkillTechTimeout = 202
const kSubstitution = 250
const kSkillOppositionServe = 401
const kSkillOppositionSpike = 404

const kServeH = 1
const kServeM = 2
const kServeQ = 3
const kServeO = 4

const kPassH = 1
const kPassM = 2
const kPassQ = 3
const kPassO = 4

const kSpikeH = 1
const kSpikeM = 2
const kSpikeQ = 3
const kSpikeT = 4
const kSpikeU = 5
const kSpikeF = 6
const kSpikeO = 7

const kFBKills = 0
const kFBOppServeErrors = 1
const kFBOppErrors = 2
const kKills = 3
const kOppErrors = 4
const kUnsuccessful = 5
const kSOUnknown = 6

export function doEvent(e, si) {
    var et = e.EventType
    var eg = e.EventGrade
    var err = e.ErrorType
    var subevent = e.SubEvent
    var subevent2 = e.SubEvent2
    switch (et) {
        case kSkillServe:
            {
                si.ServeTotal++;
                switch (eg) {
                    case 0:
                        if (err != 1) si.Serve0++;
                        break;
                    case 1:
                        si.Serve1++;
                        break;
                    case 2:
                        si.Serve2++;
                        break;
                    case 3:
                        si.Serve3++;
                        break;
                    case 4:
                        si.Serve4++;
                        break;
                    default:
                        break;
                }
            }
            break;
        case kSkillPass:
            {
                si.PassTotalPoints += e.passingGrade
                si.PassTotal++;
                switch (eg) {
                    case 0:
                        si.Pass0++;
                        break;
                    case 1:
                        si.Pass1++;
                        break;
                    case 2:
                        si.Pass2++;
                        break;
                    case 3:
                        si.Pass3++;
                        break;
                    default:
                        break;
                }
            }
            break;
        case kSkillSet:
            {
                switch (eg) {
                    case 0:
                        if (err != 1) si.Set0++;
                        break;
                    case 1:
                        si.Set1++;
                        break;
                    case 2:
                        si.Set2++;
                        break;
                    case 3:
                        si.Set3++;
                        break;
                    default:
                        break;
                }
            }
            break;
        case kSkillSpike:
            {
                si.SpikeTotal++;
                switch (eg) {
                    case 0:
                        si.Spike0++;
                        if (err == 2) {
                            si.SpikeBlocked++;
                        }
                        break;
                    case 1:
                        si.Spike1++;
                        break;
                    case 2:
                        si.Spike2++;
                        break;
                    case 3:
                        si.Spike3++;
                        break;
                    default:
                        break;
                }
            }
            break;
        case kSkillBlock:
            {
                switch (eg) {
                    case 0:
                        if (err != 1) si.Blck0++;
                        break;
                    case 1:
                        si.Blck1++;
                        break;
                    case 2:
                        si.Blck3++;
                        si.BlckSolo++;
                        break;
                    case 3:
                        if (subevent == 1) {
                            si.Blck4++;
                            si.BlckAssist++;
                        }
                        else if (subevent == 0) {
                            si.Blck3++;
                            si.BlckSolo++;
                        }
                        break;
                    default:
                        break;
                }
            }
            break;
        case kSkillDefense:
            {
                switch (eg) {
                    case 0:
                        si.BHE++;
                        break;
                    case 1:
                        si.Dig1++;
                        si.Dig++;
                        break;
                    case 2:
                        si.Dig2++;
                        si.Dig++;
                        break;
                    case 3:
                        si.Dig3++;
                        si.Dig++;
                        break;
                    default:
                        break;
                }
            }
            break;
        case kSkillLift:
            {
                si.Lift++;
                switch (eg) {
                    case 1:
                        si.LiftServe++;
                        break;
                    case 2:
                        si.LiftBlock++;
                        break;
                    case 3:
                        si.LiftAttack++;
                        break;
                    default:
                        break;
                }
            }
            break;
    }
    return si
}

export function createStatsItem(player, set) {
    var si = {}
    si.player = player
    si.set = set
    si.Guid = player !== null ? player.Guid : 'TEAM'
    si.Name = player !== null ? player.NickName : 'zzzTEAM'
    si.ShirtNumber = player !== null ? pad(player.shirtNumber, 3) : '999'
    si.Pass0 = 0
    si.Pass05 = 0
    si.Pass1 = 0
    si.Pass2 = 0
    si.Pass3 = 0
    si.PassTotal = 0
    si.PassTotalPoints = 0
    si.Serve0 = 0
    si.Serve1 = 0
    si.Serve2 = 0
    si.Serve3 = 0
    si.Serve4 = 0
    si.ServeTotal = 0
    si.ServeTotalSpeed = 0
    si.ServeAverageSpeed = 0
    si.Set0 = 0
    si.Set1 = 0
    si.Set2 = 0
    si.Set3 = 0
    si.Spike0 = 0
    si.Spike1 = 0
    si.Spike2 = 0
    si.Spike3 = 0
    si.SpikeTotal = 0
    si.SpikeBlocked = 0
    si.Blck0 = 0
    si.Blck05 = 0
    si.Blck1 = 0
    si.Blck2 = 0
    si.Blck3 = 0
    si.Blck4 = 0
    si.BlckSolo = 0
    si.BlckAssist = 0
    si.BHE = 0
    si.Lift = 0
    si.LiftServe = 0
    si.LiftBlock = 0
    si.LiftAttack = 0
    si.Dig = 0
    si.Dig0 = 0
    si.Dig05 = 0
    si.Dig1 = 0
    si.Dig2 = 0
    si.Dig3 = 0
    si.GameNumber = set != undefined ? set.GameNumber : 0
    si.gamesPlayed = 0
    si.PointsWon = 0

    return si
}

export function addStatsItem(ssSource, ssDestination) {
    ssDestination.Pass0 += ssSource.Pass0;
    ssDestination.Pass1 += ssSource.Pass1;
    ssDestination.Pass2 += ssSource.Pass2;
    ssDestination.Pass3 += ssSource.Pass3;
    ssDestination.PassTotal += ssSource.PassTotal;
    ssDestination.PassTotalPoints += ssSource.PassTotalPoints;
    ssDestination.Serve0 += ssSource.Serve0;
    ssDestination.Serve1 += ssSource.Serve1;
    ssDestination.Serve2 += ssSource.Serve2;
    ssDestination.Serve4 += ssSource.Serve4;
    ssDestination.Serve3 += ssSource.Serve3;
    ssDestination.ServeTotal += ssSource.ServeTotal;
    ssDestination.Spike0 += ssSource.Spike0;
    ssDestination.Spike1 += ssSource.Spike1;
    ssDestination.Spike2 += ssSource.Spike2;
    ssDestination.Spike3 += ssSource.Spike3;
    ssDestination.SpikeBlocked += ssSource.SpikeBlocked;
    ssDestination.SpikeTotal += ssSource.SpikeTotal;
    ssDestination.Blck0 += ssSource.Blck0;
    ssDestination.Blck1 += ssSource.Blck1;
    ssDestination.Blck2 += ssSource.Blck2;
    ssDestination.Blck3 += ssSource.Blck3;
    ssDestination.Blck4 += ssSource.Blck4;
    ssDestination.BlckSolo += ssSource.BlckSolo;
    ssDestination.BlckAssist += ssSource.BlckAssist;
    ssDestination.Set0 += ssSource.Set0;
    ssDestination.Set1 += ssSource.Set1;
    ssDestination.Set2 += ssSource.Set2;
    ssDestination.Set3 += ssSource.Set3;
    ssDestination.Dig += ssSource.Dig;
    ssDestination.Dig0 += ssSource.Dig0;
    ssDestination.Dig1 += ssSource.Dig1;
    ssDestination.Dig2 += ssSource.Dig2;
    ssDestination.Dig3 += ssSource.Dig3;
    ssDestination.BHE += ssSource.BHE;
    ssDestination.Lift += ssSource.Lift;
    ssDestination.LiftServe += ssSource.LiftServe;
    ssDestination.LiftBlock += ssSource.LiftBlock;
    ssDestination.LiftAttack += ssSource.LiftAttack;
    ssDestination.PointsBreak += ssSource.PointsBreak;
    ssDestination.playTime += ssSource.playTime;
    ssDestination.SideOuts += ssSource.SideOuts;
    ssDestination.BreakPoints += ssSource.BreakPoints;
    ssDestination.SideOutFirstBalls += ssSource.SideOutFirstBalls;
    ssDestination.SideOutFails += ssSource.SideOutFails;
    ssDestination.SideOutFirstBallKills += ssSource.SideOutFirstBallKills;
    ssDestination.SideOutOn2s += ssSource.SideOutOn2s;
    ssDestination.SideOutFirstBallSpikes += ssSource.SideOutFirstBallSpikes;
    ssDestination.SideOutOppErrors += ssSource.SideOutOppErrors;

    return ssDestination
}

export function calculateAllStats(si) {
    var t = si.Pass0 + si.Pass1 + si.Pass2 + si.Pass3;
    var tt = si.Pass3;
    var f = (t != 0) ? tt / t : 0;
    si.PassPercentPerfect = (f * 100);
    si.PassPercentPerfectString = si.PassPercentPerfect.toFixed(2)

    var t = si.BHE + si.Dig0 + si.Dig1 + si.Dig2 + si.Dig3;
    var tt = (si.Dig1) + (si.Dig2 * 2) + (si.Dig3 * 3);
    si.DigAverage = (t != 0) ? tt / t : -1;
    si.DigAverageString = si.DigAverage != -1 ? si.DigAverage.toFixed(2) : ''

    var t = si.Pass0 + si.Pass1 + si.Pass2 + si.Pass3;
    var tt = (si.Pass1) + (si.Pass2 * 2) + (si.Pass3 * 3);
    if (si.PassTotalPoints === undefined || isNaN(si.PassTotalPoints))
    {
        si.PassAverage = (t != 0) ? tt / t : -1;
    }
    else
    {
        si.PassAverage = si.PassTotal != 0 ? si.PassTotalPoints / si.PassTotal : -1;
    }
    si.PassAverageString = si.PassAverage != -1 ? si.PassAverage.toFixed(2) : ''

    var t = si.Serve0 + si.Serve1 + si.Serve2 + si.Serve3;
    var tt = (si.Serve1) + (si.Serve2 * 2) + (si.Serve3 * 3);
    si.ServeAverage = (t != 0) ? tt / t : -1;

    var total = si.Serve0 + si.Serve1 + si.Serve2 + si.Serve4 + si.Serve3;
    var ave = -1;
    if (total != 0) {
        ave = (si.Serve1 + (si.Serve2 * 2) + (si.Serve3 * 4) + (si.Serve4 * 3)) / total;
        ave /= 4;
    }
    si.ServeEfficiency = ave;

    var t = si.Set0 + si.Set1 + si.Set2 + si.Set3;
    var tt = (si.Set1) + (si.Set2 * 2) + (si.Set3 * 3);
    si.SetAverage = (t != 0) ? tt / t : -1;

    var t = si.Blck0 + si.Blck1 + si.Blck2 + si.Blck3 + si.Blck4;
    var tt = (si.Blck1) + (si.Blck2 * 2) + (si.Blck3 * 3) + (si.Blck4 * 3);
    si.BlockAverage = (t != 0) ? tt / t : -1;

    var t = (si.BlckAssist * 0.5) + si.BlckSolo;
    si.BlockKills = t;

    var t = si.Spike0 + si.Spike1 + si.Spike2 + si.Spike3;
    var tt = (si.Spike1) + (si.Spike2 * 2) + (si.Spike3 * 3);
    si.HitAverage = (t != 0) ? tt / t : -1;

    var t = si.Spike0 + si.Spike1 + si.Spike2 + si.Spike3;
    si.SpikeEfficiency = (t != 0) ? (si.Spike3 - si.Spike0) / t : -3;

    var t = si.Spike0 + si.Spike1 + si.Spike2 + si.Spike3;
    si.SpikeKillPercentage = (t != 0) ? si.Spike3 / t : -3;

    si.Points = si.Spike3 + si.Serve3 + si.Blck3 + (si.Blck4 / 2.0);

    si.PointsNett = (si.Spike3 + si.Serve3 + si.Blck3 + (si.Blck4 / 2.0)) - (si.Spike0 + si.Serve0 + si.Blck0 + si.BHE + si.Pass0 + si.Set0);

    si.PointsLost = si.Spike0 + si.Serve0 + si.Blck0 + si.BHE + si.Pass0;

    si.ServeOverallStatus = si.Serve3 - si.Serve0;

    si.PassOverallStatus = si.Pass3 - si.Pass0;

    si.DigOverallStatus = si.Dig3 - si.Dig0;

    si.HitOverallStatus = si.Spike3 - si.Spike0;

    si.BlockOverallStatus = si.Blck3 + si.Blck4 - si.Blck0;

    si.ServeAverageSpeed = si.ServeTotal != 0 ? si.ServeTotalSpeed / si.ServeTotal : 0;

    si.SpikeEfficiencyString = si.SpikeEfficiency === -3 ? '' : (si.SpikeEfficiency * 100).toFixed(0) + '%';

    si.SpikeKillPercentageString = (si.SpikeKillPercentage * 100).toFixed(2);

    si.BlockPoints = si.BlckSolo + si.BlckAssist;

    si.PointsWon = si.Spike3 + si.Serve3 + si.BlockPoints;

    si.BlocksPerGame = (si.gamesPlayed == 0) ? "" : (si.BlockPoints / si.gamesPlayed).toFixed(2);

    si.DigsPerGame = (si.gamesPlayed == 0) ? "" : (si.Dig / si.gamesPlayed).toFixed(2);
    si.AcesPerGame = (si.gamesPlayed == 0) ? "" : (si.Serve3 / si.gamesPlayed).toFixed(2);
    si.BlocksPerGame = (si.gamesPlayed == 0) ? "" : (si.BlockPoints / si.gamesPlayed).toFixed(2);
    si.PointsPerGame = (si.gamesPlayed == 0) ? "" : (si.PointsWon / si.gamesPlayed).toFixed(2);
    si.KillsPerGame = (si.gamesPlayed == 0) ? "" : (si.Spike3 / si.gamesPlayed).toFixed(2);

    var tot = (si.SideOutFails + si.SideOuts);
    si.SideOutPercent = (tot == 0) ? 0 : (si.SideOuts * 100) / tot
    si.SideOutFirstBallPercent = (tot == 0) ? 0 : (si.SideOutFirstBalls * 100) / tot;
    si.SideOutTransitionPercent = (tot == 0) ? 0 : ((si.SideOuts - si.SideOutFirstBalls) * 100) / tot;
    si.SideOutOppErrorPercent = (tot == 0) ? 0 : (si.SideOutOppErrors * 100) / tot;
    si.SideOutFirstBallKillPercent = (si.SideOutFirstBallSpikes == 0) ? 0 : (si.SideOutFirstBallKills * 100) / si.SideOutFirstBallsSpikes;

    si.pointPercent = (si.ServeTotal == 0) ? 0 : (si.BreakPoints * 100) / si.ServeTotal;
    si.plus = (si.Serve3 + si.Spike3 + si.Blck3);
    si.minus = (si.Serve0 + si.Pass0 + si.Spike0 + si.Blck0 + si.Dig0);
    si.GoodDigs = (si.Dig1 + si.Dig2 + si.Dig3);
    si.GoodServe = (si.Serve3 + si.Serve4)
    si.GoodServePercent = (si.ServeTotal == 0) ? 0 : ((si.GoodServe * 100) / si.ServeTotal);

    si.LiftUnknown = si.Lift - (si.LiftServe + si.LiftBlock + si.LiftAttack)

    return si
}

function getPlayerByGuid(guid, m)
{
    var pls = m.teamA.players.filter(obj => obj.Guid === guid)
    if (pls.length > 0) {
        return pls[0]
    }
    pls = m.teamB.players.filter(obj => obj.Guid === guid)
    if (pls.length > 0) {
        return pls[0]
    }
    return null
}

function isPlayerInTeam(pl, tm, match) {
    if (pl == null) {
        return false;
    }
    if (tm == match.teamA) {
        if (match.teamA.players.filter(obj => obj.Guid === pl.Guid).length > 0) {
            return true;
        }
    }
    else {
        if (match.teamB.players.filter(obj => obj.Guid === pl.Guid).length > 0) {
            return true;
        }
    }
    return false;
}

export function calculateSideoutStats(m, appName) {
    m = calculateSideoutStatsForTeam(m, m.teamA, appName)
    m = calculateSideoutStatsForTeam(m, m.teamB, appName)
    m.teamA.statsItems[0].BreakPoints = m.teamB.statsItems[0].SideOutFails
    m.teamA.statsItems[0].pointPercent = (m.teamA.statsItems[0].ServeTotal == 0) ? 0 : (m.teamA.statsItems[0].BreakPoints[0] * 100) / m.teamA.statsItems[0].ServeTotal;
    m.teamB.statsItems[0].BreakPoints = m.teamA.statsItems[0].SideOutFails
    m.teamB.statsItems[0].pointPercent = (m.teamB.statsItems[0].ServeTotal == 0) ? 0 : (m.teamB.statsItems[0].BreakPoints[0] * 100) / m.teamB.statsItems[0].ServeTotal;
    for (var nd=0; nd<m.sets.length; nd++)
    {
        var game = m.sets[nd]
        game.teamAStatsItems[0].BreakPoints = game.teamBStatsItems[0].SideOutFails
        game.teamAStatsItems[0].pointPercent = (game.teamBStatsItems[0].ServeTotal == 0) ? 0 : (game.teamAStatsItems[0].BreakPoints[0] * 100) / game.teamAStatsItems[0].ServeTotal;
        game.teamBStatsItems[0].BreakPoints = game.teamAStatsItems[0].SideOutFails
        game.teamBStatsItems[0].pointPercent = (game.teamBStatsItems[0].ServeTotal == 0) ? 0 : (game.teamBStatsItems[0].BreakPoints[0] * 100) / game.teamBStatsItems[0].ServeTotal;
    }
    return m
}

var selset = 0

export function calculateSideoutStatsForTeam(m, tm, appName) {
    var sideouts = 0
    var allpasses = 0;
    var fbsideouts = 0;
    var rotAllPasses = [0, 0, 0, 0, 0, 0, 0];
    var rotSideOut = [0, 0, 0, 0, 0, 0, 0];
    var rotSideOutKill = [0, 0, 0, 0, 0, 0, 0];
    var rotFBSideOut = [0, 0, 0, 0, 0, 0, 0];
    var rotFBOppServeErrorSideOut = [0, 0, 0, 0, 0, 0, 0];
    var rotFBOppErrorSideOut = [0, 0, 0, 0, 0, 0, 0];
    var rotFBKillSideOut = [0, 0, 0, 0, 0, 0, 0];
    var rotOppErrorSideOut = [0, 0, 0, 0, 0, 0, 0];
    // var setAllPasses = [0, 0, 0, 0, 0, 0];
    // var setSideOut = [0, 0, 0, 0, 0, 0];
    // var setFBSideOut = [0, 0, 0, 0, 0, 0];
    // var setFBOppServeErrorSideOut = [0, 0, 0, 0, 0, 0];
    // var setFBKillSideOut = [0, 0, 0, 0, 0, 0];
    // var setOppErrorSideOut = [0, 0, 0, 0, 0, 0, 0];

    var isHome = m.teamA === tm
    var siMatch = isHome ? m.teamA.statsItems[0] : m.teamB.statsItems[0]

    for (var nd = 0; nd < m.sets.length; nd++) {
        var setAllPasses = [0, 0, 0, 0, 0, 0, 0];
        var setSideOut = [0, 0, 0, 0, 0, 0, 0];
        var setSideOutKill = [0, 0, 0, 0, 0, 0, 0];
        var setFBSideOut = [0, 0, 0, 0, 0, 0, 0];
        var setFBOppServeErrorSideOut = [0, 0, 0, 0, 0, 0, 0];
        var setFBOppErrorSideOut = [0, 0, 0, 0, 0, 0, 0];
        var setFBKillSideOut = [0, 0, 0, 0, 0, 0, 0];
        var setOppErrorSideOut = [0, 0, 0, 0, 0, 0, 0, 0];
    
        var game = m.sets[nd]
        var siGame = isHome ? game.teamAStatsItems[0] : game.teamBStatsItems[0]
        var nset = game.GameNumber - 1;
        var xselset = nd; //selSet - 10;
        var rallies
        if (appName === 'VBStats')
        {
            rallies = getVBStatsRalliesInGameForTeam(game, tm)
        }
        else
        {
            rallies = getDVRalliesInGameForTeam(game, tm)
        }
        for (var nr = 0; nr < rallies.length; nr++) {
            var mr = rallies[nr]
            var rrow = (appName === 'VBStats') ? mr.row : mr.passrow
            var row = rrow;
            if (row >= 0 && nset >= 0) {
                var sot = mr.sideoutType;
                if (sot > -1) {
                    allpasses++;
                    setAllPasses[row]++;
                    if (xselset == m.sets.length || xselset == mr.setNumber - 1) {
                        rotAllPasses[row]++;
                    }
                    if (sot == kUnsuccessful) {

                    }
                    else if (sot == kFBKills || sot == kFBOppServeErrors || sot == kFBOppErrors) {
                        fbsideouts++;
                        setFBSideOut[row]++;
                        if (sot == kFBKills)
                        {
                            setFBKillSideOut[row]++
                        }
                        if (sot == kFBOppServeErrors)
                        {
                            setFBOppServeErrorSideOut[row]++
                        }
                        if (sot == kFBOppErrors)
                        {
                            setFBOppErrorSideOut[row]++
                        }
                        sideouts++;
                        setSideOut[row]++;
                        if (xselset == m.sets.length || xselset == mr.setNumber - 1) {
                            rotFBSideOut[row]++;
                            rotSideOut[row]++;
                            if (sot == kFBKills)
                            {
                                rotFBKillSideOut[row]++
                            }
                            if (sot == kFBOppServeErrors)
                            {
                                rotFBOppServeErrorSideOut[row]++
                            }
                            if (sot == kFBOppErrors)
                            {
                                rotFBOppErrorSideOut[row]++
                            }
                        }
                    }
                    else {
                        sideouts++;
                        setSideOut[row]++;
                        if (sot == kKills)
                        {
                            setSideOutKill[row]++
                        }
                        if (sot == kOppErrors)
                        {
                            setOppErrorSideOut[row]++
                        }

                        if (xselset == m.sets.length || xselset == mr.setNumber - 1) {
                            rotSideOut[row]++;
                            if (sot == kKills)
                            {
                                rotSideOutKill[row]++
                            }
                            if (sot == kOppErrors)
                            {
                                rotOppErrorSideOut[row]++
                            }
                        }
                    }
                }
            }
        }
        // rot 0 = total
        siGame.SideOutFirstBalls = [0, 0, 0, 0, 0, 0, 0]
        siGame.SideOutFirstBallPercent = [0, 0, 0, 0, 0, 0, 0]
        siGame.SideOutFirstBallKills = [0, 0, 0, 0, 0, 0, 0]
        siGame.SideOutFirstBallKillPercent = [0, 0, 0, 0, 0, 0, 0]
        siGame.SideOutOppErrors = [0, 0, 0, 0, 0, 0, 0]
        siGame.SideOutOppErrorPercent = [0, 0, 0, 0, 0, 0, 0]
        siGame.SideOutFirstBallOppServeError = [0, 0, 0, 0, 0, 0, 0]
        siGame.SideOutFirstBallOppServeErrorPercent = [0, 0, 0, 0, 0, 0, 0]
        siGame.SideOutFirstBallOppErrors = [0, 0, 0, 0, 0, 0, 0]
        siGame.SideOutPercent = [0, 0, 0, 0, 0, 0, 0]
        siGame.SideOutFailsPercent = [0, 0, 0, 0, 0, 0, 0]
        siGame.SideOuts = [0, 0, 0, 0, 0, 0, 0]
        siGame.SideOutKills = [0, 0, 0, 0, 0, 0, 0]
        siGame.SideOutFails = [0, 0, 0, 0, 0, 0, 0]
        for (var nr=1; nr<7; nr++)
        {
            setSideOut[0] += setSideOut[nr];
            setFBSideOut[0] += setFBSideOut[nr];
            setAllPasses[0] += setAllPasses[nr];
            setFBKillSideOut[0] += setFBKillSideOut[nr];
            setFBOppServeErrorSideOut[0] += setFBOppServeErrorSideOut[nr];
            setOppErrorSideOut[0] += setOppErrorSideOut[nr];
            setFBOppErrorSideOut[0] += setFBOppErrorSideOut[nr]
            setSideOutKill[0] += setSideOutKill[nr]

            siGame.SideOuts[nr] = setSideOut[nr]
            siGame.SideOutFails[nr] = setAllPasses[nr] - setSideOut[nr]            
            siGame.SideOutFirstBalls[nr] = setFBSideOut[nr]
            siGame.SideOutFirstBallPercent[nr] = setAllPasses[nr] > 0 ? (setFBSideOut[nr] * 100) / setAllPasses[nr] : 0
            siGame.SideOutPercent[nr] = setAllPasses[nr] > 0 ? (setSideOut[nr] * 100) / setAllPasses[nr] : 0
            siGame.SideOutFailsPercent[nr] = 100 - siGame.SideOutPercent[nr]
            
            siGame.SideOutFirstBallKills[nr] = setFBKillSideOut[nr]
            siGame.SideOutFirstBallKillPercent[nr] = setAllPasses[nr] > 0 ? (setFBKillSideOut[nr] * 100) / setAllPasses[nr] : 0
            siGame.SideOutOppErrors[nr] = setOppErrorSideOut[nr]
            siGame.SideOutOppErrorPercent[nr] = setAllPasses[nr] > 0 ? (setOppErrorSideOut[nr] * 100) / setAllPasses[nr] : 0
            siGame.SideOutFirstBallOppServeError[nr] = setFBOppServeErrorSideOut[nr]
            siGame.SideOutFirstBallOppServeErrorPercent[nr] = setAllPasses[nr] > 0 ? (setFBOppServeErrorSideOut[nr] * 100) / rotAllPasses[nr] : 0
            siGame.SideOutFirstBallOppErrors[nr] = setFBOppErrorSideOut[nr]
            siGame.SideOutKills[nr] = setSideOutKill[nr]
        }    
        siGame.SideOuts[0] = setSideOut[0]
        siGame.SideOutFails[0] = setAllPasses[0] - setSideOut[0]
        siGame.SideOutFirstBalls[0] = setFBSideOut[0]
        siGame.SideOutFirstBallPercent[0] = setAllPasses[0] > 0 ? (setFBSideOut[0] * 100) / setAllPasses[0] : 0
        siGame.SideOutPercent[0] = setAllPasses[0] > 0 ? (setSideOut[0] * 100) / setAllPasses[0] : 0
        siGame.SideOutFailsPercent[0] = setAllPasses[0] > 0 ? 100 - siGame.SideOutPercent[0] : 0
        
        siGame.SideOutFirstBallKills[0] = setFBKillSideOut[0]
        siGame.SideOutFirstBallKillPercent[0] = setAllPasses[0] > 0 ? (setFBKillSideOut[0] * 100) / setAllPasses[0] : 0
        siGame.SideOutOppErrors[0] = setOppErrorSideOut[0]
        siGame.SideOutOppErrorPercent[0] = setAllPasses[0] > 0 ? (setOppErrorSideOut[0] * 100) / setAllPasses[0] : 0
        siGame.SideOutFirstBallOppServeError[0] = setFBOppServeErrorSideOut[0]
        siGame.SideOutFirstBallOppServeErrorPercent[0] = setAllPasses[0] > 0 ? (setFBOppServeErrorSideOut[0] * 100) / setAllPasses[0] : 0
        siGame.SideOutFirstBallOppErrors[0] = setFBOppErrorSideOut[0]
        siGame.SideOutKills[0] = setSideOutKill[0]
}
    // rot 0 = total
    siMatch.SideOutFirstBalls = [0, 0, 0, 0, 0, 0, 0]
    siMatch.SideOutFirstBallPercent = [0, 0, 0, 0, 0, 0, 0]
    siMatch.SideOutPercent = [0, 0, 0, 0, 0, 0, 0]
    siMatch.SideOutFailsPercent = [0, 0, 0, 0, 0, 0, 0]
    siMatch.SideOuts = [0, 0, 0, 0, 0, 0, 0]
    siMatch.SideOutFails = [0, 0, 0, 0, 0, 0, 0]
    siMatch.SideOutFirstBallKills = [0, 0, 0, 0, 0, 0, 0]
    siMatch.SideOutFirstBallKillPercent = [0, 0, 0, 0, 0, 0, 0]
    siMatch.SideOutOppErrors = [0, 0, 0, 0, 0, 0, 0]
    siMatch.SideOutOppErrorPercent = [0, 0, 0, 0, 0, 0, 0]
    siMatch.SideOutFirstBallOppServeError = [0, 0, 0, 0, 0, 0, 0]
    siMatch.SideOutFirstBallOppServeErrorPercent = [0, 0, 0, 0, 0, 0, 0]
    siMatch.SideOutFirstBallOppErrors = [0, 0, 0, 0, 0, 0, 0]
    siMatch.SideOutKills = [0, 0, 0, 0, 0, 0, 0]

    var pc = allpasses != 0 ? (sideouts *100)/allpasses : 0;
    for (var nr=1; nr<7; nr++)
    {
        rotSideOut[0] += rotSideOut[nr];
        rotFBSideOut[0] += rotFBSideOut[nr];
        rotAllPasses[0] += rotAllPasses[nr];
        rotFBKillSideOut[0] += rotFBKillSideOut[nr];
        rotFBOppServeErrorSideOut[0] += rotFBOppServeErrorSideOut[nr];
        rotOppErrorSideOut[0] += rotOppErrorSideOut[nr];
        rotFBOppErrorSideOut[0] += rotFBOppErrorSideOut[nr]
        rotSideOutKill[0] += rotSideOutKill[nr]

        siMatch.SideOuts[nr] = rotSideOut[nr]
        siMatch.SideOutFails[nr] = rotAllPasses[nr] - rotSideOut[nr]
        siMatch.SideOutFirstBalls[nr] = rotFBSideOut[nr]
        siMatch.SideOutFirstBallPercent[nr] = rotAllPasses[nr] > 0 ? (rotFBSideOut[nr] * 100) / rotAllPasses[nr] : 0
        siMatch.SideOutPercent[nr] = rotAllPasses[nr] > 0 ? (rotSideOut[nr] * 100) / rotAllPasses[nr] : 0
        siMatch.SideOutFailsPercent[nr] = rotAllPasses[nr] > 0 ? 100 - siMatch.SideOutPercent[nr] : 0

        siMatch.SideOutFirstBallKills[nr] = rotFBKillSideOut[nr]
        siMatch.SideOutFirstBallKillPercent[nr] = rotAllPasses[nr] > 0 ? (rotFBKillSideOut[nr] * 100) / rotAllPasses[nr] : 0
        siMatch.SideOutOppErrors[nr] = rotOppErrorSideOut[nr]
        siMatch.SideOutOppErrorPercent[nr] = rotAllPasses[nr] > 0 ? (rotOppErrorSideOut[nr] * 100) / rotAllPasses[nr] : 0
        siMatch.SideOutFirstBallOppServeError[nr] = rotFBOppServeErrorSideOut[nr]
        siMatch.SideOutFirstBallOppServeErrorPercent[nr] = rotAllPasses[nr] > 0 ? (rotFBOppServeErrorSideOut[nr] * 100) / rotAllPasses[nr] : 0
        siMatch.SideOutFirstBallOppErrors[nr] = rotFBOppErrorSideOut[nr]
        siMatch.SideOutKills[nr] = rotSideOutKill[nr]
}
    siMatch.SideOuts[0] = rotSideOut[0]
    siMatch.SideOutFails[0] = rotAllPasses[0] - rotSideOut[0]
    siMatch.SideOutFirstBalls[0] = rotFBSideOut[0]
    siMatch.SideOutFirstBallPercent[0] = rotAllPasses[0] > 0 ? (rotFBSideOut[0] * 100) / rotAllPasses[0] : 0
    siMatch.SideOutPercent[0] = rotAllPasses[0] > 0 ? (rotSideOut[0] * 100) / rotAllPasses[0] : 0
    siMatch.SideOutFailsPercent[0] = rotAllPasses[0] > 0 ? 100 - siMatch.SideOutPercent[0] : 0
    siMatch.SideOutFirstBallKills[0] = rotFBKillSideOut[0]
    siMatch.SideOutFirstBallKillPercent[0] = rotAllPasses[0] > 0 ? (rotFBKillSideOut[0] * 100) / rotAllPasses[0] : 0
    siMatch.SideOutOppErrors[0] = rotOppErrorSideOut[0]
    siMatch.SideOutOppErrorPercent[0] = rotAllPasses[0] > 0 ? (rotOppErrorSideOut[0] * 100) / rotAllPasses[0] : 0
    siMatch.SideOutFirstBallOppServeError[0] = rotFBOppServeErrorSideOut[0]
    siMatch.SideOutFirstBallOppServeErrorPercent[0] = rotAllPasses[0] > 0 ? (rotFBOppServeErrorSideOut[0] * 100) / rotAllPasses[0] : 0
    siMatch.SideOutFirstBallOppErrors[0] = rotFBOppErrorSideOut[0]
    siMatch.SideOutKills[0] = rotSideOutKill[0]

    return m
}

function lineupString(pls)
{
    var s = ''
    for (var n=0; n<pls.lenth; n++)
    {
        if (s.length > 0) s += ','
        s += pls[n].Guid
    }
    return s
}

function getLineup(slineup, m)
{
    if (slineup === undefined)
    {
        return []
    }
    var pls = []
    var guids = slineup.split(',')
    for (var ng=0; ng<guids.length; ng++)
    {
        var guid = guids[ng]
        var pl = getPlayerByGuid(guid, m)
        if (pl !== null)
        {
            pls.push(pl)
        }
    }
    return pls
}

export function getDVRalliesInGameForTeam(g, tm) {
    if (g.events === undefined)
    {
        return []
    }

    var match = g.match
    var isHome = match.teamA === tm;
    var hs1 = -1;
    var as1 = -1;
    var hs2 = -1;
    var as2 = -1;
    var teamrow = 0;
    var opprow = 0;
    var r = null;
    var evs = [];
    var a = [];
    var events = g.events;

    // find first row for each team
    for (var ne = 0; ne < events.length; ne++) {
        var e = events[ne]
        if (e.EventType === kSkillServe) {
            if (isPlayerInTeam(e.Player, tm, match)) {
                teamrow = opprow == 0 ? e.Row : e.Row - 1;
                if (teamrow == -1) {
                    teamrow = 6;
                }
            }
            else {
                opprow = teamrow == 0 ? e.Row : e.Row - 1;
                if (opprow == -1) {
                    opprow = 6;
                }
            }
            if (teamrow != 0 && opprow != 0) {
                break;
            }
        }
    }

    for (var en = 0; en < events.length; en++) {
        var e = events[en];
        if (e.EventType === kSubstitution) {
            continue;
        }
        if (isHome) {
            hs1 = e.TeamScore;
            as1 = e.OppositionScore;
        }
        else {
            as1 = e.TeamScore;
            hs1 = e.OppositionScore;
        }

        evs.push(e);

        var ne = null;
        if (en < (events.length - 1)) {
            var xen = en + 1;
            if (xen < events.length) {
                ne = events[xen];
            }
        }
        if (ne != null) {
            if (isHome) {
                hs2 = ne.TeamScore;
                as2 = ne.OppositionScore;
            }
            else {
                as2 = ne.TeamScore;
                hs2 = ne.OppositionScore;
            }
        }
        else {
            if (eventOutcome(e) > 0) {
                hs2 = hs1 + 1;
            }
            else {
                as2 = as2 + 1;
            }
        }

        if (hs1 != hs2 || as1 != as2 || en == (events.length - 1)) {
            r = {};
            r.setNumber = g.GameNumber;
            r.blockEvents = [];
            r.spikeEvents = [];
            r.defenseEvents = [];
            r.oppEvents = [];
            r.homeScore = e.TeamScore;
            r.awayScore = e.OppositionScore;
            r.sideout = false;
            r.sideoutType = -1;
            r.row = e.Row;
            r.events = evs;
            r.eventObjects = [];
            for (var ne = 0; ne < evs.length; ne++) {
                var ev = evs[ne]
                if (r.sideout) {
                    break;
                }
                var eo = {};
                eo.event = ev;
                eo.matchRally = r;
                r.eventObjects.push(eo);

                if (r.startTime == null) {
                    var leadtime = ev.videoLeadTime === 0 || ev.videoLeadTime === undefined ? 2 : ev.videoLeadTime;
                    try {
                        r.startTime = ev.TimeStamp !== null && ev.TimeStamp !== undefined ? new Date(ev.TimeStamp.getTime() - leadtime * 1000) : null;

                    } catch (error) {
                        console.log(error)
                    }
                }
                var lagtime = ev.videoLagTime === 0 || ev.videoLagTime === undefined ? 3 : ev.videoLagTime;
                try {
                    r.endTime = ev.TimeStamp !== null && ev.TimeStamp !== undefined ? new Date(ev.TimeStamp.getTime() + lagtime * 1000) : null;
                } catch (error) {
                    console.log(error)
                }

                var skill = ev.EventType;
                var grade = ev.EventGrade;
                if (isPlayerInTeam(ev.Player, tm, match)) {
                    teamrow = ev.Row;
                    if (skill === kSkillPass) {
                        if (isPlayerInTeam(ev.Player, tm, match)) {
                            // DLog(@"Passer: %@", e.Player.LastName);
                        }
                        r.passrow = ev.Row;
                        r.passing = true;
                        r.passEvent = ev;
                        if (grade == 0) {
                            r.outcome = 0;
                            r.sideoutType = kUnsuccessful;
                        }
                    }
                    else if (skill == kSkillServe) {
                        r.serverow = ev.Row;
                        r.serveEvent = ev;
                        r.passing = false;
                        if (grade == 0) {
                            r.passrow = opprow;
                            r.outcome = 0;
                        }
                        else if (grade == 4) {
                            r.passrow = opprow;
                            r.outcome = 1;
                        }
                    }
                    else if (skill == kSkillSpike) {
                        if (r.passing) {
                            if (grade == 3) {
                                r.outcome = 1;
                                r.sideout = true;
                                r.keyEvent = ev;
                                r.sideoutType = kKills;
                                if (r.spikeEvents.length == 0) {
                                    r.sideoutFirstBall = true;
                                    r.sideoutType = kFBKills;
                                }
                            }
                            else if (grade == 0) {
                                r.outcome = 0;
                                r.sideoutType = kUnsuccessful;
                            }
                        }
                        r.spikeEvents.push(ev);
                    }
                    else if (skill == kSkillBlock) {
                        if (r.passing) {
                            if (grade >= 2) {
                                r.outcome = 1;
                                r.sideout = true;
                                r.keyEvent = ev;
                                r.sideoutType = kKills;
                            }
                            else if (grade == 0) {
                                r.outcome = 0;
                                r.sideoutType = kUnsuccessful;
                            }
                        }
                        r.blockEvents.push(ev);
                    }
                    else if (skill == kSkillSet || skill == kSkillSettersCall) {
                        if (grade == 0) {
                            r.outcome = 0;
                            if (r.passing) {
                                r.sideoutType = kUnsuccessful;
                            }
                        }
                    }
                    else if (skill == kSkillDefense) {
                        if (grade == 0) {
                            r.outcome = 0;
                            if (r.passing) {
                                r.sideoutType = kUnsuccessful;
                            }
                        }
                        r.defenseEvents.push(ev);
                    }
                }
                else    // opposition events
                {
                    opprow = ev.Row;
                    if (skill == kSkillServe) {
                        r.serverow = ev.Row;
                        r.passing = true;
                        if (grade == 0) {
                            r.passrow = teamrow;
                            r.outcome = 1;
                            r.sideout = true;
                            r.keyEvent = ev;
                            r.sideoutFirstBall = true;
                            r.sideoutType = kFBOppServeErrors;
                            r.sideoutOppError = true;
                        }
                        else if (grade == 4) {
                            r.passrow = teamrow;
                            r.outcome = 0;
                            r.sideoutType = kUnsuccessful;
                        }
                    }
                    else if (skill == kSkillPass) {
                        r.passrow = ev.Row;
                        if (grade == 0) {
                            r.outcome = 1;
                            r.sideoutOppError = true;
                        }
                        r.passing = false;
                    }
                    else if (skill == kSkillSet) {
                        if (grade == 0) {
                            r.outcome = 1;
                            r.sideoutOppError = true;
                        }
                    }
                    else if (skill == kSkillBlock) {
                        if (grade == 0 && ev.ErrorType == 0) {
                            r.outcome = 1;
                            if (r.passing) {
                                if (r.sideout == false) {
                                    r.sideout = true;
                                    r.keyEvent = ev;
                                    r.sideoutType = kOppErrors;
                                    r.sideoutOppError = true;
                                }
                            }
                        }
                        else if (grade >= 2) {
                            r.outcome = 0;
                            if (r.passing) {
                                r.sideoutType = kUnsuccessful;
                                r.keyEvent = ev;
                            }
                        }
                    }
                    else if (skill == kSkillSpike) {
                        if (grade == 0) {
                            r.outcome = 1;
                            if (r.passing) {
                                r.sideout = true;
                                r.keyEvent = ev;
                                r.sideoutType = kOppErrors;
                                r.sideoutOppError = true;
                            }
                        }
                        else if (grade == 3) {
                            r.outcome = 0;
                            if (r.passing) {
                                r.sideoutType = kUnsuccessful;
                                r.keyEvent = ev;
                            }
                        }
                    }
                    else {
                        if (grade == 0 && ev.ErrorType != 2) {
                            r.outcome = 1;
                            if (r.passing) {
                                if (r.sideout == false) {
                                    r.sideout = true;
                                    r.keyEvent = ev;
                                    r.sideoutType = kOppErrors;
                                    r.sideoutOppError = true;
                                }
                            }
                            if (r.spikeEvents.length <= 1) {
                                if (r.sideout == false) {
                                    r.sideout = true;
                                    r.keyEvent = ev;
                                    r.sideoutFirstBall = true;
                                    r.sideoutType = kFBOppErrors;
                                    r.sideoutOppError = true;
                                }
                            }
                        }
                    }
                    r.oppEvents.push(ev);
                }
            }
            var starte = evs[0];
            var laste = evs[evs.length - 1];
            r.endEvent = laste;
            var lagtime = laste.videoLagTime === 0 || laste.videoLagTime === undefined ? 3 : laste.videoLagTime;
            try {
                r.endTime = new Date(laste.TimeStamp.getTime() + lagtime * 1000);
            } catch (error) {

            }
            var leadtime = laste.videoLeadTime === 0 || laste.videoLeadTime === undefined ? 2 : laste.videoLeadTime;
            try {
                r.startTime = new Date(starte.TimeStamp.getTime() - leadtime * 1000);
            } catch (error) {

            }

            a.push(r);
            evs = [];
        }
    }

    var aa = [];
    for (var nr = 0; nr < a.length; nr++) {
        var mr = a[nr]
        if (mr.passing === true && mr.passEvent !== undefined && isPlayerInTeam(mr.passEvent.Player, tm, match)) {
            aa.push(mr);
        }
        if (mr.sideoutType == kFBOppServeErrors) {
            aa.push(mr);
        }
    }
    return aa;
}

function eventOutcome(e) {
    var et = e.EventType;
    var grade = e.EventGrade;
    var err = e.ErrorType;
    if (et == kOppositionError || et == kOppositionHitError || et == kOppositionServeError) {
        return 1;
    }
    if (et == kOppositionScore || et == kOppositionHitKill || et == kOppositionServeAce) {
        return -1;
    }
    if (grade == 0 && et == kSkillSpike) {
        return -1;
    }
    if (grade == 0 && et <= kSkillFreeball && err == 0) {
        return -1;
    }
    if (grade == 2 && et == kSkillBlock) // block solo
    {
        return 1;
    }
    if (grade == 3 && et == kSkillBlock) // block assist
    {
        return 2;
    }
    if (grade == 3 && et != kSkillPass) {
        return 1;
    }

    return 0;
}

function findSetter(pls)
{
    for (var n=0; n<pls.length; n++)
    {
        var pl = pls[n]
        if (pl.PositionString !== undefined && pl.PositionString.includes('Setter'))
        {
            return pl;
        }
    }
    return null;
}


export function getVBStatsRalliesInGameForTeam(g, tm)
{
    if (g.events === undefined)
    {
        return []
    }
    var hs1 = -1;
    var as1 = -1;
    var hs2 = -1;
    var as2 = -1;
    var r = null;
    var evs = [];
    var a = [];
    var events = g.events
    
    var row;
    var opprow;
    
    // find first row for each team
    for (var ne = 0; ne < events.length; ne++) {
        var e = events[ne]
        if (e.EventType === kSkillServe) {
            if (isPlayerInTeam(e.Player, tm, g.match)) {
                row = opprow == 0 ? e.Row : e.Row - 1;
                if (row == -1) {
                    row = 6;
                }
            }
            else {
                opprow = row == 0 ? e.Row : e.Row - 1;
                if (opprow == -1) {
                    opprow = 6;
                }
            }
            if (row != 0 && opprow != 0) {
                break;
            }
        }
    }
    
    var currentSetter = getPlayerByGuid(g.PrimarySetterGuid, g.match);
    var currentOppositionSetter = getPlayerByGuid(g.oppPrimarySetterGuid, g.match);

    if (tm === g.match.teamB && currentOppositionSetter === null)
    {
        return []
    }
    
    var players = getLineup(g.StartingLineup, g.match);
    var oppplayers = getLineup(g.oppStartingLineup, g.match);
    
    for (var en = 0; en < events.length; en++)
    {
        var e = events[en];
        hs1 = e.TeamScore;
        as1 = e.OppositionScore;
        
        if (e.EventType == kSubstitution)
        {
            var pl = getPlayerByGuid(e.UserDefined01, g.match);
            if (pl != null)
            {
                var idx = players.indexOf(e.Player);
                if (idx !== -1)
                {
                    players = replaceItemInArray(players, e.Player, pl)
                }
                else
                {
                    var idx = oppplayers.indexOf(e.Player);
                    if (idx !== -1)
                    {
                        oppplayers = replaceItemInArray(oppplayers, e.Player, pl)
                    }
                }
                if (e.Player == currentSetter)
                {
                    if (pl.PositionString !== undefined && pl.PositionString.includes('Setter'))
                    {
                        currentSetter = pl;
                    }
                    else
                    {
                        currentSetter = findSetter(players);
                        if (currentSetter != null)
                        {
                            var rowOnPos =  [1, 6, 5, 4, 3, 2];
                            var idx = players.indexOf(currentSetter);
                            if (idx != -1 && idx < 6)
                            {
                                row = rowOnPos[idx];
                            }
                        }
                    }
                }
                else if (e.Player == currentOppositionSetter)
                {
                    if (pl.PositionString !== undefined && pl.PositionString.includes('Setter'))
                    {
                        currentOppositionSetter = pl;
                    }
                    else
                    {
                        currentOppositionSetter = findSetter(oppplayers);
                        if (currentOppositionSetter != null)
                        {
                            var rowOnPos =  [1, 6, 5, 4, 3, 2];
                            var idx = oppplayers.indexOf(currentOppositionSetter);
                            if (idx != -1 && idx < 6)
                            {
                                opprow = rowOnPos[idx];
                            }
                        }
                    }
                }
                else if (g.match.teamA.players.filter(obj => obj.Guid === e.Player.Guid).length > 0)
                {
                    if (currentSetter == null && pl.PositionString !== undefined && pl.PositionString.includes('Setter'))
                    {
                        currentSetter = pl;
                        var rowOnPos =  [1, 6, 5, 4, 3, 2];
                        var idx = players.indexOf(currentSetter);
                        if (idx != -1 && idx < 6)
                        {
                            row = rowOnPos[idx];
                        }
                    }
                }
                else if (g.match.teamB.players.filter(obj => obj.Guid === e.Player.Guid).length > 0)
                {
                    if (currentOppositionSetter == null && pl.PositionString !== undefined && pl.PositionString.includes('Setter'))
                    {
                        currentOppositionSetter = pl;
                        var rowOnPos =  [1, 6, 5, 4, 3, 2];
                        var idx = oppplayers.indexOf(currentSetter);
                        if (idx != -1 && idx < 6)
                        {
                            opprow = rowOnPos[idx];
                        }
                    }
                }
            }
        }
        evs.push(e);
        
        var ne = en < (events.length - 1) ? events[en + 1] : null;
        if (ne != null)
        {
            hs2 = ne.TeamScore;
            as2 = ne.OppositionScore;
        }
        else
        {
            if (e.outcome > 0)
            {
                hs2 = hs1 + 1;
            }
            else
            {
                as2 = as2 + 1;
            }
        }
        
        if (hs1 != hs2 || as1 != as2)
        {
            r = {};
            r.setNumber = g.GameNumber;
            r.blockEvents = [];
            r.spikeEvents = [];
            r.defenseEvents = [];
            r.oppEvents = [];
            r.homeScore = e.TeamScore;
            r.awayScore = e.OppositionScore;
            r.lineup = lineupString(players);
            r.opplineup = lineupString(oppplayers);
            r.sideout = false;
            r.sideoutType = -1;
            
            for (var xen = en + 1; xen < events.length; xen++)
            {
                var xe = events[xen];
                if (xe.TeamScore == hs1 && xe.OppositionScore == as1)
                {
                    evs.push(xe);
                }
                else
                {
                    en = xen - 1;
                    break;
                }
            }
            
            r.events = evs;
            for (var ne=0; ne<evs.length; ne++)
            {
                var ev = evs[ne]
                var isHomeEvent = e.Player && g.match.teamA.players.filter(obj => obj.Guid === e.Player.Guid).length > 0
                var isAwayEvent = e.Player && g.match.teamB.players.filter(obj => obj.Guid === e.Player.Guid).length > 0
                
                var skill = ev.EventType;
                var grade = ev.EventGrade;
                if (skill == kSkillServe)
                {
                    r.serveEvent = ev;
                }
                else if (skill == kSkillSpike)
                {
                    r.spikeEvents.push(ev);
                }
                else if (skill == kSkillBlock)
                {
                    r.blockEvents.push(ev);
                }
                
                if (skill == kSkillSet)
                {
                    if (grade != 0)
                    {
                        continue;
                    }
                }
                if (skill == kSkillPass && isHomeEvent)
                {
                    r.passing = true;
                    r.passEvent = ev;
                    if (grade == 0)
                    {
                        r.outcome = 0;
                        r.sideoutType = kUnsuccessful;
                    }
                }
                else if (skill == kSkillServe && isHomeEvent)
                {
                    r.serveEvent = ev;
                    r.passing = false;
                    if (grade == 0)
                    {
                        r.outcome = 0;
                    }
                    else if (grade == 3)
                    {
                        r.outcome = 1;
                    }
                }
                else if (skill == kSkillSpike && isHomeEvent)
                {
                    if (r.passing)
                    {
                        if (grade == 3)
                        {
                            r.outcome = 1;
                            r.sideout = true;
                            r.sideoutType = kKills;
                            if (r.spikeEvents.length == 1)
                            {
                                r.sideoutFirstBall = true;
                                r.sideoutType = kFBKills;
                            }
                        }
                        else if (grade == 0)
                        {
                            r.outcome = 0;
                            r.sideoutType = kUnsuccessful;
                        }
                    }
                    else
                    {
                        if (grade == 3)
                        {
                            r.outcome = 1;
                        }
                        else if (grade == 0)
                        {
                            r.outcome = 0;
                        }
                    }
                }
                else if (skill == kSkillBlock && isHomeEvent)
                {
                    if (r.passing)
                    {
                        if (grade >= 2)
                        {
                            r.outcome = 1;
                            r.sideout = true;
                            r.sideoutType = kKills;
                        }
                        else if (grade == 0)
                        {
                            r.outcome = 0;
                            r.sideoutType = kUnsuccessful;
                        }
                    }
                    else
                    {
                        if (grade >= 2)
                        {
                            r.outcome = 1;
                        }
                        else if (grade == 0)
                        {
                            r.outcome = 0;
                        }
                    }
                }
                else if (skill == kSkillSet && isHomeEvent)
                {
                    if (grade == 0)
                    {
                        r.outcome = 0;
                        if (r.passing)
                        {
                            r.sideoutType = kUnsuccessful;
                        }
                    }
                }
                else if (skill == kSkillDefense && isHomeEvent)
                {
                    if (grade == 0)
                    {
                        r.outcome = 0;
                        if (r.passing)
                        {
                            r.sideoutType = kUnsuccessful;
                        }
                    }
                    r.defenseEvents.push(ev);
                }
                else if (skill == kOppositionServeAce || (skill == kSkillServe && isAwayEvent && grade == 3))
                {
                    r.passing = true;
                    r.outcome = 0;
                    r.sideoutType = kUnsuccessful;
                }
                else if (skill == kOppositionServeError || (skill == kSkillServe && isAwayEvent && grade == 0))
                {
                    r.passing = true;
                    r.outcome = 1;
                    r.sideout = true;
                    r.sideoutFirstBall = true;
                    r.sideoutType = kFBOppServeErrors;
                }
                else if (skill == kOppositionHitKill || (skill == kSkillSpike && isAwayEvent && grade == 3))
                {
                    r.outcome = 0;
                    if (r.passing)
                    {
                        r.sideoutType = kUnsuccessful;
                    }
                }
                else if (skill == kOppositionHitError || (skill == kSkillSpike && isAwayEvent && grade == 0))
                {
                    r.outcome = 1;
                    if (r.passing)
                    {
                        r.sideout = true;
                        r.sideoutType = kOppErrors;
                        if (r.spikeEvents.length <= 1)
                        {
                            r.sideoutFirstBall = true;
                            r.sideoutType = kFBOppErrors;
                        }
                    }
                }
                else if (skill == kOppositionError || (isAwayEvent && grade == 0))
                {
                    r.outcome = 1;
                    if (r.passing)
                    {
                        r.sideout = true;
                        r.sideoutType = kOppErrors;
                    }
                    if (r.spikeEvents.length <= 1)
                    {
                        r.sideoutFirstBall = true;
                        r.sideoutType = kFBOppErrors;
                    }
                }
                else if (skill == kOppositionScore || (isAwayEvent && grade == 3))
                {
                    r.outcome = 0;
                    if (r.passing)
                    {
                        r.sideoutType = kUnsuccessful;
                    }
                }
            }
            if (r.outcome == 0)
            {
                r.opprow = opprow;
                r.row = row;
                if (r.passing == false)
                {
                    opprow++;
                    if (opprow > 6)
                    {
                        opprow = 1;
                    }
                    if (oppplayers.length > 0)
                    {
                        oppplayers = rotateLineup(oppplayers);
                        r.opplineup = lineupString(oppplayers);
                    }
                }
//                opprow = [e.Row intValue];
            }
            else if (r.outcome == 1)
            {
                r.row = row;
                r.opprow = opprow;
                if (r.passing)
                {
                    row++;
                    if (row > 6)
                    {
                        row = 1;
                    }
                    players = rotateLineup(players);
                    r.lineup = lineupString(players);
                }
//                row = [e.Row intValue];
            }
            for (var ne=0; ne<r.events.length; ne++)
            {
                var e = r.events[ne]
                if (e.Player && g.match.teamA.players.filter(obj => obj.Guid === e.Player.Guid).length > 0)
                {
                    e.Row = r.row;
                }
                else if (e.Player && g.match.teamB.players.filter(obj => obj.Guid === e.Player.Guid).length > 0)
                {
                    e.Row = r.opprow;
                }
            }
//            r.row = [e.Row intValue];
            
            a.push(r);
            evs = [];
        }
    }

    // console.log('Game Number ', g.GameNumber)
    // for (var nr=0; nr<a.length; nr++)
    // {
    //     var r = a[nr]
    //     console.log(r.homeScore, r.awayScore, r.passing, r.sideoutType, r.passEvent)
    // }
    
    return a;

}

function rotateLineup(pls)
{
    if (pls.length < 6)
    {
        return null;
    }
    var pl1 = pls[0];
    var pl2 = pls[1];
    var pl3 = pls[2];
    var pl4 = pls[3];
    var pl5 = pls[4];
    var pl6 = pls[5];
    
    return [pl2, pl3, pl4, pl5, pl6, pl1];
}

