import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { dayTimeCode, saveToPC } from "../utils/Utils";
import {
  XMarkIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChatBubbleLeftEllipsisIcon,
  FolderPlusIcon,
  CloudArrowUpIcon,
  StopIcon,
} from "@heroicons/react/20/solid";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";

import {
  FolderPlusIcon as FolderPlusIconOutline,
  CloudArrowUpIcon as CloudArrowUpIconOutline,
  ChatBubbleLeftEllipsisIcon as ChatBubbleLeftEllipsisIconOutline,
} from "@heroicons/react/24/outline";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
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
  const navigate = useNavigate();
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [playlists, setPlaylists] = useState(null);
  const [comments, setComments] = useState(null);
  const location = useLocation();
  const {
    playlistFileData,
    filename,
    playlist,
    serverName,
    description,
    initialTags,
  } = location.state;
  const [playlistId, setPlaylistId] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef();
  const [videoFilePath, setVideoFilePath] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [pendingVideoLocation, setPendingVideoLocation] = useState(0);
  const [videoheight, setVideoHeight] = useState(0);
  const [videoWidth, setVideoWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const videoref = useRef();
  const [comment, setComment] = useState(null);
  const [thisDayTimeCode, setThisDayTimeCode] = useState(dayTimeCode());
  const [thisShare, setThisShare] = useState(null);
  const [selectedTags, setSelectedTags] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    const sb = window.innerWidth > 960 ? 320 + 80 : 80; // smaller than md
    setVideoWidth(window.innerWidth - sb);
    setWindowHeight(window.innerHeight);
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
    const playlistdescription = document.getElementById(
      "playlistdescription"
    ).value;
    const playlistcomments = document.getElementById("playlistcomments").value;
    const tags = selectedTags.map((t) => t.value);
    if (playlistdescription === "") {
      toast.error("Description is required");
      return;
    }
    if (playlistcomments === "") {
      toast.error("Comments are required");
      return;
    }
    if (tags.length === 0) {
      toast.error("Tags are required");
      return;
    }

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
    if (playlistdescription === "") {
      toast.error("Description is required");
      return;
    }
    if (playlistcomments === "") {
      toast.error("Comments are required");
      return;
    }
    if (stags === "") {
      toast.error("Tags are required");
      return;
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
      return item.eventStringColor + " px-2 font-bold text-shadow";
    } else {
      return "font-bold mt-1";
    }
  };

  const handleSelectTags = (e) => {
    setSelectedTags(e);
    forceUpdate((n) => !n);
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
      const sb = window.innerWidth > 960 ? 320 + 80 : 80; // smaller than md
      setVideoWidth(window.innerWidth - sb);
      setWindowHeight(window.innerHeight);
    }

    if (description) {
      document.getElementById("playlistdescription").value = description;
    }
    if (initialTags && initialTags.length > 0 && !selectedTags) {
      var apops = [];
      for (var p of initialTags) {
        apops.push({ value: p, label: p });
      }
      setSelectedTags(apops);
    }

    if (playlists && !selectedItem) {
      doSelectItem(playlists[0]);
    }

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  });

  useEffect(() => {}, [showPlaylist, videoFilePath, selectedItem, comment]);

  const onBackClick = () => {
    navigate(-1);
  };

  const doDot = (item) => {
    if (item.eventStringColor) {
      return item.eventStringColor + " size-4 sm:size-5";
    } else {
      return "size-4 sm:size-5";
    }
  };

  const doItemDetails = () => {
    return (
      <>
        {selectedItem ? (
          <div className="flex-col text-xs sm:text-sm text-base-content/80 w-full">
            <div className="flex justify-between">
              <div className="">
                <p className="font-bold px-2 mt-2">{selectedItem.playerName}</p>
              </div>
              <div className="">
                <p className="font-light mt-2">{selectedItem.eventSubstring}</p>
              </div>
            </div>
            <div className="flex mt-1 font-bold">
              <StopIcon className={doDot(selectedItem)} />
              <p className="sm:text-sm text-xs px-2">
                {selectedItem.eventString}
              </p>
            </div>
          </div>
        ) : (
          <p>Please select an item to play</p>
        )}
      </>
    );
  };

  const doLeftSide = () => {
    return (
      <>
        <div className="flex flex-col gap-1 min-w-[320px] border-r border-base-content/10">
          <div className="flex gap-2 bg-base-300 p-1 h-14">
            <a data-tooltip-id="tt-filters" data-tooltip-content="Save to file">
              <FolderPlusIconOutline
                className="size-10 btn-toolbar"
                onClick={() => doSavePlaylist()}
              />
            </a>
            <Tooltip
              id="tt-filters"
              place={"bottom-end"}
              style={{
                backgroundColor: "oklch(var(--b3))",
                color: "oklch(var(--bc))",
              }}
            />
            <a
              data-tooltip-id="tt-db"
              data-tooltip-content="Upload to database"
            >
              <CloudArrowUpIconOutline
                className="size-10 btn-toolbar"
                onClick={() => doSharePlaylist()}
              />
            </a>
            <Tooltip
              id="tt-db"
              place={"bottom-end"}
              style={{
                backgroundColor: "oklch(var(--b3))",
                color: "oklch(var(--bc))",
              }}
            />
          </div>
          <div
            aria-disabled={isEditable === false}
            className={
              isEditable === false
                ? "flex-col is-disabled p-2 bg-base-200"
                : "flex-col p-2 bg-base-200"
            }
          >
            <input
              id="playlistdescription"
              type="text"
              placeholder="Description"
              className="input input-sm p-1 input-bordered w-full rounded-md mb-1"
            />
            <textarea
              id="playlistcomments"
              placeholder="Comments"
              className="textarea textarea-bordered p-1 w-full h-10 rounded-md"
              style={{ lineHeight: "1.25" }}
            ></textarea>
            <div className="flex gap-2">
              <CreatableSelect
                ref={tagsRef}
                id="selectTags"
                name="selectTags"
                placeholder="Select tags"
                onChange={handleSelectTags.bind(this)}
                className="block w-full border-base-300 shadow-sm focus:border-base-300 focus:ring-base-300 text-xs rounded-md"
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
      </>
    );
  };

  const doRightSide = () => {
    return (
      <>
        <div className="flex-col">
          <div className="flex flex-col w-full justify-between ml-2">
            <div className="flex gap-2 h-16 overflow-auto">
              <div className="">
                {selectedItem && selectedItem.comment ? (
                  <ChatBubbleLeftEllipsisIcon className="w-6 h6 text-success" />
                ) : (
                  <ChatBubbleLeftEllipsisIconOutline className="w-6 h6 text-base-content/50" />
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
                  width={`${calcVideoSize().width}px`}
                  height={`${calcVideoSize().height}px`}
                  controls={true}
                  onReady={() => playerReady()}
                />
              ) : (
                <ReactPlayer
                  ref={playerRef}
                  url={videoFilePath}
                  playing={true}
                  width={`${calcVideoSize().width}px`}
                  height={`${calcVideoSize().height}px`}
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
      </>
    );
  };

  return (
    <>
      <div className="">
        <div>
          <Dialog
            open={sidebarOpen}
            onClose={setSidebarOpen}
            className="relative z-50 lg:hidden"
          >
            <DialogBackdrop
              transition
              className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
            />

            <div className="fixed inset-0 flex">
              <DialogPanel
                transition
                className="relative mr-16 flex w-full max-w-[320px] flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
              >
                <TransitionChild>
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                    <button
                      type="button"
                      onClick={() => setSidebarOpen(false)}
                      className="-m-2.5 p-2.5"
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        aria-hidden="true"
                        className="size-6 text-white"
                      />
                    </button>
                  </div>
                </TransitionChild>
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex grow flex-col bg-base-100">
                  {doLeftSide()}
                </div>
              </DialogPanel>
            </div>
          </Dialog>

          {/* Static sidebar for desktop */}
          <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-[320px] lg:flex-col">
            {/* Sidebar component, swap this element with another sidebar if you like */}
            <div className="flex grow flex-col bg-base-100">{doLeftSide()}</div>
          </div>

          <div className="lg:px-4 lg:ml-72 w-fit">
            <div className="sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-0">
              <div className="flex h-14 items-center gap-x-4 border-b border-gray-200 bg-base-300 px-2 shadow-sm sm:gap-x-6 sm:px-0 lg:px-2 lg:shadow-none">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="-m-2.5 p-2.5 text-base-content/50 lg:hidden"
                >
                  <span className="sr-only">Open sidebar</span>
                  <Bars3Icon
                    aria-hidden="true"
                    className="size-6 cursor-pointer text-base-content/50 hover:text-base-content/80"
                  />
                </button>

                <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 lg:ml-8">
                  <form
                    action="#"
                    method="GET"
                    className="grid flex-1 grid-cols-1"
                  >
                    {/* <h1 className="text-sm text-center py-2 font-semibold text-gray-900"> */}
                    <div className="flex justify-between">
                      {doItemDetails()}

                      <div className="flex ml-4">
                        <a
                          data-tooltip-id="tt-prev"
                          data-tooltip-content="Previous item"
                        >
                          <button type="button" className="mt-3.5">
                            <span className="sr-only">Navigate Back</span>
                            <ChevronLeftIcon
                              className="size-6 cursor-pointer text-base-content/50 hover:text-base-content/80"
                              onClick={() => moveToItem(-1)}
                            />
                          </button>
                        </a>
                        <Tooltip
                          id="tt-prev"
                          place={"bottom-end"}
                          style={{
                            backgroundColor: "oklch(var(--b3))",
                            color: "oklch(var(--bc))",
                          }}
                        />

                        <a
                          data-tooltip-id="tt-prev"
                          data-tooltip-content="Next item"
                        >
                          <button type="button" className="mt-3.5">
                            <span className="sr-only">Navigate Back</span>
                            <ChevronRightIcon
                              className="size-6 cursor-pointer text-base-content/50 hover:text-base-content/80"
                              onClick={() => moveToItem(1)}
                            />
                          </button>
                        </a>
                        <Tooltip
                          id="tt-prev"
                          place={"bottom-end"}
                          style={{
                            backgroundColor: "oklch(var(--b3))",
                            color: "oklch(var(--bc))",
                          }}
                        />
                      </div>
                    </div>
                  </form>
                  <div className="flex items-center gap-x-4 lg:gap-x-6">
                    <button type="button" className="">
                      <span className="sr-only">Navigate Back</span>
                      <XMarkIcon
                        aria-hidden="true"
                        className="size-6 cursor-pointer text-base-content/50 hover:text-base-content/80"
                        onClick={() => onBackClick()}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <main className="py-2">
              <div className="mx-auto max-w-7xl px-1 sm:pl-0 sm:pr-2 lg:pr-2 lg:pl-8">
                {doRightSide()}
              </div>
            </main>
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
          </div>
        </div>
      </div>
    </>
  );
}

export default Playlist;
