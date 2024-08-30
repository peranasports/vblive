import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { saveToPC } from "../utils/Utils";
import {
  XMarkIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/20/solid";
import PlaylistList from "./PlaylistList";
import ReactPlayer from "react-player";

function Playlist() {
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [playlists, setPlaylists] = useState(null);
  const [comments, setComments] = useState(null);
  const location = useLocation();
  const { playlistFileData, filename } = location.state;
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef();
  const [videoFilePath, setVideoFilePath] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [pendingVideoLocation, setPendingVideoLocation] = useState(0);
  const [videowidth, setVideoWidth] = useState(0);
  const [videoheight, setVideoHeight] = useState(0);
  const videoref = useRef();
  const [comment, setComment] = useState(null);

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

  const doSavePlaylist = () => {
    saveToPC(JSON.stringify({events:playlists}), filename);
  }

  useEffect(() => {
    if (playlistFileData !== null && playlists === null) {
      const pls = JSON.parse(playlistFileData);
      setPlaylists(pls.events);
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
            <div className="flex flex-col">
              <div className="flex justify-between bg-[#00000050]">
                <button className="btn btn-sm btn-primary rounded-none" onClick={() => doSavePlaylist()}>Save Play List</button>
                {/* <p className="text-sm p-2">{filename.name}</p> */}
                {/* <XMarkIcon
                  className="w-8 h-8 cursor-pointer"
                  onClick={() => toggleDrawerSide(false)}
                /> */}
              </div>
              <div className="overflow-auto w-[260px] h-[70vh] mt-2">
                <PlaylistList
                  playlists={playlists}
                  selItem={selectedItem}
                  onItemSelected={(pl) => doSelectItem(pl)}
                  onCommentClicked={(pl) => doCommentClicked(pl)}
                />
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className="flex flex-col w-full" ref={videoref}>
            <div className="flex justify-between h-8 bg-[#00000050]">
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
                  <p className="text-sm font-bold px-2 mt-1">
                    {selectedItem.playerName}
                  </p>
                  <div className="mt-1">
                    <p
                      className={
                        selectedItem.eventStringColor !== ""
                          ? selectedItem.eventStringColor
                          : "text-sm"
                      }
                    >
                      {selectedItem.eventString}
                    </p>
                  </div>
                  <p className="text-sm font-light px-2 mt-1">
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
            <div className="flex gap-2 h-6">
              {selectedItem && selectedItem.comment ? (
                <ChatBubbleLeftEllipsisIcon className="w-6 h6 text-success" />
              ) : (
                <ChatBubbleLeftEllipsisIcon className="w-6 h6 text-base-content" />
              )}
              <p className="text-sm font-medium">
                {selectedItem && selectedItem.comment}
              </p>
            </div>
            <div className="flex justify-center">
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
    </>
  );
}

export default Playlist;
