import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import {
  storePlaylist,
  shareSession,
  sharePlaylist,
} from "../context/VBLiveAPI/VBLiveAPIAction";
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
import "react-confirm-alert/src/react-confirm-alert.css";

function PlaylistsList({ userEmail }) {
  const navigate = useNavigate();
  const location = useLocation();
  // const { userEmail } = location.state;
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState([]);
  const [allTagsOptions, setAllTagsOptions] = useState([]);
  const [selectedTagOptions, setSelectedTagOptions] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState(0);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [sortColumn, setSortColumn] = useState(0);
  const [sortAscending, setSortAscending] = useState(true);
  const [thisDayTimeCode, setThisDayTimeCode] = useState(dayTimeCode());
  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState(0);

  const fetchAllMyPlaylists = async () => {
    setLoading(true);
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: process.env.REACT_APP_VBLIVE_API_URL.includes("vercel")
        ? process.env.REACT_APP_VBLIVE_API_URL +
          `/Session/GetPlaylistInfoInServerForApp/${userEmail}/VBLive`
        : process.env.REACT_APP_VBLIVE_API_URL +
          `/Session/GetPlaylistInfoInServerForApp?serverName=${userEmail}&appName=VBLive`,
      headers: {},
    };

    var playlists = [];
    await axios
      .request(config)
      .then((response) => {
        playlists = response.data;
        for (var pl of playlists) {
          pl.description = decodeHtml(pl.description);
          pl.comments = decodeHtml(pl.comments);
          pl.tags = decodeHtml(pl.tags);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
    return playlists;
  };

  const fetchAllSharedPlaylists = async () => {
    setLoading(true);
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: process.env.REACT_APP_VBLIVE_API_URL.includes("vercel")
        ? process.env.REACT_APP_VBLIVE_API_URL +
          `/Session/GetSharedPlaylistsForServer/${userEmail}/VBLive`
        : process.env.REACT_APP_VBLIVE_API_URL +
          `/Session/GetSharedPlaylistsForServer?serverName=${userEmail}&appName=VBLive`,
      headers: {},
    };

    var playlists = [];
    await axios
      .request(config)
      .then((response) => {
        playlists = response.data;
        for (var pl of playlists) {
          pl.description = decodeHtml(pl.description);
          pl.comments = decodeHtml(pl.comments);
          pl.tags = decodeHtml(pl.tags);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
    return playlists;
  };

  const doDeletePlaylist = async (playlist) => {
    confirmAlert({
      title: "Delete Playlist",
      message: "Are you sure you want to delete the selected play list?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            setLoading(true);
            let config = {
              method: "get",
              maxBodyLength: Infinity,
              url: process.env.REACT_APP_VBLIVE_API_URL.includes("vercel")
                ? process.env.REACT_APP_VBLIVE_API_URL +
                  `/Session/DeletePlaylist/${playlist.id}`
                : process.env.REACT_APP_VBLIVE_API_URL +
                  `/Session/DeletePlaylist?sessionId=${playlist.id}`,
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
    for (var m of filteredPlaylists) {
      m.selected = sel;
    }
    forceUpdate((n) => !n);
  };

  const doToggleSelect = (playlist) => {
    playlist.selected = !playlist.selected;
    forceUpdate((n) => !n);
  };

  const onTagChanged = (e) => {
    setSelectedTagOptions(e);
    if (e.length === 0) {
      setSelectedTagOptions([{ value: "All", label: "All Tags" }]);
      setFilteredPlaylists(allPlaylists);
      forceUpdate((n) => !n);
      return;
    }
    var allsel = e[e.length - 1].value === "All";
    if (allsel) {
      setFilteredPlaylists(allPlaylists);
      setSelectedTagOptions([{ value: "All", label: "All Tags" }]);
    } else {
      var tagoptions = e.filter((t) => t.value !== "All");
      setSelectedTagOptions(tagoptions);
      var tags = [];
      for (var t of e) {
        if (t.value !== "All") {
          tags.push(t.value);
        }
      }
      var fpls = [];
      for (var pl of allPlaylists) {
        const pltags = pl.tags.split("|");
        for (var pltag of pltags) {
          if (tags.includes(pltag)) {
            fpls.push(pl);
          }
        }
      }
      setFilteredPlaylists(fpls);
    }
    forceUpdate((n) => !n);
  };

  const doSharePlaylist = (playlist) => {
    setThisDayTimeCode(dayTimeCode());
    setSelectedPlaylist(playlist);
    document.getElementById("modal-share").checked = true;
  };

  const doDoShare = async (share) => {
    document.getElementById("modal-share").checked = false;
    if (!share) {
      return;
    }
    selectedPlaylist.shareStatus = share.shareStatus;
    selectedPlaylist.shareUsers = share.shareUsers;
    await sharePlaylist(selectedPlaylist);
    forceUpdate((n) => !n);
  };

  const getPlaylistById = async (playlistId) => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: process.env.REACT_APP_VBLIVE_API_URL.includes("vercel")
        ? process.env.REACT_APP_VBLIVE_API_URL +
          `/Session/GetPlaylistById/${playlistId}`
        : process.env.REACT_APP_VBLIVE_API_URL +
          `/Session/GetPlaylistById?playlistId=${playlistId}`,
      headers: {},
    };

    var pl = null;
    await axios
      .request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        pl = response.data[0];
        pl.description = decodeHtml(pl.description);
        pl.comments = decodeHtml(pl.comments);
        pl.tags = decodeHtml(pl.tags);
      })
      .catch((error) => {
        console.log(error);
      });
    return pl;
  };

  const doPlaylist = async (playlist) => {
    const pl = await getPlaylistById(playlist.id);
    const st = {
      playlist: pl,
      serverName: userEmail,
    };
    navigate("/playlist", { state: st });
  };

  const doSort = (aschs, sc, sa) => {
    var xx = null;
    if (sc === 0) {
      xx = sa
        ? aschs.sort((a, b) => a.serverName.localeCompare(b.serverName))
        : aschs.sort((a, b) => b.serverName.localeCompare(a.serverName));
    } else if (sc === 1) {
      xx = sa
        ? aschs.sort((a, b) => a.description.localeCompare(b.description))
        : aschs.sort((a, b) => b.description.localeCompare(a.description));
    } else if (sc === 2) {
      xx = sa
        ? aschs.sort((a, b) => a.dateInSeconds - b.dateInSeconds)
        : aschs.sort((a, b) => b.dateInSeconds - a.dateInSeconds);
    } else {
      return;
    }

    setFilteredPlaylists(xx);
    setSortColumn(sc);
    setSortAscending(sa);
    forceUpdate((n) => !n);
  };

  const columnHeader = (col, name) => {
    return (
      <th
        onClick={() => {
          var asc = sortColumn === col ? !sortAscending : true;
          doSort(filteredPlaylists, col, asc);
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

  const getSharedColour = (playlist) => {
    if (playlist) {
      if (playlist.shareStatus === undefined || playlist.shareStatus === null) {
        return "mr-1.5 h-5 w-5 flex-shrink-0 text-error";
      } else {
        if (playlist.shareStatus === 1) {
          return "mr-1.5 h-5 w-5 flex-shrink-0 text-success";
        } else if (playlist.shareStatus === 2) {
          return "mr-1.5 h-5 w-5 flex-shrink-0 text-warning";
        } else {
          return "mr-1.5 h-5 w-5 flex-shrink-0 text-error";
        }
      }
    } else {
      return "mr-1.5 h-5 w-5 flex-shrink-0 text-error";
    }
  };

  const onPlaylistsScreenChanged = async (screen) => {
    setSelectedScreen(screen);
    var ms =
      screen === 0
        ? await fetchAllMyPlaylists()
        : await fetchAllSharedPlaylists();
    setAllPlaylists(ms);
    setFilteredPlaylists(ms);
    setSelectedTagOptions([{ value: "All", label: "All Tags" }]);
  };

  const doInit = async () => {
    var ms =
      selectedScreen === 0
        ? await fetchAllMyPlaylists()
        : await fetchAllSharedPlaylists();
    var tags = [];
    for (var m of ms) {
      const pltags = m.tags.split("|");
      for (var pltag of pltags) {
        if (tags.filter((t) => t.value === pltag).length === 0) {
          tags.push({ value: pltag, label: pltag });
        }
      }
    }
    const aps = tags.sort((a, b) => a.label.localeCompare(b.label));
    var apops = [{ value: "All", label: "All Tags" }];
    for (var p of aps) {
      apops.push(p);
    }
    setAllTagsOptions(apops);
    doSort(ms, sortColumn, sortAscending);
    setAllPlaylists(ms);
    setFilteredPlaylists(ms);
  };

  useEffect(() => {
    if (allPlaylists.length === 0) {
      doInit();
    }
  }, []);

  const tabs = [
    { name: "My Play Lists", index: 0, current: true },
    { name: "Shared Play Lists", index: 1, current: false },
  ];

  return (
    <>
      <div className="flex-col h-[88vh] mt-4">
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="flex-col">
              <div className="border-b border-gray-200">
                <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <a
                      key={tab.name}
                      onClick={() => onPlaylistsScreenChanged(tab.index)}
                      aria-current={
                        tab.index === selectedScreen ? "page" : undefined
                      }
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

              <div className="flex gap-2 my-4">
                <div className="flex gap-2 w-72 -mt-0.5">
                  <div className="mt-1.5 text-sm text-base-content">Tags:</div>
                  <Select
                    value={selectedTagOptions}
                    options={allTagsOptions}
                    onChange={onTagChanged}
                    className="w-72 h-[10px] text-sm"
                    isMulti
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="inline-block min-w-full py-2 align-middle">
                  <div className="">
                    <table className="table-generic">
                      <thead className="thead-generic">
                        <tr>
                          {/* <th
                            scope="col"
                            className="px-3 py-2 text-left text-sm font-semibold text-base-content"
                          ></th> */}
                          {columnHeader(0, "Owner")}
                          {columnHeader(1, "Description")}
                          {columnHeader(2, "Date")}
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
                        {filteredPlaylists &&
                          filteredPlaylists.map((playlist, i) => (
                            <tr
                              key={i}
                              className={
                                i % 2 === 0
                                  ? "bg-transparent"
                                  : "bg-base-300/10"
                              }
                            >
                              {/* <td className="table-cell">
                                <input
                                  type="checkbox"
                                  checked={
                                    playlist.selected &&
                                    playlist.selected === true
                                  }
                                  className="checkbox checkbox-sm mt-1 rounded-none"
                                  onChange={() => doToggleSelect(playlist)}
                                />
                              </td> */}
                              <td className="table-cell">
                                <div className="flex gap-1">
                                  <div className="">{playlist.serverName}</div>
                                </div>
                              </td>
                              <td className="table-cell">
                                <div className="flex gap-1">
                                  <div className="">{playlist.description}</div>
                                </div>
                              </td>
                              <td className="table-cell">
                                {new Date(
                                  playlist.dateInSeconds * 1000
                                ).toLocaleDateString()}
                              </td>
                              {selectedScreen === 0 ? (
                                <>
                                  <td className="table-cell">
                                    <p className="cursor-pointer flex items-center text-sm text-gray-500">
                                      <TrashIcon
                                        className="mr-1.5 h-5 w-5 flex-shrink-0"
                                        aria-hidden="true"
                                        onClick={() =>
                                          doDeletePlaylist(playlist)
                                        }
                                      />
                                    </p>
                                  </td>
                                  <td className="table-cell">
                                    <p className="cursor-pointer flex items-center text-sm text-gray-500">
                                      <ShareIcon
                                        className={getSharedColour(playlist)}
                                        aria-hidden="true"
                                        onClick={() =>
                                          doSharePlaylist(playlist)
                                        }
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
                                    className="mr-1.5 h-5 w-5 flex-shrink-0"
                                    aria-hidden="true"
                                    onClick={() => doPlaylist(playlist)}
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
                shareStatus={selectedPlaylist && selectedPlaylist.shareStatus}
                shareUsers={selectedPlaylist && selectedPlaylist.shareUsers}
                currentTime={thisDayTimeCode}
                onShare={(share) => doDoShare(share)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PlaylistsList;
