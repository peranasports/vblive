import {
  useEffect,
  useLayoutEffect,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  useParams,
  useLocation,
  useNavigate,
  Link,
  useLoaderData,
} from "react-router-dom";
import Spinner from "../components/layout/Spinner";
import BoxScore from "../components/matches/BoxScore";
import Sideout from "../components/matches/Sideout";
import Dashboard from "../components/matches/Dashboard";
import MatchSummary from "../components/matches/MatchSummary";
import VBLiveAPIContext from "../context/VBLiveAPI/VBLiveAPIContext";
import {
  getSession,
  getLatestStats,
} from "../context/VBLiveAPI/VBLiveAPIAction";
import {
  initWithPSVBCompressedBuffer,
  parseLatestPSVBStats,
  calculatePSVBStats,
} from "../components/utils/PSVBFile";
import {
  initWithDVWCompressedBuffer,
  parseLatestDVWStats,
  calculateDVWStats,
  generateMatch,
} from "../components/utils/DVWFile";
import { calculateSideoutStats } from "../components/utils/StatsItem";
import SideoutReport from "../components/matches/SideoutReport";
import AttackZones from "../components/matches/AttackZones";
import HittingChartReport from "../components/matches/HittingChartReport";
import ServeReceiveReport from "../components/matches/ServeReceiveReport";
import VideoAnalysis from "../components/matches/VideoAnalysis";
import { unzipBuffer } from "../components/utils/Utils";

function Session() {
  const { session, appName, loading, dispatch } = useContext(VBLiveAPIContext);
  const location = useLocation();
  const { sessionId, dvwFileData, psvbFileData, filename } = location.state;
  const params = useParams();
  const [match, setMatch] = useState(null);
  const [latest, setLatest] = useState(null);
  const [selectedGame, setSelectedGame] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState(0);
  const [currentReport, setCurrentReport] = useState(0);
  const [counter, setCounter] = useState(0);
  const [showingVideo, setShowingVideo] = useState(false);
  const [, forceUpdate] = useState(0);
  const navigate = useNavigate();
  const getLatest = useCallback(async () => {
    dispatch({ type: "SET_LOADING" });

    const sessionData = await getSession(sessionId);
    dispatch({ type: "GET_SESSION", payload: sessionData });
    // console.log('appName', sessionData.appName)
    var m =
      sessionData.appName === "VBStats"
        ? initWithPSVBCompressedBuffer(sessionData.stats)
        : initWithDVWCompressedBuffer(sessionData.stats);

    var mx = null;
    if (sessionData.appName === "VBStats") {
      const latestData = await getLatestStats(sessionId, 0);
      dispatch({ type: "GET_LATEST", payload: latestData });
      setLatest(latestData);
      mx =
        sessionData.appName === "VBStats"
          ? parseLatestPSVBStats(latestData, m)
          : parseLatestDVWStats(latestData, m);
      mx = calculatePSVBStats(mx);
    } else {
      mx = calculateDVWStats(m);
    }
    mx.app = sessionData.appName;
    mx = calculateSideoutStats(mx, sessionData.appName);
    // console.log('sessionId, match=', params.sessionId, mx)
    setMatch(mx);
  }, [sessionId, selectedTeam]);

  useEffect(() => {
    if (dvwFileData !== undefined && dvwFileData !== null) {
      var m = generateMatch(dvwFileData);
      m.filename = filename;
      m.buffer = dvwFileData;
      var mx = calculateDVWStats(m);
      mx.app = "DataVolley";
      mx = calculateSideoutStats(mx, "DataVolley");
      setMatch(mx);
      forceUpdate((n) => !n);
    } else if (psvbFileData !== undefined) {
      var m = initWithPSVBCompressedBuffer(psvbFileData);
      m.filename = filename;
      m.buffer = unzipBuffer(psvbFileData);
      var mx = calculatePSVBStats(m);
      mx.app = "VBStats";
      mx = calculateSideoutStats(mx, "VBStats");
      setMatch(mx);
      forceUpdate((n) => !n);
    } else {
      getLatest();
      // setTimeout(() => setCounter(!counter), 30000)
    }
  }, [getLatest, counter, selectedGame, selectedTeam]);

  // }, [dispatch, params.sessionId], selectedGame, counter)

  if (loading) {
    return <Spinner />;
  }

  const renderReport = () => {
    if (currentReport === 0) {
      return (
        <Dashboard
          match={match}
          selectedGame={selectedGame}
          selectedTeam={selectedTeam}
        />
      );
    } else if (currentReport === 1) {
      return (
        <BoxScore
          match={match}
          selectedGame={selectedGame}
          selectedTeam={selectedTeam}
        />
      );
    } else if (currentReport === 2) {
      return (
        <SideoutReport
          match={match}
          selectedGame={selectedGame}
          selectedTeam={selectedTeam}
        />
      );
      // return <Sideout match={match} selectedGame={selectedGame} selectedTeam={selectedTeam} />
    } else if (currentReport === 3) {
      return (
        <ServeReceiveReport
          match={match}
          selectedGame={selectedGame}
          selectedTeam={selectedTeam}
        />
      );
    } else if (currentReport === 4) {
      return (
        <AttackZones
          match={match}
          selectedGame={selectedGame}
          selectedTeam={selectedTeam}
        />
      );
    } else if (currentReport === 5) {
      return (
        <HittingChartReport
          match={match}
          selectedGame={selectedGame}
          selectedTeam={selectedTeam}
        />
      );
    } else if (currentReport === 6) {
      return <VideoAnalysis match={match} selectedGame={selectedGame} />;
    }
  };

  const doVideoAnalysis = () => {
    const st = { match: match, selectedGame: selectedGame };
    navigate("/videoanalysis", { state: st });
    // return <VideoAnalysis match={match} selectedGame={selectedGame} />;
  };

  return (
    match && (
      <>
        <div>
          {showingVideo ? (
            <></>
          ) : (
            <div className="">
              <MatchSummary
                match={match}
                gameSelected={selectedGame}
                onGameSelected={(sgn) => setSelectedGame(sgn)}
                teamSelected={selectedTeam}
                onTeamSelected={(tmn) => setSelectedTeam(tmn)}
              ></MatchSummary>
            </div>
          )}
          <div className="tabs tabs-boxed p-2">
            <a
              className={
                currentReport == 0 ? "tab tab-active bg-secondary" : "tab "
              }
              onClick={() => {
                setCurrentReport(0);
              }}
            >
              Summary
            </a>
            <a
              className={currentReport == 1 ? "tab  tab-active" : "tab "}
              onClick={() => {
                setCurrentReport(1);
              }}
            >
              Box Score
            </a>
            <a
              className={currentReport == 2 ? "tab  tab-active" : "tab "}
              onClick={() => {
                setCurrentReport(2);
              }}
            >
              Sideout Report
            </a>
            <a
              className={currentReport == 3 ? "tab  tab-active" : "tab "}
              onClick={() => {
                setCurrentReport(3);
              }}
            >
              Serve Receives
            </a>
            <a
              className={currentReport == 4 ? "tab  tab-active" : "tab "}
              onClick={() => {
                setCurrentReport(4);
              }}
            >
              Attack Zones
            </a>
            <a
              className={currentReport == 5 ? "tab  tab-active" : "tab "}
              onClick={() => {
                setCurrentReport(5);
              }}
            >
              Hitting Chart
            </a>
            <a
              className={currentReport == 6 ? "tab  tab-active" : "tab "}
              onClick={() => {
                doVideoAnalysis();
              }}
            >
              Video Analysis
            </a>
          </div>
          <div className="">{renderReport()}</div>
        </div>
      </>
    )
  );
}

export default Session;
