import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllMyMatches,
  fetchSessionById,
  fetchTeamById,
  fetchTeamByNameAndSessionId,
  storeTeam,
} from "../components/utils/dbutils";
import Spinner from "../components/layout/Spinner";
import CodingPage from "./CodingPage";
import Lineup from "../components/matches/Lineup";
import { generateUUID, unzipBuffer } from "../components/utils/Utils";
import { myunzip } from "../components/utils/zip";
import { generateMatch } from "../components/utils/DVWFile";
import { initWithPSVBCompressedBuffer } from "../components/utils/PSVBFile";

function CodeMatch({ userEmail, match }) {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [playersA, setPlayersA] = useState([]);
  const [playersB, setPlayersB] = useState([]);
  const [selectedTeamA, setSelectedTeamA] = useState(null);
  const [selectedTeamB, setSelectedTeamB] = useState(null);
  const [sessionStats, setSessionStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingTeamA, setLoadingTeamA] = useState(true);
  const [loadingTeamB, setLoadingTeamB] = useState(true);
  const [isCoding, setIsCoding] = useState(false);
  const [, forceUpdate] = useState(0);
  const [formData, setFormData] = useState({
    guid: match?.guid ?? generateUUID(),
    appName: "VBLive",
    serverName: userEmail,
    sessionDate: null,
    sessionDateString: match?.sessionDateString ?? "",
    description: match?.description ?? "",
    isLive: null,
    liveVideoURL: null,
    liveVideoOffset: null,
    liveVideoStartTime: null,
    utcStartVideoTime: null,
    utcFirstPointTime: null,
    teamA: match?.teamA ?? "",
    teamB: match?.teamB ?? "",
    tournament: match?.tournament ?? "",
    scores: match?.scores ?? "",
    videoOnlineUrl: match?.videoOnlineUrl ?? "",
    videoOffset: match?.videoOffset ?? 0,
    videoStartTimeSeconds: match?.videoStartTimeSeconds ?? -1,
    shared: match?.shared ?? "",
    sessionDateTimeInSeconds: match?.sessionDateTimeInSeconds ?? 0,
    shareStatus: match?.shareStatus ?? "",
    shareUsers: match?.shareUsers ?? "",
    utcLastUpdate: match?.utcLastUpdate ?? null,
    oppPassing: match?.oppPassing ?? false,
    mbFollowsSetter: match?.mbFollowsSetter ?? false,
  });

  const {
    guid,
    appName,
    serverName,
    sessionDate,
    sessionDateString,
    description,
    isLive,
    liveVideoURL,
    liveVideoOffset,
    liveVideoStartTime,
    utcStartVideoTime,
    utcFirstPointTime,
    teamA,
    teamB,
    tournament,
    scores,
    videoOnlineUrl,
    videoOffset,
    videoStartTimeSeconds,
    shared,
    sessionDateTimeInSeconds,
    shareStatus,
    shareUsers,
    utcLastUpdate,
    oppPassing,
    mbFollowsSetter,
  } = formData;

  const cloneLineup = (lineup) => {
    return lineup.map((p) => {
      return {
        team: p.team,
        position: p.position,
        currentPosition: p.currentPosition,
        role1: p.role1,
        role2: p.role2,
        playerNumber: p.playerNumber,
        playerFirstName: p.playerFirstName,
        playerLastName: p.playerLastName,
      };
    });
  };

  const doCoding = () => {
    const rots = [0, 1, 6, 5, 4, 3, 2];
    const rotA = selectedTeamA.lineup.filter((p) => p.role1 === "S")[0];
    selectedTeamA.rotation = rots[parseInt(rotA.position)];
    selectedTeamA.currentLineup = cloneLineup(selectedTeamA.lineup);
    selectedTeamA.scores = 0;
    selectedTeamA.colour = selectedTeamA.colour ?? "lime";
    const rotB = selectedTeamB.lineup.filter((p) => p.role1 === "S")[0];
    selectedTeamB.rotation = rots[parseInt(rotB.position)];
    selectedTeamB.currentLineup = cloneLineup(selectedTeamB.lineup);
    selectedTeamB.scores = 0;
    selectedTeamB.colour = selectedTeamB.colour ?? "magenta";
    const st = {
      teamA: selectedTeamA,
      teamB: selectedTeamB,
      match: {
        teamA: selectedTeamA,
        teamB: selectedTeamB,
        matchDate: new Date(),
        scores: "0-0",
        sets: [],
      },
    };
    navigate("/codingpage", { state: st });
  };

  const doSave = async () => {
    const ret1 = await storeTeam(selectedTeamA);
    const ret2 = await storeTeam(selectedTeamB);
  };

  const doTeamSelected = (team, teamno) => {
    if (teamno === "A") {
      setSelectedTeamA(team);
    } else {
      setSelectedTeamB(team);
    }
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
  };

  const onMutate = (e) => {
    if (e.target.id === "teamA") {
      getTeamPlayers(e.target.value, "A");
    } else if (e.target.id === "teamB") {
      getTeamPlayers(e.target.value, "B");
    }
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

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
    isCoding,
  ]);

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
        },
        {
          position: "3",
          currentPosition: "3",
          role1: "MB2",
          role2: "OH1",
          playerNumber: "",
          playerFirstName: "",
          playerLastName: "",
        },
        {
          position: "2",
          currentPosition: "2",
          role1: "OH1",
          role2: "MB2",
          playerNumber: "",
          playerFirstName: "",
          playerLastName: "",
        },
        {
          position: "5",
          currentPosition: "5",
          role1: "OH2",
          role2: "MB1",
          playerNumber: "",
          playerFirstName: "",
          playerLastName: "",
        },
        {
          position: "6",
          currentPosition: "6",
          role1: "MB1",
          role2: "OH2",
          playerNumber: "",
          playerFirstName: "",
          playerLastName: "",
        },
        {
          position: "1",
          currentPosition: "1",
          role1: "S",
          role2: "S",
          playerNumber: "",
          playerFirstName: "",
          playerLastName: "",
        },
      ];
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
              <div className="flex gap-2">
                <button
                  className="btn-in-form"
                  onClick={() => doRotate(team, 1)}
                >
                  --Rotate
                </button>
                <button
                  className="btn-in-form"
                  onClick={() => doRotate(team, 0)}
                >
                  Rotate--
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
                      ? "bg-black/10 text-sm pb-0.5 cursor-pointer"
                      : "bg-black/5 text-sm pb-0.5 cursor-pointer"
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

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      {isCoding ? (
        <CodingPage teamA={selectedTeamA} teamB={selectedTeamB} />
      ) : (
        <div className="flex-col max-w-xl">
          <Lineup
            match={match}
            userEmail={userEmail}
            onTeamSelected={(t, tno) => doTeamSelected(t, tno)}
          />
          {/* <div className="flex gap-2">
            <div className="flex-col">
              <label
                htmlFor="teamA"
                className="block text-xs font-medium text-base-content pt-1.5"
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
                      value={teamA}
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
                className="block text-xs font-medium text-base-content pt-1.5"
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
                      value={teamB}
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
          </div> */}
          <div className="flex justify-end px-3 mt-10">
            <div className="flex gap-2">
              <button className="btn-in-form" onClick={() => doSave()}>
                Save
              </button>
              <button className="btn-in-form" onClick={() => doCoding()}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CodeMatch;
