import { useEffect, useState, useRef } from "react";
import { useCookies } from "react-cookie";
import { sortBy, sortedIndex } from "lodash";
import Select from "react-select";
import ReactPlayer from "react-player";
import EventsList from "./EventsList";
import { toast } from "react-toastify";

function VideoAnalysis({ match }) {
  const playerRef = useRef();
  const dvRef = useRef();
  const radarRef = useRef();
  const [showRadarFile, setShowRadarFile] = useState(false);
  const [radarFileName, setRadarFileName] = useState(null);
  const [cookies, setCookie] = useCookies(["videofile"]);
  const [videoOnlineUrl, setVideoOnlineUrl] = useState(null);
  const [videoFilePath, setVideoFilePath] = useState(null);
  const [videoFileName, setVideoFileName] = useState(null);
  const [videoFileObject, setVideoFileObject] = useState(null);
  const videoUrl = process.env.REACT_APP_VIDEO_SERVER_URL + match.code + ".mp4";
  const [selectedSet, setSelectedSet] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [startVideoTime, setStartVideoTime] = useState(null);
  const [videoOffset, setVideoOffset] = useState(0);
  const [isReady, setIsReady] = useState(false);
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
      playerRef.current.seekTo(0, "seconds");
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
    setSelectedEvent(ev);
    if (ev.VideoPosition !== undefined && ev.VideoPosition !== 0) {
      playerRef.current.seekTo(ev.VideoPosition - 3, "seconds");
    } else {
      if (startVideoTime !== null && videoOffset !== null) {
        const secondsSinceEpoch = Math.round(ev.TimeStamp.getTime() / 1000);
        const loc = secondsSinceEpoch - startVideoTime + videoOffset;
        playerRef.current.seekTo(loc, "seconds");
      }
    }
  };

  const handleChange = (e) => {
    setVideoOnlineUrl(e.target.value);
  };

  const showOnlineVideo = () => {
    const vinfo = {
      matchDVString: match.dvstring,
      videoOnlineUrl: videoOnlineUrl,
      videoFileName: null,
      videoFileObject: null,
    };
    localStorage.setItem("videoInfo", JSON.stringify(vinfo));
    setVideoFileObject(null);
    setVideoFileName(null);
    setVideoFilePath(videoOnlineUrl);
    forceUpdate((n) => !n);
  };

  const handleVideoUpload = (event) => {
    var url = URL.createObjectURL(event.target.files[0]);
    const vfo = fileObjectToJsonString(event.target.files[0]);
    setVideoFileObject(vfo);
    const vfp = URL.createObjectURL(event.target.files[0]);
    setVideoFilePath(vfp);
    const vfn = event.target.files[0].name;
    setVideoFileName(vfn);
    setVideoOnlineUrl("");
    const vinfo = {
      matchDVString: match.dvstring,
      videoOnlineUrl: null,
      videoFileName: vfn,
      videoFileObject: vfo,
    };
    localStorage.setItem("videoInfo", JSON.stringify(vinfo));
    forceUpdate((n) => !n);
  };

  const handleRadarUpload = (event) => {
    var url = URL.createObjectURL(event.target.files[0]);
    setRadarFileName(event.target.files[0].name);
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      var matches = readRadarFileData(e.target.result);
      if (matches > 0)
      {
        toast.success("Import " + matches + " radar readings!");
        setShowRadarFile(false);
        forceUpdate((n) => !n);
      }
      else
      {
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
    for (var e of match.events) {
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

  useEffect(() => {
    if (match.videoUrl !== undefined) {
      setVideoOnlineUrl(match.videoUrl);
      setVideoFilePath(match.videoUrl);
    } else {
      const vobj = localStorage.getItem("videoInfo");
      if (vobj !== null) {
        const vinfo = JSON.parse(vobj);
        if (vinfo.matchDVString === match.dvstring) {
          if (vinfo.videoOnlineUrl !== null) {
            setVideoOnlineUrl(vinfo.videoOnlineUrl);
            setVideoFilePath(vinfo.videoOnlineUrl);
          } else if (vinfo.videoFileObject !== null) {
            const fobj = JSON.parse(vinfo.videoFileObject);
            // const vfp = URL.createObjectURL(fobj)
            // setVideoFilePath(vfp)
            setVideoFileName(fobj.name);
          }
        }
      }
    }

    const tapls = teamPlayersList(match.teamA);
    setTeamAPlayers(tapls);
    const tbpls = teamPlayersList(match.teamB);
    setTeamBPlayers(tbpls);

    var natcbs = 0;
    var atcbs = [{ value: 0, label: "All Combos" }];
    var selatcbs = [{ value: 0, label: "All Combos" }];
    if (match.attackCombos !== undefined) {
      for (const atcb of match.attackCombos) {
        natcbs++;
        const xx = { value: natcbs, label: atcb.code, name: atcb.name };
        atcbs.push(xx);
      }
    }
    setAttackCombos(atcbs);
    setSelectedAttackCombos(selatcbs);

    var nscs = 0;
    var scs = [{ value: 0, label: "All Calls" }];
    var selscs = [{ value: 0, label: "All Calls" }];
    if (match.setterCalls !== undefined) {
      for (const sc of match.setterCalls) {
        nscs++;
        const xx = { value: nscs, label: sc.code, name: sc.name };
        scs.push(xx);
      }
    }
    setSetterCalls(scs);
    setSelectedSetterCalls(selscs);

    var gms = [{ value: 0, label: "All Sets" }];
    for (var ng = 1; ng <= match.sets.length; ng++) {
      gms.push({ value: ng, label: "Set " + ng });
    }
    setGames(gms);
    setSelectedGames([{ value: 0, label: "All Sets" }]);

    const sins = [1, 6, 5, 4, 3, 2];
    var rts = [{ value: 0, label: "All Rotations" }];
    for (var nr = 1; nr <= 6; nr++) {
      rts.push({ value: nr, label: "R" + nr + " - Setter in " + sins[nr - 1] });
    }
    setRotations(rts);
    setSelectedRotations([{ value: 0, label: "All Rotations" }]);

    setSelectedTeamAPlayers([{ value: 0, label: "All Players" }]);
    setSelectedTeamBPlayers([{ value: 0, label: "All Players" }]);
    forceUpdate((n) => !n);
  }, []);

  if (match === undefined) {
    return <></>;
  }

  return (
    <>
      <div className="drawer drawer-mobile">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
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
                  className="btn btn-sm w-60"
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
              <div className="flex justify-between my-2">
                <input
                  type="text"
                  className="w-full text-gray-500 bg-gray-200 input input-sm rounded-sm"
                  id="onlineVideoUrl"
                  value={videoOnlineUrl}
                  onChange={handleChange}
                />
                <button
                  className="btn btn-sm"
                  onClick={() => showOnlineVideo()}
                >
                  Apply
                </button>
              </div>

              <div className="flex ml-4 my-4">
                <ReactPlayer
                  ref={playerRef}
                  url={videoFilePath}
                  playing={true}
                  width="100%"
                  height="100%"
                  controls={true}
                  onReady={() => playerReady()}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="drawer-side h-full">
          <label htmlFor="my-drawer-3" className="drawer-overlay"></label>
          <div className="flex-col mt-2">
            <div className="flex justify-between">
              <div className="flex gap-1">
                <label
                  htmlFor="modal-filters"
                  className="btn btn-sm bg-gray-600 hover:btn-gray-900"
                >
                  Filters
                </label>
                <div className="dropdown">
                  <label
                    tabIndex={0}
                    className="btn btn-sm bg-gray-600 hover:btn-gray-900"
                  >
                    Set
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    {match.sets.map((vobj, idx) => (
                      <li key={idx} onClick={() => onGameChanged(idx + 1)}>
                        <a>Set {vobj.GameNumber}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                <button
                  className="btn btn-sm bg-gray-600 hover:btn-gray-900"
                  onClick={() => setShowRadarFile(!showRadarFile)}
                >
                  Radar
                </button>
              </div>
            </div>
            <div className="flex h-[40vw] mt-2">
              <div className="flex-col w-80 h-90 overflow-y-auto">
                <EventsList
                  match={match}
                  filters={allFilters}
                  selectedSet={selectedSet}
                  doSelectEvent={(ev) => doSelectEvent(ev)}
                />
              </div>
            </div>
            {/* 
            <div className="flex-col h-88">
            <div className="overflow-y-auto h-full w-80 bg-base-100">
              <EventsList
                match={match}
                selectedSet={selectedSet}
                doSelectEvent={(ev) => doSelectEvent(ev)}
              />
            </div>
            </div> */}
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

              <div className="flex justify-between mt-4">
                <div className="flex=col justify-between w-full mx-2">
                  <p className="text-xs">{match.teamA.Name} Players</p>
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
                  <p className="text-xs">{match.teamB.Name} Players</p>
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
            </div>
          </div>
          <div className="modal-action">
            <label
              htmlFor="modal-filters"
              className="btn"
              onClick={() => onDoFilters()}
            >
              Apply
            </label>
          </div>
        </div>
      </div>
    </>
  );
}

export default VideoAnalysis;
