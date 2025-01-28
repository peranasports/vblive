import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import SummaryCharts from "./SummaryCharts";

function Summary({ matches, team, selectedGame, selectedTeam }) {
  const [displayScreen, setDisplayScreen] = useState(0);

  const toggleScreen = () => {
    const ds = displayScreen === 0 ? 1 : 0;
    setDisplayScreen(ds);
  };

  useEffect(() => {}, []);
  

  return (
    <>
      <div className="flex-col">
        <div className="">
          {matches.length === 1 ? (
            <button className="btn-in-form" onClick={() => toggleScreen()}>
              {displayScreen === 0 ? "Show Charts" : "Show Dashboard"}
            </button>
          ) : (
            <></>
          )}
        </div>
        <div className="">
          {displayScreen === 1 ? (
            <SummaryCharts match={matches[0]}/>
          ) : (
            <Dashboard
              matches={matches}
              team={team}
              selectedGame={selectedGame}
              selectedTeam={selectedTeam}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default Summary;
