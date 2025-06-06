import { useState, useEffect } from "react";
import { initial, sortBy } from "lodash";
import { getDVRalliesInGameForTeam } from "../utils/StatsItem";
import ServeReceive from "./ServeReceive";
// import { CheckIcon, XIcon } from "@heroicons/react/24/outline";
import { CheckIcon, CheckCircleIcon } from "@heroicons/react/20/solid";
import { CheckCircleIcon as CheckCircleIconOutline } from "@heroicons/react/24/outline";
import Select from "react-select";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { psvbParseLatestStats } from "../utils/PSVBFile";
import { useNavigate } from "react-router-dom";
import {
  getEventInfo,
  getEventStringColor,
  getTimingForEvent,
  makeFilename,
  makePlaylist,
} from "../utils/Utils";
import { DVEventString } from "../utils/DVWFile";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { toast } from "react-toastify";

const kFBKills = 0;
const kFBOppServeErrors = 1;
const kFBOppErrors = 2;
const kKills = 3;
const kOppErrors = 4;
const kUnsuccessful = 5;
const kSkillSpike = 4;

function ServeReceiveReport({ matches, team, selectedGame, selectedTeam }) {
  const navigate = useNavigate();
  const { currentUser } = useAuthStatus();
  const [passingStats, setPassingStats] = useState(null);
  const [rowOptions, setRowOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [selectedRowOptions, setSelectedRowOptions] = useState([]);
  const [selectedRows, setSelectedRows] = useState([1, 2, 3, 4, 5, 6]);
  const [showPasses, setShowPasses] = useState(true);
  const [showAttacks, setShowAttacks] = useState(true);
  const [, forceUpdate] = useState(0);
  const [passSelection, sePassSelection] = useState([
    true,
    true,
    true,
    true,
    true,
    true,
    true,
  ]);

  function handleSelectRows(data) {
    if (data.length === 0) {
      setSelectedRowOptions(rowOptions[0]);
      setSelectedRows([1, 2, 3, 4, 5, 6]);
      forceUpdate((n) => !n);
      return;
    }
    for (var nd = 1; nd < data.length; nd++) {
      const opt = data[nd];
      if (opt.value === 0) {
        setSelectedRowOptions([rowOptions[0]]);
        setSelectedRows([1, 2, 3, 4, 5, 6]);
        forceUpdate((n) => !n);
        return;
      }
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      var rs = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
        rs.push(data[nd].value);
      }
      setSelectedRowOptions(ddd);
      setSelectedRows(rs);
      forceUpdate((n) => !n);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedRowOptions([data[data.length - 1]]);
      setSelectedRows([data[data.length - 1]].value);
      forceUpdate((n) => !n);
      return;
    }
    setSelectedRowOptions(data);
    var rs = [];
    for (var nd = 0; nd < data.length; nd++) {
      rs.push(data[nd].value);
    }
    setSelectedRows(rs);
    forceUpdate((n) => !n);
  }

  const calculatePassingStats = () => {
    var players = [];
    var matchstats = [];
    var stats = [matchstats, [], [], [], [], []];
    // stats.push(matchstats);
    var mrcount = 0;

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
      for (var player of tm.players) {
        if (
          players.filter(
            (obj) =>
              obj.FirstName + "_" + obj.LastName ===
              player.FirstName + "_" + player.LastName
          ).length === 0
        ) {
          players.push(player);
        }
      }
      for (var nd = 0; nd < match.sets.length; nd++) {
        // var setstats = [];
        // stats.push(setstats);
        var setstats = stats[nd + 1];
        var game = match.sets[nd];
        var rallies = getDVRalliesInGameForTeam(game, tm);
        var rcount = 0;
        for (var nr = 0; nr < rallies.length; nr++) {
          var mr = rallies[nr];
          var row = mr.passrow;
          if (selectedRows.includes(row) === false) {
            continue;
          }
          if (mr.passEvent === undefined || mr.passEvent.Player === undefined) {
            continue;
          }
          if (
            (passSelection[0] === false && mr.passEvent.DVGrade === "=") ||
            (passSelection[1] === false &&
              (mr.passEvent.DVGrade === "/" || mr.passEvent.DVGrade === "-")) ||
            (passSelection[2] === false &&
              (mr.passEvent.DVGrade === "!" || mr.passEvent.DVGrade === "+")) ||
            (passSelection[3] === false && mr.passEvent.DVGrade === "#")
          ) {
            continue;
          }
          if (passSelection[6] === false && mr.sideoutType === kUnsuccessful) {
            continue;
          }
          if (passSelection[4] === false && mr.sideout && mr.sideout === true) {
            if (
              passSelection[5] === true &&
              mr.sideoutFirstBall &&
              mr.sideoutFirstBall === true
            ) {
            } else {
              continue;
            }
          }
          if (passSelection[4] === true && mr.sideout && mr.sideout === true) {
            if (
              passSelection[5] === false &&
              mr.sideoutFirstBall &&
              mr.sideoutFirstBall === true
            ) {
              continue;
            }
          }

          // if (passSelection[4] === false && passSelection[5] === false) {
          //   if (mr.sideoutType !== kUnsuccessful) {
          //     continue;
          //   }
          // } else if (passSelection[4] === true && passSelection[5] === false) {
          //   if (
          //     mr.sideoutType !== kUnsuccessful ||
          //     (mr.sideoutFirstBall && mr.sideoutFirstBall === true)
          //   ) {
          //     continue;
          //   }
          // } else if (passSelection[4] === false && passSelection[5] === true) {
          //   if (!mr.sideoutFirstBall || mr.sideoutFirstBall === false) {
          //     continue;
          //   }
          // }

          if (mr.events[0].EventType === 1) {
            mr.passEvent.BallStartString = mr.events[0].BallEndString;
          }
          rcount++;
          mrcount++;
          if (
            players.filter(
              (obj) =>
                obj.FirstName + "_" + obj.LastName ===
                mr.passEvent.Player.FirstName +
                  "_" +
                  mr.passEvent.Player.LastName
            ).length > 0
          ) {
            var plstat;
            var ps = setstats.filter(
              (obj) =>
                obj.Player.FirstName + "_" + obj.Player.LastName ===
                mr.passEvent.Player.FirstName +
                  "_" +
                  mr.passEvent.Player.LastName
            );
            if (ps.length === 0) {
              plstat = {};
              setstats.push(plstat);
              plstat.rallies = [];
              plstat.Player = mr.passEvent.Player;
              plstat.playerName =
                mr.passEvent.Player.shirtNumber +
                ". " +
                mr.passEvent.Player.NickName;
              plstat.soFail = 0;
              plstat.soKills = 0;
              plstat.soFBKills = 0;
              plstat.soOppErrors = 0;
              plstat.soFBOppErrors = 0;
              plstat.totalPoints = 0;
              plstat.perfectPass = 0;
              plstat.positivePass = 0;
              plstat.numberOfPasses = 0;
              plstat.passHits = 0;
              plstat.passHitKills = 0;
              plstat.passHitErrors = 0;
              plstat.spikeEvents = [];
            } else {
              plstat = ps[0];
            }
            var idx = mr.events.indexOf(mr.passEvent);
            if (idx != -1) {
              for (var ne = idx + 1; ne < mr.events.length; ne++) {
                var e = mr.events[ne];
                if (e.Player === undefined || e.Player === null) {
                  continue;
                }
                var isTeamPlayer =
                  players.filter(
                    (obj) =>
                      obj.FirstName + "_" + obj.LastName ===
                      e.Player.FirstName + "_" + e.Player.LastName
                  ).length > 0;
                if (isTeamPlayer) {
                  if (e.EventType === kSkillSpike) {
                    plstat.spikeEvents.push(e);
                  }
                } else {
                  break;
                }
              }
            }
            plstat.rallies.push(mr);
            plstat.numberOfPasses++;
            if (mr.sideoutType === kUnsuccessful) {
              plstat.soFail++;
            } else if (mr.sideoutType === kFBKills) {
              plstat.soFBKills++;
            } else if (mr.sideoutType === kKills) {
              plstat.soKills++;
            } else if (mr.sideoutType === kOppErrors) {
              plstat.soOppErrors++;
            } else if (mr.sideoutType === kFBOppErrors) {
              plstat.soFBOppErrors++;
            } else if (mr.sideoutType === kKills) {
              plstat.soKills++;
            }
            plstat.totalPoints +=
              mr.passEvent.passingGrade === undefined
                ? mr.passEvent.EventGrade
                : mr.passEvent.passingGrade;
            if (mr.passEvent.DVGrade === "+") {
              plstat.positivePass++;
            } else if (
              mr.passEvent.DVGrade === "+" ||
              mr.passEvent.DVGrade === "#"
            ) {
              plstat.positivePass++;
              plstat.perfectPass++;
            }
            if (mr.events.length > 0) {
              var passed = false;
              var transition = false;
              for (var ne = 0; ne < mr.events.length; ne++) {
                var sev = mr.events[ne];
                if (sev.Player === null || sev.Player === undefined) {
                  continue;
                }
                if (sev.EventType === mr.passEvent.EventType) {
                  passed = true;
                }
                if (
                  passed &&
                  players.filter(
                    (obj) =>
                      obj.FirstName + "_" + obj.LastName ===
                      sev.Player.FirstName + "_" + sev.Player.LastName
                  ).length === 0
                ) {
                  transition = true;
                  break;
                }
                if (
                  sev.EventType === 4 &&
                  sev.Player.FirstName + "_" + sev.Player.LastName ===
                    mr.passEvent.Player.FirstName +
                      "_" +
                      mr.passEvent.Player.LastName
                ) {
                  mr.passHit = true;
                  plstat.passHits++;
                  if (sev.EventGrade === 3) {
                    mr.passHitKill = true;
                    plstat.passHitKills++;
                  } else if (sev.EventGrade === 0) {
                    mr.passHitError = true;
                    plstat.passHitErrors++;
                  }
                  break;
                }
              }
            }
          }
          for (var npl = 0; npl < setstats.length; npl++) {
            var plstat = setstats[npl];
            plstat.frequency = plstat.rallies.length / rcount;
          }
        }
      }
    }
    for (var nd = 1; nd < stats.length; nd++) {
      var setstats = stats[nd];
      for (var np = 0; np < setstats.length; np++) {
        var plstat = setstats[np];
        var ps = matchstats.filter(
          (obj) =>
            obj.Player.FirstName + "_" + obj.Player.LastName ===
            plstat.Player.FirstName + "_" + plstat.Player.LastName
        );
        var mplstat;
        if (ps.length === 0) {
          mplstat = {};
          matchstats.push(mplstat);
          mplstat.rallies = [];
          mplstat.Player = plstat.Player;
          mplstat.playerName =
            plstat.Player.shirtNumber + ". " + plstat.Player.NickName;
          mplstat.soFail = 0;
          mplstat.soKills = 0;
          mplstat.soFBKills = 0;
          mplstat.soOppErrors = 0;
          mplstat.soFBOppErrors = 0;
          mplstat.totalPoints = 0;
          mplstat.perfectPass = 0;
          mplstat.positivePass = 0;
          mplstat.numberOfPasses = 0;
          mplstat.passHits = 0;
          mplstat.passHitKills = 0;
          mplstat.passHitErrors = 0;
          mplstat.spikeEvents = [];
        } else {
          mplstat = ps[0];
        }
        for (var ne = 0; ne < plstat.rallies.length; ne++) {
          mplstat.rallies.push(plstat.rallies[ne]);
        }
        for (var ne = 0; ne < plstat.spikeEvents.length; ne++) {
          mplstat.spikeEvents.push(plstat.spikeEvents[ne]);
        }

        mplstat.numberOfPasses += plstat.numberOfPasses;
        mplstat.soFail += plstat.soFail;
        mplstat.soKills += plstat.soKills;
        mplstat.soFBKills += plstat.soFBKills;
        mplstat.soOppErrors += plstat.soOppErrors;
        mplstat.soFBOppErrors += plstat.soFBOppErrors;
        mplstat.totalPoints += plstat.totalPoints;
        mplstat.perfectPass += plstat.perfectPass;
        mplstat.positivePass += plstat.positivePass;
        mplstat.passHits += plstat.passHits;
        mplstat.passHitKills += plstat.passHitKills;
        mplstat.passHitErrors += plstat.passHitErrors;

        plstat.passingAverage =
          plstat.numberOfPasses > 0
            ? plstat.totalPoints / plstat.numberOfPasses
            : 0;
        plstat.perfectPassPC =
          plstat.numberOfPasses > 0
            ? (plstat.perfectPass * 100) / plstat.numberOfPasses
            : 0;
        plstat.positivePassPC =
          plstat.numberOfPasses > 0
            ? (plstat.positivePass * 100) / plstat.numberOfPasses
            : 0;
        plstat.sideOuts = plstat.numberOfPasses - plstat.soFail;
        plstat.FBSideOuts = plstat.soFBKills + plstat.soFBOppErrors;
        plstat.sideOutPC =
          plstat.numberOfPasses > 0
            ? (plstat.sideOuts * 100) / plstat.numberOfPasses
            : 0;
        plstat.FBsideOutPC =
          plstat.numberOfPasses > 0
            ? (plstat.FBSideOuts * 100) / plstat.numberOfPasses
            : 0;
        plstat.passHitsPC =
          plstat.numberOfPasses > 0
            ? (plstat.passHits * 100) / plstat.numberOfPasses
            : 0;
        plstat.passHitKillsPC =
          plstat.numberOfPasses > 0
            ? (plstat.passHitKills * 100) / plstat.numberOfPasses
            : 0;
        plstat.passHitsErrorPC =
          plstat.numberOfPasses > 0
            ? (plstat.passHitErrors * 100) / plstat.numberOfPasses
            : 0;
      }
    }
    for (var n = 0; n < matchstats.length; n++) {
      var setstats = matchstats[n];
      setstats.passingAverage =
        setstats.numberOfPasses > 0
          ? setstats.totalPoints / setstats.numberOfPasses
          : 0;
      setstats.perfectPassPC =
        setstats.numberOfPasses > 0
          ? (setstats.perfectPass * 100) / setstats.numberOfPasses
          : 0;
      setstats.positivePassPC =
        setstats.numberOfPasses > 0
          ? (setstats.positivePass * 100) / setstats.numberOfPasses
          : 0;
      setstats.sideOuts = setstats.numberOfPasses - setstats.soFail;
      setstats.FBSideOuts = setstats.soFBKills + setstats.soFBOppErrors;
      setstats.sideOutPC =
        setstats.numberOfPasses > 0
          ? (setstats.sideOuts * 100) / setstats.numberOfPasses
          : 0;
      setstats.FBsideOutPC =
        setstats.numberOfPasses > 0
          ? (setstats.FBSideOuts * 100) / setstats.numberOfPasses
          : 0;
      setstats.passHitsPC =
        setstats.numberOfPasses > 0
          ? (setstats.passHits * 100) / setstats.numberOfPasses
          : 0;
      setstats.passHitKillsPC =
        setstats.numberOfPasses > 0
          ? (setstats.passHitKills * 100) / setstats.numberOfPasses
          : 0;
      setstats.passHitsErrorPC =
        setstats.numberOfPasses > 0
          ? (setstats.passHitErrors * 100) / setstats.numberOfPasses
          : 0;
      setstats.frequency = setstats.rallies.length / mrcount;
    }
    setPassingStats(stats);
  };

  const doPlayerVideo = (statsItem) => {
    console.log(statsItem);
    var filteredEvents = [];
    for (var r of statsItem.rallies) {
      if (r.passEvent) {
        filteredEvents.push(r.passEvent);
      }
    }

    const evs = makePlaylist(filteredEvents);
    if (evs.length === 0) {
      // toast.error("Play list is empty.");
    } else {
      // setPlaylistEvents(evs);
      const evstr = JSON.stringify(evs);
      localStorage.setItem("VBLivePlaylistEvents", evstr);
      const pl = {
        events: evs,
      };
      const fn = makeFilename("playlist", "vblive", "playlist");
      const buffer = JSON.stringify(pl);
      const st = {
        playlistFileData: buffer,
        filename: null,
        playlists: null,
        serverName: currentUser.email,
        description: `Serve-receives by ${statsItem.Player.NickName}`,
        initialTags: ["passing"],
      };
      navigate("/playlist", { state: st });
    }
  };

  const currentStats = () => {
    const xx = passingStats[selectedGame];
    var totalpasses = 0;
    for (var nx of xx) {
      totalpasses += nx.numberOfPasses;
    }
    return passingStats[selectedGame]
      .sort((a, b) => a.Player.LastName.localeCompare(b.Player.LastName))
      .filter((obj) => obj.numberOfPasses / totalpasses > 0.05);
  };

  const togglePassEvent = (index) => {
    var newPassSections = [...passSelection];
    newPassSections[index] = !newPassSections[index];
    sePassSelection(newPassSections);
  };

  const passingLegend = (index, text, color, bordercolor, description) => {
    const bwidth = "2.5px";
    return (
      <>
        <a data-tooltip-id="tt-filters" data-tooltip-content={description}>
          <div className="flex gap-2 lg:w-30 cursor-pointer">
            <div
              className="max-w-5 max-h-5 min-w-5 min-h-5 mt-1 rounded-full"
              style={{
                backgroundColor: color,
                borderColor: bordercolor,
                borderWidth: bwidth,
              }}
              onClick={() => togglePassEvent(index)}
            >
              {passSelection[index] === true ? (
                <CheckIcon
                  className={
                    color === "white" || color === "#00ff00"
                      ? "ml-0 mt-0 max-h-4 max-w-4 text-black font-bold"
                      : "ml-0 mt-0 max-h-4 max-w-4 text-white font-bold"
                  }
                />
              ) : (
                <></>
              )}
            </div>
            <div className="text-sm mt-1 text-base-content">{text}</div>
          </div>
        </a>
        <Tooltip
          id="tt-filters"
          place={"bottom-end"}
          style={{
            backgroundColor: "oklch(var(--b3))",
            color: "oklch(var(--bc))",
          }}
        />
      </>
    );
  };

  const doPlaylist = (playlist) => {
    if (playlist.length === 0) {
      toast.error("No passes selected.");
    } else {
      const evstr = JSON.stringify(playlist);
      localStorage.setItem("VBLivePlaylistEvents", evstr);
      const pl = {
        events: playlist,
      };
      const fn = null; // makeFilename("playlist", "vblive", "playlist");
      const buffer = JSON.stringify(pl);
      const st = {
        playlistFileData: buffer,
        filename: null,
        playlists: null,
        serverName: currentUser.email,
        description: `Serve-receives by ${playlist[0].playerName}`,
        initialTags: ["passing"],
      };
      navigate("/playlist", { state: st });
    }
  };

  const doVideoNumberOfPasses = (statsItem) => {
    var evs = [];
    for (var r of statsItem.rallies) {
      if (r.passEvent) {
        evs.push(r.passEvent);
      }
    }
    const playlist = makePlaylist(evs);
    doPlaylist(playlist);
  };

  const doVideoPerfectPasses = (statsItem) => {
    var evs = [];
    for (var r of statsItem.rallies) {
      if (r.passEvent && r.passEvent.DVGrade === "#") {
        evs.push(r.passEvent);
      }
    }
    const playlist = makePlaylist(evs);
    doPlaylist(playlist);
  };

  const doVideoPositivePasses = (statsItem) => {
    var evs = [];
    for (var r of statsItem.rallies) {
      if (
        r.passEvent &&
        (r.passEvent.DVGrade === "#" || r.passEvent.DVGrade === "+")
      ) {
        evs.push(r.passEvent);
      }
    }
    const playlist = makePlaylist(evs);
    doPlaylist(playlist);
  };

  const doVideoSideouts = (statsItem) => {
    var evs = [];
    for (var r of statsItem.rallies) {
      if (r.sideout && r.sideout === true) {
        evs.push(r.passEvent);
      }
    }
    const playlist = makePlaylist(evs);
    doPlaylist(playlist);
  };

  const doVideoFBSideouts = (statsItem) => {
    var evs = [];
    for (var r of statsItem.rallies) {
      if (r.sideoutFirstBall && r.sideoutFirstBall === true) {
        evs.push(r.passEvent);
      }
    }
    const playlist = makePlaylist(evs);
    doPlaylist(playlist);
  };

  const doVideoPassHits = (statsItem) => {
    var evs = [];
    for (var r of statsItem.rallies) {
      if (r.passHit && r.passHit === true) {
        evs.push(r.passEvent);
      }
    }
    const playlist = makePlaylist(evs);
    doPlaylist(playlist);
  };

  const doVideoPassHitKills = (statsItem) => {
    var evs = [];
    for (var r of statsItem.rallies) {
      if (r.passHitKill && r.passHitKill === true) {
        evs.push(r.passEvent);
      }
    }
    const playlist = makePlaylist(evs);
    doPlaylist(playlist);
  };

  const doVideoPassHitErrors = (statsItem) => {
    var evs = [];
    for (var r of statsItem.rallies) {
      if (r.passHitError && r.passHitError === true) {
        evs.push(r.passEvent);
      }
    }
    const playlist = makePlaylist(evs);
    doPlaylist(playlist);
  };

  useEffect(() => {
    calculatePassingStats();
    if (rowOptions.length === 0) {
      // var plas = [{ value: 0, label: "All Rows" }];
      var plas = [];
      for (var nd = 1; nd <= 6; nd++) {
        plas.push({ value: nd, label: "R" + nd });
      }
      setRowOptions(plas);
      setSelectedRowOptions([plas[0]]);
    }
  }, [selectedGame, selectedTeam, passSelection, selectedRows]);

  if (passingStats === null) {
    return <></>;
  }

  return (
    <div>
      <div className="flex-col p-4 bg-gray-500/20">
        <div className="h-[30vh] overflow-auto">
          <table className="table-generic">
            <thead className="thead-generic">
              <tr>
                <th
                  scope="col"
                  className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  Receiver
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                >
                  # Passes
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                >
                  Passing Average
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                >
                  Perfect %
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                >
                  Positive %
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                >
                  Sideout %
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                >
                  FB Sideout %
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                >
                  Pass Hits
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                >
                  Pass Hit Kills
                </th>
                <th
                  scope="col"
                  className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                >
                  Pass Hit Errors
                </th>
              </tr>
            </thead>
            <tbody className="tbody-generic">
              {/* {sortBy(currentStats(), "FBsideOutPC") */}
              {currentStats()
                //   .filter((obj) => obj.frequency > 0.1)
                .map((statsItem, i) => (
                  <tr
                    key={statsItem.Player.FirstName + statsItem.Player.LastName}
                    className={
                      i % 2 === 0 ? "bg-transparent" : "bg-base-300/10"
                    }
                  >
                    <td className="whitespace-nowrap py-2.5 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {statsItem.Player.shirtNumber +
                        ". " +
                        statsItem.Player.NickName}
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500 cursor-pointer"
                      onClick={() => doVideoNumberOfPasses(statsItem)}
                    >
                      {statsItem.numberOfPasses}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">
                      {statsItem.passingAverage.toFixed(2)}
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500 cursor-pointer"
                      onClick={() => doVideoPerfectPasses(statsItem)}
                    >
                      {statsItem.perfectPassPC.toFixed(0)} (
                      {statsItem.perfectPass}/{statsItem.numberOfPasses})
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500 cursor-pointer"
                      onClick={() => doVideoPositivePasses(statsItem)}
                    >
                      {statsItem.positivePassPC.toFixed(0)} (
                      {statsItem.positivePass}/{statsItem.numberOfPasses})
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500 cursor-pointer"
                      onClick={() => doVideoSideouts(statsItem)}
                    >
                      {statsItem.sideOutPC.toFixed(0)} ({statsItem.sideOuts}/
                      {statsItem.numberOfPasses})
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500 cursor-pointer"
                      onClick={() => doVideoFBSideouts(statsItem)}
                    >
                      {statsItem.FBsideOutPC.toFixed(0)} ({statsItem.FBSideOuts}
                      /{statsItem.numberOfPasses})
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500 cursor-pointer"
                      onClick={() => doVideoPassHits(statsItem)}
                    >
                      {statsItem.passHits.toFixed(0)}
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500 cursor-pointer"
                      onClick={() => doVideoPassHitKills(statsItem)}
                    >
                      {statsItem.passHitKills.toFixed(0)}
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500 cursor-pointer"
                      onClick={() => doVideoPassHitErrors(statsItem)}
                    >
                      {statsItem.passHitErrors.toFixed(0)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="lg:flex md:flex flex-col mt-2 gap-2">
          <div className="sm:flex sm:gap-10 ml-1">
            <div className="flex gap-3 my-2">
              {rowOptions.map((rowOption, i) => (
                <div className="flex gap-1 mt-2" key={i}>
                  <label className="text-sm text-base-content">
                    {rowOption.label}
                  </label>
                  <input
                    type="checkbox"
                    defaultChecked={selectedRows.includes(rowOption.value)}
                    className="checkbox-generic"
                    onChange={() => {
                      if (selectedRows.includes(rowOption.value)) {
                        setSelectedRows(
                          selectedRows.filter((obj) => obj !== rowOption.value)
                        );
                      } else {
                        setSelectedRows([...selectedRows, rowOption.value]);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-2 p-1 bg-gray-500/10  px-1 overflow-auto">
              {passingLegend(0, "Error Pass", "red", "red", "= passes")}
              {passingLegend(1, "1 Pass", "orange", "orange", "/ and - passes")}
              {passingLegend(2, "2 Pass", "green", "green", "! and + passes")}
              {passingLegend(
                3,
                "Perfect Pass",
                "#00ff00",
                "#00ff00",
                "# passes"
              )}
              {passingLegend(
                4,
                "Successful SO",
                "white",
                "black",
                "Successful sideouts from passes"
              )}
              {passingLegend(
                5,
                "First Ball SO",
                "white",
                "dodgerblue",
                "First ball sideouts from passes"
              )}
              {passingLegend(
                6,
                "Unsuccessful SO",
                "white",
                "red",
                "Unsuccessful sideouts from passes"
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-col p-4 bg-gray-500/20 w-90 h-90 overflow-auto mt-2">
        <div className="flex gap-4">
          <div className="flex gap-1 mt-2">
            <label className="text-sm text-base-content">Show Passes</label>
            <input
              type="checkbox"
              defaultChecked={showPasses}
              className="checkbox-generic"
              onChange={() => {
                setShowPasses(!showPasses);
              }}
            />
          </div>
          <div className="flex gap-1 mt-2">
            <label className="text-sm text-base-content">Show Attacks</label>
            <input
              type="checkbox"
              defaultChecked={showAttacks}
              className="checkbox-generic"
              onChange={() => {
                setShowAttacks(!showAttacks);
              }}
            />
          </div>
        </div>
        <div className="flex overflow-x-auto">
          {/* {sortBy(currentStats(), "FBsideOutPC")
          .filter((obj) => obj.frequency > 0.1) */}
          {currentStats().map((statsItem, i) => (
            <div
              className="carousel-item w-80 h-80 my-2 cursor-pointer"
              key={statsItem.Player.FirstName + statsItem.Player.LastName}
              onClick={() => doPlayerVideo(statsItem)}
            >
              {/* <img src="https://placeimg.com/400/300/arch" alt="Burger" /> */}
              <ServeReceive
                matches={matches}
                team={team}
                stats={statsItem}
                showPasses={showPasses}
                showAttacks={showAttacks}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ServeReceiveReport;
