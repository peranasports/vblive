import { useEffect, useState, useRef } from "react";
import { useCookies } from "react-cookie";
import ReactPlayer from "react-player";
import EventsList from "./EventsList";

function VideoAnalysis({ match }) {
  const playerRef = useRef();
  const dvRef = useRef();
  const [cookies, setCookie] = useCookies(["videofile"]);
  const [videoOnlineUrl, setVideoOnlineUrl] = useState(null);
  const [videoFilePath, setVideoFilePath] = useState(null);
  const [videoFileName, setVideoFileName] = useState(null);
  const [videoFileObject, setVideoFileObject] = useState(null)
  const videoUrl = process.env.REACT_APP_VIDEO_SERVER_URL + match.code + ".mp4";
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [startVideoTime, setStartVideoTime] = useState(null);
  const [videoOffset, setVideoOffset] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [, forceUpdate] = useState(0);

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
    if (ev.VideoPosition !== 0) {
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
  
    const vinfo = { matchDVString:match.dvstring, videoOnlineUrl:videoOnlineUrl, videoFileName:null, videoFileObject:null }
    localStorage.setItem("videoInfo", JSON.stringify(vinfo));
    setVideoFileObject(null)
    setVideoFileName(null);
    setVideoFilePath(videoOnlineUrl);
    forceUpdate((n) => !n)
  };

  const handleVideoUpload = (event) => {
    var url = URL.createObjectURL(event.target.files[0]);
    const vfo = fileObjectToJsonString(event.target.files[0]);
    setVideoFileObject(vfo)
    const vfp = URL.createObjectURL(event.target.files[0])
    setVideoFilePath(vfp);
    const vfn = event.target.files[0].name
    setVideoFileName(vfn);
    setVideoOnlineUrl("")
    const vinfo = { matchDVString:match.dvstring, videoOnlineUrl:null, videoFileName:vfn, videoFileObject:vfo }
    localStorage.setItem("videoInfo", JSON.stringify(vinfo));
    forceUpdate((n) => !n);
  };

  useEffect(() => {
    const vobj = localStorage.getItem("videoInfo");
    if (vobj !== null)
    {
      const vinfo = JSON.parse(vobj)
      if (vinfo.matchDVString === match.dvstring)
      {
        if (vinfo.videoOnlineUrl !== null)
        {
          setVideoOnlineUrl(vinfo.videoOnlineUrl)
          setVideoFilePath(vinfo.videoOnlineUrl)
        }
        else if (vinfo.videoFileObject !== null)
        {
          const fobj = JSON.parse(vinfo.videoFileObject)
          // const vfp = URL.createObjectURL(fobj)
          // setVideoFilePath(vfp)
          setVideoFileName(fobj.name)
        }
      }
    }

    forceUpdate((n) => !n);
    // var vf = cookies.videofile;
    // if (vf !== undefined) {
    //   // var file = JSON.parse(vf)
    //   // var url = URL.createObjectURL(vf)
    //   // setVideoFilePath(url)
    // }
    // setVideoFilePath(
    //   process.env.REACT_APP_VIDEO_SERVER_URL + match.code + ".mp4"
    // );
  }, []);

  if (match === undefined) {
    return <></>;
  }

  return (
    <>
      <div className="drawer drawer-mobile">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <div className="flex flex-col w-full justify-between">
            <div>
              <div className="flex my-4">
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
              <div className="flex justify-between my-4">
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
                {/* <ReactPlayer
                  ref={playerRef}
                  url={videoFilePath}
                  playing={true}
                  width="90%"
                  height="90%"
                  controls={true}
                  onReady={() => playerReady()}
                /> */}
              </div>
            </div>
          </div>
        </div>
        <div className="drawer-side h-full">
          <label htmlFor="my-drawer-3" className="drawer-overlay"></label>
          <div className="overflow-y-auto w-80 bg-base-100">
            <EventsList
              match={match}
              doSelectEvent={(ev) => doSelectEvent(ev)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default VideoAnalysis;
