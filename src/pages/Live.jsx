import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import VBLiveAPIContext from "../context/VBLiveAPI/VBLiveAPIContext";
import {
  getSession,
  getSessionInfoForServer,
  getSessions,
  getSessionsForServer,
} from "../context/VBLiveAPI/VBLiveAPIAction";
import { toast } from "react-toastify";
import {
  VideoCameraIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ShareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Spinner from "../components/layout/Spinner";
import { initWithPSVBCompressedBuffer } from "../components/utils/PSVBFile";
import { initWithDVWCompressedBuffer } from "../components/utils/DVWFile";

function Live() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const { sessions, dispatch, currentUser } = useContext(VBLiveAPIContext);
  const [sortColumn, setSortColumn] = useState(0);
  const [sortAscending, setSortAscending] = useState(true);
  const [sortedSessions, setSortedSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [, forceUpdate] = useState(0);

  const handleChange = (e) => setText(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (text === "") {
      toast.error("Please enter server name to search");
    } else {
      dispatch({ type: "SET_LOADING" });
      const sessionsData = await getSessionsForServer(text);
      dispatch({ type: "GET_SESSION_INFO_FOR_SERVER", payload: sessionsData });
      const sortedss = sessionsData.sessions.sort((a, b) => b.id - a.id);
      var sss = [];
      for (var session of sortedss) {
        if (session.stats) {
          var m = null;
          if (session.appName === "VBStats") {
            m = initWithPSVBCompressedBuffer(session.stats);
            if (m.TrainingDate) {
              session.dateInSeconds = Date.parse(m.TrainingDate);
              session.date = new Date(
                session.dateInSeconds
              ).toLocaleDateString();
            }
          } else if (session.appName === "DVMate") {
            m = initWithDVWCompressedBuffer(session.stats);
            if (m && m.TrainingDate) {
              session.dateInSeconds = m.TrainingDate
                ? m.TrainingDate.getTime() / 1000
                : 0;
              session.date = m.TrainingDate.toLocaleDateString();
            }
          }
          if (m) {
            session.teamA = m.teamA.name;
            session.teamB = m.teamB.name;
          }
          session.isLive = false;
          if (session.utcLastUpdate) {
            var now = new Date();
            var utc_timestamp =
              Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                now.getUTCHours(),
                now.getUTCMinutes(),
                now.getUTCSeconds(),
                now.getUTCMilliseconds()
              );
            session.isLive = utc_timestamp / 1000 - session.utcLastUpdate < 300;
          }
          sss.push(session);
        }
      }
      doSort(sss, 1, false);
    }
    setLoading(false);
  };

  const doSort = (aschs, sc, sa) => {
    var xx = null;
    if (sc === 0) {
      xx = sa
        ? aschs.sort((a, b) => a.description.localeCompare(b.description))
        : aschs.sort((a, b) => b.description.localeCompare(a.description));
    } else if (sc === 1) {
      xx = sa
        ? aschs.sort((a, b) => a.dateInSeconds - b.dateInSeconds)
        : aschs.sort((a, b) => b.dateInSeconds - a.dateInSeconds);
    }

    setSortedSessions(xx);
    setSortColumn(sc);
    setSortAscending(sa);
    forceUpdate((n) => !n);
  };

  const doMatch = (session) => {
    const st = {
      sessionId: session.id,
      dvwFileData: null,
    };
    navigate("/session", { state: st });
  };

  const columnHeader = (col, name) => {
    return (
      <th
        onClick={() => {
          var asc = sortColumn === col ? !sortAscending : true;
          doSort(sessions, col, asc);
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

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div className="flex-col">
          <div>
            <p className="text-sm mt-4">Broadcast Server</p>
            <form onSubmit={handleSubmit}>
              <div className="form-control pt-1">
                <div className="relative">
                  <input
                    type="text"
                    className="w-80 pr-10 bg-base-300 input input-sm text-base-content rounded-none"
                    placeholder="Enter DVMateLive Server Name"
                    value={text}
                    onChange={handleChange}
                  />
                  <button
                    disabled={text.length === 0}
                    type="submit"
                    className="ml-2 rounded-none w-24 btn btn-sm"
                  >
                    Go
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="overflow-auto h-[80vh]">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="table-div">
                <table className="min-w-full divide-y divide-gray-300 text-sm">
                  <thead className="table-header">
                    <tr>
                      {columnHeader(0, "Description")}
                      {columnHeader(1, "Date")}
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                      ></th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {sortedSessions &&
                      sortedSessions.map((session, i) => (
                        <tr
                          key={i}
                          className={i % 2 ? "bg-base-100" : "bg-base-200"}
                        >
                          <td className="table-cell">
                            <div className="flex gap-1">
                              <div className="">{session.description}</div>
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex gap-2">
                              <div className="">
                                {session.sessionDateString}
                              </div>
                              {session.isLive ? (
                                <div className="bg-red-600 text-sm font-bold text-white px-2">LIVE</div>
                              ) : (
                                <></>
                              )}
                            </div>
                          </td>
                          <td className="table-cell">
                            <p className="cursor-pointer flex items-center text-sm text-gray-500">
                              <VideoCameraIcon
                                className={
                                  session.videoOnlineUrl
                                    ? "mr-1.5 h-5 w-5 text-success flex-shrink-0"
                                    : "mr-1.5 h-5 w-5 text-base-content flex-shrink-0"
                                }
                                aria-hidden="true"
                                onClick={() => doMatch(session)}
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
      )}
    </>
  );
}

export default Live;