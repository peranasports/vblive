import { useEffect, useContext, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Spinner from '../components/layout/Spinner'
import BoxScore from '../components/matches/BoxScore'
import Sideout from '../components/matches/Sideout'
import Dashboard from '../components/matches/Dashboard'
import MatchSummary from '../components/matches/MatchSummary'
import VBLiveAPIContext from '../context/VBLiveAPI/VBLiveAPIContext'
import { getSession, getLatestStats } from '../context/VBLiveAPI/VBLiveAPIAction'
import { initWithPSVBCompressedBuffer, parseLatestPSVBStats, calculatePSVBStats } from '../components/utils/PSVBFile'
import { initWithDVWCompressedBuffer, parseLatestDVWStats, calculateDVWStats} from '../components/utils/DVWFile'
import { calculateSideoutStats } from '../components/utils/StatsItem'
import SideoutReport from '../components/matches/SideoutReport'
import AttackZones from '../components/matches/AttackZones'
import HittingChartReport from '../components/matches/HittingChartReport'

function Session() {
    const { session, appName, loading, dispatch } = useContext(VBLiveAPIContext)
    const params = useParams()
    const [match, setMatch] = useState(null)
    const [latest, setLatest] = useState(null)
    const [selectedGame, setSelectedGame] = useState(0)
    const [selectedTeam, setSelectedTeam] = useState(0)
    const [currentReport, setCurrentReport] = useState(0)
    const [counter, setCounter] = useState(0)

    const getLatest = useCallback(async () => {
        dispatch({ type: 'SET_LOADING' })

        const sessionData = await getSession(params.sessionId)
        dispatch({ type: 'GET_SESSION', payload: sessionData })
        console.log('appName', appName)
        var m = appName === 'VBStats' ? initWithPSVBCompressedBuffer(sessionData.stats) : initWithDVWCompressedBuffer(sessionData.stats)

        const latestData = await getLatestStats(params.sessionId, 0)
        dispatch({ type: 'GET_LATEST', payload: latestData })
        setLatest(latestData)
        var mx = appName === 'VBStats' ? parseLatestPSVBStats(latestData, m) : parseLatestDVWStats(latestData, m)
        mx = appName === 'VBStats' ? calculatePSVBStats(mx) : calculateDVWStats(mx)
        mx = calculateSideoutStats(mx)
        console.log('sessionId, match=', params.sessionId, mx)
        setMatch(mx)

    }, [params.sessionId, selectedTeam])

    useEffect(() => {
        // dispatch({ type: 'SET_LOADING' })

        // const getLatestStatsData = async (m) => {
        //     const latestData = await getLatestStats(params.sessionId, 0)
        //     dispatch({ type: 'GET_LATEST', payload: latestData })
        //     setLatest(latestData)
        //     var mx = parseLatestStats(latestData, m)
        //     mx = calculateStats(mx)
        //     console.log('sessionId, match=', params.sessionId, mx)
        //     setMatch(mx)
        // }

        // const getSessionData = async () => {
        //     const sessionData = await getSession(params.sessionId)
        //     dispatch({ type: 'GET_SESSION', payload: sessionData })
        //     var m = initWithCompressedBuffer(sessionData.stats)
        //     getLatestStatsData(m)
        // }

        // getSessionData()
        getLatest()
        // setTimeout(() => setCounter(!counter), 30000)
    }, [getLatest, counter, selectedGame])

    // }, [dispatch, params.sessionId], selectedGame, counter)

    if (loading) {
        return <Spinner />
    }

    const renderReport = () => {
        if (currentReport === 0) {
            return <Dashboard match={match} selectedGame={selectedGame} selectedTeam={selectedTeam} />
        }
        else if (currentReport === 1) {
            return <BoxScore match={match} selectedGame={selectedGame} selectedTeam={selectedTeam} />
        }
        else if (currentReport === 2) {
            return <SideoutReport match={match} selectedGame={selectedGame} selectedTeam={selectedTeam}/>
            // return <Sideout match={match} selectedGame={selectedGame} selectedTeam={selectedTeam} />
        }
        else if (currentReport === 3) {
            return <AttackZones match={match} selectedGame={selectedGame} selectedTeam={selectedTeam}/>
        }
        else if (currentReport === 4) {
            return <HittingChartReport match={match} selectedGame={selectedGame} selectedTeam={selectedTeam}/>
        }
    }

    return match && latest && (
        <>
            <div>
                <div className='container mx-auto'>
                    <MatchSummary 
                        match={match} 
                        gameSelected={selectedGame}
                        onGameSelected={
                            (sgn) => setSelectedGame(sgn)
                        }
                        teamSelected={selectedTeam}
                        onTeamSelected={
                            (tmn) => setSelectedTeam(tmn)
                        }
                    >
                    </MatchSummary>
                </div>
                <div className="tabs">
                    <a className={currentReport == 0 ? "tab tab-bordered tab-active" : "tab tab-bordered"}
                        onClick={() => {
                            setCurrentReport(0)
                        }}
                    >Summary</a>
                    <a className={currentReport == 1 ? "tab tab-bordered tab-active" : "tab tab-bordered"}
                        onClick={() => {
                            setCurrentReport(1)
                        }}
                    >Box Score</a>
                    <a className={currentReport == 2 ? "tab tab-bordered tab-active" : "tab tab-bordered"}
                        onClick={() => {
                            setCurrentReport(2)
                        }}
                    >Sideout Report</a>
                    <a className={currentReport == 3 ? "tab tab-bordered tab-active" : "tab tab-bordered"}
                        onClick={() => {
                            setCurrentReport(3)
                        }}
                    >Attack Zones</a>
                    <a className={currentReport == 4 ? "tab tab-bordered tab-active" : "tab tab-bordered"}
                        onClick={() => {
                            setCurrentReport(4)
                        }}
                    >Hitting Chart</a>
                </div>
                <div>
                    {
                        renderReport()
                    }
                </div>

            </div>
        </>
    )
}


export default Session
