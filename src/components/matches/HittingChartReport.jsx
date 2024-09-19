import { useState, useEffect } from "react";
import { makePlaylist, zoneFromString } from "../utils/Utils";
import AllFiltersPanel from "./AllFiltersPanel";
import HittingChart from "./HittingChart";
import AttackZoneChart from "./AttackZoneChart";
import { allFilters } from "./AllFilters";
import { kSkillSpike, kSkillSet, kSkillSettersCall } from "../utils/StatsItem";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { ArrowPathIcon, VideoCameraIcon } from "@heroicons/react/24/outline";

function HittingChartReport({ matches, team, selectedGame, selectedTeam }) {
  const navigate = useNavigate();
  const { currentUser } = useAuthStatus();
  const [drawMode, setDrawMode] = useState(0);
  const [currentTeam, setCurrentTeam] = useState(-1);
  const [allEvents, setAllEvents] = useState(null);
  const [events, setEvents] = useState(null);
  const [allOptions, setAllOptions] = useState(allFilters);
  const [init, setInit] = useState(false);
  const [appName, setAppName] = useState("");
  const [, forceUpdate] = useState(0);

  const doEventsSelected = (evs) => {
    const sortedevs = evs.sort(
      (a, b) => a.TimeStamp.getTime() - b.TimeStamp.getTime()
    );
    const playlist = makePlaylist(sortedevs);
    doPlaylist(playlist);
  };

  const doDoReset = () => {
    for (var n = 0; n < allOptions.length; n++) {
      var option = allOptions[n];
      if (option.title !== "Display") {
        if (option.items) {
          for (var ni = 0; ni < option.items.length; ni++) {
            option.items[ni].selected = true;
          }
        }
      }
    }
    const opts = { allOptions: allOptions, dates: matchdates() };
    localStorage.setItem("VBLiveHittingChartsOptions", JSON.stringify(opts));
  };

  const doReset = () => {
    doDoReset();
    calculateZones();
  };

  const doVideo = () => {
    const selrows = selectedRows();
    var evs = [];
    for (var row = 0; row < 6; row++) {
      if (selrows.includes((row + 1).toString())) {
        for (var z = 0; z < 9; z++) {
          evs = evs.concat(events[row][z]);
        }
      }
    }
    const sortedevs = evs.sort(
      (a, b) => a.TimeStamp.getTime() - b.TimeStamp.getTime()
    );
    const playlist = makePlaylist(sortedevs);
    doPlaylist(playlist);
  };

  const doPlaylist = (playlist) => {
    if (playlist.length === 0) {
      toast.error("No events in selected zone.");
    } else {
      const evstr = JSON.stringify(playlist);
      localStorage.setItem("VBLivePlaylistEvents", evstr);
      const pl = {
        events: playlist,
      };
      const fn = null;
      const buffer = JSON.stringify(pl);
      const st = {
        playlistFileData: buffer,
        filename: null,
        playlists: null,
        serverName: currentUser.email,
      };
      navigate("/playlist", { state: st });
    }
  };

  const doUpdate = () => {
    const opts = { allOptions: allOptions, dates: matchdates() };
    localStorage.setItem("VBLiveHittingChartsOptions", JSON.stringify(opts));
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

  const doInit = () => {
    if (matches[0].app === "DataVolley") {
      setAppName("DataVolley");
    } else {
      setAppName("VBStats");
    }

    const opts = localStorage.getItem("VBLiveHittingChartsOptions");
    if (opts) {
      const options = JSON.parse(opts);
      if (options.dates === matchdates()) {
        for (var n = 0; n < allOptions.length; n++) {
          var option = allOptions[n];
          if (option.items) {
            for (var ni = 0; ni < option.items.length; ni++) {
              try {
                if (option.items[ni] && options.allOptions[n].items) {
                  option.items[ni].selected =
                    options.allOptions[n].items[ni].selected;
                }
              } catch (error) {
                console.log(error);
              }
            }
          }
        }
        setDrawMode(checkFilter("Display", "Cone") ? 1 : 0);
        return;
      }
    }
    doDoReset();
    var evs = [];
    for (var match of matches) {
      var tm = null;
      if (matches.length === 1) {
        tm = selectedTeam === 0 ? match.teamA : match.teamB;
      } else {
        tm =
          selectedTeam === 0
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
    }
    setAllEvents(evs);
    setSpikerNames(evs);
    if (matches[0].app === "DataVolley") {
      setSetterNames(evs);
      setAttackCombos(evs);
    }
    setInit(true);
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
        tm =
          selectedTeam === 0
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
      /*
      if (currentTeam !== selectedTeam) {
        setAllEvents(evs);
        setSpikerNames(evs);
        if (match.app !== "VBStats") {
          setSetterNames(evs);
          setAttackCombos(evs);
        }
        setCurrentTeam(selectedTeam);
      }
*/
      const egs = ["Errors", "In-play", "In-play", "Kill"];
      const srcs = { F: "Front", B: "Back", C: "Centre" };

      if (match.app === "VBStats") {
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
          if (checkFilter("Results", egs[e.EventGrade]) === false) {
            continue;
          }
          var startZone = zoneFromString(e.BallStartString);
          if (
            startZone > 0 &&
            e.Row !== undefined &&
            isNaN(e.Row) === false &&
            e.Row > 0
          ) {
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

  const matchdates = () => {
    var dates = "";
    for (var xm of matches) {
      dates += xm.sessionDateString
        ? xm.sessionDateString
        : xm.TrainingDate.toLocaleString();
    }
    return dates;
  };

  useEffect(() => {
    doInit();
    var xevents = calculateZones();
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
          <div className="w-100 h-full cursor-pointer">
            <HittingChart
              matches={matches}
              events={events}
              rows={selectedRows()}
              drawMode={drawMode}
              onEventsSelected={(evs) => doEventsSelected(evs)}
            />
          </div>
        </div>
        <div className="drawer-side w-80">
          <label htmlFor="my-drawer-5" className="drawer-overlay"></label>
          <div className="flex-col">
            <div className="flex justify-between bg-base-100 p-1">
              <div
                className="tooltip tooltip-right"
                data-tip="Reset all filters"
              >
                <ArrowPathIcon
                  className="btn btn-xs h-8 w-12 btn-info rounded-none cursor-pointer"
                  onClick={() => doReset()}
                />
              </div>
              <div
                className="tooltip tooltip-left"
                data-tip="Show video clips of filtered attacks"
                style={{ whiteSpace: "pre-line" }}
              >
                <VideoCameraIcon
                  className="btn btn-xs h-8 w-12 btn-info rounded-none cursor-pointer"
                  onClick={() => doVideo()}
                />
              </div>
            </div>
            <div className="h-full bg-base-200">
              <AllFiltersPanel
                allOptions={allOptions}
                match={matches[0]}
                events={events}
                selectedTeam={selectedTeam}
                handleFilterOptionChanged={() => doUpdate()}
                appName={appName}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HittingChartReport;
