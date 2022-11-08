import { useState, useEffect } from 'react'
import { zoneFromString } from '../utils/Utils'
import AllFiltersPanel from './AllFiltersPanel'
import HittingChart from './HittingChart';
import AttackZoneChart from './AttackZoneChart';
import { allFilters } from "./AllFilters";

const kSkillSpike = 4

function HittingChartReport({ match, selectedGame, selectedTeam }) {
    const [drawMode, setDrawMode] = useState(0)
    const [events, setEvents] = useState(null)
    const [allOptions, setAllOptions] = useState(allFilters)
    const [, forceUpdate] = useState(0);

    const doUpdate = () => {
        forceUpdate(n => !n)
        setDrawMode(checkFilter('Display', 'Cone') ? 1 : 0)
        var xevents = calculateZones()
    }

    const getAttackComboOfEvent = (code) => {
        var acs = match.attackCombos.filter(ac => { return ac.code === code })
        if (acs.length > 0) {
            return acs[0]
        }
        return null
    }

    const checkFilter = (filtername, objectname) =>
    {
        for (var n = 0; n < allOptions.length; n++) {
            var option = allOptions[n]
            if (option.title === filtername) {
                if (option.items === undefined)
                {
                    return true
                }
                for (var ni=0; ni<option.items.length; ni++)
                {
                    if (option.items[ni].name === objectname)
                    {
                        return option.items[ni].selected
                    }
                }
            }
        }
        return false
    }

    const calculateZones = () => {
        var xevents = [
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
            var nacs = match.attackCombos.length;
            var ac = getAttackComboOfEvent(e.attackCombo)
            if (ac === null || ac.code === undefined)
            {
                continue
            }
            if (checkFilter("Attack Combos", ac.code) === false) {
                continue
            }
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
                if (startZone > 0) {
                    xevents[row][startZone - 1].push(e);
                }
                else {
                    // DLog(@"%@ %@", e.attackCombo, e.Player.LastName);
                }
            }
            else {
                // DLog(@"%@ %@", e.attackCombo, e.Player.LastName);
            }
        }
        setEvents(xevents)
        return xevents
    }

    const setSpikerNames = (xevents) => {
        if (match === null) {
            return
        }
        for (var n = 0; n < allOptions.length; n++) {
            var option = allOptions[n]
            if (option.title === "Attackers") {
                option.items = []
                for (var ne = 0; ne < xevents.length; ne++) {
                    var evs = xevents[ne]
                    for (var nx = 0; nx < evs.length; nx++) {
                        var evx = evs[nx]
                        for (var nz = 0; nz < evx.length; nz++) {
                            var pl = evx[nz].Player
                            if (option.items.filter(obj => obj.name == pl.NickName).length === 0) {
                                option.items.push({ name: pl.NickName, selected: true, amount: 0 })
                            }
                        }
                    }
                }
            }
        }
    }

    const setSetterNames = (xevents) => {
        if (match === null) {
            return
        }
        for (var n = 0; n < allOptions.length; n++) {
            var option = allOptions[n]
            if (option.title === "Setters") {
                var setters = []
                for (var ne = 0; ne < xevents.length; ne++) {
                    var evs = xevents[ne]
                    for (var nx = 0; nx < evs.length; nx++) {
                        var evx = evs[nx]
                        for (var nz = 0; nz < evx.length; nz++) {
                            var sn = evx[nz].setter
                            if (setters.filter(obj => obj == sn).length === 0) {
                                setters.push(sn)
                            }
                        }

                    }
                }
                option.items = []
                for (var nn = 0; nn < setters.length; nn++) {
                    var pls = selectedTeam === 0 ? match.teamA.players : match.teamB.players
                    for (var np = 0; np < pls.length; np++) {
                        var pl = pls[np]
                        if (pl.shirtNumber === setters[nn]) {
                            option.items.push({ name: pl.NickName, selected: true, amount: 0 })
                            break
                        }
                    }
                }
            }
        }
    }

    const setAttackCombos = (xevents) => {
        if (match === null) {
            return
        }
        for (var n = 0; n < allOptions.length; n++) {
            var option = allOptions[n]
            if (option.title === "Attack Combos") {
                option.items = []
                for (var ne = 0; ne < xevents.length; ne++) {
                    var evs = xevents[ne]
                    for (var nx = 0; nx < evs.length; nx++) {
                        var evx = evs[nx]
                        for (var nz = 0; nz < evx.length; nz++) {
                            var ac = evx[nz].attackCombo
                            if (option.items.filter(obj => obj.name == ac).length === 0) {
                                option.items.push({ name: ac, selected: true, amount: 0 })
                            }
                        }
                    }
                }
            }
        }
    }

    const selectedRows = () =>
    {
        var rows = []
        for (var n = 0; n < allOptions.length; n++) {
            var option = allOptions[n]
            if (option.title === "Rotations") {
                for (var ni=0; ni<option.items.length; ni++)
                {
                    if (option.items[ni].selected)
                    {
                        rows.push(option.items[ni].name)
                    }
                }
            }
        }
        return rows
    }

    useEffect(() => {
        var xevents = calculateZones()
        setSpikerNames(xevents)
        setSetterNames(xevents)
        setAttackCombos(xevents)
        forceUpdate(n => !n)
    }, [selectedGame])

    if (events === null) {
        return <></>
    }

    return (
        <div>
            <div className="drawer drawer-mobile">
                <input id="my-drawer-5" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    <div className="w-100 h-full">
                        <HittingChart match={match} events={events} rows={selectedRows()} drawMode={drawMode} />
                    </div>
                </div>
                <div className="drawer-side w-80">
                    <label htmlFor="my-drawer-5" className="drawer-overlay"></label>
                    <div className="h-full bg-base-200">
                        <AllFiltersPanel
                            allOptions={allOptions}
                            match={match}
                            events={events}
                            selectedTeam={selectedTeam}
                            handleFilterOptionChanged={() => doUpdate()}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HittingChartReport