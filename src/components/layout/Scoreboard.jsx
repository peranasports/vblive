import React, { useEffect } from "react";

function Scoreboard({ match }) {
  useEffect(() => {
    // console.log(match);
  }, [match.scores]);

  return (
    <>
      <div className="flex-col">
        <div className="flex gap-2">
          <div className="w-32 px-1 pt-0.5 text-xs font-bold text-base-content">
            {match.teamA.name.toUpperCase()}
          </div>
          <div className="w-10 px-1 pt-0.5 text-xs font-medium text-base-content">
            {match.sets.map((set, index) => (
              <span
                key={index}
                className="text-xs font-medium text-base-content ml-2"
              >
                {set.teamAScores}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
        <div className="w-32 px-1 pt-0.5 text-xs font-bold text-base-content">
            {match.teamB.name.toUpperCase()}
          </div>
          <div className="w-10 px-1 pt-0.5 text-xs font-medium text-base-content">
            {match.sets.map((set, index) => (
              <span
                key={index}
                className="text-xs font-medium text-base-content ml-2"
              >
                {set.teamBScores}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Scoreboard;
