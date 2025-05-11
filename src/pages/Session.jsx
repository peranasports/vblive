import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import {
  useLocation,
  useNavigate,
  useParams
} from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStatus } from "../components/hooks/useAuthStatus";
import Spinner from "../components/layout/Spinner";
import AttackZones from "../components/matches/AttackZones";
import BoxScore from "../components/matches/BoxScore";
import HittingChartReport from "../components/matches/HittingChartReport";
import MatchSummary from "../components/matches/MatchSummary";
import ServeReceiveReport from "../components/matches/ServeReceiveReport";
import SideoutReport from "../components/matches/SideoutReport";
import Summary from "../components/matches/Summary";
import {
  calculateDVWStats,
  generateMatch,
  initWithDVWCompressedBuffer,
  parseLatestDVWStats,
} from "../components/utils/DVWFile";
import {
  calculatePSVBStats,
  initWithPSVBCompressedBuffer,
  parseLatestPSVBStats,
} from "../components/utils/PSVBFile";
import { calculateSideoutStats } from "../components/utils/StatsItem";
import {
  generateUUID,
  unzipBuffer
} from "../components/utils/Utils";
import {
  getLatestStats,
  getSession,
  storeSession,
} from "../context/VBLiveAPI/VBLiveAPIAction";
import VBLiveAPIContext from "../context/VBLiveAPI/VBLiveAPIContext";

function Session() {
  const { session, appName, loading, dispatch } = useContext(VBLiveAPIContext);
  const location = useLocation();
  const { sessionId, dvwFileData, psvbFileData, filename, msession } =
    location?.state;
  const { currentUser } = useAuthStatus();
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
  const countRef = useRef(counter);
  const refreshInterval = 30; //refresh every 1 minutes
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLiveSession, setIsLiveSession] = useState(false);
  const [inDatabase, setInDatabase] = useState(false);
  const [lastUtcLastUpdate, setLastUtcLastUpdate] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const getLatest = useCallback(async () => {
    dispatch({ type: "SET_LOADING" });

    const sessionData = await getSession(sessionId);
    if (!sessionData) {
      return;
    }
    dispatch({ type: "GET_SESSION", payload: sessionData });
    var m = null;
    var appname = null;
    if (sessionData.utcLastUpdate) {
      var now = new Date();
      var utc_timestamp = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds()
      );
      const diff = utc_timestamp / 1000 - sessionData.utcLastUpdate;
      setIsLiveSession(utc_timestamp / 1000 - sessionData.utcLastUpdate < 300);
      setLastUtcLastUpdate(sessionData.utcLastUpdate);
    }
    if (sessionData.appName === "DVMate") {
      var buffer = unzipBuffer(sessionData.stats);
      if (buffer.includes("DATAVOLLEY")) {
        appname = "DVMate";
        m = initWithDVWCompressedBuffer(sessionData.stats);
      } else {
        appname = "VBStats";
        m = initWithPSVBCompressedBuffer(sessionData.stats);
      }
    } else {
      m =
        sessionData.appName === "VBStats"
          ? initWithPSVBCompressedBuffer(sessionData.stats)
          : initWithDVWCompressedBuffer(sessionData.stats);
    }
    var mx = null;
    if (sessionData.appName === "VBStats") {
      appname = "VBStats";
      const latestData = await getLatestStats(sessionId, 0);
      dispatch({ type: "GET_LATEST", payload: latestData });
      setLatest(latestData);
      mx =
        sessionData.appName === "VBStats"
          ? parseLatestPSVBStats(latestData, m)
          : parseLatestDVWStats(latestData, m);
      mx = calculatePSVBStats(mx);
    } else {
      appname = "DVMate";
      mx = calculateDVWStats(m);
    }
    if (mx) {
      mx.app = appname;
      mx = calculateSideoutStats(mx, sessionData.appName);
      // console.log('sessionId, match=', params.sessionId, mx)
      mx.buffer = unzipBuffer(sessionData.stats);
      setMatch(mx);
    }
    setCounter(0);
  }, [sessionId, selectedTeam]);

  useEffect(() => {
    const indb = msession && msession.id ? true : false;
    if (dvwFileData !== undefined && dvwFileData !== null) {
      var m = generateMatch(dvwFileData);
      m.filename = filename;
      m.buffer = dvwFileData;
      var mx = calculateDVWStats(m);
      mx.app = "DataVolley";
      mx = calculateSideoutStats(mx, "DataVolley");
      mx.videoOnlineUrl = msession && msession.videoOnlineUrl;
      mx.videoStartTimeSeconds = msession && msession.videoStartTimeSeconds;
      mx.videoOffset = msession && msession.videoOffset;
      if (mx.videoOffset && mx.videoOnlineUrl !== -1) {
        const firstev = mx.events[0];
        for (var ev of mx.events) {
          ev.VideoPosition = ev.TimeStamp?.getTime() / 1000 - firstev.TimeStamp?.getTime() / 1000 + mx.videoOffset;
        }
      }
      setInDatabase(indb);
      if (!mx.guid) {
        mx.guid = generateUUID();
      }
      const cr = localStorage.getItem("currentReportForMatch");
      if (cr) {
        const tokens = cr.split("_");
        if (mx && mx.TrainingDate.toLocaleString() === tokens[1]) {
          setCurrentReport(parseInt(tokens[0]));
        }
      }
      setMatch(mx);
      setAutoRefresh(false);
      setIsLiveSession(false);
      forceUpdate((n) => !n);
    } else if (psvbFileData !== undefined) {
      var m = initWithPSVBCompressedBuffer(psvbFileData);
      m.filename = filename;
      m.buffer = unzipBuffer(psvbFileData);
      var mx = calculatePSVBStats(m);
      mx.app = "VBStats";
      mx = calculateSideoutStats(mx, "VBStats");
      mx.videoOnlineUrl =
        msession && msession.videoOnlineUrl ? msession.videoOnlineUrl : null;
      mx.videoStartTimeSeconds =
        msession && msession.videoStartTimeSeconds
          ? msession.videoStartTimeSeconds
          : -1;
      mx.videoOffset =
        msession && msession.videoOffset ? msession.videoOffset : -1;
      setInDatabase(indb);
      if (!mx.guid) {
        mx.guid = generateUUID();
      }
      setMatch(mx);
      const cr = localStorage.getItem("currentReportForMatch");
      if (cr) {
        const tokens = cr.split("_");
        if (mx && mx.TrainingDate.toLocaleString() === tokens[1]) {
          setCurrentReport(parseInt(tokens[0]));
        }
      }
      setAutoRefresh(false);
      setIsLiveSession(false);
      forceUpdate((n) => !n);
    } else {
      // setIsLiveSession(true);
      getLatest();
    }

    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [getLatest, selectedGame, selectedTeam]);

  useEffect(() => {
    if (isLiveSession) {
      const timerId = schedule();
      return () => clearTimeout(timerId);
    }
  }, [counter, isLiveSession]);

  useEffect(() => {
    if (match && currentReport !== 6) {
      localStorage.setItem(
        "currentReportForMatch",
        currentReport + "_" + match.TrainingDate.toLocaleString()
      );
    }
  }, [currentReport]);

  const schedule = () => {
    const timerId = setTimeout(() => {
      let currCount = countRef.current;
      setCounter((currCount) => currCount + 1);
      // console.log(counter);
      if (counter >= refreshInterval - 1) {
        if (isLiveSession && autoRefresh) {
          getLatest();
        }
        setCounter(0);
      }
    }, 1000);

    return timerId;
  };

  if (loading) {
    return <Spinner />;
  }

  const renderReport = () => {
    if (currentReport === 0) {
      return (
        <Summary
          matches={[match]}
          selectedGame={selectedGame}
          selectedTeam={selectedTeam}
        />
      );
    } else if (currentReport === 1) {
      return (
        <BoxScore
          matches={[match]}
          team={selectedTeam === 0 ? match.teamA.Name : match.teamB.Name}
          selectedGame={selectedGame}
          selectedTeam={selectedTeam}
        />
      );
    } else if (currentReport === 2) {
      return (
        <SideoutReport
          matches={[match]}
          team={selectedTeam === 0 ? match.teamA.Name : match.teamB.Name}
          selectedGame={selectedGame}
          selectedTeam={selectedTeam}
        />
      );
      // return <Sideout match={match} selectedGame={selectedGame} selectedTeam={selectedTeam} />
    } else if (currentReport === 3) {
      return (
        <ServeReceiveReport
          matches={[match]}
          team={selectedTeam === 0 ? match.teamA.Name : match.teamB.Name}
          selectedGame={selectedGame}
          selectedTeam={selectedTeam}
        />
      );
    } else if (currentReport === 4) {
      return (
        <AttackZones
          matches={[match]}
          team={selectedTeam === 0 ? match.teamA.Name : match.teamB.Name}
          selectedGame={selectedGame}
          selectedTeam={selectedTeam}
        />
      );
    } else if (currentReport === 5) {
      // const st = {
      //   matches: [match],
      //   team: selectedTeam === 0 ? match.teamA.Name : match.teamB.Name,
      //   selectedGame: selectedGame,
      //   selectedTeam: selectedTeam,
      // };
      // navigate("/hittingchartreport", { state: st });
      return (
        <HittingChartReport
          matches={[match]}
          team={selectedTeam === 0 ? match.teamA.Name : match.teamB.Name}
          selectedGame={selectedGame}
          selectedTeam={selectedTeam}
          verticalScroll={isLiveSession ? scrollPosition - 44 : scrollPosition}
        />
      );
    } else if (currentReport === 6) {
      doVideoAnalysis();
      // return <VideoAnalysis match={match} selectedGame={selectedGame} />;
    }
  };

  const doHittingChart = () => {
    const st = {
      matches: [match],
      team: selectedTeam === 0 ? match.teamA.Name : match.teamB.Name,
      selectedGame: selectedGame,
      selectedTeam: selectedTeam,
    };
    navigate("/hittingchartreport", { state: st });
  };

  const doVideoAnalysis = () => {
    const st = {
      matches: [match],
      team: match.teamA.Name,
      selectedGame: selectedGame,
    };
    navigate("/videoanalysis", { state: st });
    // return <VideoAnalysis match={match} selectedGame={selectedGame} />;
  };

  const doUpload = async () => {
    const ret = await storeSession(match, currentUser);
    if (ret === 0) {
      toast.error("Error uploading session");
    } else {
      toast.success("Session uploaded successfully");
    }
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

  if (!match) {
    return (
      <div className="flex-col">
        {isLiveSession ? (
          <div className="flex gap-2 mt-2 p-2 h-9 bg-gray-500/20">
            <div className="text-sm font-bold text-white bg-red-700 px-2 h-5">
              Match has not started
            </div>
            {autoRefresh ? (
              <label className="text-sm">
                Auto-refresh in {refreshInterval - counter}s
              </label>
            ) : (
              <label className="text-sm">Auto-refresh is off</label>
            )}

            {autoRefresh ? (
              <div className="">
                <div className="tooltip" data-tip="Turn Auto-refresh Off">
                  <XCircleIcon
                    className="w-5 h-5 ml-2 text-base-content cursor-pointer"
                    onClick={() => setAutoRefresh(false)}
                  />
                </div>
              </div>
            ) : (
              <div className="">
                <div className="tooltip" data-tip="Turn Auto-refresh On">
                  <CheckCircleIcon
                    className="w-5 h-5 ml-2 text-base-content cursor-pointer"
                    onClick={() => setAutoRefresh(true)}
                  />
                </div>
              </div>
            )}
            <div className="tooltip" data-tip="Refresh Now">
              <ArrowPathIcon
                className="w-5 h-5 ml-2 text-base-content cursor-pointer"
                onClick={() => getLatest()}
              />
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  }

  return (
    match && (
      <>
        <div>
          {showingVideo ? (
            <></>
          ) : (
            <div className="flex justify-between">
              <MatchSummary
                matches={[match]}
                team={match.teamA.Name}
                gameSelected={selectedGame}
                onGameSelected={(sgn) => setSelectedGame(sgn)}
                teamSelected={selectedTeam}
                onTeamSelected={(tmn) => setSelectedTeam(tmn)}
                onSaveToDatabase={() => doUpload()}
                inDatabase={inDatabase}
                isLive={isLiveSession}
              ></MatchSummary>
            </div>
          )}
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
          <div className="flex-col">
            {isLiveSession ? (
              <div className="flex gap-2 mt-2 p-2 h-9 bg-gray-500/20">
                <div className="text-sm font-bold text-white bg-red-700 px-2 h-5">
                  LIVE
                </div>
                {autoRefresh ? (
                  <label className="text-sm">
                    Auto-refresh in {refreshInterval - counter}s
                  </label>
                ) : (
                  <label className="text-sm">Auto-refresh is off</label>
                )}

                {autoRefresh ? (
                  <div className="">
                    <div className="tooltip" data-tip="Turn Auto-refresh Off">
                      <XCircleIcon
                        className="w-5 h-5 ml-2 text-base-content cursor-pointer"
                        onClick={() => setAutoRefresh(false)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="">
                    <div className="tooltip" data-tip="Turn Auto-refresh On">
                      <CheckCircleIcon
                        className="w-5 h-5 ml-2 text-base-content cursor-pointer"
                        onClick={() => setAutoRefresh(true)}
                      />
                    </div>
                  </div>
                )}
                <div className="tooltip" data-tip="Refresh Now">
                  <ArrowPathIcon
                    className="w-5 h-5 ml-2 text-base-content cursor-pointer"
                    onClick={() => getLatest()}
                  />
                </div>
              </div>
            ) : (
              <></>
            )}
            <div className="mt-4">{renderReport()}</div>
          </div>
        </div>
      </>
    )
  );
}

export default Session;
