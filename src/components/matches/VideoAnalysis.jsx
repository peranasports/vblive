import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import { sortBy, sortedIndex } from "lodash";
import playlistIcon from "../assets/passing_001.svg";
import {
  FunnelIcon,
  ListBulletIcon,
  VideoCameraIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";
import Select from "react-select";
import ReactPlayer from "react-player/lazy";
import EventsList from "./EventsList";
import Timing from "./Timing";
import { toast } from "react-toastify";
import {
  getEventInfo,
  getTimingForEvent,
  makeFilename,
  saveToPC,
  getEventStringColor,
} from "../utils/Utils";
import { myzip, myunzip } from "../utils/zip";
import { DVEventString } from "../utils/DVWFile";
import { storeSession } from "../../context/VBLiveAPI/VBLiveAPIAction";
import { useAuthStatus } from "../hooks/useAuthStatus";

function VideoAnalysis() {
  // function VideoAnalysis({ match, selectedGame }) {
  const location = useLocation();
  const { matches, team, selectedGame } = location.state;
  const navigate = useNavigate();
  const playerRef = useRef();
  const dvRef = useRef();
  const radarRef = useRef();
  const { currentUser } = useAuthStatus();
  const [showRadarFile, setShowRadarFile] = useState(false);
  const [radarFileName, setRadarFileName] = useState(null);
  const [cookies, setCookie] = useCookies(["videofile"]);
  const [videoInfo, setVideoInfo] = useState(null);
  const [videoOnlineUrl, setVideoOnlineUrl] = useState(null);
  const [videoFilePath, setVideoFilePath] = useState(null);
  const [videoFileName, setVideoFileName] = useState(null);
  const [videoFileObject, setVideoFileObject] = useState(null);
  // const videoUrl = process.env.REACT_APP_VIDEO_SERVER_URL + match.code + ".mp4";
  const [selectedSet, setSelectedSet] = useState(1);
  const [selectedMatchGuid, setSelectedMatchGuid] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [startVideoTimeSeconds, setStartVideoTimeSeconds] = useState(null);
  const [videoOffset, setVideoOffset] = useState(0);
  const [currentVideoTime, setCurrentVideoTime] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isCollapseAll, setIsCollapseAll] = useState(true);
  const [, forceUpdate] = useState(0);
  const [allFilters, setAllFilters] = useState(null);
  const [teamAPlayers, setTeamAPlayers] = useState(null);
  const [teamBPlayers, setTeamBPlayers] = useState(null);
  const [selectedTeamAPlayers, setSelectedTeamAPlayers] = useState(null);
  const [selectedTeamBPlayers, setSelectedTeamBPlayers] = useState(null);
  const [attackCombos, setAttackCombos] = useState(null);
  const [setterCalls, setSetterCalls] = useState(null);
  const [selectedAttackCombos, setSelectedAttackCombos] = useState(null);
  const [selectedSetterCalls, setSelectedSetterCalls] = useState(null);
  const [games, setGames] = useState(null);
  const [rotations, setRotations] = useState(null);
  const [selectedGames, setSelectedGames] = useState(null);
  const [selectedRotations, setSelectedRotations] = useState(null);
  const [leadTimes, setLeadTimes] = useState([0, 0, 3, 3, 3, 3]);
  const [durations, setDurations] = useState([8, 8, 8, 8, 8, 8]);
  const [filteredEvents, setFilteredEvents] = useState(null);
  const [playlistEvents, setPlaylistEvents] = useState([]);
  const menuRef = useRef();
  const [menuOpen, setMenuOpen] = useState(false);
  const wref = useRef(null);
  const refWindow = useRef();
  const refList = useRef();
  const [contentsHeight, setContentsHeight] = useState(0);
  const [isYoutube, setIsYoutube] = useState(false);
  const [videoWidth, setVideoWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  const eventTypes = [
    { value: 0, label: "All Types" },
    { value: 1, label: "Serve" },
    { value: 2, label: "Serve-Receive" },
    { value: 3, label: "Set" },
    { value: 20, label: "Setter's Call" },
    { value: 4, label: "Spike" },
    { value: 5, label: "Block" },
    { value: 6, label: "Defence" },
  ];
  const [selectedEventTypes, setSelectedEventTypes] = useState([eventTypes[0]]);
  const eventResults = [
    { value: 0, label: "All Results" },
    { value: 1, label: "=" },
    { value: 2, label: "/" },
    { value: 3, label: "-" },
    { value: 4, label: "!" },
    { value: 5, label: "+" },
    { value: 6, label: "#" },
  ];
  const [selectedEventResults, setSelectedEventResults] = useState([
    eventResults[0],
  ]);

  const attackTypes = [
    { value: 0, label: "All Types" },
    { value: 1, label: "Hard" },
    { value: 2, label: "Soft" },
    { value: 3, label: "Tip" },
    { value: 4, label: "Not Specified" },
  ];
  const [selectedAttackTypes, setSelectedAttackTypes] = useState([
    attackTypes[0],
  ]);

  const hitTypes = [
    { value: 0, label: "All Types" },
    { value: 1, label: "H - High" },
    { value: 2, label: "M- Medium" },
    { value: 3, label: "Q - Quick" },
    { value: 4, label: "T - Tense" },
    { value: 5, label: "U - Super" },
    { value: 6, label: "F - Fast" },
    { value: 7, label: "O - Other" },
  ];
  const [selectedHitTypes, setSelectedHitTypes] = useState([hitTypes[0]]);

  const blockTypes = [
    { value: 6, label: "All Types" },
    { value: 0, label: "B0 - No Block" },
    { value: 1, label: "B1 - 1 Block" },
    { value: 2, label: "B2 - 2 Blocks" },
    { value: 3, label: "B3 - 3 Blocks" },
    { value: 4, label: "BS - Seams" },
    { value: 5, label: "Not Specified" },
  ];
  const [selectedBlockTypes, setSelectedBlockTypes] = useState([blockTypes[0]]);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // the required distance between touchStart and touchEnd to be detected as a swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe || isRightSwipe)
      console.log("swipe", isLeftSwipe ? "left" : "right");
    // add your conditional logic here
  };

  const onSaveToDatabase = async () => {
    const ret = await storeSession(matches[0], currentUser);
    if (ret === true) {
      toast.success("Session uploaded successfully");
    } else {
      toast.error("Error uploading session");
    }
  };

  function handleSelectEventTypes(data) {
    if (data.length === 0) {
      setSelectedEventTypes(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedEventTypes(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedEventTypes([data[data.length - 1]]);
      return;
    }
    setSelectedEventTypes(data);
  }

  function handleSelectGames(data) {
    if (data.length === 0) {
      setSelectedGames(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedGames(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedGames([data[data.length - 1]]);
      return;
    }
    setSelectedGames(data);
  }

  function handleSelectRotations(data) {
    if (data.length === 0) {
      setSelectedRotations(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedRotations(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedRotations([data[data.length - 1]]);
      return;
    }
    setSelectedRotations(data);
  }

  function handleSelectEventResults(data) {
    if (data.length === 0) {
      setSelectedEventResults(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedEventResults(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedEventResults([data[data.length - 1]]);
      return;
    }
    setSelectedEventResults(data);
  }

  function handleSelectAttackTypes(data) {
    if (data.length === 0) {
      setSelectedAttackTypes(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedAttackTypes(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedAttackTypes([data[data.length - 1]]);
      return;
    }
    setSelectedAttackTypes(data);
  }

  function handleSelectHitTypes(data) {
    if (data.length === 0) {
      setSelectedHitTypes(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedHitTypes(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedHitTypes([data[data.length - 1]]);
      return;
    }
    setSelectedHitTypes(data);
  }

  function handleSelectBlockTypes(data) {
    if (data.length === 0) {
      setSelectedBlockTypes(data);
      return;
    }
    if (data[0].value === 6 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedBlockTypes(ddd);
      return;
    } else if (data[data.length - 1].value === 6 && data.length > 1) {
      setSelectedBlockTypes([data[data.length - 1]]);
      return;
    }
    setSelectedBlockTypes(data);
  }

  function handleSelectAttackCombos(data) {
    if (data.length === 0) {
      setSelectedAttackCombos(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedAttackCombos(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedAttackCombos([data[data.length - 1]]);
      return;
    }
    setSelectedAttackCombos(data);
  }

  function handleSelectSetterCalls(data) {
    if (data.length === 0) {
      setSelectedSetterCalls(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedSetterCalls(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedSetterCalls([data[data.length - 1]]);
      return;
    }
    setSelectedSetterCalls(data);
  }

  function handleSelectTeamAPlayers(data) {
    if (data.length === 0) {
      setSelectedTeamAPlayers(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedTeamAPlayers(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedTeamAPlayers([data[data.length - 1]]);
      return;
    }
    setSelectedTeamAPlayers(data);
  }

  function handleSelectTeamBPlayers(data) {
    if (data.length === 0) {
      setSelectedTeamBPlayers(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedTeamBPlayers(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedTeamBPlayers([data[data.length - 1]]);
      return;
    }
    setSelectedTeamBPlayers(data);
  }

  const onDoFilters = () => {
    document.getElementById("modal-filters").checked = false;
    setAllFilters({
      teamAPlayers: selectedTeamAPlayers,
      teamBPlayers: selectedTeamBPlayers,
      eventTypes: selectedEventTypes,
      eventResults: selectedEventResults,
      attackTypes: selectedAttackTypes,
      hitTypes: selectedHitTypes,
      blockTypes: selectedBlockTypes,
      attackCombos: selectedAttackCombos,
      setterCalls: selectedSetterCalls,
      games: selectedGames,
      rotations: selectedRotations,
    });
  };

  const teamPlayersList = (team) => {
    var pls = [{ value: 0, label: "All Players" }];
    for (var np = 0; np < team.players.length; np++) {
      const pl = team.players[np];
      const plname =
        pl.shirtNumber + ". " + pl.FirstName + " " + pl.LastName.toUpperCase();
      pls.push({ value: np + 1, label: plname, guid: pl.Guid });
    }
    return pls;
  };

  const goToVideoPosition = (videoTime) => {
    // console.log('Match TS', videoTime)
    // console.log('Match TS', videoUrl)
    playerRef.current.seekTo(videoTime, "seconds");
  };

  const playerReady = () => {
    if (!isReady) {
      setIsReady(true);
      let vt = currentVideoTime;
      if (currentVideoTime !== null) {
        vt = currentVideoTime;
        setCurrentVideoTime(null);
      }
      playerRef.current.seekTo(vt, "seconds");
    }
  };

  const closeEventsList = () => {
    document.getElementById("my-drawer-3").checked = false;
  };

  const showEventsList = () => {
    document.getElementById("my-drawer-3").checked = true;
  };

  const fileObjectToJsonString = (fileObject) => {
    fileObject.toJSON = function () {
      return {
        lastModified: fileObject.lastModified,
        lastModifiedDate: fileObject.lastModifiedDate,
        name: fileObject.name,
        size: fileObject.size,
        type: fileObject.type,
      };
    };
    return JSON.stringify(fileObject);
  };

  const JsonStringToFileObject = () => {
    var fileObject;
  };

  const doSelectEvent = (ev) => {
    if (matches.length === 1) {
      setSelectedEvent(ev);
      const tm = getTimingForEvent(ev);
      if (startVideoTimeSeconds !== null && videoOffset !== null) {
        const secondsSinceEpoch = Math.round(ev.TimeStamp.getTime() / 1000);
        const loc =
          secondsSinceEpoch - startVideoTimeSeconds + videoOffset - tm.leadTime;
        playerRef.current.seekTo(loc, "seconds");
      } else {
        if (ev.VideoPosition !== undefined && ev.VideoPosition !== 0) {
          playerRef.current.seekTo(ev.VideoPosition - tm.leadTime, "seconds");
        }
      }
    } else {
      setSelectedEvent(ev);
      const match = ev.Drill.match;
      let svts = startVideoTimeSeconds;
      let vos = videoOffset;
      let diffvideo = false;
      if (match !== currentMatch) {
        setCurrentMatch(match);
        svts = match.videoStartTimeSeconds;
        vos = match.videoOffset;
        const yturl = convertYouTubeUrl(match.videoOnlineUrl);
        setVideoFilePath(yturl);
        setIsReady(false);
        diffvideo = true;
      }
      const tm = getTimingForEvent(ev);
      let vt = null;
      if (svts !== null && vos !== null && vos >= 0) {
        const secondsSinceEpoch = Math.round(ev.TimeStamp.getTime() / 1000);
        vt = secondsSinceEpoch - svts + vos - tm.leadTime;
      } else {
        if (ev.VideoPosition !== undefined && ev.VideoPosition !== 0) {
          vt = ev.VideoPosition - tm.leadTime;
        }
      }
      if (diffvideo) {
        setCurrentVideoTime(vt);
      } else {
        playerRef.current.seekTo(vt, "seconds");
      }
    }
  };

  const handleChange = (e) => {
    setVideoOnlineUrl(e.target.value);
  };

  const onSynchVideo = () => {
    if (selectedEvent === null) {
      toast.error("Please select an event to synch with video!");
      return;
    }
    const secondsSinceEpoch = Math.round(
      selectedEvent.TimeStamp.getTime() / 1000
    );
    setStartVideoTimeSeconds(secondsSinceEpoch);
    const voffset = playerRef.current.getCurrentTime();
    setVideoOffset(voffset);
    const prefix =
      selectedEvent.Drill.match.app === "VBStats"
        ? selectedEvent.Drill.match.Guid
        : selectedEvent.Drill.match.dvstring;
    const obj = localStorage.getItem(prefix + "_videoInfo");
    if (vobj !== null) {
      var vobj = JSON.parse(obj);
      vobj.videoOffset = voffset;
      vobj.startVideoTimeSeconds = secondsSinceEpoch;
    }
    localStorage.setItem(prefix + "_videoInfo", JSON.stringify(vobj));
    matches[0].videoOffset = voffset;
    matches[0].videoStartTimeSeconds = secondsSinceEpoch;
    // localStorage.setItem(videoFileName + "_offset", voffset.toString());
    // localStorage.setItem(
    //   videoFileName + "_startVideoTime",
    //   secondsSinceEpoch.toString()
    // );
    toast.success("Video synched with events!");
  };

  const doSaveFile = () => {
    var a = matches[0].buffer.split(/\r?\n/);
    if (a.length == 0) {
      return;
    }
    var fn = "";
    var buffer = "";
    if (matches[0].app === "DataVolley") {
      if (a[0] !== "[3DATAVOLLEYSCOUT]") {
        return;
      }
      var incomments = false;
      for (var nl = 0; nl < a.length; nl++) {
        var s = a[nl];
        if (s.includes("[3COMMENTS]")) {
          incomments = true;
        } else if (incomments && s.includes("[") && s.includes("]")) {
          buffer += "\n";
          if (videoOffset && videoOffset > 0) {
            buffer += ";" + videoOnlineUrl + "\n";
            buffer += ";offset=" + videoOffset + "\n";
            buffer += ";start=" + startVideoTimeSeconds + "\n";
          } else {
            buffer += ";" + videoOnlineUrl + "\n";
          }
          buffer += s;
          incomments = false;
          continue;
        }
        if (incomments) {
          if (s.includes(";http")) continue;
          if (s.includes(";offset")) continue;
          if (s.includes(";start")) continue;
        }
        if (buffer.length > 0) buffer += "\n";
        buffer += s;
      }
    } else if (matches[0].app === "VBStats") {
      if (a[0].includes("PSVB") === false) {
        return;
      }
      var buf = "";
      for (const s of a) {
        if (buf.length > 0) buf += "\n";
        if (s.includes("M~")) {
          var json = s.split("~");
          var m = JSON.parse(json[1]);
          m.videoOnlineUrl = videoOnlineUrl;
          m.videoOffset = videoOffset;
          m.startVideoTimeSeconds = startVideoTimeSeconds;
          buf += "M~" + JSON.stringify(m);
        } else {
          buf += s;
        }
      }
      buffer = myzip(buf);
    }

    fn = makeFilename(matches[0].filename.name, "vblive", "");
    // if (match.filename.name.includes("_vblive")) {
    //   fn = match.filename.name;
    // } else {
    //   const tokens = match.filename.name.split(".");
    //   for (var nn = 0; nn < tokens.length - 1; nn++) {
    //     if (fn.length > 0) fn += ".";
    //     fn += tokens[nn];
    //   }
    //   fn += "_vblive" + "." + tokens[tokens.length - 1];
    // }
    console.log(fn);
    saveToPC(buffer, fn);
  };

  const showOnlineVideo = () => {
    const vinfo = {
      matchDVString: matches[0].dvstring,
      videoOnlineUrl: videoOnlineUrl,
      videoFileName: null,
      videoFileObject: null,
      videoOffset: null,
      startVideoTimeSeconds: null,
    };
    const prefix =
      matches[0].app === "VBStats" ? matches[0].Guid : matches[0].dvstring;
    localStorage.setItem(prefix + "_videoInfo", JSON.stringify(vinfo));
    setVideoFileObject(null);
    setVideoFileName(null);
    setVideoOffset(null);
    const yturl = convertYouTubeUrl(videoOnlineUrl);
    setVideoFilePath(yturl);
    matches[0].videoOnlineUrl = videoOnlineUrl;
    forceUpdate((n) => !n);
  };

  const handleVideoUpload = (event) => {
    setIsYoutube(false);
    var url = URL.createObjectURL(event.target.files[0]);
    const vfo = fileObjectToJsonString(event.target.files[0]);
    setVideoFileObject(vfo);
    const vfp = URL.createObjectURL(event.target.files[0]);
    setVideoFilePath(vfp);
    const vfn = event.target.files[0].name;
    setVideoFileName(vfn);
    setVideoOnlineUrl("");
    const vinfo = {
      matchDVString: matches[0].dvstring,
      videoOnlineUrl: null,
      videoFileName: vfn,
      videoFileObject: vfo,
      videoOffset: null,
      startVideoTimeSeconds: null,
    };
    const prefix =
      matches[0].app === "VBStats" ? matches[0].Guid : matches[0].dvstring;
    localStorage.setItem(prefix + "_videoInfo", JSON.stringify(vinfo));
    forceUpdate((n) => !n);
  };

  const handleRadarUpload = (event) => {
    var url = URL.createObjectURL(event.target.files[0]);
    setRadarFileName(event.target.files[0].name);
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      var matches = readRadarFileData(e.target.result);
      if (matches > 0) {
        toast.success("Import " + matches + " radar readings!");
        setShowRadarFile(false);
        forceUpdate((n) => !n);
      } else {
        toast.error("Unable to import radar readings!");
      }
    };
  };

  const readRadarFileData = (buf) => {
    var rds = [];

    var a = buf.split(/\r?\n/);
    if (a.length === 0) {
      return null;
    }
    for (var nl = 1; nl < a.length; nl++) {
      const line = a[nl];
      var tokens = line.split(",");
      const ts = new Date(tokens[0] + " " + tokens[1]);
      rds.push({
        timestamp: ts,
        activity: tokens[2],
        speed: Number.parseInt(tokens[4]),
        unit: tokens[5],
        index: nl,
      });
    }

    rds = sortBy(rds, "timestamp");

    var serves = [];
    for (var e of matches[0].events) {
      if (e.EventType === 1) {
        e.radar = null;
        serves.push(e);
      }
    }

    var bestmatches = 0;
    var bestmatchesrd = 0;
    for (var startrd = 0; startrd < rds.length; startrd++) {
      const threshold = 3000;
      var matches = 0;
      var nextrd = startrd;
      var firstetime = serves[0].TimeStamp.getTime();
      var firstrdtime = rds[startrd].timestamp.getTime();
      for (var e of serves) {
        const etime = e.TimeStamp.getTime();
        const ediff = etime - firstetime;
        for (var nr = nextrd; nr < rds.length; nr++) {
          const rd = rds[nr];
          const rtime = rd.timestamp.getTime();
          const rdiff = rtime - firstrdtime;
          const diff = Math.abs(rdiff - ediff);
          if (diff <= threshold) {
            e.radar = rd;
            matches++;
            nextrd = nr + 1;
            break;
          }
        }
        if (matches > bestmatches) {
          bestmatches = matches;
          bestmatchesrd = startrd;
        }
      }
      // console.log(startrd, matches);
    }
    // console.log("best:", bestmatchesrd, bestmatches);

    const threshold = 3000;
    matches = 0;
    startrd = bestmatchesrd;
    nextrd = bestmatchesrd;
    firstetime = serves[0].TimeStamp.getTime();
    firstrdtime = rds[startrd].timestamp.getTime();
    for (var e of serves) {
      e.radar = null;
      const etime = e.TimeStamp.getTime();
      const ediff = etime - firstetime;
      for (var nr = nextrd; nr < rds.length; nr++) {
        const rd = rds[nr];
        const rtime = rd.timestamp.getTime();
        const rdiff = rtime - firstrdtime;
        const diff = Math.abs(rdiff - ediff);
        if (diff <= threshold) {
          e.radar = rd;
          matches++;
          nextrd = nr + 1;
          break;
        }
      }
    }
    // console.log(startrd, matches);

    return bestmatches;
  };

  const onGameChanged = (idx) => {
    setSelectedSet(idx);
  };

  const onMatchChanged = (match) => {
    setSelectedMatchGuid(match.guid);
  };

  const onFilter = (fes) => {
    setFilteredEvents(fes);
  };

  const selectAllItems = () => {
    setMenuOpen(false);
    for (var ev of filteredEvents) {
      ev.playlist = true;
    }
    setPlaylistEvents(filteredEvents);
    forceUpdate((n) => !n);
  };

  const unselectAllItems = () => {
    setMenuOpen(false);
    for (var ev of filteredEvents) {
      ev.playlist = false;
    }
    setPlaylistEvents([]);
    forceUpdate((n) => !n);
  };

  const createPlaylist = () => {
    setMenuOpen(false);
    for (var ev of filteredEvents) {
      if (ev.playlist) {
        if (!ev.Drill.match.videoOnlineUrl) {
          toast.error(
            "Play lists can only be created with events that have video online."
          );
          return;
        }
      }
    }

    // if (videoOnlineUrl === null || videoOnlineUrl.length === 0) {
    //   toast.error("Play lists can only be created with an online video.");
    //   return;
    // }
    var evs = [];
    for (var ev of filteredEvents) {
      if (ev.playlist) {
        var loc = 0;
        const tm = getTimingForEvent(ev);
        if (
          ev.Drill.match.videoStartTimeSeconds &&
          ev.Drill.match.videoOffset &&
          ev.Drill.match.videoOffset >= 0
        ) {
          const secondsSinceEpoch = Math.round(ev.TimeStamp.getTime() / 1000);
          loc =
            secondsSinceEpoch -
            ev.Drill.match.videoStartTimeSeconds +
            ev.Drill.match.videoOffset -
            tm.leadTime;
        } else {
          if (ev.VideoPosition !== undefined && ev.VideoPosition !== 0) {
            loc = ev.VideoPosition - tm.leadTime;
          }
        }

        var xx = "";
        var col = "";
        if (ev.DVGrade === undefined) {
          const ss = getEventInfo(ev);
          xx = ss.sub;
          col = ss.subcolor;
        } else {
          xx = DVEventString(ev);
          col = getEventStringColor(ev);
        }
        const evx = {
          playerName:
            ev.Player.shirtNumber + ". " + ev.Player.NickName.toUpperCase(),
          eventString: xx,
          eventStringColor: col,
          eventSubstring:
            "Set " +
            ev.Drill.GameNumber +
            " " +
            ev.TeamScore +
            "-" +
            ev.OppositionScore +
            " R" +
            ev.Row,
          videoOnlineUrl: ev.Drill.match.videoOnlineUrl,
          videoPosition: loc,
          eventId: ev.EventId,
          matchVideo: ev.Drill.match.videoOnlineUrl
            ? ev.Drill.match.videoOnlineUrl
            : "",
        };
        evs.push(evx);
      }
    }
    if (evs.length === 0) {
      toast.error("Play list is empty.");
    } else {
      setPlaylistEvents(evs);
      const evstr = JSON.stringify(evs);
      localStorage.setItem("VBLivePlaylistEvents", evstr);
      const pl = {
        events: evs,
      };
      const fn = makeFilename("playlist", "vblive", "playlist");
      const buffer = JSON.stringify(pl);
      const st = {
        sessionId: null,
        playlistFileData: buffer,
        filename: fn,
      };
      navigate("/playlist", { state: st });

      // saveToPC(buffer, fn);
    }
  };

  const doCloseTiming = () => {
    document.getElementById("modal-timing").click();
    const obj = localStorage.getItem("vblive_timings");
    if (obj !== null) {
      const vobj = JSON.parse(obj);
      const lts = vobj.leadTimes.split(",");
      setLeadTimes(lts);
      const ds = vobj.durations.split(",");
      setDurations(ds);
    }
  };

  const convertYouTubeUrl = (str) => {
    if (str.includes("youtu.be") === false) return str;
    const regex = /.*\/([0-9a-zA-Z-]*)/gm;
    let m;
    while ((m = regex.exec(str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        console.log(`Found match, group ${groupIndex}: ${match}`);
      });
      if (m[1] !== null) {
        setIsYoutube(true);
        return "https://www.youtube.com/watch?v=" + m[1];
      }
    }
    setIsYoutube(false);
    return str;
  };

  useLayoutEffect(() => {
    if (wref.current) {
      const ch = wref.current.offsetHeight - 162;
      console.log("contentsHeight:" + ch);
      setContentsHeight(ch);
    }
    if (refWindow.current && refList.current) {
      setVideoWidth(
        refWindow.current.offsetWidth - refList.current.offsetWidth
      );
      setWindowHeight(window.innerHeight);
    }
  }, []);

  useEffect(() => {
    if (matches.length === 1) {
      if (matches[0].videoOnlineUrl) {
        const yturl = convertYouTubeUrl(matches[0].videoOnlineUrl);
        setVideoOnlineUrl(yturl);
        setVideoFilePath(yturl);
        setVideoOffset(matches[0].videoOffset ? matches[0].videoOffset : -1);
      } else {
        const prefix =
          matches[0].app === "VBStats" ? matches[0].Guid : matches[0].dvstring;
        const vobj = localStorage.getItem(prefix + "_videoInfo");
        if (vobj !== null) {
          const vinfo = JSON.parse(vobj);
          setVideoInfo(vobj);
          if (vinfo.matchDVString === matches[0].dvstring) {
            setVideoOffset(vinfo.videoOffset);
            setStartVideoTimeSeconds(vinfo.startVideoTimeSeconds);
            if (vinfo.videoOnlineUrl !== null) {
              const yturl = convertYouTubeUrl(vinfo.videoOnlineUrl);
              setVideoOnlineUrl(yturl);
              setVideoFilePath(yturl);
            } else if (vinfo.videoFileObject !== null) {
              const fobj = JSON.parse(vinfo.videoFileObject);
              // const vfp = URL.createObjectURL(fobj)
              // setVideoFilePath(vfp)
              setVideoFileName(fobj.name);
            }
          }
        } else {
          if (matches[0].videoUrl !== undefined) {
            const yturl = convertYouTubeUrl(matches[0].videoUrl);
            setVideoOnlineUrl(yturl);
            setVideoFilePath(yturl);
          } else {
          }
        }
      }
    }
    var fevents = [];
    var natcbs = 0;
    var atcbs = [{ value: 0, label: "All Combos" }];
    var selatcbs = [{ value: 0, label: "All Combos" }];
    var plas = [{ value: 0, label: "All Players" }];
    var plbs = [{ value: 0, label: "All Players" }];
    var nscs = 0;
    var scs = [{ value: 0, label: "All Calls" }];
    var selscs = [{ value: 0, label: "All Calls" }];
    var gms = [{ value: 0, label: "All Sets" }];

    for (var match of matches) {
      const tma = team === match.teamA.Name ? match.teamA : match.teamB;
      const tmb = team === match.teamA.Name ? match.teamB : match.teamA;
      for (var xpl of tma.players) {
        if (
          plas.filter(
            (pl) =>
              pl.FirstName + "_" + pl.LastName ===
              xpl.FirstName + "_" + xpl.LastName
          ).length === 0
        ) {
          const plname = xpl.FirstName + " " + xpl.LastName.toUpperCase();
          plas.push({ value: plas.length, label: plname, guid: plname });
        }
      }
      for (var xpl of tmb.players) {
        if (
          plbs.filter(
            (pl) =>
              pl.FirstName + "_" + pl.LastName ===
              xpl.FirstName + "_" + xpl.LastName
          ).length === 0
        ) {
          const plname = xpl.FirstName + " " + xpl.LastName.toUpperCase();
          plbs.push({ value: plas.length, label: plname, guid: plname });
        }
      }
      setTeamAPlayers(plas);
      setTeamBPlayers(plbs);

      if (match.attackCombos !== undefined) {
        for (const atcb of match.attackCombos) {
          if (atcbs.filter((at) => at.label === atcb.code).length === 0) {
            natcbs++;
            const xx = { value: natcbs, label: atcb.code, name: atcb.name };
            atcbs.push(xx);
          }
        }
      }

      if (match.setterCalls !== undefined) {
        for (const sc of match.setterCalls) {
          if (scs.filter((at) => at.label === sc.code).length === 0) {
            nscs++;
            const xx = { value: nscs, label: sc.code, name: sc.name };
            scs.push(xx);
          }
        }
      }

      for (var ng = 1; ng <= match.sets.length; ng++) {
        if (gms.filter((at) => at.value === ng).length === 0) {
          gms.push({ value: ng, label: "Set " + ng });
        }
      }

      for (var game of match.sets) {
        fevents.push(...game.events);
      }

      const playlistevstr = localStorage.getItem("VBLivePlaylistEvents");
      var plevs = [];
      if (playlistevstr !== null) {
        const evs = JSON.parse(playlistevstr);
        for (var evx of evs) {
          const ff = fevents.filter(
            (fev) =>
              fev.EventId === evx.eventId &&
              fev.Drill.match.videoOnlineUrl === evx.videoOnlineUrl
          );
          if (ff.length === 1) {
            ff[0].playlist = true;
            plevs.push(ff[0]);
          }
        }
      }
    }

    setPlaylistEvents(plevs);
    setFilteredEvents(fevents);
    setAttackCombos(atcbs);
    setSelectedAttackCombos(selatcbs);
    setSetterCalls(scs);
    setSelectedSetterCalls(selscs);
    setGames(gms);
    setSelectedGames([{ value: 0, label: "All Sets" }]);
    const sins = [1, 6, 5, 4, 3, 2];
    var rts = [{ value: 0, label: "All Rotations" }];
    for (var nr = 1; nr <= 6; nr++) {
      rts.push({
        value: nr,
        label: "R" + nr + " - Setter in " + sins[nr - 1],
      });
    }
    setRotations(rts);
    setSelectedRotations([{ value: 0, label: "All Rotations" }]);
    setSelectedTeamAPlayers([{ value: 0, label: "All Players" }]);
    setSelectedTeamBPlayers([{ value: 0, label: "All Players" }]);
    forceUpdate((n) => !n);

    function handleWindowResize() {
      if (wref.current) {
        const ch = wref.current.offsetHeight - 162;
        console.log("contentsHeight:" + ch);
        setContentsHeight(ch);
      }
      if (refWindow.current && refList.current) {
        setVideoWidth(
          refWindow.current.offsetWidth - refList.current.offsetWidth
        );
        setWindowHeight(window.innerHeight);
      }
    }

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  useEffect(() => {
    setSelectedSet(selectedGame);
    forceUpdate((n) => !n);
  }, [selectedGame, isCollapseAll]);

  useEffect(() => {}, [selectedSet, selectedMatchGuid]);

  useEffect(() => {
    // Bind the event listener
    document.addEventListener("mousedown", handleOutsideClicks);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleOutsideClicks);
    };
  }, [menuOpen]);

  //create a function in your component to handleOutsideClicks
  const handleOutsideClicks = (event) => {
    if (
      menuOpen &&
      menuRef.current &&
      !menuRef.current.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  };

  const drawerSideClass = () => {
    // return "flex-col w-[40vw] h-[" + contentsHeight + "px] bg-green-300"
    return (
      "flex-col px-2 h-[" + contentsHeight + "px] overflow-y-auto bg-purple-500"
    );
  };

  const onBackClick = () => {
    navigate(-1);
  };

  const calcVideoSize = () => {
    var maxh = windowHeight - 300;
    var w = videoWidth;
    var h = (videoWidth * 9) / 16;
    if (h > maxh) {
      h = maxh;
      w = (h * 16) / 9;
    }
    return { width: w, height: h };
  };

  if (!matches) {
    return <></>;
  }

  return (
    <>
      <div className="flex-col">
        <div className="flex h-full w-full" ref={refWindow}>
          <div className="flex-col min-w-[320px]">
            <div className="flex justify-between gap-1 h-10 p-1 bg-base-300">
              <div className="flex gap-1">
                {/* <label
                  htmlFor="modal-filters"
                  className="btn btn-sm bg-gray-600 hover:btn-gray-900 "
                >
                  Filters
                </label> */}
                <div className="tooltip" data-tip="Filters">
                  <FunnelIcon
                    className="w-8 h-8 p-1 bg-primary text-primary-content hover:bg-primary-focus cursor-pointer"
                    onClick={() =>
                      (document.getElementById("modal-filters").checked = true)
                    }
                  />
                </div>
                {matches.length === 1 ? (
                  <div className="dropdown">
                    <div className="tooltip" data-tip="Sets">
                      <ListBulletIcon
                        tabIndex={0}
                        className="w-8 h-8 p-1 bg-primary text-primary-content hover:bg-primary-focus cursor-pointer"
                      />
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 shadow bg-base-100 w-52"
                    >
                      {matches[0].sets.map((vobj, idx) => (
                        <li key={idx} onClick={() => onGameChanged(idx + 1)}>
                          <a>Set {vobj.GameNumber}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="dropdown">
                    <div className="tooltip" data-tip="Sets">
                      <ListBulletIcon
                        tabIndex={0}
                        className="w-8 h-8 p-1 bg-primary text-primary-content hover:bg-primary-focus cursor-pointer"
                      />
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 shadow bg-base-100 w-52"
                    >
                      {matches.map((match, idx) => (
                        <li key={idx} onClick={() => onMatchChanged(match)}>
                          <a>
                            {match.teamA.Name} vs {match.teamB.Name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="dropdown" ref={menuRef}>
                  <div tabIndex={0} onClick={() => setMenuOpen(!menuOpen)}>
                    <div className="tooltip" data-tip="Play List">
                      <VideoCameraIcon className="w-8 h-8 p-1 bg-primary text-primary-content hover:bg-primary-focus cursor-pointer" />
                    </div>
                  </div>
                  {menuOpen ? (
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 shadow bg-base-100 w-52"
                    >
                      <li onClick={() => selectAllItems()}>
                        <a>Select all items</a>
                      </li>
                      <li onClick={() => unselectAllItems()}>
                        <a>Unselect all items</a>
                      </li>
                      <li onClick={() => createPlaylist()}>
                        <a>Create play list</a>
                      </li>
                    </ul>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              <div>
                {isCollapseAll ? (
                  <div className="tooltip" data-tip="Expand All">
                    <ChevronDoubleDownIcon
                      className="w-8 h-8 p-1 bg-primary text-primary-content hover:bg-primary-focus cursor-pointer"
                      onClick={() => setIsCollapseAll(false)}
                    />
                  </div>
                ) : (
                  <div className="tooltip" data-tip="Collapse All">
                    <ChevronDoubleUpIcon
                      className="w-8 h-8 p-1 bg-primary text-primary-content hover:bg-primary-focus cursor-pointer"
                      onClick={() => setIsCollapseAll(true)}
                    />
                  </div>
                )}
              </div>

              <div>
                {matches.length === 1 ? (
                  <div className="tooltip" data-tip="Speed Radar">
                    <SignalIcon
                      className="w-8 h-8 p-1 bg-primary text-primary-content hover:bg-primary-focus cursor-pointer"
                      onClick={() => setShowRadarFile(!showRadarFile)}
                    />
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
            <div
              className="overflow-y-auto"
              ref={refList}
              style={{ height: `${windowHeight - 140}px` }}
            >
              <div className="">
                <EventsList
                  matches={matches}
                  team={team}
                  filters={allFilters}
                  selectedSet={selectedSet}
                  selectedMatchGuid={selectedMatchGuid}
                  doSelectEvent={(ev) => doSelectEvent(ev)}
                  onFilter={(fes) => onFilter(fes)}
                  collapseAll={isCollapseAll}
                />
              </div>
            </div>
          </div>
          <div className="flex-col">
            <div className="flex flex-col w-full justify-between ml-2">
              <div>
                {showRadarFile === false ? (
                  <></>
                ) : (
                  <div className="flex my-2">
                    <input
                      type="file"
                      id="selectedRadarFile"
                      ref={radarRef}
                      style={{ display: "none" }}
                      onChange={handleRadarUpload}
                      onClick={(event) => {
                        event.target.value = null;
                      }}
                    />
                    <input
                      type="button"
                      className="btn btn-sm w-60"
                      value="Select Radar File..."
                      onClick={() =>
                        document.getElementById("selectedRadarFile").click()
                      }
                    />
                    <label className="label ml-4">
                      <span className="label-text">
                        {videoFileName === null
                          ? "radar file not selected"
                          : radarFileName}
                      </span>
                    </label>
                  </div>
                )}
                {matches.length === 1 ? (
                  <div>
                    <div className="flex justify-between">
                      <div className="flex my-2">
                        <input
                          type="file"
                          id="selectedVideoFile"
                          ref={dvRef}
                          style={{ display: "none" }}
                          onChange={handleVideoUpload}
                          onClick={(event) => {
                            event.target.value = null;
                          }}
                        />
                        <input
                          type="button"
                          className="btn btn-sm btn-info w-60 rounded-none"
                          value="Select Match Video..."
                          onClick={() =>
                            document.getElementById("selectedVideoFile").click()
                          }
                        />
                        <label className="label ml-4">
                          <span className="label-text">
                            {videoFileName === null
                              ? "match video not selected"
                              : videoFileName}
                          </span>
                        </label>
                      </div>
                      <div className="flex">
                        <button
                          className="btn btn-primary rounded-none btn-sm m-2"
                          onClick={() => onSaveToDatabase()}
                        >
                          Save to Database
                        </button>
                        <button
                          className="btn btn-primary rounded-none btn-sm m-2"
                          onClick={() => onBackClick()}
                        >
                          Back
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1 mx-2 my-2">
                      <input
                        type="text"
                        className="w-full text-gray-500 bg-gray-200 input input-sm rounded-sm"
                        id="onlineVideoUrl"
                        value={videoOnlineUrl}
                        placeholder="Online video URL"
                        onChange={handleChange}
                      />
                      <button
                        className="btn btn-sm btn-info rounded-none"
                        onClick={() => showOnlineVideo()}
                      >
                        Apply
                      </button>
                      <button
                        className="btn btn-sm btn-info rounded-none"
                        onClick={() => onSynchVideo()}
                      >
                        Synch
                      </button>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                <div
                  className="flex m-2 p-1 justify-center bg-black"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  {isYoutube ? (
                    <>
                      {" "}
                      <ReactPlayer
                        ref={playerRef}
                        url={videoFilePath}
                        playing={true}
                        controls={true}
                        onReady={() => playerReady()}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                        width={`${calcVideoSize().width}px`}
                        height={`${calcVideoSize().height}px`}
                      />
                    </>
                  ) : (
                    <>
                      <ReactPlayer
                        ref={playerRef}
                        url={videoFilePath}
                        playing={true}
                        // width="100%"
                        // height="100%"
                        controls={true}
                        onReady={() => playerReady()}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                        width={`${calcVideoSize().width}px`}
                        height={`${calcVideoSize().height}px`}
                      />
                    </>
                  )}
                </div>
                {matches.length === 1 ? (
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <label
                        htmlFor="modal-timing"
                        className="btn btn-sm bg-info rounded-none hover:btn-gray-900"
                      >
                        Timing
                      </label>
                      <button
                        className="btn btn-sm btn-info rounded-none hover:btn-gray-900"
                        onClick={() => doSaveFile()}
                      >
                        Save Video Settings to DVW File
                      </button>
                    </div>
                    {videoOffset !== 0 ? (
                      <></>
                      // <p>Offset = {videoOffset} secs</p>
                    ) : (
                      <></>
                    )}
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <input type="checkbox" id="modal-filters" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box w-7/12 max-w-5xl h-full">
          <h3 className="mb-4 font-bold text-2xl">Filters</h3>
          <div className="form">
            <div className="my-4">
              <div className="flex justify-between mt-4">
                <div className="flex=col justify-between w-full mx-2">
                  <p className="text-xs">
                    {matches.length === 1 ? matches[0].teamA.Name : team}{" "}
                    Players
                  </p>
                  <Select
                    id="teamAPlayersSelect"
                    name="teamAPlayersSelect"
                    onChange={handleSelectTeamAPlayers}
                    className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-lg sm:text-md"
                    options={teamAPlayers}
                    value={selectedTeamAPlayers}
                    isMulti
                  />
                </div>
                <div className="flex=col justify-between w-full mx-2">
                  <p className="text-xs">
                    {matches.length === 1 ? matches[0].teamB.Name : "Opponents"}{" "}
                    Players
                  </p>
                  <Select
                    id="teamBPlayersSelect"
                    name="teamBPlayersSelect"
                    onChange={handleSelectTeamBPlayers}
                    className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-lg sm:text-md"
                    options={teamBPlayers}
                    value={selectedTeamBPlayers}
                    isMulti
                  />
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <div className="flex=col justify-between w-full mx-2">
                  <p className="text-xs">Set</p>
                  <Select
                    id="gamesSelect"
                    name="gamesSelect"
                    onChange={handleSelectGames}
                    className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-lg sm:text-md"
                    options={games}
                    value={selectedGames}
                    isMulti
                  />
                </div>

                <div className="flex=col justify-between w-full mx-2">
                  <p className="text-xs">Rotation</p>
                  <Select
                    id="rotationsSelect"
                    name="rotationsSelect"
                    onChange={handleSelectRotations}
                    className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-lg sm:text-md"
                    options={rotations}
                    value={selectedRotations}
                    isMulti
                  />
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <div className="flex=col justify-between w-full mx-2">
                  <p className="text-xs">Event Type</p>
                  <Select
                    id="eventTypesSelect"
                    name="eventTypesSelect"
                    onChange={handleSelectEventTypes}
                    className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-lg sm:text-md"
                    options={eventTypes}
                    value={selectedEventTypes}
                    isMulti
                  />
                </div>
                <div className="flex=col justify-between w-full mx-2">
                  <p className="text-xs">Event Result</p>
                  <Select
                    id="eventResultsSelect"
                    name="eventResultsSelect"
                    onChange={handleSelectEventResults}
                    className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-lg sm:text-md"
                    options={eventResults}
                    value={selectedEventResults}
                    isMulti
                  />
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <div className="flex=col justify-between w-full mx-2">
                  <p className="text-xs">Attack Type</p>
                  <Select
                    id="attackTypesSelect"
                    name="attackTypesSelect"
                    onChange={handleSelectAttackTypes}
                    className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-lg sm:text-md"
                    options={attackTypes}
                    value={selectedAttackTypes}
                    isMulti
                  />
                </div>
                <div className="flex=col justify-between w-full mx-2">
                  <p className="text-xs">Hit Type</p>
                  <Select
                    id="hitTypesSelect"
                    name="hitTypesSelect"
                    onChange={handleSelectHitTypes}
                    className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-lg sm:text-md"
                    options={hitTypes}
                    value={selectedHitTypes}
                    isMulti
                  />
                </div>
                <div className="flex=col justify-between w-full mx-2">
                  <p className="text-xs">Block Type</p>
                  <Select
                    id="blockTypesSelect"
                    name="blockTypesSelect"
                    onChange={handleSelectBlockTypes}
                    className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-lg sm:text-md"
                    options={blockTypes}
                    value={selectedBlockTypes}
                    isMulti
                  />
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <div className="flex=col justify-between w-full mx-2">
                  <p className="text-xs">Attack Combo</p>
                  <Select
                    id="attackCombosSelect"
                    name="attackCombosSelect"
                    onChange={handleSelectAttackCombos}
                    className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-lg sm:text-md"
                    options={attackCombos}
                    value={selectedAttackCombos}
                    isMulti
                  />
                </div>
                <div className="flex=col justify-between w-full mx-2">
                  <p className="text-xs">Setter's Call</p>
                  <Select
                    id="setterCallsSelect"
                    name="setterCallsSelect"
                    onChange={handleSelectSetterCalls}
                    className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 text-lg sm:text-md"
                    options={setterCalls}
                    value={selectedSetterCalls}
                    isMulti
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <div className="modal-action">
              <label htmlFor="modal-filters" className="btn btn-info rounded-none btn-sm">
                Cancel
              </label>
            </div>
            <div className="modal-action">
              <button
                htmlFor="modal-filters"
                className="btn btn-info rounded-none btn-sm"
                onClick={() => onDoFilters()}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      <input type="checkbox" id="modal-timing" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box w-4/12 max-w-5xl h-[62vh]">
          <h3 className="mb-4 font-bold text-2xl">Timing</h3>
          <div className="flex flex-col">
            <div>
              <Timing onClose={() => doCloseTiming()} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default VideoAnalysis;
