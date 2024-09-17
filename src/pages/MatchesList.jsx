import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  VideoCameraIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ShareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import selectnone from "../components/assets/selectnone.png";
import selectall from "../components/assets/selectall.png";
import { myunzip, myzip } from "../components/utils/zip";
import Select from "react-select";
import axios from "axios";
import Spinner from "../components/layout/Spinner";
import { shareSession } from "../context/VBLiveAPI/VBLiveAPIAction";
import Share from "../components/matches/Share";
import VBLiveAPIContext from "../context/VBLiveAPI/VBLiveAPIContext";
import {
  dayTimeCode,
  decodeHtml,
  functionTabSecondary,
  unzipBuffer,
} from "../components/utils/Utils";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

function MatchesList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { liveMatches, userEmail } = location.state;
  // const { currentUser } = useContext(VBLiveAPIContext)
  // const { currentUser } = location.state;
  const [allMatches, setAllMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [allLiveMatches, setAllLiveMatches] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [allTeamOptions, setAllTeamOptions] = useState([]);
  const [selectedTeamOption, setSelectedTeamOption] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTeamName, setSelectedTeamName] = useState("");
  const [selectedScreen, setSelectedScreen] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [sortColumn, setSortColumn] = useState(0);
  const [sortAscending, setSortAscending] = useState(true);
  const [thisDayTimeCode, setThisDayTimeCode] = useState(dayTimeCode());
  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState(0);

  const fetchAllMyMatches = async () => {
    setLoading(true);
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url:
        process.env.REACT_APP_VBLIVE_API_URL +
        `/Session/GetSessionInfoInServerForApp?serverName=${userEmail}&appName=VBLive`,
      headers: {},
    };

    var matches = [];
    await axios
      .request(config)
      .then((response) => {
        matches = response.data;
        for (var match of matches) {
          match.teamA = decodeHtml(match.teamA);
          match.teamB = decodeHtml(match.teamB);
          match.description = decodeHtml(match.description);
          match.tournament = match.tournament
            ? decodeHtml(match.tournament)
            : "";
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
    return matches;
  };

  const fetchAllSharedMatches = async () => {
    setLoading(true);
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url:
        process.env.REACT_APP_VBLIVE_API_URL +
        `/Session/GetSharedSessionsForServer?serverName=${userEmail}&appName=VBLive`,
      headers: {},
    };

    var matches = [];
    await axios
      .request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        matches = response.data;
        for (var match of matches) {
          match.teamA = decodeHtml(match.teamA);
          match.teamB = decodeHtml(match.teamB);
          match.description = decodeHtml(match.description);
          match.tournament = match.tournament
            ? decodeHtml(match.tournament)
            : "";
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
    return matches;
  };

  const doDeleteMatch = async (match) => {
    confirmAlert({
      title: "Delete Match",
      message: "Are you sure you want to delete the selected match?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            setLoading(true);
            let config = {
              method: "get",
              maxBodyLength: Infinity,
              url:
                process.env.REACT_APP_VBLIVE_API_URL +
                `/Session/DeleteSession?sessionId=${match.id}`,
              headers: {},
            };

            await axios
              .request(config)
              .then((response) => {
                // console.log(JSON.stringify(response.data));
                setLoading(false);
                doInit();
              })
              .catch((error) => {
                console.log(error);
              });
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  const doSelect = (sel) => () => {
    for (var m of filteredMatches) {
      m.selected = sel;
    }
    forceUpdate((n) => !n);
  };

  const selectedMatches = () => {
    const ms = filteredMatches.filter((m) => m.selected && m.selected === true);
    return ms;
  };

  const doMultiMatchReports = async () => {
    var ms = selectedMatches();
    if (ms.length === 0) {
      alert("No matches selected.");
      return;
    } else {
      setLoading(true);
      const mobjs = {};
      for (var m of ms) {
        var m1 = mobjs[m.teamA];
        if (!m1) {
          mobjs[m.teamA] = [];
        }
        mobjs[m.teamA].push(m);
        var m2 = mobjs[m.teamB];
        if (!m2) {
          mobjs[m.teamB] = [];
        }
        mobjs[m.teamB].push(m);
      }
      var ok = false;
      var team = null;
      for (var key in mobjs) {
        if (mobjs[key].length === ms.length) {
          ok = true;
          team = key;
          break;
        }
      }
      if (!ok) {
        setLoading(false);
        alert("Not all matches are selected are of the same team.");
        return;
      } else {
        var xms = [];
        for (var m of ms) {
          const xm = await getSessionById(m.id);
          var buffer = myunzip(xm.stats);
          if (!buffer) {
            buffer = unzipBuffer(xm.stats);
          }
          xm.buffer = buffer;
          // if (m.videoFilePath) {
          //   for (var sm of xm.sets) {
          //     for (var ev of sm.events) {
          //       ev.videoTime = ev.timestamp - m.videoStartTime;
          //       ev.videoFile = m.videoFilePath;
          //     }
          //   }
          // }
          xms.push(xm);
        }
        setLoading(false);
        const st = {
          matches: xms,
          team: team,
        };
        navigate("/multisessions", { state: st });
      }
    }
  };

  const doShareMatch = (match) => {
    setThisDayTimeCode(dayTimeCode());
    setSelectedMatch(match);
    document.getElementById("modal-share").checked = true;
  };

  const doDoShare = async (share) => {
    document.getElementById("modal-share").checked = false;
    if (!share) {
      return;
    }
    var ok = false;
    for (var m of filteredMatches) {
      if (m.selected && m.selected === true) {
        ok = true;
        m.shareStatus = share.shareStatus;
        m.shareUsers = share.shareUsers;
        await shareSession(m, share);
      }
    }
    if (!ok) {
      selectedMatch.shareStatus = share.shareStatus;
      selectedMatch.shareUsers = share.shareUsers;
      await shareSession(selectedMatch);
    }
    forceUpdate((n) => !n);
  };

  const getSessionById = async (sessionId) => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url:
        process.env.REACT_APP_VBLIVE_API_URL +
        `/Session/GetSessionsById?sessionId=${sessionId}`,
      headers: {},
    };

    var session = null;
    await axios
      .request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        session = response.data[0];
        session.teamA = decodeHtml(session.teamA);
        session.teamB = decodeHtml(session.teamB);
        session.description = decodeHtml(session.description);
        session.tournament = session.tournament
          ? decodeHtml(session.tournament)
          : "";
      })
      .catch((error) => {
        console.log(error);
      });
    return session;
  };

  const doMatch = async (match) => {
    const session = await getSessionById(match.id);
    var uz = myunzip(session.stats);
    if (!uz || uz.length === 0) {
      uz = unzipBuffer(session.stats);
    }
    const st = {
      msession: session,
      dvwFileData: uz,
      filename: "",
    };
    navigate("/session", { state: st });
  };

  const doSort = (aschs, sc, sa) => {
    var xx = null;
    if (sc === 0) {
      xx = sa
        ? aschs.sort((a, b) => a.teamA.localeCompare(b.teamA))
        : aschs.sort((a, b) => b.teamA.localeCompare(a.teamA));
    } else if (sc === 1) {
      xx = sa
        ? aschs.sort((a, b) => a.teamB.localeCompare(b.teamB))
        : aschs.sort((a, b) => b.teamB.localeCompare(a.teamB));
    } else if (sc === 2) {
      xx = sa
        ? aschs.sort((a, b) => a.tournament.localeCompare(b.tournament))
        : aschs.sort((a, b) => b.tournament.localeCompare(a.tournament));
    } else if (sc === 4) {
      xx = sa
        ? aschs.sort(
            (a, b) => a.sessionDateTimeInSeconds - b.sessionDateTimeInSeconds
          )
        : aschs.sort(
            (a, b) => b.sessionDateTimeInSeconds - a.sessionDateTimeInSeconds
          );
    } else {
      return;
    }

    setFilteredMatches(xx);
    setSortColumn(sc);
    setSortAscending(sa);
    forceUpdate((n) => !n);
  };

  const doToggleSelect = (match) => {
    match.selected = !match.selected;
    forceUpdate((n) => !n);
  };

  const columnHeader = (col, name) => {
    return (
      <th
        onClick={() => {
          var asc = sortColumn === col ? !sortAscending : true;
          doSort(filteredMatches, col, asc);
        }}
        scope="col"
        className="table-header-column text-sm p-2"
      >
        <div className="flex">
          <p>{name}</p>
          {sortColumn === col ? (
            <div>
              {sortAscending ? (
                <ArrowDownIcon
                  className="ml-1 mt-0.5 h-4 w-4 flex-shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <ArrowUpIcon
                  className="ml-1 mt-0.5 h-4 w-4 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
            </div>
          ) : (
            <></>
          )}
        </div>
      </th>
    );
  };

  const onTeamChanged = (e) => {
    setSelectedTeamOption(e);
    const team = e.value;
    setSearchText("");
    localStorage.setItem("SearchText", "");
    if (!team) {
      localStorage.setItem("selectedTeamName", "");
      setSelectedTeamName(null);
      setSelectedTeam(null);
      setFilteredMatches(allMatches);
    } else {
      localStorage.setItem("selectedTeamName", team.name);
      setSelectedTeamName(e.label);
      setSelectedTeam(team);
      const fms = allMatches.filter(
        (m) => m.teamA === team.name || m.teamB === team.name
      );
      setFilteredMatches(fms);
    }
    forceUpdate((n) => !n);
  };

  const formatOptionLabel = ({ value, label }) => (
    <div className="flex gap-2">
      {/* <div className="-mt-0.5">
        {value ? getFlag(value.countrycode, 7, 5) : <></>}
      </div> */}
      <div className="font-medium text-black">{label}</div>
    </div>
  );

  const doInit = async () => {
    var ms = [];
    if (liveMatches && liveMatches.length > 0) {
      for (var m of liveMatches) {
        if (!m.teamA || !m.teamB) {
          const tokens = m.description.split(" vs ");
          if (tokens.length === 2) {
            m.teamA = tokens[0];
            m.teamB = tokens[1];
          } else {
            m.teamA = "";
            m.teamB = "";
          }
        }
        ms.push(m);
      }
      setAllLiveMatches(ms);
      setSelectedScreen(2);
      setLoading(false);
    } else {
      ms =
        selectedScreen === 0
          ? await fetchAllMyMatches()
          : await fetchAllSharedMatches();
    }
    var pls = {};
    for (var m of ms) {
      if (!pls[m.teamA]) {
        pls[m.teamA] = {
          name: m.teamA,
        };
      }
      if (!pls[m.teamB]) {
        pls[m.teamB] = {
          name: m.teamB,
        };
      }
    }
    var ps = [];
    for (var key in pls) {
      ps.push(pls[key]);
    }
    const aps = ps.sort((a, b) => a.name.localeCompare(b.name));
    setAllTeams(aps);
    var apops = [{ value: null, label: "All Teams" }];
    for (var p of aps) {
      apops.push({ value: p, label: p.name });
    }
    setAllTeamOptions(apops);
    doSort(ms, sortColumn, sortAscending);
    setAllMatches(ms);

    const search = localStorage.getItem("searchText");
    if (search && search.length > 0) {
      setSearchText(search);
      const fms = ms.filter(
        (m) =>
          m.teamA.toLowerCase().includes(search) ||
          m.teamB.toLowerCase().includes(search) ||
          m.tournament.toLowerCase().includes(search)
      );
      setFilteredMatches(fms);
    } else {
      const teamname = localStorage.getItem("selectedTeamName");
      if (teamname && teamname.length > 0) {
        const poption = apops.find((p) => p.value && p.value.name === teamname);
        setSelectedTeamOption(poption);
        const team = aps.find((p) => p.name === teamname);
        if (team) {
          setSelectedTeamName(team.name);
          setSelectedTeam(team);
          const fms = ms.filter(
            (m) => m.teamA === team.name || m.teamB === team.name
          );
          setFilteredMatches(fms);
        }
      } else {
        setFilteredMatches(ms);
      }
    }
  };

  useEffect(() => {
    doInit();
  }, []);

  useEffect(() => {
    doInit();
  }, [selectedScreen]);

  const getSharedColour = (match) => {
    if (match.shareStatus === undefined || match.shareStatus === null) {
      if (match.shareStatus === 1) {
        return "mr-1.5 h-5 w-5 flex-shrink-0 text-success";
      } else {
        return "mr-1.5 h-5 w-5 flex-shrink-0 text-warning";
      }
    } else {
      if (match.shareStatus === 1) {
        return "mr-1.5 h-5 w-5 flex-shrink-0 text-success";
      } else if (match.shareStatus === 2) {
        return "mr-1.5 h-5 w-5 flex-shrink-0 text-warning";
      } else {
        return "mr-1.5 h-5 w-5 flex-shrink-0 text-error";
      }
    }
  };

  // const getFlag = (countrycode) => {
  //   if (countrycode) {
  //     return (
  //       <img
  //         className="pl-2 w-7 h-5"
  //         alt=""
  //         src={require(`../assets/flags/${countrycode}.png`)}
  //       />
  //     );
  //   } else {
  //     return <></>;
  //   }
  // };

  const onMatchesScreenChanged = async (screen) => {
    setSelectedScreen(screen);
  };

  return (
    <>
      <div className="flex-col h-[88vh] mt-4">
        <div className="flex justify-between">
          <div className="flex gap-2">
            <div className="tooltip" data-tip="Select All">
              <div
                className="bg-info p-1 cursor-pointer"
                onClick={doSelect(true)}
              >
                <img src={selectall} alt="Select All" className="w-6 h-6" />
              </div>
            </div>
            <div className="tooltip" data-tip="Unselect All">
              <div
                className="bg-info p-1 cursor-pointer"
                onClick={doSelect(false)}
              >
                <img src={selectnone} alt="Select None" className="w-6 h-6" />
              </div>
            </div>
            <div className="flex gap-2 w-72 -mt-0.5">
              {/* <div className="mt-1.5 text-sm text-base-content">Team:</div> */}
              <Select
                value={selectedTeamOption}
                options={allTeamOptions}
                onChange={onTeamChanged}
                formatOptionLabel={formatOptionLabel}
                className="w-72 h-[10px] text-sm"
              />
            </div>

            <input
              type="text"
              value={searchText}
              className="input input-bordered input-sm rounded-none"
              placeholder="Search..."
              onChange={(e) => {
                const search = e.target.value.toLowerCase();
                setSearchText(search);
                setSelectedTeamName(null);
                setSelectedTeam(null);
                setSelectedTeamOption(null);
                localStorage.setItem("searchText", search);
                localStorage.setItem("selectedTeamName", "");
                const fms = allMatches.filter(
                  (m) =>
                    m.teamA.toLowerCase().includes(search) ||
                    m.teamB.toLowerCase().includes(search) ||
                    m.tournament.toLowerCase().includes(search)
                );
                setFilteredMatches(fms);
              }}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-error rounded-none"
              onClick={() => navigate("/live")}
            >
              Live
            </button>
            <button
              className="btn btn-sm btn-info rounded-none"
              onClick={() => navigate("/input")}
            >
              Import
            </button>
            <button
              disabled={selectedMatches().length < 2}
              className="btn btn-sm btn-info rounded-none"
              onClick={() => doMultiMatchReports()}
            >
              Multi Match Reports
            </button>
          </div>

          {/* <div className="flex gap-2">
            <button
              className="btn btn-sm btn-primary rounded-none"
              onClick={() => {
                navigate("/newmatch");
              }}
            >
              New
            </button>
            <button
              className="btn btn-sm btn-info rounded-none"
              onClick={() => {
                navigate("/import-psts");
              }}
            >
              Import
            </button>
          </div> */}
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="flex-col">
              <div className="flex gap-2 my-2">
                {functionTabSecondary(
                  selectedScreen === 0,
                  0,
                  "My Matches",
                  onMatchesScreenChanged
                )}
                {functionTabSecondary(
                  selectedScreen === 1,
                  1,
                  "Shared Matches",
                  onMatchesScreenChanged
                )}
                {allLiveMatches ? (
                  <>
                    {functionTabSecondary(
                      selectedScreen === 2,
                      1,
                      "Live Matches",
                      onMatchesScreenChanged
                    )}
                  </>
                ) : (
                  <></>
                )}
              </div>
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full py-2 align-middle">
                  <div className="table-div">
                    <table className="min-w-full divide-y divide-gray-300 text-sm">
                      <thead className="table-header">
                        <tr>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                          ></th>
                          {columnHeader(0, "Team 1")}
                          {columnHeader(1, "Team 2")}
                          {columnHeader(2, "Tournament")}
                          {columnHeader(3, "Scores")}
                          {columnHeader(4, "Date")}
                          {selectedScreen === 0 ? (
                            <>
                              <th
                                scope="col"
                                className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                              ></th>
                              <th
                                scope="col"
                                className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                              ></th>
                            </>
                          ) : (
                            <></>
                          )}
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                          ></th>
                        </tr>
                      </thead>
                      <tbody className="table-body">
                        {filteredMatches &&
                          filteredMatches.map((match, i) => (
                            <tr
                              key={i}
                              className={i % 2 ? "bg-base-100" : "bg-base-200"}
                            >
                              <td className="table-cell">
                                <input
                                  type="checkbox"
                                  checked={
                                    match.selected && match.selected === true
                                  }
                                  className="checkbox checkbox-sm mt-1 rounded-none"
                                  onChange={() => doToggleSelect(match)}
                                />
                              </td>
                              <td className="table-cell">
                                <div className="flex gap-1">
                                  {/* {getFlag(match.player1CountryCode, 7, 5)} */}
                                  <div className="">{match.teamA}</div>
                                </div>
                              </td>
                              <td className="table-cell">
                                <div className="flex gap-1">
                                  {/* {getFlag(match.player2CountryCode, 7, 5)} */}
                                  <div className="">{match.teamB}</div>
                                </div>
                              </td>
                              <td className="table-cell">{match.tournament}</td>
                              <td className="table-cell">{match.scores}</td>
                              <td className="table-cell">
                                {match.sessionDateString}
                                {/* {convertSecondsToDate(match.seconds / 1000)} */}
                              </td>
                              {selectedScreen === 0 ? (
                                <>
                                  <td className="table-cell">
                                    <p className="cursor-pointer flex items-center text-sm text-gray-500">
                                      <TrashIcon
                                        className="mr-1.5 h-5 w-5 flex-shrink-0"
                                        aria-hidden="true"
                                        onClick={() => doDeleteMatch(match)}
                                      />
                                    </p>
                                  </td>
                                  <td className="table-cell">
                                    <p className="cursor-pointer flex items-center text-sm text-gray-500">
                                      <ShareIcon
                                        className={getSharedColour(match)}
                                        aria-hidden="true"
                                        onClick={() => doShareMatch(match)}
                                      />
                                    </p>
                                  </td>
                                </>
                              ) : (
                                <></>
                              )}
                              <td className="table-cell">
                                <p className="cursor-pointer flex items-center text-sm text-gray-500">
                                  <VideoCameraIcon
                                    className={
                                      match.videoOnlineUrl
                                        ? "mr-1.5 h-5 w-5 text-success flex-shrink-0"
                                        : "mr-1.5 h-5 w-5 text-base-content flex-shrink-0"
                                    }
                                    aria-hidden="true"
                                    onClick={() => doMatch(match)}
                                  />
                                </p>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <input type="checkbox" id="modal-share" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box sm:w-4/12 w-full max-w-5xl min-w-[480px] h-[70vh] shadow rounded-none">
          <h3 className="mb-4 font-bold text-2xl">Share</h3>
          <div className="flex flex-col">
            <div>
              <Share
                shareStatus={selectedMatch && selectedMatch.shareStatus}
                shareUsers={selectedMatch && selectedMatch.shareUsers}
                currentTime={thisDayTimeCode}
                onShare={(share) => doDoShare(share)}
              />
            </div>
            {/* <div className="flex justify-end">
              <div className="modal-action">
                <label htmlFor="modal-share" className="btn btn-sm btn-info rounded-none">
                  Close
                </label>
              </div>
              <div className="modal-action">
                <label
                  htmlFor="modal-share"
                  className="btn btn-sm btn-info ml-4 rounded-none"
                  onClick={() => doDoShare()}
                >
                  Save
                </label>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default MatchesList;
