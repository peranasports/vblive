import { useState, useEffect } from "react";
import AttackZoneChart from "./AttackZoneChart";
import { makePlaylist, zoneFromString } from "../utils/Utils";
import { toast } from "react-toastify";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { useNavigate } from "react-router-dom";
import { VideoCameraIcon } from "@heroicons/react/24/outline";

const kSkillSpike = 4;

function AttackZones({ matches, team, selectedGame, selectedTeam }) {
  const [events, setEvents] = useState(null);
  const { currentUser } = useAuthStatus();
  const navigate = useNavigate();

  const doEventsSelected = (evs, row, zone) => {
    const sortedevs = evs.sort(
      (a, b) => a.TimeStamp.getTime() - b.TimeStamp.getTime()
    );
    const playlist = makePlaylist(sortedevs);
    if (playlist.length === 0) {
      toast.error("No events in selected zone.");
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
        description: `Attacks in zone ${zone} - row ${row}`,
        initialTags: ["spiking"],
      };
      navigate("/playlist", { state: st });
    }
  };

  const doVideo = (row) => {
    var evs = [];
    for (var z = 0; z < 9; z++) {
      evs = evs.concat(events[row - 1][z]);
    }
    const sortedevs = evs.sort(
      (a, b) => a.TimeStamp.getTime() - b.TimeStamp.getTime()
    );
    const playlist = makePlaylist(sortedevs);
    if (playlist.length === 0) {
      toast.error("No events in selected zone.");
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
      };
      navigate("/playlist", { state: st });
    }
  };

  const getAttackComboOfEvent = (code) => {
    if (code == undefined) {
      return null;
    }
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

  const calculateZones = () => {
    var events = [
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
      if (match.app === "VBStats") {
        for (var ne = 0; ne < evs.length; ne++) {
          var e = evs[ne];
          var startZone = zoneFromString(e.BallStartString);
          try {
            if (
              startZone > 0 &&
              e.Row !== undefined &&
              e.Row > 0 &&
              isNaN(e.Row) === false
            ) {
              events[e.Row - 1][startZone - 1].push(e);
            }
          } catch (error) {
            console.log(error);
          }
        }
      } else {
        for (var ne = 0; ne < evs.length; ne++) {
          var e = evs[ne];
          var nacs =
            match.attackCombos === undefined ? 0 : match.attackCombos.length;
          var ac = getAttackComboOfEvent(e.attackCombo);
          if (
            (nacs > 0 && ac != null && ac.targetHitter !== "-") ||
            nacs == 0
          ) {
            var row = e.Row - 1;
            var startZone = 0;
            if (nacs > 0) {
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
            } else {
              startZone = zoneFromString(e.BallStartString);
            }
            if (
              startZone > 0 &&
              e.Row !== undefined &&
              isNaN(e.Row) === false
            ) {
              events[e.Row - 1][startZone - 1].push(e);
            } else {
              // DLog(@"%@ %@", e.attackCombo, e.Player.LastName);
            }
          } else {
            // DLog(@"%@ %@", e.attackCombo, e.Player.LastName);
          }
        }
      }
    }
    setEvents(events);
  };

  useEffect(() => {
    calculateZones();
  }, [selectedGame, selectedTeam]);

  if (events === null) {
    return <></>;
  }

  const doRow = (row) => {
    return (
      <>
        <div className="flex-col w-80 h-[360px] border shadow-lg">
          <div className="flex justify-between px-4 bg-gray-400/50">
            <div className="text-lg text-base-content font-bold">ROW {row}</div>
            <div
              className="tooltip tooltip-bottom"
              data-tip="Show all attacks. Or click on a zone to show attacks in that zone."
            >
              <VideoCameraIcon
                className="h-6 w-6 cursor-pointer"
                onClick={() => doVideo(row)}
              />
            </div>
          </div>
          <div className="bg-orange-400 h-full overflow-hidden">
            <AttackZoneChart
            className="h-[200px]"
              matches={matches}
              team={team}
              events={events}
              row={row.toString()}
              onEventsSelected={(evs, zone) => doEventsSelected(evs, row, zone)}
            />
          </div>
        </div>
      </>
    );
  };

  const doTeamName = () => {
    if (selectedTeam === 0) return team.toUpperCase();
    else {
      if (matches.length === 1) {
        return matches[0].teamB.Name.toUpperCase();
      }
      return `OPPONENTS (${matches.length})`;
    }
  }

  return (
    <div className="h-full">
      <p className="text-xl font-bold">
        {doTeamName()}
      </p>
      <div className="flex overflow-x-auto w-[90vw]">
        <div className="flex-col gap-4">
          <div className="flex gap-2 p-4 lg:overflow-hidden">
            {doRow(4)}
            {doRow(5)}
            {doRow(6)}
          </div>
          <div className="flex gap-2 mt-2 p-4 lg:overflow-hidden">
            {doRow(3)}
            {doRow(2)}
            {doRow(1)}
          </div>
        </div>
      </div>
    </div>
  );
}
export default AttackZones;
