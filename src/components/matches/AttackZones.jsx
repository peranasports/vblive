import { useState, useEffect } from 'react'
import AttackZoneChart from './AttackZoneChart'
import { zoneFromString } from '../utils/Utils'

const kSkillSpike = 4

function AttackZones({ match, selectedGame, selectedTeam }) {
    const [events, setEvents] = useState(null)

    const getAttackComboOfEvent = (code) => {
        if (code == undefined)
        {
            return null
        }
        var acs = match.attackCombos.filter(ac => { return ac.code === code })
        if (acs.length > 0) {
            return acs[0]
        }
        return null
    }

    const calculateZones = () => {
        var events = [
            [[], [], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], [], []],
            [[], [], [], [], [], [], [], [], []],
        ]

        var team = selectedTeam === 0 ? match.teamA : match.teamB
        var xevs = selectedGame === 0 ? match.events : match.sets[selectedGame - 1].events
        var evs = []
        for (var ne = 0; ne < xevs.length; ne++) {
            var e = xevs[ne];
            if (e.Player !== null && team.players.filter(obj => obj.Guid === e.Player.Guid).length > 0) {
                if (e.EventType == kSkillSpike) {
                    evs.push(e)
                }
            }
        }

        for (var ne = 0; ne < evs.length; ne++) {
            var e = evs[ne]
            var nacs = match.attackCombos === undefined ? 0 : match.attackCombos.length;
            var ac = getAttackComboOfEvent(e.attackCombo)
            if ((nacs > 0 && ac != null && ac.targetHitter !== "-") ||
                (nacs == 0)) {
                var row = e.Row - 1;
                var startZone = 0;
                if (nacs > 0) {
                    if (ac.isBackcourt) {
                        if (ac.targetHitter === "B") {
                            startZone = 9;
                        }
                        else if (ac.targetHitter === "F") {
                            startZone = 7;
                        }
                        else {
                            startZone = 8;
                        }
                    }
                    else {
                        if (ac.targetHitter === "B") {
                            startZone = 2;
                        }
                        else if (ac.targetHitter === "F") {
                            startZone = 4;
                        }
                        else {
                            startZone = 3;
                        }
                    }
                }
                else {
                    startZone = zoneFromString(e.BallStartString);
                }
                if (startZone > 0 && e.Row !== undefined && isNaN(e.Row) === false) {
                    events[e.Row - 1][startZone - 1].push(e);
                }
                else {
                    // DLog(@"%@ %@", e.attackCombo, e.Player.LastName);
                }
            }
            else {
                // DLog(@"%@ %@", e.attackCombo, e.Player.LastName);
            }
        }
        setEvents(events)
    }

    useEffect(() => {
        calculateZones()
    }, [selectedGame])

    if (events === null) {
        return <></>
    }

    return (
        <div className=''>
            <p className='text-3xl font-bold'>{selectedTeam === 0 ? match.teamA.Name.toUpperCase() : match.teamB.Name.toUpperCase() }</p>
            <div className="flex h-80 lg:overflow-hidden">
                <div className="w-80 h-80 bg-slate-100">
                    <AttackZoneChart match={match} events={events} row='4' />
                </div>
                <div className="w-80 h-80 bg-slate-100">
                    <AttackZoneChart match={match} events={events} row='5' />
                </div>
                <div className="w-80 h-80 bg-slate-100">
                    <AttackZoneChart match={match} events={events} row='6' />
                </div>
            </div>
            <div className="flex h-80 lg:overflow-hidden">
                <div className="w-80 h-80 bg-slate-100">
                    <AttackZoneChart match={match} events={events} row='3' />
                </div>
                <div className="w-80 h-80 bg-slate-100">
                    <AttackZoneChart match={match} events={events} row='2' />
                </div>
                <div className="w-80 h-80 bg-slate-100">
                    <AttackZoneChart match={match} events={events} row='1' />
                </div>
            </div>
        </div>
    )
}
export default AttackZones