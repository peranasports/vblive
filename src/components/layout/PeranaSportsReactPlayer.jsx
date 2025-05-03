import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";

function PeranaSportsReactPlayer({ videoFilePath }) {
  const playerRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [sizeVideo, setSizeVideo] = useState({ width: 0, height: 0 });

  let seekInterval = 2.5;
  function seekBack() {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() - seekInterval);
  }

  // Function to seek forwards and display a timecode overlay
  function seekForward() {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() + seekInterval);
  }

  const doSwipe = (interval) => {
    if (interval > 0) {
      seekInterval = interval;
      seekForward();
    } else {
      seekInterval = -interval;
      seekBack();
    }
  };

  const handleScroll = (e) => {
    if (playerRef.current && e.target.src) {
        setPlaying(false);
      seekInterval = -e.deltaY / 20.0;
      if (e.deltaY > 0) {
        doSwipe(seekInterval);
      } else {
        doSwipe(seekInterval);
      }
    }

    // if (playerRef.current && duration >= 0) {
    //   const currentTime = playerRef.current.getCurrentTime();
    //   let newTime = currentTime + e.deltaY * 0.02;

    //   if (newTime <= 0) {
    //     playerRef.current.seekTo(0, "seconds");
    //   } else if (newTime >= duration) {
    //     playerRef.current.seekTo(duration, "seconds");
    //   } else {
    //     e.preventDefault();
    //     playerRef.current.seekTo(newTime, "seconds");
    //   }
    // }
  };

  useEffect(() => {
    window.addEventListener("wheel", handleScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleScroll);
    };
  }, [duration]);

  return (
    <>
      <ReactPlayer
        ref={playerRef}
        url={videoFilePath}
        playing={playing}
        controls={true}
        width="100%"
        height={`${(sizeVideo?.width * 9) / 16 - 40}px`}
        playbackRate={playbackRate}
        onClickPreview={() => setPlaying(!playing)}
      />
    </>
  );
}

export default PeranaSportsReactPlayer;
