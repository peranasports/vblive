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
import axios from "axios";
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
import { useAuthStatus } from "../components/hooks/useAuthStatus";
import { myzip } from "../components/utils/zip";
import { toast } from "react-toastify";

function MultiSessions() {
  const { session, appName, loading, dispatch } = useContext(VBLiveAPIContext);
  const location = useLocation();
  const { matches, team } = location.state;
  const { currentUser } = useAuthStatus();
  const params = useParams();
  const [match, setMatch] = useState(null);
  const [latest, setLatest] = useState(null);
  const [selectedGame, setSelectedGame] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState(0);
  const [currentReport, setCurrentReport] = useState(0);
  const [allMatches, setAllMatches] = useState([]);
  const [counter, setCounter] = useState(0);
  const [showingVideo, setShowingVideo] = useState(false);
  const [, forceUpdate] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    var allms = [];
    for (var match of matches) {
      if (match.buffer.includes("DATAVOLLEY")) {
        var m = generateMatch(match.buffer);
        var mx = calculateDVWStats(m);
        mx.app = "DataVolley";
        mx = calculateSideoutStats(mx, "DataVolley");
        mx.videoOnlineUrl = match.videoOnlineUrl;
        mx.videoStartTimeSeconds = match.videoStartTimeSeconds;
        mx.videoOffset = match.videoOffset;
        allms.push(mx);
      } else {
        var m = initWithPSVBCompressedBuffer(match.buffer);
        var mx = calculatePSVBStats(m);
        mx.app = "VBStats";
        mx = calculateSideoutStats(mx, "VBStats");
        mx.videoOnlineUrl = match.videoOnlineUrl;
        mx.videoStartTimeSeconds = match.videoStartTimeSeconds;
        mx.videoOffset = match.videoOffset;
        allms.push(mx);
      }
    }
    setAllMatches(allms);
  }, [matches]);

  // }, [dispatch, params.sessionId], selectedGame, counter)

  if (loading) {
    return <Spinner />;
  }

  const renderReport = () => {
    if (currentReport === 0) {
      return (
        <Dashboard
          matches={allMatches}
          team={team}
          selectedGame={selectedGame}
          selectedTeam={selectedTeam}
        />
      );
    } else if (currentReport === 1) {
      return (
        <BoxScore
          matches={allMatches}
          team={team}
          selectedGame={selectedGame}
          selectedTeam={selectedTeam}
        />
      );
    } else if (currentReport === 2) {
      return (
        <SideoutReport
          matches={allMatches}
          team={team}
          selectedGame={selectedGame}
          selectedTeam={selectedTeam}
        />
      );
      // return <Sideout match={match} selectedGame={selectedGame} selectedTeam={selectedTeam} />
    } else if (currentReport === 3) {
      return (
        <ServeReceiveReport
          matches={allMatches}
          team={team}
        // match={allMatches[0]}
        selectedGame={selectedGame}
          selectedTeam={selectedTeam}
        />
      );
    } else if (currentReport === 4) {
      return (
        <AttackZones
          matches={allMatches}
          team={team}
          selectedGame={selectedGame}
          selectedTeam={selectedTeam}
        />
      );
    } else if (currentReport === 5) {
      return (
        <HittingChartReport
          matches={allMatches}
          team={team}
          selectedGame={selectedGame}
          selectedTeam={selectedTeam}
        />
      );
    } else if (currentReport === 6) {
      return <VideoAnalysis match={allMatches[0]} selectedGame={selectedGame} />;
    }
  };

  const doVideoAnalysis = () => {
    const st = { matches: allMatches, team:team, selectedGame: selectedGame };
    navigate("/videoanalysis", { state: st });
    // return <VideoAnalysis allMatches[0]={allMatches[0]} selectedGame={selectedGame} />;
  };

  return (
    allMatches && (
      <>
        <div>
          {showingVideo ? (
            <></>
          ) : (
            <div className="flex justify-between">
              <MatchSummary
                matches={allMatches}
                team={team}
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

export default MultiSessions;
