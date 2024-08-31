import { useState, useEffect } from "react";
import { zoneFromString } from "../utils/Utils";
import AllFiltersPanel from "./AllFiltersPanel";
import HittingChart from "./HittingChart";
import AttackZoneChart from "./AttackZoneChart";
import { allFilters } from "./AllFilters";
import { kSkillSpike, kSkillSet, kSkillSettersCall } from "../utils/StatsItem";

function HittingChartReport({ matches, team, selectedGame, selectedTeam }) {
  const [drawMode, setDrawMode] = useState(0);
  const [currentTeam, setCurrentTeam] = useState(-1);
  const [allEvents, setAllEvents] = useState(null);
  const [events, setEvents] = useState(null);
  const [allOptions, setAllOptions] = useState(allFilters);
  const [init, setInit] = useState(false);
  const [, forceUpdate] = useState(0);

  const doUpdate = () => {
    forceUpdate((n) => !n);
    setDrawMode(checkFilter("Display", "Cone") ? 1 : 0);
    var xevents = calculateZones();
  };

  const getAttackComboOfEvent = (code) => {
    for (var match of matches) {
      var acs = match.attackCombos.filter((ac) => {
        return ac.code === code;
      });
      if (acs.length > 0) {
        return acs[0];
      }
    }
    return null;
  };

  const checkFilter = (filtername, objectname) => {
    for (var n = 0; n < allOptions.length; n++) {
      var option = allOptions[n];
      if (option.title === filtername) {
        if (option.items === undefined) {
          return true;
        }
        for (var ni = 0; ni < option.items.length; ni++) {
          if (
            option.items[ni].name === objectname ||
            option.items[ni].number === objectname
          ) {
            return option.items[ni].selected;
          }
        }
      }
    }
    return false;
  };

  const calculateZones = () => {
    var xevents = [
      [[], [], [], [], [], [], [], [], []],
      [[], [], [], [], [], [], [], [], []],
      [[], [], [], [], [], [], [], [], []],
      [[], [], [], [], [], [], [], [], []],
      [[], [], [], [], [], [], [], [], []],
      [[], [], [], [], [], [], [], [], []],
    ];

    for (var match of matches) {
      var tm = null;
      if (matches.length === 1) {
        tm = selectedTeam === 0 ? match.teamA : match.teamB;
      } else {
        tm = selectedTeam === 0
          ? team === match.teamA.Name
            ? match.teamA
            : match.teamB
          : team === match.teamA.Name
          ? match.teamB
          : match.teamA;
      }
      var xevs =
        selectedGame === 0 ? match.events : match.sets[selectedGame - 1].events;
      var setter = null;
      var evs = [];
      for (var ne = 0; ne < xevs.length; ne++) {
        var e = xevs[ne];
        if (
          e.Player !== null &&
          tm.players.filter((obj) => obj.Guid === e.Player.Guid).length > 0
        ) {
          if (e.EventType == kSkillSpike) {
            evs.push(e);
          }
        }
      }

      if (currentTeam !== selectedTeam) {
        setAllEvents(evs);
        setSpikerNames(evs);
        if (match.app !== "VBStats") {
          setSetterNames(evs);
          setAttackCombos(evs);
        }
        setCurrentTeam(selectedTeam);
      }

      const egs = ["Errors", "In-play", "In-play", "Kill"];
      const srcs = { F: "Front", B: "Back", C: "Centre" };

      if (match.app === "VBStats") {
        for (var ne = 0; ne < evs.length; ne++) {
          var e = evs[ne];
          var startZone = zoneFromString(e.BallStartString);
          if (startZone > 0 && e.Row !== undefined && isNaN(e.Row) === false) {
            xevents[e.Row - 1][startZone - 1].push(e);
          }
        }
      } else {
        for (var ne = 0; ne < evs.length; ne++) {
          var e = evs[ne];
          if (
            checkFilter("Stages", e.isSideOut ? "Side Out" : "Transition") ===
            false
          ) {
            continue;
          }
          if (checkFilter("Attackers", e.Player.LastName) === false) {
            continue;
          }
          if (e.setter !== null && checkFilter("Setters", e.setter) === false) {
            continue;
          }
          if (checkFilter("Results", egs[e.EventGrade]) === false) {
            continue;
          }

          var nacs = match.attackCombos.length;
          var ac =
            e.attackCombo === "~~"
              ? { code: "~~" }
              : getAttackComboOfEvent(e.attackCombo);
          if (ac === null || ac.code === undefined) {
            continue;
          }
          if (checkFilter("Attack Combos", ac.code) === false) {
            continue;
          }
          if (checkFilter("Source", srcs[ac.targetHitter]) === false) {
            continue;
          }
          if (
            (nacs > 0 && ac != null && ac.targetHitter !== "-") ||
            nacs == 0
          ) {
            var row = e.Row - 1;
            var startZone = 0;
            if (nacs > 0) {
              if (ac.startZone !== undefined) {
                startZone = Number.parseInt(ac.startZone);
              } else {
                if (ac.isBackcourt) {
                  if (ac.targetHitter === "B") {
                    startZone = 9;
                  } else if (ac.targetHitter === "F") {
                    startZone = 7;
                  } else {
                    startZone = 8;
                  }
                } else {
                  if (ac.targetHitter === "B") {
                    startZone = 2;
                  } else if (ac.targetHitter === "F") {
                    startZone = 4;
                  } else {
                    startZone = 3;
                  }
                }
              }
            } else {
              startZone = zoneFromString(e.BallStartString);
            }
            if (startZone > 0) {
              xevents[row][startZone - 1].push(e);
            } else {
              // DLog(@"%@ %@", e.attackCombo, e.Player.LastName);
            }
          } else {
            // DLog(@"%@ %@", e.attackCombo, e.Player.LastName);
          }
        }
      }
    }
    setEvents(xevents);
    return xevents;
  };

  const setSpikerNames = (xevents) => {
    if (matches === null) {
      return;
    }
    for (var match of matches) {
      var tm =
        selectedTeam === 0
          ? team === match.teamA.Name
            ? match.teamA
            : match.teamB
          : team === match.teamA.Name
          ? match.teamB
          : match.teamA;
      for (var n = 0; n < allOptions.length; n++) {
        var option = allOptions[n];
        if (option.title === "Attackers") {
          option.items = [];
          for (var ne = 0; ne < xevents.length; ne++) {
            var evx = xevents[ne];
            var pl = evx.Player;
            if (
              option.items.filter((obj) => obj.name == pl.NickName).length === 0
            ) {
              option.items.push({
                name: pl.NickName,
                selected: true,
                amount: 0,
              });
            }
          }
        }
      }
    }
  };

  const setSetterNames = (xevents) => {
    if (matches === null) {
      return;
    }
    for (var match of matches) {
      for (var n = 0; n < allOptions.length; n++) {
        var option = allOptions[n];
        if (option.title === "Setters") {
          var setters = [];
          for (var ne = 0; ne < xevents.length; ne++) {
            var evx = xevents[ne];
            var sn = evx.setter;
            if (setters.filter((obj) => obj == sn).length === 0) {
              setters.push(sn);
            }
          }
          option.items = [];
          for (var nn = 0; nn < setters.length; nn++) {
            var tm =
            selectedTeam === 0
              ? team === match.teamA.Name
                ? match.teamA
                : match.teamB
              : team === match.teamA.Name
              ? match.teamB
              : match.teamA;
            var pls = tm.players;
            for (var np = 0; np < pls.length; np++) {
              var pl = pls[np];
              if (pl.shirtNumber === setters[nn]) {
                option.items.push({
                  name: pl.NickName,
                  number: pl.shirtNumber,
                  selected: true,
                  amount: 0,
                });
                break;
              }
            }
          }
        }
      }
    }
  };

  const setAttackCombos = (xevents) => {
    if (matches === null) {
      return;
    }
    for (var n = 0; n < allOptions.length; n++) {
      var option = allOptions[n];
      if (option.title === "Attack Combos") {
        option.items = [];
        for (var ne = 0; ne < xevents.length; ne++) {
          var evx = xevents[ne];
          var ac = evx.attackCombo;
          if (option.items.filter((obj) => obj.name == ac).length === 0) {
            option.items.push({ name: ac, selected: true, amount: 0 });
          }
        }
      }
    }
  };

  const selectedRows = () => {
    var rows = [];
    for (var n = 0; n < allOptions.length; n++) {
      var option = allOptions[n];
      if (option.title === "Rotations") {
        for (var ni = 0; ni < option.items.length; ni++) {
          if (option.items[ni].selected) {
            rows.push(option.items[ni].name);
          }
        }
      }
    }
    return rows;
  };

  useEffect(() => {
    var xevents = calculateZones();
    // setSpikerNames(allEvents);
    // if (match.app !== "VBStats") {
    //   setSetterNames(allEvents);
    //   setAttackCombos(allEvents);
    // }
    forceUpdate((n) => !n);
  }, [selectedGame, selectedTeam]);

  useEffect(() => {}, [events]);

  if (events === null) {
    return <></>;
  }

  return (
    <div className="flex-col">
      <div className="drawer drawer-mobile">
        <input id="my-drawer-5" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <div className="w-100 h-full">
            <HittingChart
              matches={matches}
              events={events}
              rows={selectedRows()}
              drawMode={drawMode}
            />
          </div>
        </div>
        <div className="drawer-side w-80">
          <label htmlFor="my-drawer-5" className="drawer-overlay"></label>
          <div className="h-full bg-base-200">
            <AllFiltersPanel
              allOptions={allOptions}
              match={matches[0]}
              events={events}
              selectedTeam={selectedTeam}
              handleFilterOptionChanged={() => doUpdate()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HittingChartReport;
