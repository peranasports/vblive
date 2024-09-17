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

  const doEventsSelected = (evs) => {
    const sortedevs = evs.sort((a, b) => a.TimeStamp.getTime() - b.TimeStamp.getTime());
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

  const doVideo = (row) => {
    var evs = [];
    for (var z = 0; z < 9; z++) {
      evs = evs.concat(events[row - 1][z]);
    }
    const sortedevs = evs.sort((a, b) => a.TimeStamp.getTime() - b.TimeStamp.getTime());
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
          if (startZone > 0 && e.Row !== undefined && isNaN(e.Row) === false) {
            events[e.Row - 1][startZone - 1].push(e);
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

  return (
    <div className="">
      <p className="text-3xl font-bold">
        {selectedTeam === 0
          ? team.toUpperCase()
          : "OPPONENTS (" + matches.length + ")"}
      </p>
      <div className="flex h-80 lg:overflow-hidden">
        <div className="flex-col w-80 h-80 bg-slate-100">
          <div className="flex justify-between px-4">
            <div className="text-xl font-bold">ROW 4</div>
            <div
              className="tooltip tooltip-bottom"
              data-tip="Show all attacks. Or click on zones to show attacks in that zone."
            >
              <VideoCameraIcon
                className="h-6 w-6 cursor-pointer"
                onClick={() => doVideo(4)}
              />
            </div>
          </div>
          <AttackZoneChart
            matches={matches}
            team={team}
            events={events}
            row="4"
            onEventsSelected={(evs) => doEventsSelected(evs)}
          />
        </div>
        <div className="w-80 h-80 bg-slate-100">
          <div className="flex justify-between px-4">
            <div className="text-xl font-bold">ROW 5</div>
            <div
              className="tooltip tooltip-bottom"
              data-tip="Show all attacks. Or click on zones to show attacks in that zone."
            >
              <VideoCameraIcon
                className="h-6 w-6 cursor-pointer"
                onClick={() => doVideo(5)}
              />
            </div>
          </div>
          <AttackZoneChart
            matches={matches}
            team={team}
            events={events}
            row="5"
            onEventsSelected={(evs) => doEventsSelected(evs)}
          />
        </div>
        <div className="w-80 h-80 bg-slate-100">
          <div className="flex justify-between px-4">
            <div className="text-xl font-bold">ROW 6</div>
            <div
              className="tooltip tooltip-bottom"
              data-tip="Show all attacks. Or click on zones to show attacks in that zone."
            >
              <VideoCameraIcon
                className="h-6 w-6 cursor-pointer"
                onClick={() => doVideo(6)}
              />
            </div>
          </div>
          <AttackZoneChart
            matches={matches}
            team={team}
            events={events}
            row="6"
            onEventsSelected={(evs) => doEventsSelected(evs)}
          />
        </div>
      </div>
      <div className="flex h-80 lg:overflow-hidden">
        <div className="w-80 h-80 bg-slate-100">
          <div className="flex justify-between px-4">
            <div className="text-xl font-bold">ROW 3</div>
            <div
              className="tooltip tooltip-bottom"
              data-tip="Show all attacks. Or click on zones to show attacks in that zone."
            >
              <VideoCameraIcon
                className="h-6 w-6 cursor-pointer"
                onClick={() => doVideo(3)}
              />
            </div>
          </div>
          <AttackZoneChart
            matches={matches}
            team={team}
            events={events}
            row="3"
            onEventsSelected={(evs) => doEventsSelected(evs)}
          />
        </div>
        <div className="w-80 h-80 bg-slate-100">
          <div className="flex justify-between px-4">
            <div className="text-xl font-bold">ROW 2</div>
            <div
              className="tooltip tooltip-bottom"
              data-tip="Show all attacks. Or click on zones to show attacks in that zone."
            >
              <VideoCameraIcon
                className="h-6 w-6 cursor-pointer"
                onClick={() => doVideo(2)}
              />
            </div>
          </div>
          <AttackZoneChart
            matches={matches}
            team={team}
            events={events}
            row="2"
            onEventsSelected={(evs) => doEventsSelected(evs)}
          />
        </div>
        <div className="w-80 h-80 bg-slate-100">
          <div className="flex justify-between px-4">
            <div className="text-xl font-bold">ROW 1</div>
            <div
              className="tooltip tooltip-bottom"
              data-tip="Show all attacks. Or click on zones to show attacks in that zone."
            >
              <VideoCameraIcon
                className="h-6 w-6 cursor-pointer"
                onClick={() => doVideo(1)}
              />
            </div>
          </div>
          <AttackZoneChart
            matches={matches}
            team={team}
            events={events}
            row="1"
            onEventsSelected={(evs) => doEventsSelected(evs)}
          />
        </div>
      </div>
    </div>
  );
}
export default AttackZones;
