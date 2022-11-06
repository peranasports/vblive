import { useState, useEffect } from 'react'
import { sortBy } from 'lodash'
import { getDVRalliesInGameForTeam } from '../utils/StatsItem';

const kFBKills = 0
const kFBOppServeErrors = 1
const kFBOppErrors = 2
const kKills = 3
const kOppErrors = 4
const kUnsuccessful = 5

function ServeReceive({ match, selectedGame, selectedTeam }) {
    const [passingStats, setPassingStats] = useState(null)

    const calculatePassingStats = () => {
        var tm = selectedTeam === 0 ? match.teamA : match.teamB
        var players = tm.players
        var stats = []
        var matchstats = []
        stats.push(matchstats)
        var mrcount = 0
        for (var nd = 0; nd < match.sets.length; nd++) {
            var setstats = []
            stats.push(setstats)
            var game = match.sets[nd]
            var rallies = getDVRalliesInGameForTeam(game, tm)
            var rcount = 0
            for (var nr = 0; nr < rallies.length; nr++) {
                var mr = rallies[nr]
                var row = mr.passrow;
                if (mr.passEvent === undefined || mr.passEvent.Player === undefined) {
                    continue
                }
                rcount++
                mrcount++
                if (players.filter(obj => obj.Guid === mr.passEvent.Player.Guid).length > 0) {
                    var plstat
                    var ps = setstats.filter(obj => obj.Player.Guid === mr.passEvent.Player.Guid)
                    if (ps.length === 0) {
                        plstat = {}
                        setstats.push(plstat)
                        plstat.events = []
                        plstat.Player = mr.passEvent.Player
                        plstat.playerName = mr.passEvent.Player.shirtNumber + ". " + mr.passEvent.Player.NickName
                        plstat.soFail = 0
                        plstat.soKills = 0
                        plstat.soFBKills = 0
                        plstat.soOppErrors = 0
                        plstat.soFBOppErrors = 0
                        plstat.totalPoints = 0
                        plstat.perfectPass = 0
                        plstat.positivePass = 0
                        plstat.numberOfPasses = 0
                        plstat.passHits = 0
                        plstat.passHitKills = 0
                        plstat.passHitErrors = 0
                    }
                    else {
                        plstat = ps[0]
                    }
                    plstat.events.push(mr.passEvent)
                    plstat.numberOfPasses++
                    if (mr.sideoutType === kUnsuccessful) {
                        plstat.soFail++
                    }
                    else if (mr.sideoutType === kFBKills) {
                        plstat.soFBKills++
                    }
                    else if (mr.sideoutType === kKills) {
                        plstat.soKills++
                    }
                    else if (mr.sideoutType === kOppErrors) {
                        plstat.soOppErrors++
                    }
                    else if (mr.sideoutType === kFBOppErrors) {
                        plstat.soFBOppErrors++
                    }
                    else if (mr.sideoutType === kKills) {
                        plstat.soKills++
                    }
                    plstat.totalPoints += mr.passEvent.passingGrade
                    if (mr.passEvent.DVGrade === '+') {
                        plstat.positivePass++;
                    }
                    else if (mr.passEvent.DVGrade === '+' || mr.passEvent.DVGrade === '#') {
                        plstat.positivePass++;
                        plstat.perfectPass++;
                    }
                    if (mr.events.length > 0) {
                        var passed = false
                        var transition = false
                        for (var ne = 0; ne <mr.events.length; ne++) {
                            var sev = mr.events[ne]
                            if (sev.Player === null || sev.Player === undefined)
                            {
                                continue
                            }
                            if (sev.EventType === mr.passEvent.EventType) {
                                passed = true;
                            }
                            if (passed && players.filter(obj => obj.Guid === sev.Player.Guid).length === 0) {
                                transition = true;
                                break
                            }
                            if (sev.EventType === 4 && sev.Player.Guid === mr.passEvent.Player.Guid) {
                                plstat.passHits++
                                if (sev.EventGrade === 3) {
                                    plstat.passHitKills++
                                }
                                else if (sev.EventGrade === 0) {
                                    plstat.passHitErrors++
                                }
                                break
                            }
                        }
                    }
                }
                for (var npl = 0; npl < setstats.length; npl++) {
                    var plstat = setstats[npl]
                    plstat.frequency = plstat.events.length / rcount
                }
            }
        }
        for (var nd = 0; nd < match.sets.length; nd++) {
            var setstats = stats[nd + 1]
            for (var np = 0; np < setstats.length; np++) {
                var plstat = setstats[np]
                var ps = matchstats.filter(obj => obj.Player.Guid === plstat.Player.Guid)
                var mplstat
                if (ps.length === 0) {
                    mplstat = {}
                    matchstats.push(mplstat)
                    mplstat.events = []
                    mplstat.Player = plstat.Player
                    mplstat.playerName = plstat.Player.shirtNumber + ". " + plstat.Player.NickName
                    mplstat.soFail = 0
                    mplstat.soKills = 0
                    mplstat.soFBKills = 0
                    mplstat.soOppErrors = 0
                    mplstat.soFBOppErrors = 0
                    mplstat.totalPoints = 0
                    mplstat.perfectPass = 0
                    mplstat.positivePass = 0
                    mplstat.numberOfPasses = 0;
                    mplstat.passHits = 0
                    mplstat.passHitKills = 0
                    mplstat.passHitErrors = 0
                }
                else {
                    mplstat = ps[0]
                }
                for (var ne = 0; ne < plstat.events.length; ne++) {
                    mplstat.events.push(plstat.events[ne])
                }
                mplstat.numberOfPasses += plstat.numberOfPasses
                mplstat.soFail += plstat.soFail
                mplstat.soKills += plstat.soKills
                mplstat.soFBKills += plstat.soFBKills
                mplstat.soOppErrors += plstat.soOppErrors
                mplstat.soFBOppErrors += plstat.soFBOppErrors
                mplstat.totalPoints += plstat.totalPoints
                mplstat.perfectPass += plstat.perfectPass
                mplstat.positivePass += plstat.positivePass
                mplstat.passHits += plstat.passHits
                mplstat.passHitKills += plstat.passHitKills
                mplstat.passHitErrors += plstat.passHitErrors

                plstat.passingAverage = plstat.numberOfPasses > 0 ? plstat.totalPoints / plstat.numberOfPasses : 0
                plstat.perfectPassPC = plstat.numberOfPasses > 0 ? (plstat.perfectPass * 100) / plstat.numberOfPasses : 0
                plstat.positivePassPC = plstat.numberOfPasses > 0 ? (plstat.positivePass * 100) / plstat.numberOfPasses : 0
                plstat.sideOuts = plstat.numberOfPasses - plstat.soFail
                plstat.FBSideOuts = plstat.soFBKills + plstat.soFBOppErrors
                plstat.sideOutPC = plstat.numberOfPasses > 0 ? (plstat.sideOuts * 100) / plstat.numberOfPasses : 0
                plstat.FBsideOutPC = plstat.numberOfPasses > 0 ? (plstat.sideOuts * 100) / plstat.numberOfPasses : 0
                plstat.passHitsPC = plstat.numberOfPasses > 0 ? (plstat.passHits * 100) / plstat.numberOfPasses : 0
                plstat.passHitKillsPC = plstat.numberOfPasses > 0 ? (plstat.passHitKills * 100) / plstat.numberOfPasses : 0
                plstat.passHitsErrorPC = plstat.numberOfPasses > 0 ? (plstat.passHitErrors * 100) / plstat.numberOfPasses : 0
            }
        }
        for (var n = 0; n < matchstats.length; n++) {
            var setstats = matchstats[n]
            setstats.passingAverage = setstats.numberOfPasses > 0 ? setstats.totalPoints / setstats.numberOfPasses : 0
            setstats.perfectPassPC = setstats.numberOfPasses > 0 ? (setstats.perfectPass * 100) / setstats.numberOfPasses : 0
            setstats.positivePassPC = setstats.numberOfPasses > 0 ? (setstats.positivePass * 100) / setstats.numberOfPasses : 0
            setstats.sideOuts = setstats.numberOfPasses - setstats.soFail
            setstats.FBSideOuts = setstats.soFBKills + setstats.soFBOppErrors
            setstats.sideOutPC = setstats.numberOfPasses > 0 ? (setstats.sideOuts * 100) / setstats.numberOfPasses : 0
            setstats.FBsideOutPC = setstats.numberOfPasses > 0 ? (setstats.sideOuts * 100) / setstats.numberOfPasses : 0
            setstats.passHitsPC = setstats.numberOfPasses > 0 ? (setstats.passHits * 100) / setstats.numberOfPasses : 0
            setstats.passHitKillsPC = setstats.numberOfPasses > 0 ? (setstats.passHitKills * 100) / setstats.numberOfPasses : 0
            setstats.passHitsErrorPC = setstats.numberOfPasses > 0 ? (setstats.passHitErrors * 100) / setstats.numberOfPasses : 0
            setstats.frequency = setstats.events.length / mrcount
        }
        setPassingStats(stats)
    }

    const currentStats = () => {
        return passingStats[selectedGame]
    }

    useEffect(() => {
        calculatePassingStats()
    }, [selectedGame])

    if (passingStats === null) {
        return <></>
    }

    return (
        <div>
            <div className="shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                Receiver
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                # Passes
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                Passing Average
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                Perfect %
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                Positive %
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                Sideout %
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                FB Sideout %
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                Pass Hits
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                Pass Hit Kills
                            </th>
                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                Pass Hit Errors
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {sortBy(currentStats(), 'sideOutPC').filter(obj => obj.frequency > 0.1).map((statsItem, i) => (
                            <tr key={statsItem.Player.Guid} className={i % 2 === 0 ? undefined : 'bg-gray-100'}>
                                <td className="whitespace-nowrap py-2.5 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                    {statsItem.Player.shirtNumber + ". " + statsItem.Player.NickName}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.numberOfPasses}</td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.passingAverage.toFixed(2)}</td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.perfectPassPC.toFixed(0)}</td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.positivePassPC.toFixed(0)}</td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.sideOutPC.toFixed(0)}</td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.FBsideOutPC.toFixed(0)}</td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.passHits.toFixed(0)}</td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.passHitKills.toFixed(0)}</td>
                                <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.passHitErrors.toFixed(0)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}

export default ServeReceive