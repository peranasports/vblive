import { useEffect, useState } from "react";
import { sortBy } from "lodash";
import { getMultiMatchesStatsItems } from "../utils/Utils";
import {
  addStatsItem,
  calculateAllStats,
  calculateSideoutStats,
  createStatsItem,
} from "../utils/StatsItem";

function Sideout({
  matches,
  team,
  selectedGame,
  selectedTeam,
  selectedRows,
  onRowSelected,
}) {
  const [rotSideouts, setRotSideouts] = useState(null);
  const [setSideouts, setSetSideouts] = useState(null);

  useEffect(() => {
    var sis = null;
    // if (matches.length === 0) {
    //   if (selectedGame === 0) {
    //     sis =
    //       selectedTeam === 0
    //         ? matches[0].teamA.statsItems[0]
    //         : matches[0].teamB.statsItems[0];
    //   } else {
    //     sis =
    //       selectedTeam === 0
    //         ? matches[0].sets[selectedGame - 1].teamAStatsItems[0]
    //         : matches[0].sets[selectedGame - 1].teamBStatsItems[0];
    //   }
    // } else if (matches.length > 1) {
    //   const allsis = getMultiMatchesStatsItems(matches, team, selectedTeam);
    //   sis = allsis[0];
    // }

    const allsis = getMultiMatchesStatsItems(matches, team, selectedTeam);
    sis = allsis[0];

    var rotsideouts = [];
    for (var nr = 1; nr < 7; nr++) {
      var rotsideout = {
        row: "Row " + nr.toString(),
        fbsideout:
          sis.SideOutFirstBalls[nr].toString() +
          " (" +
          sis.SideOutFirstBallPercent[nr].toFixed(0) +
          "%)",
        allsideout:
          sis.SideOuts[nr].toString() +
          " / " +
          (sis.SideOuts[nr] + sis.SideOutFails[nr]).toString() +
          " (" +
          sis.SideOutPercent[nr].toFixed(0) +
          "%)",
        allsideoutval: sis.SideOutPercent[nr],
      };
      rotsideouts.push(rotsideout);
    }
    nr = 0;
    var rotsideout = {
      row: "All Rows",
      fbsideout:
        sis.SideOutFirstBalls[nr].toString() +
        " (" +
        sis.SideOutFirstBallPercent[nr].toFixed(0) +
        "%)",
      allsideout:
        sis.SideOuts[nr].toString() +
        " / " +
        (sis.SideOuts[nr] + sis.SideOutFails[nr]).toString() +
        " (" +
        sis.SideOutPercent[nr].toFixed(0) +
        "%)",
      allsideoutval: sis.SideOutPercent[nr],
    };
    rotsideouts.push(rotsideout);
    setRotSideouts(rotsideouts);

    var setsideouts = [];
    var setobjs = {};
    var msis = createStatsItem(null, null);
    for (var match of matches) {
      for (var nd = 0; nd < match.sets.length; nd++) {
        var d = match.sets[nd];
        var xsis =
          selectedTeam === 0
            ? match.sets[nd].teamAStatsItems[0]
            : match.sets[nd].teamBStatsItems[0];
        var sisobj = setobjs[d.GameNumber];
        if (sisobj === undefined) {
          sisobj = createStatsItem(null, d);
          setobjs[d.GameNumber] = sisobj;
        }
        addStatsItem(xsis, sisobj);
        calculateAllStats(sisobj);
        addStatsItem(xsis, msis);
        calculateAllStats(msis);
      }
    }
    for (var key in setobjs) {
      var xmis = setobjs[key];
      var setsideout = {
        set: "Set " + key,
        fbsideout:
          xmis.SideOutFirstBalls[nr].toString() +
          " (" +
          xmis.SideOutFirstBallPercent[nr].toFixed(0) +
          "%)",
        allsideout:
          xmis.SideOuts[nr].toString() +
          " / " +
          (xmis.SideOuts[nr] + xmis.SideOutFails[nr]).toString() +
          " (" +
          xmis.SideOutPercent[nr].toFixed(0) +
          "%)",
        allsideoutval: xmis.SideOutPercent[nr],
      };
      setsideouts.push(setsideout);
    }
    //   var msis =
    //     selectedTeam === 0
    //       ? match.teamA.statsItems[0]
    //       : match.teamB.statsItems[0];
    nr = 0;
    var setsideout = {
      set: "Match",
      fbsideout:
        msis.SideOutFirstBalls[nr].toString() +
        " (" +
        msis.SideOutFirstBallPercent[nr].toFixed(0) +
        "%)",
      allsideout:
        msis.SideOuts[nr].toString() +
        " / " +
        (msis.SideOuts[nr] + msis.SideOutFails[nr]).toString() +
        " (" +
        msis.SideOutPercent[nr].toFixed(0) +
        "%)",
      allsideoutval: msis.SideOutPercent[nr],
    };
    setsideouts.push(setsideout);
    setSetSideouts(setsideouts);
  }, [selectedGame, selectedRows, selectedTeam, matches]);

  if (!matches) {
    return <></>;
  }

  if (setSideouts === null || rotSideouts === null) {
    return <></>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th>
                      {/* <label>
                                                <input type="checkbox" className="checkbox" />
                                            </label> */}
                    </th>
                    <th
                      scope="col"
                      className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Rotation
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                    >
                      First Ball Sideouts
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                    >
                      All Sideouts
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {rotSideouts.map((rotsideout, row) => (
                    <tr
                      key={row}
                      className={row % 2 === 0 ? undefined : "bg-gray-100"}
                    >
                      <th>
                        {row === 6 ? (
                          <label></label>
                        ) : (
                          <label>
                            <input
                              type="checkbox"
                              className="checkbox"
                              defaultChecked={
                                selectedRows.indexOf(row + 1) !== -1
                              }
                              onClick={() => onRowSelected(row + 1)}
                            />
                          </label>
                        )}
                      </th>
                      <td className="whitespace-nowrap py-2.5 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {rotsideout.row}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">
                        {rotsideout.fbsideout}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">
                        {rotsideout.allsideout}
                      </td>
                      <td>
                        <div
                          className="radial-progress w-6 h-6 bg-primary text-primary-content border-4 border-primary"
                          style={{
                            "--value": rotsideout.allsideoutval,
                            "--size": "4rem",
                            "--thickness": "4px",
                          }}
                        ></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Set
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                    >
                      First Ball Sideouts
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                    >
                      All Sideouts
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                    ></th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {setSideouts.map((setsideout, row) => (
                    <tr
                      key={row}
                      className={row % 2 === 0 ? undefined : "bg-gray-100"}
                    >
                      <td className="whitespace-nowrap py-2.5 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {setsideout.set}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">
                        {setsideout.fbsideout}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">
                        {setsideout.allsideout}
                      </td>
                      <td>
                        <div
                          className="radial-progress w-6 h-6 bg-primary text-primary-content border-4 border-primary"
                          style={{
                            "--value": setsideout.allsideoutval,
                            "--size": "4rem",
                            "--thickness": "4px",
                          }}
                        ></div>
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

export default Sideout;
