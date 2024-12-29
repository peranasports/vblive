import { useEffect, useState } from "react";
import { sortBy } from "lodash";
import {
  addStatsItem,
  calculateAllStats,
  createStatsItem,
  hasStats,
} from "../utils/StatsItem";

function BoxScore({ matches, team, selectedGame, selectedTeam }) {
  const [loading, setLoading] = useState(false);
  const [shortHeader, setShortHeader] = useState(true);
  const [statsItems, setStatsItems] = useState([]);
  const [filteredStatsItems, setFilteredStatsItems] = useState([]);
  const [showAllPlayers, setShowAllPlayers] = useState(false);

  useEffect(() => {
    if (matches && matches.length === 1) {
      var sis = null;
      if (selectedGame === 0) {
        sis =
          selectedTeam === 0
            ? matches[0].teamA.statsItems
            : matches[0].teamB.statsItems;
      } else {
        sis =
          selectedTeam === 0
            ? matches[0].sets[selectedGame - 1].teamAStatsItems
            : matches[0].sets[selectedGame - 1].teamBStatsItems;
      }
      if (showAllPlayers) {
        setStatsItems(sis);
      } else {
        setStatsItems(sis.filter((si) => hasStats(si)));
      }
    } else if (matches && matches.length > 1) {
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
            const plkey = si.player
              ? si.player.FirstName + "_" + si.player.LastName
              : si.Name;
            let plobj = st.teamAStatsItems[plkey];
            if (plobj === undefined) {
              plobj = createStatsItem(si.player, s);
              st.teamAStatsItems[plkey] = plobj;
            }
            addStatsItem(si, plobj);
            calculateAllStats(plobj);
          }
          for (var si of awayteamsi) {
            const plkey = si.player
              ? si.player.FirstName + "_" + si.player.LastName
              : si.Name;
            let plobj = st.teamBStatsItems[plkey];
            if (plobj === undefined) {
              plobj = createStatsItem(si.player, s);
              st.teamBStatsItems[plkey] = plobj;
            }
            addStatsItem(si, plobj);
            calculateAllStats(plobj);
          }
        }
      }
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
      if (showAllPlayers) {
        setStatsItems(sis);
      } else {
        setStatsItems(sis.filter((si) => hasStats(si)));
      }
    }
  }, [selectedGame, selectedTeam, showAllPlayers]);

  // if (loading) {
  //     return <Spinner />
  // }

  if (!matches) {
    return <></>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => {
                setShortHeader(!shortHeader);
              }}
              className="btn-in-form my-1"
            >
              {shortHeader ? "Show Full Headers" : "Show Short Headers"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAllPlayers(!showAllPlayers);
              }}
              className="ml-2 btn-in-form my-1"
            >
              {showAllPlayers ? "Show Less Players" : "Show All Players"}
            </button>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="table-generic">
                <thead className="thead-generic">
                  {shortHeader ? (
                    <tr>
                      <th
                        scope="col"
                        className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-base-content sm:pl-6"
                      >
                        Player
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        K
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        E
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        TA
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        HE
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        SA
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        SE
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        PE
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        %PP
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        PAVE
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        TP
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        ASS
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        DIG
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        DE
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        DAVE
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        BS
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        BA
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        BE
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        PTS
                      </th>
                    </tr>
                  ) : (
                    <tr>
                      <th
                        scope="col"
                        className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-base-content sm:pl-6"
                      >
                        Player
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        Attack Kills
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        Attack Errors
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        Total Attempts
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        Hitting Efficiency
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        Serve Aces
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        Serve Errors
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        Pass Errors
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        % Perfect Passes
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        Passing Average
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        Total Passes
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        Set Assists
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        Digs
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        Dig Errors
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        Dig Average
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        Block Solos
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        Block Assists
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        Block Errors
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      >
                        Points Scored
                      </th>
                    </tr>
                  )}
                </thead>
                <tbody className="tbody-generic">
                  {sortBy(statsItems, "ShirtNumber").map((statsItem, i) => (
                    <tr
                      key={statsItem.Guid}
                      className={i % 2 === 0 ? "bg-transparent" : "bg-base-300/10"}
                    >
                      <td className="whitespace-nowrap py-2.5 pl-4 pr-3 text-sm font-medium text-base-content sm:pl-6">
                        {statsItem.player !== null
                          ? statsItem.player.shirtNumber +
                            ". " +
                            statsItem.player.NickName.toUpperCase()
                          : "TEAM"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-base-content">
                        {statsItem.Spike3}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-base-content">
                        {statsItem.Spike0}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-base-content">
                        {statsItem.SpikeTotal}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-base-content">
                        {statsItem.SpikeEfficiency != -3
                          ? statsItem.SpikeEfficiencyString
                          : ""}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-base-content">
                        {statsItem.Serve3}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-base-content">
                        {statsItem.Serve0}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-base-content">
                        {statsItem.Pass0}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-base-content">
                        {statsItem.PassTotal === 0
                          ? ""
                          : statsItem.PassPercentPerfect.toFixed(0)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-base-content">
                        {statsItem.PassAverageString}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-base-content">
                        {statsItem.PassTotal}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-base-content">
                        {statsItem.Set3}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-base-content">
                        {statsItem.GoodDigs}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-base-content">
                        {statsItem.Dig0}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-base-content">
                        {statsItem.DigAverageString}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-base-content">
                        {statsItem.BlckSolo}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-base-content">
                        {statsItem.BlckAssist}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-base-content">
                        {statsItem.Blck0}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-base-content">
                        {statsItem.PointsWon}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoxScore;
