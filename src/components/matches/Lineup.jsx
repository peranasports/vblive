import React, { useEffect, useState } from "react";
import Spinner from "../layout/Spinner";
import {
  fetchAllMyMatches,
  fetchSessionById,
  fetchTeamByNameAndSessionId,
} from "../utils/dbutils";
import { unzipBuffer } from "../utils/Utils";
import { myunzip } from "../utils/zip";
import { generateMatch } from "../utils/DVWFile";
import { initWithPSVBCompressedBuffer } from "../utils/PSVBFile";
import { ReactComponent as Undo } from "../assets/icons/Undo.svg";
import { ReactComponent as Redo } from "../assets/icons/Redo.svg";

function Lineup({ match, userEmail, onTeamSelected }) {
  const [teams, setTeams] = useState([]);
  const [playersA, setPlayersA] = useState([]);
  const [playersB, setPlayersB] = useState([]);
  const [selectedTeamA, setSelectedTeamA] = useState(null);
  const [selectedTeamB, setSelectedTeamB] = useState(null);
  const [loadingTeamA, setLoadingTeamA] = useState(false);
  const [loadingTeamB, setLoadingTeamB] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, forceUpdate] = useState(false);
  const [formData, setFormData] = useState({
    teamA: match?.teamA ?? "",
    teamB: match?.teamB ?? "",
  });
  const { teamA, teamB } = formData;

  const doInit = async () => {
    setLoading(true);
    const ms = await fetchAllMyMatches(userEmail);
    var tms = [];
    for (var m of ms) {
      if (tms.filter((t) => t.name === m.teamA).length === 0) {
        tms.push({ name: m.teamA, sessionId: m.id });
      }
      if (tms.filter((t) => t.name === m.teamB).length === 0) {
        tms.push({ name: m.teamB, sessionId: m.id });
      }
    }
    setTeams(tms.sort((a, b) => a.name.localeCompare(b.name)));
    setLoading(false);
  };

  useEffect(() => {
    doInit();
  }, []);

  useEffect(() => {}, [
    selectedTeamA,
    selectedTeamB,
    selectedTeamA?.selectedPosition,
    selectedTeamB?.selectedPosition,
  ]);

  const onMutate = async (e) => {
    if (e.target.id === "teamA") {
      const team = await getTeamPlayers(e.target.value, "A");
      onTeamSelected(team, "A");
    } else if (e.target.id === "teamB") {
      const team = await getTeamPlayers(e.target.value, "B");
      onTeamSelected(team, "B");
    }
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const getTeamPlayers = async (teamName, teamno) => {
    if (teamno === "A") {
      setLoadingTeamA(true);
    } else {
      setLoadingTeamB(true);
    }
    const team = teams.filter((t) => t.name === teamName)[0];
    const dbteam = await fetchTeamByNameAndSessionId(team.name, team.sessionId);
    if (dbteam) {
      team.isMBFollowingSetter = dbteam.isMBFollowingSetter ?? false;
      team.isOppPassing = dbteam.isOppPassing ?? false;
      team.logoURL = dbteam.logoURL ?? "";
      team.players = dbteam.players !== "" ? JSON.parse(dbteam.players) : null;
      team.lineup = dbteam.lineup !== "" ? JSON.parse(dbteam.lineup) : null;
      if (teamno === "A") {
        setPlayersA(team.players);
        setSelectedTeamA(team);
      } else {
        setPlayersB(team.players);
        setSelectedTeamB(team);
      }
    } else {
      if (team.players) {
        if (teamno === "A") setPlayersA(team.players);
        else setPlayersB(team.players);
      } else {
        const m = await fetchSessionById(team.sessionId);
        var buffer = myunzip(m.stats);
        if (!buffer) {
          buffer = unzipBuffer(m.stats);
        }
        var mm = null;
        if (buffer.includes("3DATAVOLLEY")) {
          mm = generateMatch(buffer);
        } else {
          mm = initWithPSVBCompressedBuffer(m.stats);
        }
        if (teamno === "A") {
          team.players =
            mm.teamA.Name === teamName ? mm.teamA.players : mm.teamB.players;
          setPlayersA(
            mm.teamA.Name === teamName ? mm.teamA.players : mm.teamB.players
          );
          setSelectedTeamA(team);
        } else {
          team.players =
            mm.teamA.Name === teamName ? mm.teamA.players : mm.teamB.players;
          setPlayersB(
            mm.teamA.Name === teamName ? mm.teamA.players : mm.teamB.players
          );
          setSelectedTeamB(team);
        }
      }
    }
    if (teamno === "A") {
      setLoadingTeamA(false);
    } else {
      setLoadingTeamB(false);
    }
    return team;
  };

  const doRotate = (team, direction) => {
    if (!team) return;
    if (!team.lineup) return;
    if (direction === 0) {
      // rotate position on volleyball court counter clockwise
      const p6 = { ...team.lineup.filter((p) => p.position === "6")[0] };
      for (var i = 6; i > 0; i--) {
        const orig =
          i > 1
            ? team.lineup.filter((p) => p.position === (i - 1).toString())[0]
            : p6;
        const dest = team.lineup.filter((p) => p.position === i.toString())[0];
        dest.currentPosition = dest.position;
        dest.role1 = orig.role1;
        dest.role2 = orig.role2;
        dest.playerNumber = orig.playerNumber;
        dest.playerFirstName = orig.playerFirstName;
        dest.playerLastName = orig.playerLastName;
      }
    } else {
      // rotate position on volleyball court clockwise
      const p1 = { ...team.lineup.filter((p) => p.position === "1")[0] };
      for (var i = 1; i < 7; i++) {
        const orig =
          i < 6
            ? team.lineup.filter((p) => p.position === (i + 1).toString())[0]
            : p1;
        const dest = team.lineup.filter((p) => p.position === i.toString())[0];
        dest.role1 = orig.role1;
        dest.role2 = orig.role2;
        dest.playerNumber = orig.playerNumber;
        dest.playerFirstName = orig.playerFirstName;
        dest.playerLastName = orig.playerLastName;
      }
    }

    forceUpdate((n) => !n);
  };

  const doLineup = (team, teamno) => {
    if (!team) return <></>;
    if (!team.lineup) {
      team.lineup = [
        {
          position: "4",
          currentPosition: "4",
          role1: "OP",
          role2: "OP",
          playerNumber: "",
          playerFirstName: "",
          playerLastName: "",
          liberoNumber: "",
          team: team.name,
        },
        {
          position: "3",
          currentPosition: "3",
          role1: "MB2",
          role2: "OH1",
          playerNumber: "",
          playerFirstName: "",
          playerLastName: "",
          liberoNumber: "",
          team: team.name,
        },
        {
          position: "2",
          currentPosition: "2",
          role1: "OH1",
          role2: "MB2",
          playerNumber: "",
          playerFirstName: "",
          playerLastName: "",
          liberoNumber: "",
          team: team.name,
        },
        {
          position: "5",
          currentPosition: "5",
          role1: "OH2",
          role2: "MB1",
          playerNumber: "",
          playerFirstName: "",
          playerLastName: "",
          liberoNumber: "",
          team: team.name,
        },
        {
          position: "6",
          currentPosition: "6",
          role1: "MB1",
          role2: "OH2",
          playerNumber: "",
          playerFirstName: "",
          playerLastName: "",
          liberoNumber: "",
          team: team.name,
        },
        {
          position: "1",
          currentPosition: "1",
          role1: "S",
          role2: "S",
          playerNumber: "",
          playerFirstName: "",
          playerLastName: "",
          liberoNumber: "",
          team: team.name,
        },
        {
          position: "7",
          currentPosition: "7",
          role1: "L1",
          role2: "L1",
          playerNumber: "",
          playerFirstName: "",
          playerLastName: "",
          liberoNumber: "",
          team: team.name,
        },
        {
          position: "8",
          currentPosition: "8",
          role1: "L2",
          role2: "L2",
          playerNumber: "",
          playerFirstName: "",
          playerLastName: "",
          liberoNumber: "",
          team: team.name,
        },
      ];
    }
    else {
      for (var i = 0; i < team.lineup.length; i++) {
        const li = team.lineup[i];
        li.team = team.name;
        li.currentPosition = li.position;
        li.liberoNumber = "";
      }
    }
    return (
      <>
        {(loadingTeamA && teamno === "A") ||
        (loadingTeamB && teamno === "B") ? (
          <></>
        ) : (
          <div className="flex-col">
            <div className="mt-4 bg-black/50 w-full py-2 px-2">
              <div class="grid grid-cols-3 gap-2 justify-items-center">
                {team.lineup.map((p, idx) => (
                  <div
                    key={idx}
                    className={
                      team.selectedPosition &&
                      team.selectedPosition === p.position
                        ? "bg-white/30 w-12 p-1 cursor-pointer border-success border-2"
                        : "bg-white/20 w-12 p-1 cursor-pointer"
                    }
                    onClick={() => {
                      team.selectedPosition = p.position;
                      forceUpdate((n) => !n);
                    }}
                  >
                    <div className="flex-col">
                      <div className="flex justify-between text-xs text-base-content/50">
                        <div className="text-xs">{p.position}</div>
                        <div className="text-xs">
                          {team.isMBFollowingSetter ? p.role2 : p.role1}
                        </div>
                      </div>
                      <div className="flex text-xl justify-center">
                        {p.playerNumber !== "" ? p.playerNumber : "-"}
                      </div>
                      {/* <div className="flex text-xs justify-end text-base-content/50">
                            {team.isMBFollowingSetter ? p.role2 : p.role1}
                          </div> */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-control">
              <div className="flex gap-4 justify-end p-1">
                <button>
                  <Undo
                    icon={true}
                    className="btn-toolbar size-7"
                    onClick={() => doRotate(team, 0)}
                  />
                </button>
                <button>
                  <Redo
                    icon={true}
                    className="btn-toolbar size-7"
                    onClick={() => doRotate(team, 1)}
                  />
                </button>
              </div>
              <label className="label cursor-pointer">
                <span className="label-text">MB following setter</span>
                <input
                  type="checkbox"
                  checked={team.isMBFollowingSetter}
                  className="checkbox checkbox-xs rounded-none"
                  onChange={() => {
                    team.isMBFollowingSetter = !team.isMBFollowingSetter;
                    forceUpdate((n) => !n);
                  }}
                />
              </label>
              <label className="label cursor-pointer -mt-2">
                <span className="label-text">Opposite passing</span>
                <input
                  type="checkbox"
                  checked={team.isOppPassing}
                  className="checkbox checkbox-xs rounded-none"
                  onChange={() => {
                    team.isOppPassing = !team.isOppPassing;
                    forceUpdate((n) => !n);
                  }}
                />
              </label>
            </div>
          </div>
        )}
      </>
    );
  };

  const doRoster = (team, teamno) => {
    if (!team) return <></>;
    return (
      <>
        {(loadingTeamA && teamno === "A") ||
        (loadingTeamB && teamno === "B") ? (
          <Spinner />
        ) : (
          <ul className="mt-2 h-80 overflow-auto">
            {team.players &&
              team.players.map((player, idx) => (
                <li
                  key={idx}
                  className={
                    idx % 2 === 0
                      ? "bg-black/10 text-sm py-2 pl-4 cursor-pointer"
                      : "bg-black/5 text-sm py-2 pl-4 cursor-pointer"
                  }
                  onClick={() => {
                    if (team.selectedPosition) {
                      const existing = team.lineup.filter(
                        (p) => p.playerNumber === player.shirtNumber
                      );
                      for (var e of existing) {
                        e.playerNumber = "";
                      }
                      const p = team.lineup.filter(
                        (p) => p.position === team.selectedPosition
                      )[0];
                      p.playerNumber = player.shirtNumber;
                      p.playerFirstName = player.FirstName;
                      p.playerLastName = player.LastName;
                      forceUpdate((n) => !n);
                    }
                  }}
                >
                  {player.shirtNumber}. {player.NickName}
                </li>
              ))}
            {/* <li>
                    <button className="btn-in-form">Add Player</button>
                  </li> */}
          </ul>
        )}
      </>
    );
  };

  return (
    <>
      <div className="flex gap-6">
        <div className="flex-col">
          <label
            htmlFor="teamA"
            className="block text-sm font-medium text-base-content pt-1.5"
          >
            Team A:
          </label>
          <div className="col-span-2">
            <div className="grid grid-cols-1 max-w-xs">
              <div className="flex gap-2">
                <select
                  name="teamA"
                  id="teamA"
                  className="select-generic"
                  value={match?.teamA?.name}
                  onChange={onMutate}
                >
                  <option value="">Select Team A...</option>
                  {teams.map((team, idx) => (
                    <option key={idx} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {doRoster(selectedTeamA, "A")}
          {doLineup(selectedTeamA, "A")}
        </div>
        <div className="flex-col">
          <label
            htmlFor="teamB"
            className="block text-sm font-medium text-base-content pt-1.5"
          >
            Team B:
          </label>
          <div className="col-span-2">
            <div className="grid grid-cols-1 max-w-xs">
              <div className="flex gap-2">
                <select
                  name="teamB"
                  id="teamB"
                  className="select-generic"
                  value={match?.teamB?.name}
                  onChange={onMutate}
                >
                  <option value="">Select Team B...</option>
                  {teams.map((team, idx) => (
                    <option key={idx} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {doRoster(selectedTeamB, "B")}
          {doLineup(selectedTeamB, "B")}
        </div>
      </div>
    </>
  );
}

export default Lineup;
