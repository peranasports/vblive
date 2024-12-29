import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

function SideoutChart({ sideoutData, selectedGame }) {
  const [rowString, setRowString] = useState("ALL ROWS");
  const COLORS = [
    "#27ae60",
    "#e67e22",
    "#3498db",
    "#8e44ad",
    "#f1c40f",
    "#c0392b",
  ];

  return (
    <>
      <div className="h-80 w-80 bg-base-100">
        <p className="mt-3"></p>
        <p className="text-lg font-bold">
          {selectedGame === 0 ? "MATCH" : "SET " + selectedGame}
        </p>
        <p className="text-lg font-bold">{rowString}</p>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart width={400} height={400}>
            <Pie
              data={sideoutData}
              isAnimationActive={false}
              cx="50%"
              cy="50%"
              labelLine={false}
              label
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {sideoutData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8 bg-base-100">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <tbody className="bg-base-100">
                {sideoutData.map((sod, row) => (
                  <tr key={row}>
                    <td
                      style={{ backgroundColor: sod.colour }}
                      className={`whitespace-nowrap py-1 pl-4 pr-3 text-sm text-white font-medium sm:pl-6`}
                    >
                      {sod.name}
                    </td>
                    <td
                      style={{ backgroundColor: sod.colour }}
                      className="whitespace-nowrap px-3 py-1 bg-[${sod.colour}] text-sm text-white"
                    >
                      {sod.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default SideoutChart;
