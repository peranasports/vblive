import Sideout from "./Sideout";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { sortBy } from "lodash";
import {
  addStatsItem,
  calculateAllStats,
  createStatsItem,
} from "../utils/StatsItem";
import { getMultiMatchesStatsItems } from "../utils/Utils";
import { WidthProvider, Responsive } from "react-grid-layout";
import SideoutChart from "./SideoutChart";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

function SideoutReport({
  matches,
  team,
  selectedGame,
  onGameSelected,
  selectedTeam,
  onTeamSelected,
}) {
  const [sideoutData, setSideoutData] = useState(null);
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedRows, setSelectedRows] = useState([1, 2, 3, 4, 5, 6]);
  const [rowString, setRowString] = useState("ALL ROWS");
  const COLORS = [
    "#27ae60",
    "#e67e22",
    "#3498db",
    "#8e44ad",
    "#f1c40f",
    "#c0392b",
  ];

  const layouts = {
    className: "layout",
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    rowHeight: 30,
  };

  useEffect(() => {
    var sis = null;
    if (matches.length === 1) {
      if (selectedGame === 0) {
        sis =
          selectedTeam === 0
            ? matches[0].teamA.statsItems[0]
            : matches[0].teamB.statsItems[0];
      } else {
        sis =
          selectedTeam === 0
            ? matches[0].sets[selectedGame - 1].teamAStatsItems[0]
            : matches[0].sets[selectedGame - 1].teamBStatsItems[0];
      }
    } else if (matches.length > 1) {
      const allsis = getMultiMatchesStatsItems(matches, team, selectedTeam);
      sis = allsis[0];
    } else {
      const allsis = getMultiMatchesStatsItems(matches, team, selectedTeam);
      sis = allsis[0];
    }
    var fbkills = 0;
    var fboppserveerrors = 0;
    var fbopperrors = 0;
    var kills = 0;
    var opperrors = 0;
    var fails = 0;
    var sss = selectedRows.length > 1 ? "ROWS " : "ROW ";
    var ssr = sortBy(selectedRows);

    var ssr = selectedRows.sort(function (a, b) {
      return a - b;
    });

    for (var nsr = 0; nsr < ssr.length; nsr++) {
      if (nsr > 0) {
        sss += ", ";
      }
      sss += selectedRows[nsr].toString();
      fbkills += sis.SideOutFirstBallKills[selectedRows[nsr]];
      fboppserveerrors += sis.SideOutFirstBallOppServeError[selectedRows[nsr]];
      fbopperrors += sis.SideOutFirstBallOppErrors[selectedRows[nsr]];
      kills += sis.SideOutKills[selectedRows[nsr]];
      opperrors += sis.SideOutOppErrors[selectedRows[nsr]];
      fails += sis.SideOutFails[selectedRows[nsr]];
    }
    setRowString(selectedRows.length === 6 ? "ALL ROWS" : sss);
    var sodata = [];
    sodata.push({ colour: COLORS[0], name: "FB Kills", value: fbkills });
    sodata.push({
      colour: COLORS[1],
      name: "Opp. Serve Errors",
      value: fboppserveerrors,
    });
    sodata.push({
      colour: COLORS[2],
      name: "FB Opp. Errors",
      value: fbopperrors,
    });
    sodata.push({ colour: COLORS[3], name: "Kills/Blocks", value: kills });
    sodata.push({ colour: COLORS[4], name: "Opp. Errors", value: opperrors });
    sodata.push({ colour: COLORS[5], name: "Unsuccessful", value: fails });
    setSideoutData(sodata);
  }, [selectedGame, selectedTeam, selectedRows, selectedRow]);

  useEffect(() => {
    // console.log("SideoutReport useEffect", sideoutData);
  }, [sideoutData]);

  if (sideoutData === null) {
    return <></>;
  }

  const doSelectRow = (row) => {
    if (row == 7) {
      setSelectedRows([1, 2, 3, 4, 5, 6]);
    } else {
      var srs = selectedRows;
      var index = srs.indexOf(row);
      if (index === -1) {
        srs.push(row);
      } else {
        srs.splice(index, 1);
      }
      setSelectedRows(srs);
    }
    setSelectedRow(!selectedRow);
  };

  const teamname = () => {
    if (matches.length === 0) {
      return selectedTeam === 0
        ? team.toUpperCase()
        : matches[0].teamB.Name.toUpperCase();
    } else if (matches.length > 1) {
      return selectedTeam === 0
        ? team.toUpperCase()
        : "OPPONENTS (" + matches.length + ")";
    }
    return "";
  };

  return (
    <>
      <div className="bg-base-100">
        <ResponsiveReactGridLayout
          className="layout"
          // cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={30}
          // layouts={layouts}
          // onLayoutChange={(layout, layouts) =>
          //   this.onLayoutChange(layout, layouts)
          // }
        >
          <div
            key="1"
            data-grid={{
              w: 2,
              h: 14,
              x: 0,
              y: 0,
              static: true,
              minW: 2,
              minH: 3,
            }}
          >
            <SideoutChart
              sideoutData={sideoutData}
              rowString={rowString}
              selectedGame={selectedGame}
            />
          </div>
          <div
            className="bg-base-100"
            key="2"
            data-grid={{
              w: 8,
              h: 16,
              x: 4,
              y: 0,
              static: true,
              minW: 2,
              minH: 3,
            }}
          >
            <Sideout
              matches={matches}
              team={team}
              selectedGame={selectedGame}
              selectedTeam={selectedTeam}
              selectedRows={selectedRows}
              onRowSelected={(row) => doSelectRow(row)}
            />
          </div>
        </ResponsiveReactGridLayout>
      </div>
    </>
  );

  // return (
  //   <div>
  //     <div className="drawer drawer-mobile">
  //       <input id="my-drawer-5" type="checkbox" className="drawer-toggle" />
  //       <div className="drawer-content">
  //         <div className="flex space-x-2 justify-end"></div>
  //         <div className="h-full">
  //           <p className="mt-3"></p>
  //           <p className="text-3xl font-bold">{teamname}</p>
  //           <Sideout
  //             matches={matches}
  //             team={team}
  //             selectedGame={selectedGame}
  //             selectedTeam={selectedTeam}
  //             selectedRows={selectedRows}
  //             onRowSelected={(row) => doSelectRow(row)}
  //           />
  //         </div>
  //       </div>
  //       <div className="drawer-side w-80">
  //         <label htmlFor="my-drawer-5" className="drawer-overlay"></label>
  //         <div className="h-80">
  //           <p className="mt-3"></p>
  //           <p className="text-3xl font-bold">
  //             {selectedGame === 0 ? "MATCH" : "SET " + selectedGame}
  //           </p>
  //           <p className="text-xl font-bold">{rowString}</p>
  //           <ResponsiveContainer width="100%" height="85%">
  //             <PieChart width={400} height={400}>
  //               <Pie
  //                 data={sideoutData}
  //                 isAnimationActive={false}
  //                 cx="50%"
  //                 cy="50%"
  //                 labelLine={false}
  //                 label
  //                 outerRadius={100}
  //                 fill="#8884d8"
  //                 dataKey="value"
  //               >
  //                 {sideoutData.map((entry, index) => (
  //                   <Cell
  //                     key={`cell-${index}`}
  //                     fill={COLORS[index % COLORS.length]}
  //                   />
  //                 ))}
  //               </Pie>
  //               <Tooltip />
  //             </PieChart>
  //           </ResponsiveContainer>
  //           <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
  //             <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
  //               <table className="min-w-full divide-y divide-gray-300">
  //                 <tbody className="bg-white">
  //                   {sideoutData.map((sod, row) => (
  //                     <tr key={row}>
  //                       <td
  //                         style={{ backgroundColor: sod.colour }}
  //                         className={`whitespace-nowrap py-1 pl-4 pr-3 text-sm text-white font-medium sm:pl-6`}
  //                       >
  //                         {sod.name}
  //                       </td>
  //                       <td
  //                         style={{ backgroundColor: sod.colour }}
  //                         className="whitespace-nowrap px-3 py-1 bg-[${sod.colour}] text-sm text-white"
  //                       >
  //                         {sod.value}
  //                       </td>
  //                     </tr>
  //                   ))}
  //                 </tbody>
  //               </table>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
}

export default SideoutReport;
