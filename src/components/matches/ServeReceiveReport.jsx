import { useState, useEffect } from "react";
import { sortBy } from "lodash";
import { getDVRalliesInGameForTeam } from "../utils/StatsItem";
import ServeReceive from "./ServeReceive";
import { CheckIcon, XIcon } from "@heroicons/react/24/outline";
import { psvbParseLatestStats } from "../utils/PSVBFile";
import { useNavigate } from "react-router-dom";
import { getEventInfo, getEventStringColor, getTimingForEvent, makeFilename } from "../utils/Utils";
import { DVEventString } from "../utils/DVWFile";
import { useAuthStatus } from "../hooks/useAuthStatus";

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
  const [showPasses, setShowPasses] = useState(true);
  const [showAttacks, setShowAttacks] = useState(true);
  const [passSelection, sePassSelection] = useState([
    true,
    true,
    true,
    true,
    true,
    true,
    true,
  ]);

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
                  plstat.passHits++;
                  if (sev.EventGrade === 3) {
                    plstat.passHitKills++;
                  } else if (sev.EventGrade === 0) {
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
    var evs = [];
    for (var ev of filteredEvents) {
      var loc = 0;
      const tm = getTimingForEvent(ev);
      if (
        ev.Drill.match.videoStartTimeSeconds &&
        ev.Drill.match.videoOffset &&
        ev.Drill.match.videoOffset >= 0
      ) {
        const secondsSinceEpoch = Math.round(ev.TimeStamp.getTime() / 1000);
        loc =
          secondsSinceEpoch -
          ev.Drill.match.videoStartTimeSeconds +
          ev.Drill.match.videoOffset -
          tm.leadTime;
      } else {
        if (ev.VideoPosition !== undefined && ev.VideoPosition !== 0) {
          loc = ev.VideoPosition - tm.leadTime;
        }
      }

      var xx = "";
      var col = "";
      if (ev.DVGrade === undefined) {
        const ss = getEventInfo(ev);
        xx = ss.sub;
        col = ss.subcolor;
      } else {
        xx = DVEventString(ev);
        col = getEventStringColor(ev);
      }
      const evx = {
        playerName:
          ev.Player.shirtNumber + ". " + ev.Player.NickName.toUpperCase(),
        eventString: xx,
        eventStringColor: col,
        eventSubstring:
          "Set " +
          ev.Drill.GameNumber +
          " " +
          ev.TeamScore +
          "-" +
          ev.OppositionScore +
          " R" +
          ev.Row,
        videoOnlineUrl: ev.Drill.match.videoOnlineUrl,
        videoPosition: loc,
        eventId: ev.EventId,
        matchVideo: ev.Drill.match.videoOnlineUrl
          ? ev.Drill.match.videoOnlineUrl
          : "",
      };
      evs.push(evx);
    }
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
      };
      navigate("/playlist", { state: st });

      // saveToPC(buffer, fn);
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
    var cln = "h-5 w-5 text-black";
    if (passSelection[index] === true) {
      cln = "h-5 w-5 text-white";
    }
    // const bgcolor = passSelection[index] === true ? color : "white";
    const bwidth = "2.5px";
    return (
      <div className="tooltip" data-tip={description}>
        <div className="flex gap-2">
          <div
            className="min-w-[16px] mt-1 rounded-full"
            style={{
              width: "20px",
              height: "20px",
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
                    ? "ml-0 mt-0 h-4 w-4 text-black"
                    : "ml-0 mt-0 h-4 w-4 text-white"
                }
              />
            ) : (
              <></>
            )}
          </div>
          {/* <div
            className=""
            style={{
              width: "16px",
              height: "16px",
              // borderRadius: "6px",
              backgroundColor: {color},
            }}
          /> */}
          {/* <div
            className={cln}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "6px",
              backgroundColor: color,
            }}
          /> */}
          <div className="text-sm mt-1 text-gray-800">{text}</div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    calculatePassingStats();
  }, [selectedGame, selectedTeam, passSelection]);

  if (passingStats === null) {
    return <></>;
  }

  return (
    <div>
      <div className="h-[30vh] overflow-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
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
          <tbody className="bg-white">
            {/* {sortBy(currentStats(), "FBsideOutPC") */}
            {currentStats()
              //   .filter((obj) => obj.frequency > 0.1)
              .map((statsItem, i) => (
                <tr
                  key={statsItem.Player.FirstName + statsItem.Player.LastName}
                  className={i % 2 === 0 ? undefined : "bg-gray-100"}
                >
                  <td className="whitespace-nowrap py-2.5 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {statsItem.Player.shirtNumber +
                      ". " +
                      statsItem.Player.NickName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">
                    {statsItem.numberOfPasses}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">
                    {statsItem.passingAverage.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">
                    {statsItem.perfectPassPC.toFixed(0)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">
                    {statsItem.positivePassPC.toFixed(0)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">
                    {statsItem.sideOutPC.toFixed(0)} ({statsItem.sideOuts}/
                    {statsItem.numberOfPasses})
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">
                    {statsItem.FBsideOutPC.toFixed(0)} ({statsItem.FBSideOuts}/
                    {statsItem.numberOfPasses})
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">
                    {statsItem.passHits.toFixed(0)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">
                    {statsItem.passHitKills.toFixed(0)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">
                    {statsItem.passHitErrors.toFixed(0)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="flex mt-2">
        <button
          type="button"
          onClick={() => {
            setShowPasses(!showPasses);
          }}
          className="flex mr-4 justify-end rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
        >
          {showPasses ? "Hide Passes" : "Show Passes"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowAttacks(!showAttacks);
          }}
          className="flex justify-end rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
        >
          {showAttacks ? "Hide Attacks" : "Show Attacks"}
        </button>
        <div className="flex gap-4 ml-4 mt-1 bg-gray-100 border px-4">
          {passingLegend(0, "Error Pass", "red", "red", "= passes")}
          {passingLegend(1, "1 Pass", "orange", "orange", "/ and - passes")}
          {passingLegend(2, "2 Pass", "green", "green", "! and + passes")}
          {passingLegend(3, "Perfect Pass", "#00ff00", "#00ff00", "# passes")}
          {passingLegend(
            4,
            "Successful Sideout",
            "white",
            "black",
            "Successful sideouts from passes"
          )}
          {passingLegend(
            5,
            "FB Sideout",
            "white",
            "dodgerblue",
            "First ball sideouts from passes"
          )}
          {passingLegend(
            6,
            "Unsuccessful Sideout",
            "white",
            "red",
            "Unsuccessful sideouts from passes"
          )}
          {/* <div className="tooltip" data-tip="Sideout successfully from pass">
            <div className="flex gap-2">
              <div
                className="flex gap-2 mt-2"
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "6px",
                  borderColor: "black",
                  borderWidth: "1px",
                  backgroundColor: "white",
                }}
              ></div>
              <div className="text-sm mt-1 text-gray-800">
                Successful Sideout
              </div>
            </div>
          </div>
          <div className="tooltip" data-tip="Sideout first ball from pass">
            <div className="flex gap-2">
              <div
                className="flex gap-2 mt-2"
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "6px",
                  borderColor: "magenta",
                  borderWidth: "1px",
                  backgroundColor: "white",
                }}
              ></div>
              <div className="text-sm mt-1 text-gray-800">
                Sideout First Ball
              </div>
            </div>
          </div> */}
        </div>
      </div>
      <div className="carousel w-full">
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
  );
}

export default ServeReceiveReport;
