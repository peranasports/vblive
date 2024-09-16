import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { dayTimeCode, saveToPC } from "../utils/Utils";
import {
  XMarkIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChatBubbleLeftEllipsisIcon,
  FolderPlusIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/20/solid";
import {
  FolderPlusIcon as FolderPlusIconOutline,
  CloudArrowUpIcon as CloudArrowUpIconOutline,
} from "@heroicons/react/24/outline";
import PlaylistList from "./PlaylistList";
import ReactPlayer from "react-player";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import { myunzip, myzip } from "../utils/zip";
import { storePlaylist } from "../../context/VBLiveAPI/VBLiveAPIAction";
import Share from "../matches/Share";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

function Playlist() {
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [playlists, setPlaylists] = useState(null);
  const [comments, setComments] = useState(null);
  const location = useLocation();
  const { playlistFileData, filename, playlist, serverName } = location.state;
  const [playlistId, setPlaylistId] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef();
  const [videoFilePath, setVideoFilePath] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [pendingVideoLocation, setPendingVideoLocation] = useState(0);
  const [videowidth, setVideoWidth] = useState(0);
  const [videoheight, setVideoHeight] = useState(0);
  const videoref = useRef();
  const [comment, setComment] = useState(null);
  const [thisDayTimeCode, setThisDayTimeCode] = useState(dayTimeCode());
  const [thisShare, setThisShare] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const basictags = [
    "middles",
    "outsides",
    "liberos",
    "setters",
    "opposites",
    "passing",
    "spiking",
    "serving",
    "blocking",
    "defending",
  ];
  const [allTags, setAllTags] = useState(null);
  const [, forceUpdate] = useState(0);
  const [isEditable, setIsEditable] = useState(false);

  const useFocus = () => {
    const htmlElRef = useRef(null);
    const setFocus = () => {
      htmlElRef.current && htmlElRef.current.focus();
    };

    return [htmlElRef, setFocus];
  };
  const [tagsRef, setTagsFocus] = useFocus();

  const getVideoWindowSize = (width, height) => {
    var w = width;
    var h = width * 0.5625;
    return { width: w + "px", height: h + "px" };
  };

  useLayoutEffect(() => {
    if (videoref.current !== null) {
      const vsize = getVideoWindowSize(
        videoref.current.offsetWidth,
        videoref.current.offsetHeight
      );
      console.log("useLayoutEffect:", vsize);
      setVideoWidth(vsize.width);
      setVideoHeight(vsize.height);
    }
  }, []);

  const doSelectItem = (pl) => {
    setSelectedItem(pl);
    if (pl.videoOnlineUrl !== videoFilePath) {
      setIsReady(false);
      setVideoFilePath(pl.videoOnlineUrl);
      setPendingVideoLocation(pl.videoPosition);
    } else {
      goToVideoPosition(pl.videoPosition);
    }
  };

  const goToVideoPosition = (videoTime) => {
    playerRef.current.seekTo(videoTime, "seconds");
  };

  const playerReady = () => {
    if (!isReady) {
      setIsReady(true);
      playerRef.current.seekTo(pendingVideoLocation, "seconds");
    }
  };

  const toggleDrawerSide = (show) => {
    setShowPlaylist(show);
    // if (show === false)
    // {
    //   const vsize = getVideoWindowSize(
    //     videoref.current.offsetWidth,
    //     videoref.current.offsetHeight
    //   );
    //   console.log("toggleDrawerSide:", vsize);
    //   setVideoWidth(vsize.width);
    //   setVideoHeight(vsize.height);
    // }
  };

  const moveToItem = (pos) => {
    var n = playlists.indexOf(selectedItem);
    n += pos;
    if (n === -1) {
      n = playlists.length - 1;
    } else if (n === playlists.length) {
      n = 0;
    }
    doSelectItem(playlists[n]);
  };

  const onCommentChange = (e) => {
    setComment(e.target.value);
  };

  const doSaveComment = () => {
    // document.getElementById("modal-comment").checked = false;
    selectedItem.comment = comment;
    setComment("");
  };

  const doCommentClicked = (pl) => {
    const cm = pl.comment !== undefined ? pl.comment : "";
    setComment(cm);
    document.getElementById("modal-comment").checked = true;
  };

  const doRemoveItem = (pl) => {
    confirmAlert({
      title: "Remove Item",
      message: "Do you really want to remove the selected item?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            const idx = playlists.indexOf(pl);
            playlists.splice(idx, 1);
            if (selectedItem === pl) {
              setSelectedItem(null);
            }
            forceUpdate((n) => !n);
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  const doSavePlaylist = () => {
    const desc = document.getElementById("playlistdescription").value;
    const comments = document.getElementById("playlistcomments").value;
    var tags = [];
    for (var selectedTag of selectedTags) {
      tags.push(selectedTag.value);
    }
    const descx = desc.replace(/(" ")/gm, "_");
    const fn = dayTimeCode() + "_" + desc + ".playlist";
    saveToPC(
      JSON.stringify({
        events: playlists,
        description: desc,
        comments: comments,
        tags: tags,
      }),
      fn
    );
  };

  const doSharePlaylist = async () => {
    setThisDayTimeCode(dayTimeCode());
    document.getElementById("modal-share").checked = true;
  };

  const doDoShare = async (share) => {
    document.getElementById("modal-share").checked = false;
    if (!share) {
      return;
    }
    setThisShare(share);
    const playlistdescription = document.getElementById(
      "playlistdescription"
    ).value;
    const playlistcomments = document.getElementById("playlistcomments").value;
    const tags = selectedTags.map((t) => t.value);
    var stags = "";
    for (var t of tags) {
      if (stags.length > 0) stags += "|";
      stags += t;
    }
    const now = new Date();
    const xpl = myzip(JSON.stringify(playlists));
    const pl = {
      id: playlistId,
      description: playlistdescription,
      comments: playlistcomments,
      tags: stags,
      playlists: xpl,
      appName: "VBLive",
      serverName: serverName,
      dateInSeconds: now.getTime() / 1000,
      shareStatus: share.shareStatus,
      shareUsers: share.shareUsers,
    };
    const newplid = await storePlaylist(pl);
    if (newplid > 0) {
      setPlaylistId(newplid);
      toast.success("Playlist saved successfully");
    } else {
      toast.error("Error saving playlist");
    }
    forceUpdate((n) => !n);
  };

  const getEventString = (item) => {
    if (item.eventStringColor) {
      return item.eventStringColor + " font-bold mt-1";
    } else {
      return "font-bold mt-1";
    }
  };

  const handleSelectTags = (e) => {
    setSelectedTags(e);
    forceUpdate((n) => !n);
  };

  useEffect(() => {
    if (!allTags) {
      if (playlistFileData) {
        setPlaylistId(0);
        if (playlists === null) {
          const pls = JSON.parse(playlistFileData);
          setPlaylists(pls.events);
          document.getElementById("playlistdescription").value = pls.description
            ? pls.description
            : "";
          document.getElementById("playlistcomments").value = pls.comments
            ? pls.comments
            : "";
          if (pls.tags) {
            var tgoptions = [];
            for (var tg of pls.tags) {
              tgoptions.push({ value: tg, label: tg });
            }
            setSelectedTags(tgoptions);
          }
        }
        setThisShare({ shareStatus: 0, shareUsers: "" });
        setIsEditable(filename === null);
      } else if (playlist) {
        setIsEditable(playlist.serverName === serverName);
        document.getElementById("playlistdescription").value =
          playlist.description;
        setPlaylistId(playlist.id);
        setThisShare({
          shareStatus: playlist.shareStatus !== null ? playlist.shareStatus : 0,
          shareUsers: playlist.shareUsers !== null ? playlist.shareUsers : "",
        });
        document.getElementById("playlistcomments").value = playlist.comments;
        var tgs = playlist.tags.split("|");
        var tgoptions = [];
        for (var tg of tgs) {
          tgoptions.push({ value: tg, label: tg });
        }
        setSelectedTags(tgoptions);
        const xpl = myunzip(playlist.playlists);
        if (playlists === null) {
          setPlaylists(JSON.parse(xpl));
        }
      }
      var apops = [];
      for (var p of basictags) {
        apops.push({ value: p, label: p });
      }
      setAllTags(apops);
    }

    function handleWindowResize() {
      if (videoref.current !== null) {
        const vsize = getVideoWindowSize(
          videoref.current.offsetWidth,
          videoref.current.offsetHeight
        );
        console.log("handleWindowResize:", vsize);
        setVideoWidth(vsize.width);
        setVideoHeight(vsize.height);
      }
    }

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  });

  useEffect(() => {}, [showPlaylist, videoFilePath, selectedItem, comment]);

  return (
    <>
      <div className="">
        <div className="flex gap-2">
          {showPlaylist ? (
            <div className="flex flex-col gap-1">
              <div className="flex gap-2 bg-base-300 p-1 h-10">
                <div className="tooltip" data-tip="Save to file">
                  <FolderPlusIconOutline
                    className="btn btn-xs h-8 w-12 btn-info rounded-none"
                    onClick={() => doSavePlaylist()}
                  />
                </div>
                <div className="tooltip" data-tip="Save to database">
                  <CloudArrowUpIconOutline
                    className="btn btn-xs h-8 w-12 btn-info rounded-none"
                    onClick={() => doSharePlaylist()}
                  />
                </div>
                {/* <p className="text-sm p-2">{filename.name}</p> */}
                {/* <XMarkIcon
                  className="w-8 h-8 cursor-pointer"
                  onClick={() => toggleDrawerSide(false)}
                /> */}
              </div>
              <div
                aria-disabled={isEditable === false}
                className={
                  isEditable === false ? "flex-col is-disabled" : "flex-col"
                }
              >
                <input
                  id="playlistdescription"
                  type="text"
                  placeholder="Description"
                  className="input input-sm p-1 input-bordered w-full rounded-none mb-1"
                />
                <textarea
                  id="playlistcomments"
                  placeholder="Comments"
                  className="textarea textarea-bordered p-1 w-full h-10 rounded-none"
                  style={{ lineHeight: "1.25" }}
                ></textarea>
                <div className="flex gap-2">
                  <CreatableSelect
                    ref={tagsRef}
                    id="selectTags"
                    name="selectTags"
                    onChange={handleSelectTags.bind(this)}
                    className="block w-full border-base-300 shadow-sm focus:border-base-300 focus:ring-base-300 text-xs rounded-none"
                    options={allTags}
                    value={selectedTags}
                    isMulti
                  />
                </div>
              </div>
              <div className="overflow-auto min-w-[320px] h-[70vh] mt-2">
                <PlaylistList
                  playlists={playlists}
                  selItem={selectedItem}
                  onItemSelected={(pl) => doSelectItem(pl)}
                  onCommentClicked={(pl) => doCommentClicked(pl)}
                  onItemRemoved={(pl) => doRemoveItem(pl)}
                />
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className="flex flex-col w-full" ref={videoref}>
            <div className="flex justify-between bg-base-200 h-10">
              {showPlaylist ? (
                <></>
              ) : (
                <Bars3Icon
                  className="w-8 h-8 cursor-pointer"
                  onClick={() => toggleDrawerSide(true)}
                />
              )}
              {selectedItem ? (
                <div className="flex gap-2">
                  <p className="text-md font-bold px-2 mt-2">
                    {selectedItem.playerName}
                  </p>
                  <div className="mt-1 text-md font-bold">
                    <p className={getEventString(selectedItem)}>
                      {selectedItem.eventString}
                    </p>
                  </div>
                  <p className="text-md font-light px-2 mt-2">
                    {selectedItem.eventSubstring}
                  </p>
                </div>
              ) : (
                <p>Please select an item to play</p>
              )}

              <div className="flex">
                <ChevronLeftIcon
                  className="w-8 h-8 cursor-pointer"
                  onClick={() => moveToItem(-1)}
                />
                <ChevronRightIcon
                  className="w-8 h-8 cursor-pointer"
                  onClick={() => moveToItem(1)}
                />
              </div>
            </div>
            <div className="flex gap-2 h-16 overflow-auto">
              <div className="">
                {selectedItem && selectedItem.comment ? (
                  <ChatBubbleLeftEllipsisIcon className="w-6 h6 text-success" />
                ) : (
                  <ChatBubbleLeftEllipsisIcon className="w-6 h6 text-base-content" />
                )}
              </div>
              <p
                className="text-sm font-medium"
                style={{ whiteSpace: "pre-line" }}
              >
                {selectedItem && selectedItem.comment}
              </p>
            </div>
            <div className="flex justify-center bg-black">
              {videoFilePath && videoFilePath.includes("youtube") ? (
                <ReactPlayer
                  ref={playerRef}
                  url={videoFilePath}
                  playing={true}
                  width={videowidth}
                  height={videoheight}
                  // width="100%"
                  // height="100%"
                  controls={true}
                  onReady={() => playerReady()}
                />
              ) : (
                <ReactPlayer
                  ref={playerRef}
                  url={videoFilePath}
                  playing={true}
                  width={videowidth}
                  height={videoheight}
                  // width="100%"
                  // height="100%"
                  controls={true}
                  onReady={() => playerReady()}
                />
              )}
            </div>
            <p className="text-xs mt-1 ml-2">{videoFilePath}</p>
            <div className="flex flex-col">
              {comments &&
                comments.map((cm, i) => (
                  <div className="">
                    {i % 2 === 0 ? (
                      <div className="chat chat-start">
                        <div className="chat-bubble">{cm}</div>
                      </div>
                    ) : (
                      <div className="chat chat-end">
                        <div className="chat-bubble">{cm}</div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <input type="checkbox" id="modal-comment" className="modal-toggle" />
        <div className="modal">
          <div className="modal-box sm:w-4/12 w-full max-w-5xl h-[50vh]">
            <h3 className="mb-4 font-bold text-2xl">Comment</h3>
            <div className="flex flex-col">
              <div>
                <textarea
                  placeholder="Type comment here"
                  value={comment}
                  style={{ whiteSpace: "pre-line" }}
                  className="textarea textarea-bordered w-full h-40"
                  onChange={onCommentChange}
                />
              </div>
              <div className="flex justify-end">
                <div className="modal-action">
                  <label
                    htmlFor="modal-comment"
                    className="btn btn-sm btn-info"
                  >
                    Close
                  </label>
                </div>
                <div className="modal-action">
                  <label
                    htmlFor="modal-comment"
                    className="btn btn-sm btn-info ml-4"
                    onClick={() => doSaveComment()}
                  >
                    Save
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <input type="checkbox" id="modal-share" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box sm:w-4/12 w-full max-w-5xl min-w-[480px] h-[70vh] shadow rounded-none">
          <h3 className="mb-4 font-bold text-2xl">Share</h3>
          <div className="flex flex-col">
            <div>
              <Share
                shareStatus={thisShare && thisShare.shareStatus}
                shareUsers={thisShare && thisShare.shareUsers}
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

      {/* <input type="checkbox" id="modal-newtags" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box sm:w-5/12 w-full max-w-5xl h-[24vh] rounded-none">
          <h3 className="mb-4 font-bold text-2xl"></h3>
          <div className="flex flex-col">
            <div className="flex-col text-sm">
              <div>Enter tags separated by commas (,)</div>
              <input
                id="newtags"
                type="text"
                placeholder="tag1, tag2, tag3"
                className="input input-sm mt-2 input-bordered w-full rounded-none"
              />
            </div>
            <div className="flex justify-end">
              <div className="modal-action">
                <label
                  htmlFor="modal-newtags"
                  className="btn btn-sm btn-info rounded-none"
                >
                  Close
                </label>
              </div>
              <div className="modal-action">
                <label
                  htmlFor="modal-newtags"
                  className="btn btn-sm btn-info ml-4 rounded-none"
                  onClick={() => doDoAddTags()}
                >
                  Save
                </label>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
}

export default Playlist;
