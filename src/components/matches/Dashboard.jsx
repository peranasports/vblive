// import { CalendarIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { useState, useEffect } from "react";
import { sortBy } from "lodash";
import { ReactComponent as Spiking001 } from "../assets/spiking_001.svg";
import { ReactComponent as Passing001 } from "../assets/passing_001.svg";
import {
  addStatsItem,
  calculateAllStats,
  createStatsItem,
} from "../utils/StatsItem";

export default function Dashboard({
  matches,
  team,
  selectedGame,
  selectedTeam,
}) {
  const [categoryLeaders, setCategoryLeaders] = useState(null);
  const [stats, setStats] = useState(null);
  // const [match, setMatch] = useState(null);

  const sortCategoryLeaders = (match) => {
    if (!match) {
      return;
    }
    var sis =
      selectedGame === 0
        ? selectedTeam === 0
          ? match.teamA.statsItems
          : match.teamB.statsItems
        : selectedTeam === 0
        ? match.sets[selectedGame - 1].teamAStatsItems
        : match.sets[selectedGame - 1].teamBStatsItems;
    doSortCategoryLeaders(sis);
  };

  const doSortCategoryLeaders = (sis) => {
    var catleaders = [];
    var bestPassers = sortBy(sis, "PassAverage").reverse();
    var bestHitters = sortBy(sis, "SpikeEfficiency").reverse();
    var bestBlockers = sortBy(sis, "BlockPoints").reverse();
    var bestServers = sortBy(sis, "GoodServePercent").reverse();
    var bestBreakPoints = sortBy(sis, "pointPercent").reverse();

    var passers = {};
    passers.id = 1;
    passers.title = "Best Passers";
    passers.players = [];
    for (var si of bestPassers.filter((obj) => obj.PassTotal > 3)) {
      // var si = bestPassers[np];
      if (si.player == null) {
        passers.teamStats = si;
        continue;
      }
      var player = {};
      player.id = si.player.Guid;
      player.name =
        si.player.FirstName.substr(0, 1) + ". " + si.player.LastName;
      player.imageData = si.player.thumbnailData;
      player.stats = si.PassAverageString;
      passers.players.push(player);
    }
    catleaders.push(passers);

    var hitters = {};
    hitters.id = 2;
    hitters.title = "Best Hitters";
    hitters.players = [];
    for (var si of bestHitters.filter((obj) => obj.SpikeTotal > 3)) {
      if (si.player == null) {
        hitters.teamStats = si;
        continue;
      }
      var player = {};
      player.id = si.player.Guid;
      player.name =
        si.player.FirstName.substr(0, 1) + ". " + si.player.LastName;
      player.imageData = si.player.thumbnailData;
      player.stats = si.SpikeEfficiencyString;
      hitters.players.push(player);
    }
    catleaders.push(hitters);

    var blockers = {};
    blockers.id = 3;
    blockers.title = "Best Blockers";
    blockers.players = [];
    for (var np = 0; np < bestBlockers.length; np++) {
      var si = bestBlockers[np];
      if (si.player == null) {
        blockers.teamStats = si;
        continue;
      }
      var player = {};
      player.id = si.player.Guid;
      player.name =
        si.player.FirstName.substr(0, 1) + ". " + si.player.LastName;
      player.imageData = si.player.thumbnailData;
      player.stats = si.BlockPoints === 0 ? "" : si.BlockPoints.toString();
      blockers.players.push(player);
    }
    catleaders.push(blockers);

    var servers = {};
    servers.id = 4;
    servers.title = "Best Servers";
    servers.players = [];
    for (var si of bestServers.filter((obj) => obj.ServeTotal > 3)) {
      if (si.player == null) {
        servers.teamStats = si;
        continue;
      }
      var player = {};
      player.id = si.player.Guid;
      player.name =
        si.player.FirstName.substr(0, 1) + ". " + si.player.LastName;
      player.imageData = si.player.thumbnailData;
      player.stats = si.GoodServe === 0 ? "" : si.GoodServePercent;
      servers.players.push(player);
    }
    catleaders.push(servers);

    var pointers = {};
    pointers.id = 4;
    pointers.title = "Best Break Pointers";
    pointers.players = [];
    for (var np = 0; np < bestBreakPoints.length; np++) {
      var si = bestBreakPoints[np];
      if (si.player == null) {
        pointers.teamStats = si;
        continue;
      }
      var player = {};
      player.id = si.player.Guid;
      player.name =
        si.player.FirstName.substr(0, 1) + ". " + si.player.LastName;
      player.imageData = si.player.thumbnailData;
      player.stats = si.pointPercent;
      pointers.players.push(player);
    }
    catleaders.push(pointers);

    setCategoryLeaders(catleaders);
  };

  const doInit = () => {
    if (matches.length === 1) {
      sortCategoryLeaders(matches[0]);
      // setMatch(matches[0]);
    } else if (matches.length > 1) {
      var st = {
        teamAStatsItems: {},
        teamBStatsItems: {},
      };
      for (var m of matches) {
        for (var s of m.sets) {
          const hometeamsi =
            m.teamA.Name === team ? s.teamAStatsItems : s.teamBStatsItems;
          const awayteamsi =
            m.teamA.Name === team ? s.teamBStatsItems : s.teamAStatsItems;
          for (var si of hometeamsi) {
            const plkey = si.player ? si.player.FirstName + "_" + si.player.LastName : si.Name;
            let plobj =
              st.teamAStatsItems[plkey];
            if (plobj === undefined) {
              plobj = createStatsItem(si.player, s);
              st.teamAStatsItems[plkey] = plobj;
            }
            addStatsItem(si, plobj);
            calculateAllStats(plobj);
          }
          for (var si of awayteamsi) {
            const plkey = si.player ? si.player.FirstName + "_" + si.player.LastName : si.Name;
            let plobj =
              st.teamBStatsItems[plkey];
            if (plobj === undefined) {
              plobj = createStatsItem(si.player, s);
              st.teamBStatsItems[plkey] = plobj;
            }
            addStatsItem(si, plobj);
            calculateAllStats(plobj);
          }
        }
      }

      setStats(st);
      var sis = [];
      if (selectedTeam === 0) {
        for (var key in st.teamAStatsItems) {
          sis.push(st.teamAStatsItems[key]);
        }
      } else {
        for (var key in st.teamBStatsItems) {
          sis.push(st.teamBStatsItems[key]);
        }
      }
      doSortCategoryLeaders(sis);
    }
  };

  useEffect(() => {
    if (matches) {
      doInit();
      // sortCategoryLeaders();
    }
  }, [matches, selectedGame, selectedTeam]);

  if (categoryLeaders === null) {
    return <></>;
  }

  return (
    <>
      <div className="stats stats-vertical shadow mt-4">
        <div className="stat">
          <div className="flex stat-figure text-lime-500 justify-between">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current mb-2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
              />
            </svg>
          </div>
          <div className="stat-title">Passing Average</div>
          <div className="stat-value text-lime-500">
            {categoryLeaders[0].teamStats && categoryLeaders[0].teamStats.PassAverageString}
          </div>
          <ul>
            {categoryLeaders[0].players
              .slice(0, 2)
              .filter((obj) => obj.stats !== "")
              .map((player) => (
                <li
                  className="flex stat-desc text-current justify-between"
                  key={player.id}
                >
                  <div>{player.name}</div>
                  <div>{player.stats}</div>
                </li>
              ))}
          </ul>
        </div>

        <div className="stat">
          <div className="flex stat-figure text-fuchsia-600 justify-between">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current mb-2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
              />
            </svg>
          </div>
          <div className="stat-title">Block Kills</div>
          <div className="stat-value text-fuchsia-600">
            {categoryLeaders[2].teamStats && categoryLeaders[2].teamStats.BlockPoints}
          </div>
          {categoryLeaders[2].players
            .slice(0, 2)
            .filter((obj) => obj.stats !== "")
            .map((player) => (
              <li
                className="flex stat-desc text-current justify-between"
                key={player.id}
              >
                <div>{player.name}</div>
                <div>{player.stats}</div>
              </li>
            ))}
        </div>

        <div className="stat">
          <div className="flex stat-figure text-orange-600 justify-between">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current mb-2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
              />
            </svg>
          </div>
          <div className="stat-title">Side Out Percentage</div>
          <div className="stat-value text-orange-600">
            {categoryLeaders[0].teamStats && categoryLeaders[0].teamStats.SideOutPercent[0].toFixed(0)}%
          </div>
          <div className="stat-desc text-current">
            All First Ball{" "}
            {categoryLeaders[0].teamStats && categoryLeaders[0].teamStats && categoryLeaders[0].teamStats.SideOutFirstBallPercent[0].toFixed(0)}
            %
          </div>
          <div className="stat-desc text-current">
            First Ball Kills{" "}
            {categoryLeaders[0].teamStats && categoryLeaders[0].teamStats.SideOutFirstBallKillPercent[0].toFixed(
              0
            )}
            %
          </div>
        </div>
      </div>

      <div className="stats stats-vertical shadow mt-4">
        <div className="stat">
          <div className="flex stat-figure text-secondary justify-between">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current mb-2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
              />
            </svg>
          </div>
          <div className="stat-title">Hitting Efficiency</div>
          <div className="stat-value text-secondary">
            {categoryLeaders[1].teamStats && categoryLeaders[1].teamStats.SpikeEfficiencyString}
          </div>
          <ul>
            {categoryLeaders[1].players
              .slice(0, 2)
              .filter((obj) => obj.stats !== "")
              .map((player) => (
                <li
                  className="flex stat-desc text-current justify-between"
                  key={player.id}
                >
                  <div>{player.name}</div>
                  <div>{player.stats}</div>
                </li>
              ))}
          </ul>
        </div>

        <div className="stat">
          <div className="flex stat-figure text-teal-400 justify-between">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current mb-2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
              />
            </svg>
          </div>
          <div className="stat-title">Good Serve</div>
          <div className="stat-value text-teal-400">
            {categoryLeaders[3].teamStats && categoryLeaders[3].teamStats.GoodServePercent.toFixed(0)}%
          </div>
          <ul>
            {categoryLeaders[3].players
              .slice(0, 2)
              .filter((obj) => obj.stats !== "")
              .map((player) => (
                <li
                  className="flex stat-desc text-current justify-between"
                  key={player.id}
                >
                  <div>{player.name}</div>
                  <div>{player.stats.toFixed(0)}%</div>
                </li>
              ))}
          </ul>
        </div>

        <div className="stat">
          <div className="stat-figure text-amber-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current mb-2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M11.412 15.655L9.75 21.75l3.745-4.012M9.257 13.5H3.75l2.659-2.849m2.048-2.194L14.25 2.25 12 10.5h8.25l-4.707 5.043M8.457 8.457L3 3m5.457 5.457l7.086 7.086m0 0L21 21"
              />
            </svg>
          </div>
          <div className="stat-title">Break Points</div>
          <div className="stat-value text-amber-400">
            {categoryLeaders[0].teamStats && categoryLeaders[0].teamStats.pointPercent.toFixed(0)}%
          </div>
          <ul>
            {categoryLeaders[4].players.slice(0, 2).map((player) => (
              <li
                className="flex stat-desc text-current justify-between"
                key={player.id}
              >
                <div>.{/* {player.name} */}</div>
                <div>{/* {player.stats}% */}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
