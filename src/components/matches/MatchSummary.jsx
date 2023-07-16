import { useState } from 'react'
import { sortBy } from 'lodash'
import Moment from 'moment'

function MatchSummary({ match, gameSelected, onGameSelected, teamSelected, onTeamSelected }) {
    const [currentGame, setCurrentGame] = useState(0)
    const [currentTeam, setCurrentTeam] = useState(0)
    const doSelectGame = (sgn) => {
        setCurrentGame(sgn)
        onGameSelected(sgn)
    }
    const doSelectTeam = (tmn) => {
        setCurrentTeam(tmn)
        onTeamSelected(tmn)
    }

    return match && (
        <div className="flex-auto mb-4 tabs-boxed">
            <a className={teamSelected === 0 ? "tab text-xl text-primary font-medium tab-active" : "tab text-xl font-medium"} 
                onClick={() => doSelectTeam(0)}
            >
                {match.teamA.Name.toUpperCase()}
            </a>
            <a>  vs  </a>
            <a className={teamSelected === 1 ? "tab text-xl text-primary font-medium tab-active" : "tab text-xl font-medium"} 
                onClick={() => doSelectTeam(1)}
            >
                {match.teamB.Name.toUpperCase()}
            </a>
            <p className="ml-4 my-1 text-sm text-base-700">
                {Moment(match.TrainingDate).format('DD-MMM-yyyy')} - {match.tournamentName}
            </p>
            <div className="ml-2 tabs tabs-boxed">
                <a className={gameSelected == 0 ? "tab tab-active" : "tab"}
                    onClick={() => {
                        doSelectGame(0)
                    }}
                >
                    Match</a>
                {sortBy(match.sets, 'GameNumber').map((game, i) => (
                    <a
                        className={gameSelected === game.GameNumber ? "tab tab-active" : "tab"}
                        key={game.GameNumber}
                        onClick={() => {
                            doSelectGame(game.GameNumber)
                        }}
                    >
                        {game.HomeScore} - {game.AwayScore}
                    </a>
                ))}
            </div>
        </div>
    )
}

export default MatchSummary