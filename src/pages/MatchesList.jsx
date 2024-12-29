import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  VideoCameraIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ShareIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import selectnone from "../components/assets/selectnone.png";
import selectall from "../components/assets/selectall.png";
import { myunzip, myzip } from "../components/utils/zip";
import Select from "react-select";
import axios, { all } from "axios";
import Spinner from "../components/layout/Spinner";
import { shareSession } from "../context/VBLiveAPI/VBLiveAPIAction";
import Share from "../components/matches/Share";
import VBLiveAPIContext from "../context/VBLiveAPI/VBLiveAPIContext";
import {
  classNames,
  dayTimeCode,
  decodeHtml,
  functionTabSecondary,
  unzipBuffer,
} from "../components/utils/Utils";
import { confirmAlert } from "react-confirm-alert";
import { useAuthStatus } from "../components/hooks/useAuthStatus";
import "react-confirm-alert/src/react-confirm-alert.css";

function MatchesList({ liveMatches, userEmail }) {
  const navigate = useNavigate();
  const { firebaseUser } = useAuthStatus();
  const location = useLocation();
  // const { liveMatches, userEmail } = location.state;
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
  const [sortColumn, setSortColumn] = useState(4);
  const [sortAscending, setSortAscending] = useState(false);
  const [thisDayTimeCode, setThisDayTimeCode] = useState(dayTimeCode());
  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState(0);

  const fetchAllMyMatches = async () => {
    setLoading(true);
    const uemail = firebaseUser.email;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url:
        process.env.REACT_APP_VBLIVE_API_URL +
        `/Session/GetSessionInfoInServerForApp?serverName=${uemail}&appName=VBLive`,
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
    const dvbuf = uz.includes("PSVB") ? null : uz;
    const vbbuf = uz.includes("PSVB") ? uz : null;
    const st = {
      msession: session,
      dvwFileData: dvbuf,
      psvbFileData: vbbuf,
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
    const team =
      e.target.selectedIndex > 0 ? allTeams[e.target.selectedIndex - 1] : null;
    setSelectedTeamOption(team && team.name);
    setSearchText("");
    localStorage.setItem("SearchText", "");
    if (!team) {
      localStorage.setItem("selectedTeamName", "");
      setSelectedTeamName(null);
      setSelectedTeam(null);
      setFilteredMatches(allMatches);
    } else {
      localStorage.setItem("selectedTeamName", team.name);
      setSelectedTeamName(team.name);
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
    } else if (firebaseUser) {
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
      // apops.push({ value: p, label: p.name });
      apops.push(p);
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
    } else if (firebaseUser) {
      const teamname = localStorage.getItem("selectedTeamName");
      if (teamname && teamname.length > 0) {
        const poption = apops.find((p) => p.name === teamname);
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
  }, [selectedScreen, firebaseUser]);

  const makeDate = (seconds) => {
    const dt = new Date(seconds * 1000);
    return dt.toLocaleDateString();
  };

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

  const customStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      // minHeight: '32px',
      // height: '32px',
      borderRadius: 4,
      color: "blue",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderColor: state.isFocused ? "oklch(var(--p))" : "transparent",
      ":hover": {
        borderColor: "transparent",
      },
    }),
    valueContainer: (baseStyles, state) => ({
      ...baseStyles,
      padding: "0 8px",
      // backgroundColor: "oklch(var(--p))",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    }),
    // input: (baseStyles, state) => ({
    //   ...baseStyles,
    //   color: "oklch(var(--bc))",
    // }),
    // singleValueLabel: (baseStyles, state) => ({
    //   ...baseStyles,
    //   color: "oklch(var(--bc))",
    // }),
    // multiValue: (baseStyles, state) => ({
    //   ...baseStyles,
    //   backgroundColor: "oklch(var(--b2))",
    // }),
    // multiValueLabel: (baseStyles, state) => ({
    //   ...baseStyles,
    //   color: "oklch(var(--bc))",
    // }),
    // multiValueRemove: (baseStyles, state) => ({
    //   ...baseStyles,
    //   color: "oklch(var(--bc))",
    //   ":hover": {
    //     backgroundColor: "rgba(255, 255, 255, 0.2)",
    //     color: "oklch(var(--bc))",
    //   },
    // }),
  };

  const tabs = [
    { name: "My Matches", index: 0, current: true },
    { name: "Shared Matches", index: 1, current: false },
  ];

  return (
    <>
      <div className="flex-col h-[88vh] mt-4">
        {/* <div className="flex gap-2 my-2 text-sm">
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
        </div> */}
        <div className="border-b border-gray-200 mb-4">
          <nav aria-label="Tabs" className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                onClick={() => onMatchesScreenChanged(tab.index)}
                aria-current={tab.index === selectedScreen ? "page" : undefined}
                className={classNames(
                  tab.index === selectedScreen
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

        <div className="grid grid-cols-6 gap-x-2 gap-y-2">
          <div className="col-span-3">
            <input
              type="text"
              value={searchText}
              className="input-generic"
              placeholder="Search team..."
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
          <div className="col-span-3">
            <select
              className="select-generic"
              onChange={onTeamChanged}
              value={selectedTeamName}
            >
              <option value="all">All Teams</option>
              {allTeams.map((team, i) => (
                <option key={i} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between mt-2">
          <div className="flex gap-2">
            <div className="tooltip" data-tip="Select All">
              <div className="btn-in-form w-10" onClick={doSelect(true)}>
                <CheckIcon
                  className="w-6 h-6"
                  style={{ color: "oklch(var(--bc))" }}
                />

                {/* <img src={selectall} alt="Select All" className="w-6 h-6" /> */}
              </div>
            </div>
            <div className="tooltip" data-tip="Unselect All">
              <div className="btn-in-form w-10" onClick={doSelect(false)}>
                <XMarkIcon
                  className="w-6 h-6"
                  style={{ color: "oklch(var(--bc))" }}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              disabled={selectedMatches().length < 2}
              className="btn-in-form"
              onClick={() => doMultiMatchReports()}
            >
              Multi Match Reports
            </button>
          </div>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="flex-col mt-2 rounded-md">
              <div className="overflow-auto h-[70vh]">
                <div className="inline-block min-w-full align-middle">
                  <div className="">
                    <table className="table-generic">
                      <thead className="thead-generic">
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
                      <tbody className="tbody-generic">
                        {filteredMatches &&
                          filteredMatches.map((match, i) => (
                            <tr
                              key={i}
                              className={
                                i % 2 === 0
                                  ? "bg-transparent"
                                  : "bg-base-300/10"
                              }
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
                                <div
                                  className="flex gap-1 cursor-pointer"
                                  onClick={() => doMatch(match)}
                                >
                                  {/* {getFlag(match.player1CountryCode, 7, 5)} */}
                                  <div className="underline">{match.teamA}</div>
                                </div>
                              </td>
                              <td className="table-cell">
                                <div
                                  className="flex gap-1 cursor-pointer"
                                  onClick={() => doMatch(match)}
                                >
                                  {/* {getFlag(match.player2CountryCode, 7, 5)} */}
                                  <div className="underline">{match.teamB}</div>
                                </div>
                              </td>
                              <td className="table-cell">{match.tournament}</td>
                              <td className="table-cell">{match.scores}</td>
                              <td className="table-cell">
                                {makeDate(match.sessionDateTimeInSeconds)}
                                {/*match.sessionDateString*/}
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
