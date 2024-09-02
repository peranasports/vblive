import { useState } from "react";
import { sortBy } from "lodash";
import Moment from "moment";

function MatchSummary({
  matches,
  team,
  gameSelected,
  onGameSelected,
  teamSelected,
  onTeamSelected,
  onSaveToDatabase,
}) {
  const [currentGame, setCurrentGame] = useState(0);
  const [currentTeam, setCurrentTeam] = useState(0);
  const doSelectGame = (sgn) => {
    setCurrentGame(sgn);
    onGameSelected(sgn);
  };
  const doSelectTeam = (tmn) => {
    setCurrentTeam(tmn);
    onTeamSelected(tmn);
  };

  return (
    matches && (
      <div className="flex-auto tabs-boxed rounded-none">
        <div className="flex justify-between">
          <div className="flex gap-2">
            <button
              className={
                teamSelected === 0
                  ? "btn btn-sm text-xl btn-primary rounded-none font-medium"
                  : "btn btn-sm bg-base-300 text-base-content text-xl font-medium rounded-none"
              }
              onClick={() => doSelectTeam(0)}
            >
              {team.toUpperCase()}
            </button>
            <div className="text-xl"> vs </div>
            <button
              className={
                teamSelected === 1
                  ? "btn btn-sm text-xl btn-primary rounded-none font-medium"
                  : "btn btn-sm bg-base-300 text-base-content text-xl font-medium rounded-none"
              }
              onClick={() => doSelectTeam(1)}
            >
              {matches.length === 1
                ? matches[0].teamB.Name.toUpperCase()
                : "OPPONENTS (" + matches.length + ")"}
            </button>
          </div>
          <button
            className="btn btn-sm btn-primary rounded-none"
            onClick={() => onSaveToDatabase()}
          >
            Save to Database
          </button>
        </div>
        {matches.length === 1 ? (
          <p className="ml-4 my-1 text-sm text-base-700">
            {Moment(matches[0].TrainingDate).format("DD-MMM-yyyy")} -{" "}
            {matches[0].tournamentName}
          </p>
        ) : (
          <></>
        )}
        {matches.length === 1 ? (
          <div className="ml-2 tabs tabs-boxed rounded-none">
            <a
              className={gameSelected == 0 ? "tab tab-active rounded-none" : "tab rounded-none"}
              onClick={() => {
                doSelectGame(0);
              }}
            >
              Match
            </a>
            {sortBy(matches[0].sets, "GameNumber").map((game, i) => (
              <a
                className={
                  gameSelected === game.GameNumber ? "tab tab-active rounded-none" : "tab rounded-none"
                }
                key={game.GameNumber}
                onClick={() => {
                  doSelectGame(game.GameNumber);
                }}
              >
                {game.HomeScore} - {game.AwayScore}
              </a>
            ))}
          </div>
        ) : (
          <></>
        )}
      </div>
    )
  );
}

export default MatchSummary;
