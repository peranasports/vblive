import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  VideoCameraIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { myunzip } from "../components/utils/zip";
import Select from "react-select";
import axios from "axios";
import Spinner from "../components/layout/Spinner";

function MatchesList() {
  const navigate = useNavigate();
  const location = useLocation();
  // const { currentUser } = location.state;
  const [allMatches, setAllMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [allTeamOptions, setAllTeamOptions] = useState([]);
  const [selectedTeamOption, setSelectedTeamOption] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTeamName, setSelectedTeamName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sortColumn, setSortColumn] = useState(0);
  const [sortAscending, setSortAscending] = useState(true);
  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState(0);

  const fetchAllMatches = async () => {
    setLoading(true);
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://vbliveapi.peranasports.com/api/Session/GetSessionInfoInServerForApp?serverName=leco3110%40gmail.com&appName=VBLive",
      headers: {},
    };

    var matches = [];
    await axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        matches = response.data;
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
    return matches;
  };

  const doSelect = (sel) => () => {
    for (var m of filteredMatches) {
      m.selected = sel;
    }
    forceUpdate((n) => !n);
  };

  const doMultiMatchReports = async () => {
    setLoading(true);
    var ms = filteredMatches.filter((m) => m.selected && m.selected === true);
    if (ms.length === 0) {
      alert("No matches selected.");
      return;
    }
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
      alert("Not all matches are selected are of the same team.");
      return;
    }
    var xms = [];
    for (var m of ms) {
      const xm = await getSessionById(m.id);
      xm.buffer = myunzip(xm.stats);
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
  };

  const getSessionById = async (sessionId) => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://vbliveapi.peranasports.com/api/Session/GetSessionsById?sessionId=${sessionId}`,
      headers: {},
    };

    var session = null;
    await axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        session = response.data[0];
      })
      .catch((error) => {
        console.log(error);
      });
    return session;
  };

  const doMatch = async (match) => {
    const session = await getSessionById(match.id);
    const uz = myunzip(session.stats);
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
            (a, b) => a.TrainingDate.getTime() - b.TrainingDate.getTime()
          )
        : aschs.sort(
            (a, b) => b.TrainingDate.getTime() - a.TrainingDate.getTime()
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
                  className="ml-1.5 h-4 w-4 flex-shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <ArrowUpIcon
                  className="ml-1.5 h-4 w-4 flex-shrink-0"
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
        (m) => m.player1Guid === team.name || m.teamB === team.name
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
    const ms = await fetchAllMatches();
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
        setSelectedTeamName(team.name);
        setSelectedTeam(team);
        const fms = ms.filter(
          (m) => m.player1Guid === team.name || m.teamB === team.name
        );
        setFilteredMatches(fms);
      } else {
        setFilteredMatches(ms);
      }
    }
  };

  useEffect(() => {
    doInit();
  }, []);

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

  return (
    <>
      <div className="flex-col h-[88vh] mt-4">
        <div className="flex justify-between">
          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-info rounded-none w-28"
              onClick={doSelect(true)}
            >
              Select All
            </button>
            <button
              className="btn btn-sm btn-info rounded-none w-32"
              onClick={doSelect(false)}
            >
              Select None
            </button>
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
          <button
            className="btn btn-sm btn-info rounded-none"
            onClick={() => doMultiMatchReports()}
          >
            Multi Match Reports
          </button>

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
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="table-div">
                <table className="min-w-full divide-y divide-gray-300 text-sm">
                  <thead className="table-header">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                      ></th>
                      {columnHeader(0, "Team 1")}
                      {columnHeader(1, "Team 2")}
                      {columnHeader(2, "Tournament")}
                      {columnHeader(3, "Scores")}
                      {columnHeader(4, "Date")}
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                      ></th>
                      {/* <th
                      scope="col"
                      className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                    ></th> */}
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
                          <td className="table-cell">
                            <p className="cursor-pointer flex items-center text-sm text-gray-500">
                              <VideoCameraIcon
                                className="mr-1.5 h-5 w-5 flex-shrink-0"
                                aria-hidden="true"
                                onClick={() => doMatch(match)}
                              />
                            </p>
                          </td>
                          {/* <td className="table-cell">
                          <p className="cursor-pointer flex items-center text-sm text-gray-500">
                            <TrashIcon
                              className="mr-1.5 h-5 w-5 flex-shrink-0"
                              aria-hidden="true"
                              onClick={() => doDeleteUser(match)}
                            />
                          </p>
                        </td> */}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default MatchesList;
