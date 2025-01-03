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
import { generateUUID, unzipBuffer } from "../components/utils/Utils";
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
  const [scrollPosition, setScrollPosition] = useState(0);
  const [, forceUpdate] = useState(0);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const cr = localStorage.getItem("currentReportForMatches");
  //   if (cr) {
  //     const tokens = cr.split("_");
  //     const crep = parseInt(tokens[0]);
  //     if (crep < 5) {
  //       var dates = "";
  //       for (var xm of matches) {
  //         dates += xm.sessionDateString;
  //       }
  //       if (dates === tokens[1]) {
  //         setCurrentReport(parseInt(tokens[0]));
  //       }
  //     }
  //   }
  // }, [currentReport]);

  const getMatchesDateStrings = () => {
    var dates = "";
    for (var xm of matches) {
      dates += xm.sessionDateString;
    }
    return dates;
  };

  useEffect(() => {
    if (currentReport !== 6) {
      localStorage.setItem(
        "currentReportForMatches",
        currentReport + "_" + getMatchesDateStrings()
      );
    }
  }, [currentReport]);

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
        if (!mx.guid) {
          mx.guid = generateUUID();
        }
        allms.push(mx);
      } else {
        var m = initWithPSVBCompressedBuffer(match.buffer);
        var mx = calculatePSVBStats(m);
        mx.app = "VBStats";
        mx = calculateSideoutStats(mx, "VBStats");
        mx.videoOnlineUrl = match.videoOnlineUrl;
        mx.videoStartTimeSeconds = match.videoStartTimeSeconds;
        mx.videoOffset = match.videoOffset;
        if (!mx.guid) {
          mx.guid = generateUUID();
        }
        allms.push(mx);
      }
    }
    setAllMatches(allms);
    const cr = localStorage.getItem("currentReportForMatches");
    if (cr) {
      const tokens = cr.split("_");
      const crep = parseInt(tokens[0]);
      if (crep < 5) {
        const dates = getMatchesDateStrings();
        if (dates === tokens[1]) {
          setCurrentReport(parseInt(tokens[0]));
        }
      }
    }

    const handleScroll = () => {
      const position = window.scrollY;
      console.log(position);
      setScrollPosition(position);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
        window.removeEventListener('scroll', handleScroll);
    };

  }, [selectedTeam]);

  // }, [dispatch, params.sessionId], selectedGame, counter)

  if (loading) {
    return <Spinner />;
  }

  const renderReport = () => {
    // if (currentReport < 5) {
    //   var dates = "";
    //   for (var xm of matches) {
    //     dates += xm.sessionDateString;
    //   }
    //   localStorage.setItem(
    //     "currentReportForMatches",
    //     currentReport + "_" + dates
    //   );
    // }

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
          verticalScroll={scrollPosition + 78}
        />
      );
    } else if (currentReport === 6) {
      doVideoAnalysis();
      // return (
      //   <VideoAnalysis match={allMatches[0]} selectedGame={selectedGame} />
      // );
    }
  };

  const doVideoAnalysis = () => {
    const st = { matches: allMatches, team: team, selectedGame: selectedGame };
    navigate("/videoanalysis", { state: st });
    // return <VideoAnalysis allMatches[0]={allMatches[0]} selectedGame={selectedGame} />;
  };

  const tabs = [
    { name: "Summary", index: 0, current: false },
    { name: "Box Score", index: 1, current: false },
    { name: "Side-outs Report", index: 2, current: false },
    { name: "Serve Receives", index: 3, current: false },
    { name: "Attack Zones", index: 4, current: false },
    { name: "Hitting Charts", index: 5, current: false },
    { name: "Video Analysis", index: 6, current: false },
  ];

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

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
                isLive={false}
              ></MatchSummary>
            </div>
          )}
          {/* <div className="tabs tabs-boxed p-2">
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
          </div> */}
          {/* <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <a
                    key={tab.name}
                    onClick={() => setCurrentReport(tab.index)}
                    aria-current={
                      tab.index === currentReport ? "page" : undefined
                    }
                    className={classNames(
                      tab.index === currentReport
                        ? "border-primary/80 text-primary/80"
                        : "border-transparent text-base-content hover:border-base-content/30 hover:text-base-content/70",
                      "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium"
                    )}
                  >
                    {tab.name}
                  </a>
                ))}
              </nav>
            </div>
          </div> */}

          <div>
            <div className="grid grid-cols-1 sm:hidden">
              <div className="grid grid-cols-6">
                <div className="col-span-1">
                  <label className="text-sm pt-1">Report</label>
                </div>
                <div className="col-span-5">
                  <div className="flex gap-1">
                    <select
                      onChange={(e) =>
                        setCurrentReport(
                          tabs.find((tab) => tab.name === e.target.value).index
                        )
                      }
                      value={
                        tabs.find((tab) => tab.index === currentReport).name
                      }
                      aria-label="Select a tab"
                      className="select-generic text-sm"
                    >
                      {tabs.map((tab) => (
                        <option key={tab.name}>{tab.name}</option>
                      ))}
                    </select>
                    {/* <ChevronDownIcon
                      aria-hidden="true"
                      className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500"
                    /> */}
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <a
                      key={tab.name}
                      onClick={() => setCurrentReport(tab.index)}
                      aria-current={
                        tab.index === currentReport ? "page" : undefined
                      }
                      className={classNames(
                        tab.index === currentReport
                          ? "border-primary/80 text-primary/80"
                          : "border-transparent text-base-content hover:border-base-content/30 hover:text-base-content/70",
                        "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium"
                      )}
                    >
                      {tab.name}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          <div className="mt-4">{renderReport()}</div>
        </div>
      </>
    )
  );
}

export default MultiSessions;
