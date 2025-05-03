import React, { useEffect, useLayoutEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  ArrowsUpDownIcon,
  ArrowsRightLeftIcon,
  UserIcon,
  ArrowUturnLeftIcon,
  ArrowUturnUpIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  FilmIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ReactComponent as PlayVideo } from "../components/assets/icons/Controls-Play.svg";
import { ReactComponent as PauseVideo } from "../components/assets/icons/Controls-Pause.svg";
import { ReactComponent as Undo } from "../components/assets/icons/Undo-Left.svg";
import { ReactComponent as Redo } from "../components/assets/icons/Undo-Right.svg";
import { ReactComponent as UndoMulti } from "../components/assets/icons/Undo-Left-Square.svg";
import { ReactComponent as RedoMulti } from "../components/assets/icons/Undo-Right-Square.svg";
import { ReactComponent as EditMatchState } from "../components/assets/icons/Task-List-Edit.svg";
import { ReactComponent as TVRetro } from "../components/assets/icons/Tv-Retro.svg";
import { ReactComponent as TVCancel } from "../components/assets/icons/Tv-Disable.svg";
import {
  kStageServe,
  kStagePass,
  kStageSet,
  kStageAttack,
  kStageBlock,
  kStageCover,
  kStageDefense,
  kStageFreeball,
  kSkillServe,
  kSkillPass,
  kSkillSet,
  kSkillAttack,
  kSkillBlock,
  kSkillCover,
  kSkillDefense,
  kSkillFreeball,
  kSkillSpike,
  kEventModifierLastTouchError,
  kEventModifierLastSpikeError,
  kEventModifierLastSpikeKill,
} from "../components/utils/Constants";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import EventEditor from "../components/layout/EventEditor";
import Scoreboard from "../components/layout/Scoreboard";
import CurrentMatchState from "../components/layout/CurrentMatchState";
import ReactPlayer from "react-player";
import { useSwipeable } from "react-swipeable";
import {
  generateUUID,
  getBrowser,
  getOperatingSystem,
  playerInitialAndName,
  realGameScores,
  rotateTeam,
} from "../components/utils/Utils";
import { DVEventString, eventString } from "../components/utils/DVWFile";
import CodingCourt2 from "../components/layout/CodingCourt2";
import CodingEventsList from "../components/layout/CodingEventsList";
import {
  enableBodyScroll,
  disableBodyScroll,
  clearAllBodyScrollLocks,
} from "body-scroll-lock";
import { toast } from "react-toastify";

function CodingPage() {
  const location = useLocation();
  const { teamA, teamB, match } = location.state;
  const playerRef = React.useRef(null);
  const videoRef = React.createRef();
  const eventsListRef = React.createRef();
  const [playing, setPlaying] = React.useState(false);
  const [isPortrait, setIsPortrait] = React.useState(true);
  const [paddingHeight, setPaddingHeight] = React.useState(0);
  const [sizeMain, setSizeMain] = React.useState(null);
  const [sizeVideo, setSizeVideo] = React.useState(null);
  const [sizeCourt, setSizeCourt] = React.useState(null);
  const [sizeInfo, setSizeInfo] = React.useState(null);
  const [sizeScoreboard, setSizeScoreboard] = React.useState(null);
  const [sizeEventsList, setSizeEventsList] = React.useState(null);
  const [sizeEventEditor, setSizeEventEditor] = React.useState(null);
  const [courtToolbarAtTop, setCourtToolbarAtTop] = React.useState(false);
  const [pcVideo, setPcVideo] = React.useState(null);
  const [pcCourt, setPcCourt] = React.useState(null);
  const [pcInfo, setPcInfo] = React.useState(null);
  const [pcScoreboard, setPcScoreboard] = React.useState(null);
  const [pcEventsList, setPcEventsList] = React.useState(null);
  const [pcEventEditor, setPcEventEditor] = React.useState(null);
  const [videoFilePath, setVideoFilePath] = React.useState(null);
  const [playbackRate, setPlaybackRate] = React.useState(1);
  const [isShowingVideo, setIsShowingVideo] = React.useState(true);
  const [isCourtVertical, setIsCourtVertical] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [currentTeam, setCurrentTeam] = React.useState(teamA);
  const [servingTeam, setServingTeam] = React.useState(teamA);
  const [currentSide, setCurrentSide] = React.useState(0);
  const [currentStage, setCurrentStage] = React.useState(kStageServe);
  const [currentPositionStage, setCurrentPositionStage] =
    React.useState(kStageServe);
  const [currentEvent, setCurrentEvent] = React.useState(null);
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [lastSpikeEvent, setLastSpikeEvent] = React.useState(null);
  const [events, setEvents] = React.useState([]);
  const [scores, setScores] = React.useState({ 0: 0, 1: 0 });
  const [pointNumber, setPointNumber] = React.useState(0);
  const [currentSet, setCurrentSet] = React.useState(null);
  const [topTeam, setTopTeam] = React.useState(teamA);
  const [bottomTeam, setBottomTeam] = React.useState(teamB);
  const handle = useFullScreenHandle();
  const [undoStack, setUndoStack] = React.useState([]);
  const [redoStack, setRedoStack] = React.useState([]);
  const [originalState, setOriginalState] = React.useState(null);
  const [touchStart, setTouchStart] = React.useState(null);
  const [touchEnd, setTouchEnd] = React.useState(null);

  const [, forceUpdate] = React.useState(0);

  const pixelWidthInfo = 300;

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    // if (isLeftSwipe || isRightSwipe) {
    //   console.log("swipe", isLeftSwipe ? "left" : "right");
    //   toast.warning("Swipe detected");
    // }
    // add your conditional logic here
  };

  const addToUndo = () => {
    let st = { ...currentSet.currentState };
    let uds = undoStack;
    uds.push(st);
    setUndoStack(uds);
    localStorage.setItem("currentmatch", JSON.stringify(match));
  };

  const onUndoMulti = () => {
    let uds = undoStack;
    var udid = null;
    do {
      const ud = uds[uds.length - 1];
      if (!udid) {
        udid = ud.id;
      }
      if (ud.id !== udid) {
        break;
      }
      onUndo();
    } while (uds.length > 0);
  };

  const onUndo = () => {
    let uds = undoStack;
    const ud = uds.pop();
    let rds = redoStack;
    rds.push(ud);
    setRedoStack(rds);
    setUndoStack(uds);
    const st = uds.length > 0 ? uds[uds.length - 1] : originalState;
    if (st) {
      currentSet.currentState = st;
      setScores(st.scores);
      currentSet.scores = st.scores;
      setCurrentTeam(st.currentTeam);
      setServingTeam(st.servingTeam);
      setCurrentStage(st.currentStage);
      setCurrentPositionStage(st.currentPositionStage);
      setCurrentSide(st.currentSide);
      setTopTeam(st.topTeam);
      setBottomTeam(st.bottomTeam);
      const event =
        st.events.length > 0 ? st.events[st.events.length - 1] : null;
      setCurrentEvent(event);
      setSelectedEvent(event);
      setEvents(st.events);
      topTeam.scores = st.topTeamScores;
      topTeam.rotation = st.topTeamRotation;
      topTeam.currentLineup = st.topTeamCurrentLineup;
      bottomTeam.currentLineup = st.bottomTeamCurrentLineup;
      bottomTeam.scores = st.bottomTeamScores;
      bottomTeam.rotation = st.bottomTeamRotation;
      localStorage.setItem("currentmatch", JSON.stringify(match));
    }
  };

  const onRedoMulti = () => {
    let rds = redoStack;
    var udid = null;
    do {
      const rd = rds[rds.length - 1];
      if (!udid) {
        udid = rd.id;
      }
      if (rd.id !== udid) {
        break;
      }
      onRedo();
    } while (rds.length > 0);
  };

  const onRedo = () => {
    let rds = redoStack;
    const st = rds.pop();
    setRedoStack(rds);
    if (st) {
      let uds = undoStack;
      uds.push(st);
      setUndoStack(uds);
      currentSet.currentState = st;
      setScores(st.scores);
      currentSet.scores = st.scores;
      setCurrentTeam(st.currentTeam);
      setServingTeam(st.servingTeam);
      setCurrentStage(st.currentStage);
      setCurrentPositionStage(st.currentPositionStage);
      setCurrentSide(st.currentSide);
      setTopTeam(st.topTeam);
      setBottomTeam(st.bottomTeam);
      const event =
        st.events.length > 0 ? st.events[st.events.length - 1] : null;
      setCurrentEvent(event);
      setSelectedEvent(event);
      setEvents(st.events);
      topTeam.scores = st.topTeamScores;
      topTeam.rotation = st.topTeamRotation;
      topTeam.currentLineup = st.topTeamCurrentLineup;
      bottomTeam.currentLineup = st.bottomTeamCurrentLineup;
      bottomTeam.scores = st.bottomTeamScores;
      bottomTeam.rotation = st.bottomTeamRotation;
      localStorage.setItem("currentmatch", JSON.stringify(match));
    }
  };

  const doSelectEvent = (event) => {
    if (event.VideoPosition > 0) {
      playerRef?.current?.seekTo(event.VideoPosition - 3);
    }
    setSelectedEvent(event);
    forceUpdate((n) => !n);
  };

  const onEditMatchState = () => {
    document.getElementById("modal-current-match-state").checked = true;
  };

  const handleVideoSelected = (event) => {
    const vfp = URL.createObjectURL(event.target.files[0]);
    setVideoFilePath(vfp);
    forceUpdate((n) => !n);
  };

  const doPlayerChanged = (player) => {
    selectedEvent.player = player;
    forceUpdate((n) => !n);
  };

  const doSkillChanged = (skill) => {
    selectedEvent.skill = skill;
    forceUpdate((n) => !n);
  };

  const doSubskillChanged = (subskill) => {
    selectedEvent.subskill = subskill;
    forceUpdate((n) => !n);
  };

  const doSetterCallsChanged = (setterCall) => {
    selectedEvent.setterCalls = setterCall;
    forceUpdate((n) => !n);
  };

  const doAttackCombosChanged = (attackCombo) => {
    selectedEvent.attackCombo = attackCombo;
    forceUpdate((n) => !n);
  };

  const doBlocksChanged = (block) => {
    selectedEvent.NumberOfBlocks = block;
    forceUpdate((n) => !n);
  };

  const doSubskill2Changed = (subskill2) => {
    selectedEvent.subskill2 = subskill2;
  };

  const doGradeChanged = (grade) => {
    forceUpdate((n) => !n);

    // const serveoutcomes = [
    //   kServeIn,
    //   kServeFootfault,
    //   kServeAce,
    //   kServeWinner,
    //   kServeLet,
    //   kServeOut,
    // ];
    // const returnoutcomes = [
    //   kReturnIn,
    //   kReturnUnforcedError,
    //   kReturnForcingError,
    //   kReturnWinner,
    // ];
    // const rallyoutcomes = [
    //   kRallyOutcomeIn,
    //   kRallyOutcomeWinner,
    //   kRallyOutcomeUnforcedError,
    //   kRallyOutcomeForcingError,
    //   kRallyOutcomePassingShot,
    //   kRallyOutcomeOutPassingShot,
    //   kRallyOutcomeNetted,
    //   kRallyOutcomePutAway,
    // ];
    // if (currentEvent.skill === 0) {
    //   // serve
    //   currentEvent.outcome = serveoutcomes[outcome];
    //   if (currentEvent.result === 0) {
    //     if (serveoutcomes[outcome] === kServeFootfault) {
    //       doFootFault(currentEvent);
    //       // forceUpdate((n) => !n);
    //     } else if (
    //       serveoutcomes[outcome] === kServeAce ||
    //       serveoutcomes[outcome] === kServeWinner
    //     ) {
    //       currentEvent.result = 1;
    //       endOfPoint(currentEvent);
    //     } else if (serveoutcomes[outcome] === kServeLet) {
    //       currentEvent.result = 0;
    //       doLetServe(currentEvent);
    //     } else if (serveoutcomes[outcome] === kServeOut) {
    //       restoreLastServeState();
    //       alert("Please enter ball position for serve out.");
    //     }
    //   } else if (currentEvent.result === 1) {
    //     if (serveoutcomes[outcome] === kServeIn) {
    //       currentEvent.result = 0;
    //       restoreLast0State(currentEvent.skill);
    //     } else if (serveoutcomes[outcome] === kServeFootfault) {
    //       doFootFault(currentEvent);
    //       // selectedEvent.outcome = serveoutcomes[outcome];
    //       if (
    //         currentSet.currentState.currentStage === kStageFirstReturnDeuce ||
    //         currentSet.currentState.currentStage === kStageFirstReturnAd
    //       ) {
    //         currentSet.currentState.currentStage =
    //           currentSet.currentState.currentStage - 2;
    //         setCurrentStage(currentSet.currentState.currentStage);
    //         setCurrentPlayer(currentSet.currentState.servingTeam);
    //         setCurrentSide(
    //           currentSet.currentState.servingTeam.name === topPlayer.name
    //             ? 0
    //             : 1
    //         );
    //       }
    //       forceUpdate((n) => !n);
    //     } else if (
    //       serveoutcomes[outcome] === kServeAce ||
    //       serveoutcomes[outcome] === kServeWinner
    //     ) {
    //       forceUpdate((n) => !n);
    //     } else if (serveoutcomes[outcome] === kServeLet) {
    //       restoreLast0State(currentEvent.skill);
    //       currentEvent.result = 0;
    //       doLetServe(currentEvent);
    //     } else if (serveoutcomes[outcome] === kServeOut) {
    //       restoreLastServeState();
    //       alert("Please enter ball position for serve out.");
    //     }
    //   } else if (currentEvent.result === -1) {
    //     if (serveoutcomes[outcome] === kServeIn) {
    //       currentEvent.result = 0;
    //       restoreLast0State(currentEvent.skill);
    //     } else if (
    //       serveoutcomes[outcome] === kServeAce ||
    //       serveoutcomes[outcome] === kServeWinner
    //     ) {
    //       currentEvent.result = 1;
    //       endOfPoint(currentEvent);
    //       // forceUpdate((n) => !n);
    //     } else if (serveoutcomes[outcome] === kServeLet) {
    //       restoreLast0State(currentEvent.skill);
    //       currentEvent.result = 0;
    //       doLetServe(currentEvent);
    //     } else if (serveoutcomes[outcome] === kServeOut) {
    //       restoreLastServeState();
    //       alert("Please enter ball position for serve out.");
    //     }
    //   }
    // } else if (currentEvent.skill === 1) {
    //   // return
    //   currentEvent.outcome = returnoutcomes[outcome];
    //   if (currentEvent.result === 0) {
    //     if (returnoutcomes[outcome] === kReturnWinner) {
    //       currentEvent.result = 1;
    //       endOfPoint(currentEvent);
    //     } else if (
    //       returnoutcomes[outcome] === kReturnUnforcedError ||
    //       returnoutcomes[outcome] === kReturnForcingError
    //     ) {
    //       currentEvent.result = -1;
    //       endOfPoint(currentEvent);
    //     }
    //   } else if (currentEvent.result === 1) {
    //     if (returnoutcomes[outcome] === kReturnIn) {
    //       restoreLast0State(currentEvent.skill);
    //       currentEvent.result = 0;
    //     } else if (
    //       returnoutcomes[outcome] === kReturnUnforcedError ||
    //       returnoutcomes[outcome] === kReturnForcingError
    //     ) {
    //       restoreLast0State(currentEvent.skill);
    //       currentEvent.result = -1;
    //       endOfPoint(currentEvent);
    //     }
    //   } else if (currentEvent.result === -1) {
    //     if (returnoutcomes[outcome] === kReturnIn) {
    //       restoreLast0State(currentEvent.skill);
    //       currentEvent.result = 0;
    //     } else if (returnoutcomes[outcome] === kReturnWinner) {
    //       restoreLast0State(currentEvent.skill);
    //       currentEvent.result = 1;
    //       endOfPoint(currentEvent);
    //     } else if (
    //       returnoutcomes[outcome] === kReturnUnforcedError ||
    //       returnoutcomes[outcome] === kReturnForcingError
    //     ) {
    //       forceUpdate((n) => !n);
    //     }
    //   }
    // } else if (currentEvent.skill === 2 || currentEvent.skill === 3) {
    //   // rally or keypoint
    //   currentEvent.outcome = rallyoutcomes[outcome];
    //   if (currentEvent.result === 0) {
    //     if (
    //       rallyoutcomes[outcome] === kRallyOutcomeWinner ||
    //       rallyoutcomes[outcome] === kRallyOutcomePassingShot ||
    //       rallyoutcomes[outcome] === kRallyOutcomePutAway
    //     ) {
    //       currentEvent.result = 1;
    //       endOfPoint(currentEvent);
    //     } else if (
    //       rallyoutcomes[outcome] === kRallyOutcomeUnforcedError ||
    //       rallyoutcomes[outcome] === kRallyOutcomeForcingError ||
    //       rallyoutcomes[outcome] === kRallyOutcomeNetted ||
    //       rallyoutcomes[outcome] === kRallyOutcomeOutPassingShot
    //     ) {
    //       currentEvent.result = -1;
    //       endOfPoint(currentEvent);
    //     }
    //   } else if (currentEvent.result === 1) {
    //     if (rallyoutcomes[outcome] === kRallyOutcomeIn) {
    //       restoreLast0State(currentEvent.skill);
    //       currentEvent.result = 0;
    //     } else if (
    //       rallyoutcomes[outcome] === kRallyOutcomeUnforcedError ||
    //       rallyoutcomes[outcome] === kRallyOutcomeForcingError ||
    //       rallyoutcomes[outcome] === kRallyOutcomeNetted ||
    //       rallyoutcomes[outcome] === kRallyOutcomeOutPassingShot
    //     ) {
    //       restoreLast0State(currentEvent.skill);
    //       currentEvent.result = -1;
    //       endOfPoint(currentEvent);
    //     } else if (
    //       rallyoutcomes[outcome] === kRallyOutcomeWinner ||
    //       rallyoutcomes[outcome] === kRallyOutcomePassingShot ||
    //       rallyoutcomes[outcome] === kRallyOutcomePutAway
    //     ) {
    //       forceUpdate((n) => !n);
    //     }
    //   } else if (currentEvent.result === -1) {
    //     if (rallyoutcomes[outcome] === kRallyOutcomeIn) {
    //       restoreLast0State(currentEvent.skill);
    //       currentEvent.result = 0;
    //     } else if (
    //       rallyoutcomes[outcome] === kRallyOutcomeWinner ||
    //       rallyoutcomes[outcome] === kRallyOutcomePassingShot ||
    //       rallyoutcomes[outcome] === kRallyOutcomePutAway
    //     ) {
    //       restoreLast0State(currentEvent.skill);
    //       currentEvent.result = 1;
    //       endOfPoint(currentEvent);
    //     } else if (
    //       rallyoutcomes[outcome] === kRallyOutcomeUnforcedError ||
    //       rallyoutcomes[outcome] === kRallyOutcomeForcingError ||
    //       rallyoutcomes[outcome] === kRallyOutcomeNetted ||
    //       rallyoutcomes[outcome] === kRallyOutcomeOutPassingShot
    //     ) {
    //       forceUpdate((n) => !n);
    //     }
    //   }
    // }
  };

  //   const doSubskill2Changed = (subskill2) => {
  //     const returnss2 = [
  //       kRallyDrive,
  //       kRallySlice,
  //       kRallyTopspin,
  //       kRallyApproach,
  //       kRallyLob,
  //       kRallyDropshot,
  //     ];
  //     const rallyss2 = [
  //       kRallySlice,
  //       kRallyTopspin,
  //       kRallyVolley,
  //       kRallyOverhead,
  //       kRallySmash,
  //       kRallyLob,
  //       kRallyDropshot,
  //       kRallyDriveVolley,
  //       kRallyServeVolley,
  //       kRallyApproach,
  //       kRallyPassingShot,
  //     ];
  //     if (selectedEvent.skill === 1) {
  //       selectedEvent.subskill2 = returnss2[subskill2];
  //     } else if (selectedEvent.skill === 2 || selectedEvent.skill === 3) {
  //       selectedEvent.subskill2 = rallyss2[subskill2];
  //     }
  //     forceUpdate((n) => !n);
  //   };

  const matchScores = () => {
    return `${teamA.scores ?? 0} - ${teamB.scores ?? 0}`;
  };

  // const rotateTeam = (team) => {
  //   team.rotation = team.rotation === 6 ? 1 : team.rotation + 1;
  //   for (var i = 0; i < team.currentLineup.length; i++) {
  //     const pos = team.currentLineup[i].currentPosition;
  //     const newpos = pos === "1" ? "6" : (pos - 1).toString();
  //     team.currentLineup[i].currentPosition = newpos;
  //   }
  // };

  const doState = (
    cteam,
    steam,
    cstate,
    cpstate,
    cside,
    tascores,
    tbscores
  ) => {
    setCurrentTeam(cteam);
    setServingTeam(steam);
    setCurrentStage(cstate);
    setCurrentPositionStage(cpstate);
    setCurrentSide(cside);
    return {
      currentTeam: cteam,
      servingTeam: steam,
      currentStage: cstate,
      currentSide: cside,
      teamAScores: tascores,
      teamBScores: tbscores,
      teamA: { ...teamA },
      teamB: { ...teamB },
    };
  };

  const processEvent = (event) => {
    let st = { ...currentSet.currentState };
    var outcome = null;

    if (event.skill === kSkillServe) {
      outcome = event.grade === 5 ? 1 : event.grade === 0 ? -1 : 0;
      if (outcome === 1) {
        if (!event.team.scores) event.team.scores = 0;
        match.scores = matchScores();
        st = doState(
          event.team,
          event.team,
          kStageServe,
          kStageServe,
          event.team.name === topTeam.name ? 0 : 1,
          teamA.scores,
          teamB.scores
        );
        event.team.scores++;
      } else if (outcome === -1) {
        const ct = event.team.name === teamA.name ? teamB : teamA;
        if (!ct.scores) ct.scores = 0;
        match.scores = matchScores();
        st = doState(
          ct,
          ct,
          kStageServe,
          kStageServe,
          ct.name === topTeam.name ? 0 : 1,
          teamA.scores,
          teamB.scores
        );
        ct.scores++;
        rotateTeam(ct);
        // ct.rotation = ct.rotation === 6 ? 1 : ct.rotation + 1;
      } else {
        st = doState(
          event.team,
          event.team,
          kStageServe,
          kStageServe,
          event.team.name === topTeam.name ? 0 : 1,
          teamA.scores,
          teamB.scores
        );
      }
    } else if (event.skill === kSkillPass) {
      if (event.grade === 0) {
        st = doState(
          servingTeam,
          servingTeam,
          kStageServe,
          kStageServe,
          servingTeam.name === topTeam.name ? 0 : 1,
          teamA.scores,
          teamB.scores
        );
        servingTeam.scores++;
      } else {
        st = doState(
          event.grade === 0 ? servingTeam : event.team,
          servingTeam,
          event.grade === 0 ? kStageServe : kStageAttack,
          event.grade === 0 ? kStageServe : kStageAttack,
          event.team.name === topTeam.name ? 0 : 1,
          teamA.scores,
          teamB.scores
        );
      }
    } else if (event.skill === kSkillSet) {
      if (event.grade === 0) {
        const ct = event.team.name === teamA.name ? teamB : teamA;
        st = doState(
          ct,
          ct,
          kStageServe,
          kStageServe,
          ct.name === topTeam.name ? 0 : 1,
          teamA.scores,
          teamB.scores
        );
        ct.scores++;
      } else {
        st = doState(
          event.team,
          servingTeam.team,
          event.grade === 0 ? kStageServe : kStageAttack,
          event.grade === 0 ? kStageServe : kStageAttack,
          event.team.name === topTeam.name ? 0 : 1,
          teamA.scores,
          teamB.scores
        );
      }
    } else if (event.skill === kSkillSpike) {
      outcome =
        event.grade === 5 ? 1 : event.grade === 0 || event.grade === 1 ? -1 : 0;
      if (outcome === 1) {
        if (!event.team.scores) event.team.scores = 0;
        match.scores = matchScores();
        st = doState(
          event.team,
          event.team,
          kStageServe,
          kStageServe,
          event.team.name === topTeam.name ? 0 : 1,
          teamA.scores,
          teamB.scores
        );
        event.team.scores++;
        if (event.team.name !== servingTeam.name) {
          rotateTeam(event.team);
          // event.team.rotation =
          //   event.team.rotation === 6 ? 1 : event.team.rotation + 1;
        }
      } else if (outcome === -1) {
        const ct = event.team.name === teamA.name ? teamB : teamA;
        if (!ct.scores) ct.scores = 0;
        match.scores = matchScores();
        st = doState(
          ct,
          ct,
          kStageServe,
          kStageServe,
          ct.name === topTeam.name ? 0 : 1,
          teamA.scores,
          teamB.scores
        );
        ct.scores++;
        rotateTeam(ct);
        // ct.rotation = ct.rotation === 6 ? 1 : ct.rotation + 1;
      } else {
        const ct = event.team.name === teamA.name ? teamB : teamA;
        st = doState(
          ct,
          ct,
          kStageDefense,
          kStageDefense,
          ct.name === topTeam.name ? 0 : 1,
          teamA.scores,
          teamB.scores
        );
      }
    } else if (event.skill === kSkillDefense) {
      if (event.grade === 0) {
        const attackingTeam = event.team.name === teamA.name ? teamB : teamA;
        st = doState(
          attackingTeam,
          attackingTeam,
          kStageServe,
          kStageServe,
          attackingTeam.name === topTeam.name ? 0 : 1,
          teamA.scores,
          teamB.scores
        );
        attackingTeam.scores++;
      } else {
        st = doState(
          event.team,
          servingTeam,
          event.grade === 0 ? kStageServe : kStageAttack,
          event.grade === 0 ? kStageServe : kStageAttack,
          event.team.name === topTeam.name ? 0 : 1,
          teamA.scores,
          teamB.scores
        );
      }
    } else if (event.skill === kSkillFreeball && event.freeballer) {
      st = doState(
        event.team,
        servingTeam,
        event.grade === 0 ? kStageServe : kStageAttack,
        event.grade === 0 ? kStageServe : kStageAttack,
        event.team.name === topTeam.name ? 0 : 1,
        teamA.scores,
        teamB.scores
      );
    } else if (event.skill === kSkillCover && event.coverer) {
      st = doState(
        event.team,
        servingTeam,
        event.grade === 0 ? kStageServe : kStageAttack,
        event.grade === 0 ? kStageServe : kStageAttack,
        event.team.name === topTeam.name ? 0 : 1,
        teamA.scores,
        teamB.scores
      );
    } else if (event.skill === kSkillBlock) {
      if (event.grade === 0) {
        const attackingTeam = event.team.name === teamA.name ? teamB : teamA;
        st = doState(
          attackingTeam,
          attackingTeam,
          kStageServe,
          kStageServe,
          attackingTeam.name === topTeam.name ? 0 : 1,
          lastSpikeEvent.TeamScore,
          lastSpikeEvent.OppositionScore
          // teamA.scores,
          // teamB.scores
        );
      } else if (event.grade === 5) {
        st = doState(
          event.team,
          event.team,
          kStageServe,
          kStageServe,
          event.team.name === topTeam.name ? 0 : 1,
          lastSpikeEvent.TeamScore,
          lastSpikeEvent.OppositionScore
          // teamA.scores,
          // teamB.scores
        );
      } else {
        st = doState(
          event.team,
          servingTeam,
          event.grade === 0 ? kStageServe : kStageAttack,
          event.grade === 0 ? kStageServe : kStageAttack,
          event.team.name === topTeam.name ? 0 : 1,
          teamA.scores,
          teamB.scores
        );
      }
    }
    return st;
  };

  const onModifyEvent = (modifier, players) => {
    if (modifier === kEventModifierLastTouchError) {
      onUndo();
      const evs = events;
      const ev = evs.pop();
      const event = ev.origEvent;
      event.grade = 0;
      onCreateEvents([event]);
      forceUpdate((n) => !n);
    } else if (modifier === kEventModifierLastSpikeError) {
      const evs = events;
      var modevs = [];
      for (var i = evs.length - 1; i >= 0; i--) {
        onUndo();
        const ev = evs.pop();
        if (ev.origEvent.skill === kSkillBlock) {
          ev.origEvent.grade = 5; // block kill
          modevs.push(ev.origEvent);
        } else if (ev.origEvent.skill === kSkillSpike) {
          ev.origEvent.grade = 1; // blocked
          modevs.unshift(ev.origEvent);
          break;
        }
      }
      onCreateEvents(modevs);
    } else if (modifier === kEventModifierLastSpikeKill) {
      const evs = events;
      var modevs = [];
      for (var i = evs.length - 1; i >= 0; i--) {
        onUndo();
        const ev = evs.pop();
        if (ev.origEvent.skill === kSkillBlock) {
          ev.origEvent.grade = 0; // block error
          modevs.push(ev.origEvent);
        } else if (ev.origEvent.skill === kSkillSpike) {
          ev.origEvent.grade = 5; // kill
          modevs.unshift(ev.origEvent);
          break;
        }
      }
      onCreateEvents(modevs);
    }
  };

  const onCreateEvents = (newevents) => {
    const evtypes = [
      "Serve ",
      "Pass ",
      "Set ",
      "Attack ",
      "Block ",
      "Dig ",
      "Freeball ",
      "Cover ",
    ];
    const dvgrades = ["=", "/", "!", "-", "+", "#"];

    const evs = events.slice();

    // if (
    //   newevents.length === 1 &&
    //   newevents[0].lastEventIsError &&
    //   newevents[0].lastEventIsError === true
    // ) {
    //   onUndo();
    //   const lastevent = evs.pop();
    //   lastevent.grade = 0;
    //   newevents[0].player = {
    //     firstName: lastevent.player.FirstName,
    //     lastName: lastevent.player.LastName,
    //     shirtNumber: lastevent.player.shirtNumber,
    //   };
    // }

    let cteam = currentTeam;
    let steam = servingTeam;
    let cside = currentSide;
    let cstage = currentStage;
    let cpstage = currentPositionStage;
    let ctop = topTeam;
    let cbottom = bottomTeam;
    let cpoint = pointNumber;

    if (!currentSet?.currentState) {
      const st = {
        scores: { ...scores },
        currentTeam: cteam,
        servingTeam: steam,
        currentStage: cstage,
        currentPositionStage: cpstage,
        currentSide: cside,
        topTeam: ctop,
        bottomTeam: cbottom,
        topTeamScores: ctop.scores,
        bottomTeamScores: cbottom.scores,
        topTeamRotation: ctop.rotation,
        bottomTeamRotation: cbottom.rotation,
        topTeamCurrentLineup: [...ctop.currentLineup],
        bottomTeamCurrentLineup: [...cbottom.currentLineup],
        pointNumber: cpoint,
        events: [],
      };
      currentSet.currentState = st;
      setOriginalState(st);
      addToUndo();
    }
    const udid = generateUUID();
    var c = 0;
    for (var event of newevents) {
      let pest = processEvent(event);
      let ev = {
        AdvanceCode1: "",
        AdvanceCode2: "",
        AdvanceCode3: "",
        AdvanceCode4: "",
        AdvanceCode5: "",
        attackCombo: "",
        BallEndString: `${event.ballend.x},${event.ballend.y}`,
        BallStartString: `${event.ballstart.x},${event.ballstart.y}`,
        BallMidString: `${event.ballmid.x},${event.ballmid.y}`,
        Drill: null,
        DVGrade: dvgrades[event.grade],
        dvString: "",
        ErrorType: 0,
        EventGrade: event.grade,
        EventId: "",
        EventString: event.coverer ? "Cover" : evtypes[event.skill - 1],
        EventType: event.skill,
        ExtraCode1: "~",
        ExtraCode2: "~",
        ExtraCode3: "~",
        NumberOfBlocks: "",
        OppositionScore: pest.teamBScores,
        passingGrade: 0,
        player: {
          FirstName: event.player.firstName,
          LastName: event.player.lastName,
          ShirtNumber: event.player.shirtNumber,
        },
        Row: event.rotation,
        setter: event.setter,
        settersCall: "",
        SubEvent: event.subevent ?? 0,
        SubEvent2: 0,
        substitution: null,
        TeamScore: pest.teamAScores,
        TimeStamp: new Date().getTime() + c * 1000,
        VideoPosition:
          playerRef?.current?.player?.prevLoaded > 0
            ? playerRef.current.getCurrentTime() + c
            : 0,
        teamColour: event.team.colour,
        origEvent: event,
      };
      c++;
      if (event.skill === kSkillSpike) {
        setLastSpikeEvent(ev);
      }
      if (
        event.hitter &&
        event.setter?.playerNumber === event.hitter?.playerNumber
      ) {
        console.log("setter dump");
        ev.SubEvent = 1;
      }
      if (event.hitter && currentEvent.EventString === "Freeball ") {
        console.log("hit overpass");
        onUndo();
        evs.pop();
      }
      evs.push(ev);
      setCurrentEvent(ev);
      setSelectedEvent(ev);
      currentSet.events = evs;

      currentSet.currentState = {
        scores: { ...scores },
        currentTeam: pest.currentTeam,
        servingTeam: pest.servingTeam,
        currentStage: pest.currentStage,
        currentPositionStage: currentPositionStage,
        currentSide: pest.currentSide,
        topTeam: ctop,
        bottomTeam: cbottom,
        topTeamScores: ctop.scores,
        bottomTeamScores: cbottom.scores,
        topTeamRotation: ctop.rotation,
        bottomTeamRotation: cbottom.rotation,
        topTeamCurrentLineup: [...ctop.currentLineup],
        bottomTeamCurrentLineup: [...cbottom.currentLineup],
        pointNumber: cpoint,
        events: [...evs],
        id: udid,
      };
      currentSet.teamAScores = teamA.scores;
      currentSet.teamBScores = teamB.scores;

      addToUndo();
    }
    setEvents(evs);

    // let pest = processEvent(event);
    // event.player = currentTeam;
    // const ts = playerRef?.current
    //   ? playerRef.current.currentTime
    //   : new Date().getTime() / 1000;
    // event.timestampseconds = ts;
    // event.scores = { ...scores };
    // event.reach = 0;
    // if (event.skill !== 0) {
    //   event.subskill2 = kRallyTopspin;
    // }
    // setCurrentEvent(event);
    // const evs = events.slice();
    // evs.push(event);
    // setEvents(evs);
    // setSelectedEvent(event);
    // let cstage = pest.currentStage;
    // let cplayer = currentTeam;
    // let cserver = servingTeam;
    // let cside = currentSide;
    // let ctop = topTeam;
    // let cbottom = bottomTeam;
    // let cpoint = pointNumber;
    // if (event.result !== 0) {
    //   if (currentStage === kStageServe) {
    //     cstage = kStageSecondServeDeuce;
    //     setCurrentStage(kStageSecondServeDeuce);
    //   } else if (currentStage === kStageFirstServeAd) {
    //     cstage = kStageSecondServeAd;
    //     setCurrentStage(kStageSecondServeAd);
    //   } else {
    //     const st = endOfPoint(event);
    //     cplayer = st.currentTeam;
    //     cside = st.currentSide;
    //     cpoint = st.pointNumber;
    //   }
    // } else {
    //   cplayer = currentTeam.name === teamA.name ? teamB : teamA;
    //   setCurrentTeam(cplayer);
    //   cside = currentSide === 0 ? 1 : 0;
    //   setCurrentSide(cside);
    // }
    // currentSet.events = evs;
    // currentSet.currentState = {
    //   scores: { ...scores },
    //   currentTeam: cplayer,
    //   servingTeam: cserver,
    //   currentStage: cstage,
    //   currentSide: cside,
    //   topTeam: ctop,
    //   bottomTeam: cbottom,
    //   pointNumber: cpoint,
    //   event: { ...event },
    //   events: evs,
    // };
    // addToUndo();
    // // let uds = undoStack;
    // // uds.push(currentSet.currentState);
    // // setUndoStack(uds);
    // // localStorage.setItem("currentmatch", JSON.stringify(match));
  };

  const onDeleteEvent = (event) => {};

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    if (isFullscreen) {
      handle.exit();
      // document.body.style.overflow = "auto";
    } else {
      handle.enter();
      // document.body.style.overflow = "contain";
    }
  };

  const togglePlayVideo = () => {
    if (playerRef.current) {
      if (playerRef.current.paused) {
        playerRef.current.play();
      } else {
        playerRef.current.pause();
      }
    }
  };

  const toggleVideo = () => {
    const showvideo = !isShowingVideo;
    localStorage.setItem("showvideo", showvideo);
    setIsShowingVideo(showvideo);
    doSizing(showvideo);
    forceUpdate((n) => !n);
  };

  const totalGames = () => {
    let totalgames = 0;
    // for (var mset of match?.sets) {
    //   if (mset.scores) {
    //     totalgames += mset.scores.player1SetScore + mset.scores.player2SetScore;
    //   }
    // }
    return totalgames;
  };

  const toggleServer = () => {
    const pl = servingTeam.name === teamA.name ? teamB : teamA;
    setServingTeam(pl);
    setCurrentTeam(pl);
    if (totalGames() === 0) {
      match.firstServer = pl;
    }
    setCurrentSide(pl.name === topTeam.name ? 0 : 1);
    forceUpdate((n) => !n);
  };

  const togglePlayerSide = () => {
    const tp = topTeam.name === teamA.name ? teamB : teamA;
    const bp = bottomTeam.name === teamA.name ? teamB : teamA;
    setTopTeam(tp);
    setBottomTeam(bp);
    if (totalGames() === 0) {
      match.topTeam = tp;
    }
    setCurrentSide(servingTeam.name === tp.name ? 0 : 1);
    forceUpdate((n) => !n);
  };

  const doSizing = (showvideo) => {
    const portrait = window.innerHeight > window.innerWidth;
    setIsPortrait(portrait);
    const panelMain = document.querySelector(
      '[data-panel-group-id="panelMain"]'
    );

    if (!panelMain) return;

    const observer = new ResizeObserver(() => {
      let height = sizeMain ? sizeMain?.height : window.innerHeight - 88;
      let width = sizeMain ? sizeMain?.width : window.innerWidth - 44;
      if (panelMain.offsetWidth !== 0 || panelMain.offsetHeight !== 0) {
        height = panelMain.offsetHeight;
        width = panelMain.offsetWidth;
        setSizeMain({ width: width, height: height });
      }

      if (portrait) {
        if (showvideo) {
          const videoheight = (width * 9) / 16;
          setSizeVideo({ width: width, height: videoheight });
          const courtwidth = width * 0.35;
          const courtheight = height - videoheight;
          setSizeCourt({ width: courtwidth, height: courtheight });
          const infowidth = pixelWidthInfo;
          const infoheight = courtheight;
          const scoreboardheight = 40;
          const scoreboardwidth = infowidth;
          setSizeInfo({ width: infowidth, height: infoheight });
          setSizeScoreboard({
            width: scoreboardwidth,
            height: scoreboardheight,
          });
          const eventslistwidth = infowidth;
          const eventslistheight = courtheight - scoreboardheight;
          setSizeEventsList({
            width: eventslistwidth,
            height: eventslistheight,
          });
          const eventeditorwidth = width - courtwidth - infowidth;
          const eventeditorheight = courtheight;
          setSizeEventEditor({
            width: eventeditorwidth,
            height: eventeditorheight,
          });
          setPcVideo({ width: 100, height: (videoheight * 100) / height });
          setPcCourt({
            width: (courtwidth * 100) / width,
            height: (courtheight * 100) / height,
          });
          setPcInfo({
            width: (infowidth * 100) / width,
            height: (infoheight * 100) / height,
          });
          setPcScoreboard({
            width: (scoreboardwidth * 100) / width,
            height: (scoreboardheight * 100) / infoheight,
          });
          setPcEventsList({
            width: (scoreboardwidth * 100) / width,
            height: (eventslistheight * 100) / infoheight,
          });
          setPcEventEditor({
            width: (eventeditorwidth * 100) / width,
            height: (courtheight * 100) / height,
          });
        } else {
          const videoheight = height;
          const videowidth = width;
          setSizeVideo({ width: videowidth, height: videoheight });
          const courtwidth = width * 0.7;
          const courtheight = height;
          setSizeCourt({ width: courtwidth, height: courtheight });
          const infoheight = height * 0.4;
          const infowidth = width - courtwidth;
          const eventeditorheight = height * 0.6;
          const eventeditorwidth = infowidth;
          setSizeInfo({ width: infowidth, height: infoheight });
          const scoreboardheight = 40;
          const scoreboardwidth = infowidth;
          setSizeScoreboard({
            width: scoreboardwidth,
            height: scoreboardheight,
          });
          const eventslistheight = infoheight - scoreboardheight;
          setSizeEventsList({ width: infowidth, height: eventslistheight });
          setSizeEventEditor({
            width: eventeditorwidth,
            height: eventeditorheight,
          });
          setPcVideo({ width: 100, height: 100 });
          setPcCourt({
            width: (courtwidth * 100) / width,
            height: (courtheight * 100) / height,
          });
          setPcInfo({
            width: (infowidth * 100) / width,
            height: (infoheight * 100) / height,
          });
          setPcScoreboard({
            width: (scoreboardwidth * 100) / width,
            height: (scoreboardheight * 100) / infoheight,
          });
          setPcEventsList({
            width: (scoreboardwidth * 100) / width,
            height: (eventslistheight * 100) / infoheight,
          });
          setPcEventEditor({
            width: (eventeditorwidth * 100) / width,
            height: (eventeditorheight * 100) / height,
          });
        }
      } else {
        if (showvideo) {
          const videowidth = width * 0.7;
          const videoheight = (videowidth * 9) / 16;
          setSizeVideo({ width: videowidth, height: videoheight });
          const courtwidth = width - videowidth;
          const courtheight = videoheight;
          setSizeCourt({ width: courtwidth, height: courtheight });
          const infowidth = pixelWidthInfo;
          const infoheight = height - courtheight;
          const scoreboardheight = 40;
          const scoreboardwidth = infowidth;
          setSizeInfo({ width: infowidth, height: infoheight });
          setSizeScoreboard({
            width: scoreboardwidth,
            height: scoreboardheight,
          });
          const eventslistwidth = infowidth;
          const eventslistheight = infoheight - scoreboardheight;
          setSizeEventsList({
            width: eventslistwidth,
            height: eventslistheight,
          });
          const eventeditorwidth = width - infowidth;
          const eventeditorheight = infoheight;
          setSizeEventEditor({
            width: eventeditorwidth,
            height: eventeditorheight,
          });
          setPcVideo({
            width: (videowidth * 100) / width,
            height: (videoheight * 100) / height,
          });
          setPcCourt({
            width: (courtwidth * 100) / width,
            height: (courtheight * 100) / height,
          });
          setPcInfo({
            width: (infowidth * 100) / width,
            height: (infoheight * 100) / height,
          });
          setPcScoreboard({
            width: (scoreboardwidth * 100) / width,
            height: (scoreboardheight * 100) / infoheight,
          });
          setPcEventsList({
            width: (scoreboardwidth * 100) / width,
            height: (eventslistheight * 100) / height,
          });
          setPcEventEditor({
            width: (eventeditorwidth * 100) / width,
            height: (courtheight * 100) / height,
          });
        } else {
          const videowidth = width;
          const videoheight = height;
          setSizeVideo({ width: videowidth, height: videoheight });
          const courtwidth = width;
          var courtheight = width / 2;
          const infowidth = pixelWidthInfo;
          var infoheight = height - courtheight;
          if (infoheight < 180) {
            infoheight = 180;
            courtheight = height - 180;
          }
          const scoreboardheight = 40;
          const scoreboardwidth = infowidth;
          setSizeCourt({ width: courtwidth, height: courtheight });
          setSizeInfo({ width: infowidth, height: infoheight });
          setSizeScoreboard({
            width: scoreboardwidth,
            height: scoreboardheight,
          });
          const eventslistwidth = infowidth;
          const eventslistheight = infoheight - scoreboardheight;
          setSizeEventsList({
            width: eventslistwidth,
            height: eventslistheight,
          });
          const eventeditorwidth = width - infowidth;
          const eventeditorheight = infoheight;
          setSizeEventEditor({
            width: eventeditorwidth,
            height: eventeditorheight,
          });
          setPcVideo({
            width: (videowidth * 100) / width,
            height: (videoheight * 100) / height,
          });
          setPcCourt({
            width: (courtwidth * 100) / width,
            height: (courtheight * 100) / height,
          });
          setPcInfo({
            width: (infowidth * 100) / width,
            height: (infoheight * 100) / height,
          });
          setPcScoreboard({
            width: (scoreboardwidth * 100) / width,
            height: (scoreboardheight * 100) / infoheight,
          });
          setPcEventsList({
            width: (scoreboardwidth * 100) / width,
            height: (eventslistheight * 100) / height,
          });
          setPcEventEditor({
            width: (eventeditorwidth * 100) / width,
            height: (courtheight * 100) / height,
          });
        }
      }
    });

    observer.observe(panelMain);

    return () => {
      observer.unobserve(panelMain);
      observer.disconnect();
    };
  };

  useLayoutEffect(() => {
    const showvideo = localStorage.getItem("showvideo") === "true";
    setIsShowingVideo(showvideo ?? true);
    doSizing(showvideo);
  }, []);

  useEffect(() => {
    if (eventsListRef?.current) {
      // disableBodyScroll(eventsListRef?.current);
    }
    // disableBodyScroll(document);
    // document.body.style.overflow = "hidden";
    const showvideo = localStorage.getItem("showvideo") === "true";
    setIsShowingVideo(showvideo ?? true);
    doSizing(showvideo);
    return () => {
      clearAllBodyScrollLocks();
      // enableBodyScroll(document);
    };
  }, [isShowingVideo]);

  const doInit = () => {
    if (!match.sets || match.sets.length === 0) {
      const thisset = {
        setNumber: 1,
        // currentState: {
        //   scores: { ...scores },
        //   currentTeam: teamA,
        //   servingTeam: teamA,
        //   currentStage: kStageServe,
        //   currentSide: 0,
        //   topTeam: teamA,
        //   bottomTeam: teamB,
        //   pointNumber: 1,
        //   events: [],
        // },
        teamAScores: 0,
        teamBScores: 0,
      };
      match.sets.push(thisset);
      setCurrentSet(thisset);
    }
  };

  useEffect(() => {
    // enableBodyScroll(document);
    // if (eventsListRef?.current) {
    //   disableBodyScroll(eventsListRef?.current);
    // }

    // disableBodyScroll(document);
    calculateTopPadding();
    document.body.style.overflow = "hidden";
    doInit();
    const showvideo = localStorage.getItem("showvideo") === "true";
    setIsShowingVideo(showvideo ?? true);
    doSizing(showvideo);

    function handleWindowResize() {
      const showvideo = localStorage.getItem("showvideo") === "true";
      setIsShowingVideo(showvideo ?? true);
      doSizing(showvideo);
    }
    window.addEventListener("resize", handleWindowResize);

    window.addEventListener("wheel", handleScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("resize", handleWindowResize);
      // enableBodyScroll(document);
      // document.body.style.overflow = "auto"; // cleanup or run on page unmount
    };
  }, []);

  useEffect(() => {
    // disableBodyScroll(document);
    // document.body.style.overflow = "hidden";
    if (currentEvent) {
      calculateTopPadding();
      const elem = document.activeElement;
      if (elem) {
        elem?.blur();
      }
      const idx = events.indexOf(currentEvent);
      const element = document.getElementById(`EventItem_${idx}`);
      if (element) {
        // 👇 Will scroll smoothly to the top of the next section
        element.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
      }
      forceUpdate((n) => !n);
    }
    return () => {
      // enableBodyScroll(document);
    };

    // return () => {
    //   document.body.style.overflow = "auto"; // cleanup or run on page unmount
    // };
  }, [currentEvent]);

  const calculateTopPadding = () => {
    // hack to deal with disabling body scrollin in iOS
    let isIOS =
      /iPad|iPhone|iPod/.test(navigator.platform) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (events.length > 0 && isIOS) {
      let hh = parseInt(window.innerHeight / 20);
      let ph = hh > 60 ? 64 : hh > 50 ? 32 : 80;
      setPaddingHeight(ph);
    } else {
      setPaddingHeight(0);
    }
  };

  const doScoreboard = () => {
    return (
      <div className="bg-base-100 border-2 border-base-300">
        <Scoreboard match={match} />
      </div>
    );
  };

  const findTeamForPlayer = (player) => {
    if (!player) return null;
    let ret = teamA.players.filter(
      (p) =>
        p.LastName === player.LastName &&
        p.FirstName === player.FirstName &&
        p.shirtNumber === player.ShirtNumber
    );
    if (ret.length > 0) return teamA;
    return teamB;
  };

  const doEventEditor = () => {
    return (
      <div
        className="overflow-auto bg-base-100 p-1 border-2 border-base-300"
        style={{ height: `${sizeEventEditor?.height}px` }}
      >
        <EventEditor
          isPortrait={isPortrait}
          event={selectedEvent}
          isCurrentEvent={selectedEvent === currentEvent}
          team={findTeamForPlayer(selectedEvent?.player)}
          onPlayerChanged={(player) => doPlayerChanged(player)}
          onSkillChanged={(hand) => doSkillChanged(hand)}
          onSubskillChanged={(subskill2) => doSubskillChanged(subskill2)}
          onSetterCallsChanged={(sc) => doSetterCallsChanged(sc)}
          onAttackCombosChanged={(ac) => doAttackCombosChanged(ac)}
          onBlocksChanged={(nb) => doBlocksChanged(nb)}
          onGradeChanged={(outcome) => doGradeChanged(outcome)}
        />
      </div>
    );
  };

  const doEventsList = () => {
    return (
      <>
        <div ref={eventsListRef}>
          <CodingEventsList
            events={events}
            sizeEventsList={sizeEventsList}
            selectedEvent={selectedEvent}
            onEventSelected={(event) => doSelectEvent(event)}
          />
        </div>
        {/* <div
          className="bg-base-100 overflow-auto border-2 border-base-300 p-1"
          style={{ height: `${sizeEventsList?.height}px` }}
        >
          {events &&
            events
              .sort((a, b) => b.timestampseconds - a.timestampseconds)
              .map((event, index) => (
                <div className="flex mt-0.5">
                  <div
                    className="w-1"
                    style={{ backgroundColor: event.teamColour }}
                  ></div>
                  <div
                    className={
                      selectedEvent === event
                        ? "bg-primary/50 flex-col p-1 border-b border-base-300 cursor-pointer w-full"
                        : "bg-base-100 flex-col p-1 border-b border-base-300 cursor-pointer w-full"
                    }
                    key={`EventItem-${index}`}
                    onClick={() => {
                      setSelectedEvent(event);
                      forceUpdate((n) => !n);
                    }}
                  >
                    <div className="flex justify-between">
                      <div className="font-medium text-xs">
                        {playerInitialAndName(event)}
                      </div>
                      <div className="font-medium text-xs">
                        {event.TeamScore} - {event.OppositionScore}
                      </div>
                    </div>
                    <div className="font-normal text-xs">
                      {DVEventString(event)}
                    </div>
                  </div>
                </div>
              ))}
        </div> */}
      </>
    );
  };

  const doPlaybackRate = (rate) => {
    setPlaybackRate(parseFloat(rate));
    // playerRef?.current?.playbackRate(parseFloat(rate));
  };

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
      seekInterval = -e.deltaY / 100.0;
      if (e.deltaY > 0) {
        doSwipe(seekInterval);
      } else {
        doSwipe(seekInterval);
      }
    }
  };

  const swipedRight = () => {
    seekForward();
  };

  const swipedLeft = () => {
    seekBack();
  };

  const handlers = useSwipeable({
    onSwiped: (eventData) => {
      // toast.success("User Swiped Velocity: " + eventData.velocity);
      seekInterval = 2.5 + eventData.velocity;
    },
    onSwipedLeft: () => swipedLeft(),
    onSwipedRight: () => swipedRight(),
  });

  const getRealCourtSize = (vertical) => {
    if (!sizeCourt) {
      return null;
    }
    if (vertical) {
      if (sizeCourt.height / sizeCourt.width > 2) {
        // setCourtToolbarAtTop(true);
        return {
          width: sizeCourt.width,
          height: sizeCourt.height - 40,
          toolbarAtTop: true,
        };
      } else {
        // setCourtToolbarAtTop(false);
        return {
          width: sizeCourt.width - 64,
          height: sizeCourt.height,
          toolbarAtTop: false,
        };
      }
    } else {
      if (sizeCourt.width / sizeCourt.height > 2) {
        return {
          width: sizeCourt.width - 64,
          height: sizeCourt.height,
          toolbarAtTop: false,
        };
      } else {
        return {
          width: sizeCourt.width,
          height: sizeCourt.height - 40,
          toolbarAtTop: true,
        };
      }
    }
  };

  const doCodingCourt = (vertical) => {
    // console.log("sizeCourt: ", sizeCourt);
    // if (!sizeCourt) {
    //   doSizing(isShowingVideo);
    // }
    return (
      <div
        className="border-2 border-base-300"
        style={{
          backgroundColor: "blue",
          width: `${sizeCourt?.width}px`,
          height: `${sizeCourt?.height}px`,
        }}
      >
        <CodingCourt2
          isVertical={vertical}
          courtSize={getRealCourtSize(vertical)}
          topTeam={topTeam}
          bottomTeam={bottomTeam}
          servingTeam={servingTeam}
          startingTeam={currentTeam}
          startingStage={currentStage}
          currentSide={servingTeam.name === topTeam.name ? 0 : 1}
          onCreateEvents={(event) => onCreateEvents(event)}
          onModifyEvent={(modifier, players) =>
            onModifyEvent(modifier, players)
          }
          updated={(n) => !n}
        />
      </div>
    );
  };

  const doVideoPlayer = () => {
    return (
      <>
        <div className="flex-col">
          <div className="" ref={videoRef}>
            {/* <PeranaSportsReactPlayer
              videoFilePath={videoFilePath}
              sizeVideo={sizeVideo}
            /> */}
            <ReactPlayer
              ref={playerRef}
              url={videoFilePath}
              playing={playing}
              controls={true}
              //   onReady={() => playerReady()}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              width="100%"
              height={`${(sizeVideo?.width * 9) / 16 - 40}px`}
              playbackRate={playbackRate}
            />
          </div>
          <div className="flex gap-2 p-1 bg-base-300" {...handlers}>
            <ChevronDoubleLeftIcon
              className="btn-toolbar size-9"
              onClick={() => {
                doSwipe(-10);
              }}
            />
            <ChevronLeftIcon
              className="btn-toolbar size-9"
              onClick={() => {
                doSwipe(-1);
              }}
            />
            <select
              className="w-20 mx-2 select-generic text-base-content/50"
              value={playbackRate}
              onChange={(e) => doPlaybackRate(e.target.value)}
            >
              <option value="0.25">0.25x</option>
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
              <option value="3">3x</option>
              <option value="4">4x</option>
            </select>
            <ChevronRightIcon
              className="btn-toolbar size-9"
              onClick={() => {
                doSwipe(1);
              }}
            />
            <ChevronDoubleRightIcon
              className="btn-toolbar size-9"
              onClick={() => {
                doSwipe(10);
              }}
            />
            <div className="w-full mt-1 text-sm text-base-content/40 text-center noselect">
              Swipe here to scroll for iOS or use mousewheel...
            </div>
            {playing ? (
              <PauseVideo
                className="btn-toolbar size-9"
                onClick={() => setPlaying(false)}
              />
            ) : (
              <PlayVideo
                className="btn-toolbar size-9"
                onClick={() => setPlaying(true)}
              />
            )}
          </div>
        </div>
      </>
    );
  };

  const doPortraitLayout = () => {
    // console.log(
    //   "pcVideo ",
    //   pcVideo,
    //   "pcCourt ",
    //   pcCourt,
    //   "pcInfo ",
    //   pcInfo,
    //   "pcScoreboard ",
    //   pcScoreboard,
    //   "pcEventsList ",
    //   pcEventsList,
    //   "pcEventEditor ",
    //   pcEventEditor
    // );
    if (!isShowingVideo) {
      return (
        <>
          <div className="flex-col h-full">
            <div className="">{doToolbar()}</div>
            <PanelGroup
              autoSaveId="main"
              direction="horizontal"
              id="panelMain"
              className=""
            >
              <Panel
                minSize={pcInfo?.width}
                maxSize={pcInfo?.width}
                id="panelInfoEditor"
              >
                <PanelGroup
                  autoSaveId="left"
                  direction="vertical"
                  id="panelgroupInfoEditor"
                >
                  <Panel
                    minSize={pcInfo?.height}
                    maxSize={pcInfo?.height}
                    id="panelInfo"
                  >
                    <PanelGroup
                      autoSaveId="left"
                      direction="vertical"
                      id="panelgroupInfo"
                    >
                      <Panel
                        minSize={pcScoreboard?.height}
                        maxSize={pcScoreboard?.height}
                        id="panelScoreboard"
                      >
                        {doScoreboard()}
                      </Panel>
                      <PanelResizeHandle />{" "}
                      <Panel id="panelEventsList">{doEventsList()}</Panel>
                    </PanelGroup>
                  </Panel>
                  <Panel
                    minSize={pcEventEditor?.height}
                    maxSize={pcEventEditor?.height}
                    id="panelEditor"
                  >
                    {doEventEditor()}
                  </Panel>
                </PanelGroup>
              </Panel>
              <Panel
                minSize={pcCourt?.width}
                maxSize={pcCourt?.width}
                id="panelCourt"
              >
                <div className="flex-col w-full h-full">
                  {doCodingCourt(true)}
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="flex-col h-full">
            <div className="">{doToolbar()}</div>
            <PanelGroup
              autoSaveId="main"
              direction="vertical"
              id="panelMain"
              className=""
            >
              <Panel
                minSize={pcVideo?.height}
                maxSize={pcVideo?.height}
                id="panelVideo"
              >
                {doVideoPlayer()}
                {/* <div className="" ref={videoRef}>
                <ReactPlayer
                  ref={playerRef}
                  url={videoFilePath}
                  playing={true}
                  controls={true}
                  //   onReady={() => playerReady()}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                  width="100%"
                  height={`${(sizeVideo.width * 9) / 16}px`}
                />
              </div> */}
              </Panel>
              <PanelResizeHandle />
              <Panel
                minSize={pcCourt?.height}
                maxSize={pcCourt?.height}
                id="panelBottom"
              >
                <PanelGroup
                  autoSaveId="left"
                  direction="horizontal"
                  id="panelgroupBottom"
                >
                  <Panel
                    minSize={pcInfo?.width}
                    maxSize={pcInfo?.width}
                    id="panelInfo"
                  >
                    <PanelGroup
                      autoSaveId="left"
                      direction="vertical"
                      id="panelgroupInfo"
                    >
                      <Panel
                        minSize={pcScoreboard?.height}
                        maxSize={pcScoreboard?.height}
                        id="panelScoreboard"
                      >
                        {doScoreboard()}
                      </Panel>
                      <PanelResizeHandle />{" "}
                      <Panel id="panelEventsList">
                        {doEventsList(pcEventsList?.height)}
                      </Panel>
                    </PanelGroup>
                  </Panel>
                  <PanelResizeHandle />
                  <Panel
                    id="panelEditor"
                    // minSize={pcEventEditor.width}
                    // maxSize={pcEventEditor.width}
                  >
                    {doEventEditor()}
                  </Panel>
                  <PanelResizeHandle />
                  <Panel
                    minSize={pcCourt?.width}
                    maxSize={pcCourt?.width}
                    id="panelCourt"
                  >
                    <div className="flex-col w-full h-full">
                      {doCodingCourt(true)}
                    </div>
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </div>
        </>
      );
    }
  };

  const doLandscapeLayout = () => {
    // console.log(
    //   "pcVideo ",
    //   pcVideo,
    //   "pcCourt ",
    //   pcCourt,
    //   "pcInfo ",
    //   pcInfo,
    //   "pcScoreboard ",
    //   pcScoreboard,
    //   "pcEventsList ",
    //   pcEventsList,
    //   "pcEventEditor ",
    //   pcEventEditor
    // );
    return (
      <>
        {isShowingVideo ? (
          <div className="flex-col h-full">
            <div className="">{doToolbar()}</div>

            <PanelGroup autoSaveId="main" direction="vertical" id="panelMain">
              <Panel
                minSize={pcVideo?.height}
                maxSize={pcVideo?.height}
                id="panelTop"
              >
                <PanelGroup direction="horizontal" id="panelgroupTop">
                  <Panel
                    minSize={pcVideo?.width}
                    maxSize={pcVideo?.width}
                    id="panelVideo"
                  >
                    {doVideoPlayer()}
                    {/* <div className="" ref={videoRef}>
                    <ReactPlayer
                      ref={playerRef}
                      url={videoFilePath}
                      playing={true}
                      controls={true}
                      //   onReady={() => playerReady()}
                      onTouchStart={onTouchStart}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
                      width="100%"
                      height={`${(sizeVideo.width * 9) / 16}px`}
                    />
                  </div> */}
                  </Panel>
                  <Panel
                    minSize={pcCourt?.width}
                    maxSize={pcCourt?.width}
                    id="panelCourt"
                  >
                    {doCodingCourt(true)}
                  </Panel>
                </PanelGroup>
              </Panel>
              <Panel
                minSize={pcInfo?.height}
                maxSize={pcInfo?.height}
                id="panelBottom"
              >
                <PanelGroup
                  autoSaveId="right"
                  direction="horizontal"
                  id="panelgroupBottom"
                >
                  <Panel
                    minSize={pcInfo?.width}
                    maxSize={pcInfo?.width}
                    id="panelInfo"
                  >
                    <PanelGroup
                      autoSaveId="left"
                      direction="vertical"
                      id="panelgroupInfo"
                    >
                      <Panel
                        minSize={pcScoreboard?.height}
                        maxSize={pcScoreboard?.height}
                        id="panelScoreboard"
                      >
                        {doScoreboard()}
                      </Panel>
                      <PanelResizeHandle />{" "}
                      <Panel
                        id="panelEventsList"
                        // minSize={pcEventsList.height}
                        // maxSize={pcEventsList.height}
                      >
                        {doEventsList()}
                      </Panel>
                    </PanelGroup>
                  </Panel>
                  <Panel
                    minSize={pcEventEditor?.width}
                    maxSize={pcEventEditor?.width}
                    id="panelEditor"
                  >
                    {doEventEditor()}
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </div>
        ) : (
          <>
            <div className="flex-col h-full">
              <div className="">{doToolbar()}</div>
              <PanelGroup autoSaveId="main" direction="vertical" id="panelMain">
                <Panel id="panelTop">
                  <PanelGroup
                    autoSaveId="right"
                    direction="horizontal"
                    id="panelgroupTop"
                  >
                    <Panel
                      minSize={pcInfo?.width}
                      maxSize={pcInfo?.width}
                      id="panelInfo"
                    >
                      <PanelGroup
                        autoSaveId="left"
                        direction="vertical"
                        id="panelgroupInfo"
                      >
                        <Panel
                          minSize={pcScoreboard?.height}
                          maxSize={pcScoreboard?.height}
                          id="panelScoreboard"
                        >
                          {doScoreboard()}
                        </Panel>
                        <PanelResizeHandle />{" "}
                        <Panel
                          id="panelEventsList"
                          // minSize={pcEventsList.height}
                          // maxSize={pcEventsList.height}
                        >
                          {doEventsList()}
                        </Panel>
                      </PanelGroup>
                    </Panel>
                    <Panel
                      minSize={pcEventEditor?.width}
                      maxSize={pcEventEditor?.width}
                      id="panelEditor"
                    >
                      {doEventEditor()}
                    </Panel>
                  </PanelGroup>
                </Panel>
                <Panel
                  minSize={pcCourt?.height}
                  maxSize={pcCourt?.height}
                  id="panelBottom"
                >
                  {doCodingCourt(false)}
                </Panel>
              </PanelGroup>
            </div>
          </>
        )}
      </>
    );
  };

  const doSaveMatchState = () => {
    document.getElementById("modal-current-match-state").checked = false;
    // setScores({ ...currentSet.scores });
    // setCurrentPlayer(currentSet.currentState.currentPlayer);
    // setServingTeam(currentSet.currentState.servingTeam);
    // setCurrentStage(currentSet.currentState.currentStage);
    // setCurrentSide(
    //   currentSet.currentState.servingTeam.name === topPlayer.name ? 0 : 1
    // );
    forceUpdate((n) => !n);
  };

  const doToolbar = () => {
    return (
      <>
        {/* <div className="h-40 bg-purple-600"></div> */}
        <div className="flex justify-between">
          <div className="flex gap-2 py-1">
            {isFullscreen ? (
              <ArrowsPointingInIcon
                className="btn-toolbar"
                onClick={() => toggleFullscreen()}
              />
            ) : (
              <ArrowsPointingOutIcon
                className="btn-toolbar"
                onClick={() => toggleFullscreen()}
              />
            )}
            <UserIcon className="btn-toolbar" onClick={() => toggleServer()} />
            {isCourtVertical ? (
              <ArrowsUpDownIcon
                className="btn-toolbar"
                onClick={() => togglePlayerSide()}
              />
            ) : (
              <ArrowsRightLeftIcon
                className="btn-toolbar"
                onClick={() => togglePlayerSide()}
              />
            )}
            <button disabled={undoStack.length <= 1}>
              <UndoMulti
                icon={true}
                className={
                  undoStack.length <= 1
                    ? "btn-toolbar-disabled size-8"
                    : "btn-toolbar size-8"
                }
                onClick={onUndoMulti}
              />
            </button>
            <button disabled={undoStack.length <= 1}>
              <Undo
                icon={true}
                className={
                  undoStack.length <= 1
                    ? "btn-toolbar-disabled size-8"
                    : "btn-toolbar size-8"
                }
                onClick={onUndo}
              />
            </button>
            <button disabled={redoStack.length === 0}>
              <Redo
                icon={true}
                className={
                  redoStack.length === 0
                    ? "btn-toolbar-disabled size-8"
                    : "btn-toolbar size-8"
                }
                onClick={onRedo}
              />
            </button>
            <button disabled={redoStack.length === 0}>
              <RedoMulti
                icon={true}
                className={
                  redoStack.length === 0
                    ? "btn-toolbar-disabled size-8"
                    : "btn-toolbar size-8"
                }
                onClick={onRedoMulti}
              />
            </button>
            <button>
              <EditMatchState
                icon={true}
                className="btn-toolbar size-7"
                onClick={onEditMatchState}
              />
            </button>
          </div>
          <div className="flex gap-2">
            {isShowingVideo ? (
              <div className="flex gap-2">
                <div className="flex">
                  <input
                    type="file"
                    id="selectedVideoFile"
                    style={{ display: "none" }}
                    onChange={handleVideoSelected}
                    onClick={(event) => {
                      event.target.value = null;
                    }}
                  />
                  <a
                    data-tooltip-id="tt-videofile"
                    data-tooltip-content="Select local video file"
                  >
                    <FilmIcon
                      className="btn-toolbar size-8"
                      onClick={() =>
                        document.getElementById("selectedVideoFile").click()
                      }
                    />
                  </a>
                  <Tooltip
                    id="tt-videofile"
                    place={"bottom-start"}
                    style={{
                      backgroundColor: "gray", //"oklch(var(--b3))",
                      color: "lightgray", //"oklch(var(--bc))",
                    }}
                  />
                  <a
                    data-tooltip-id="tt-videofile"
                    data-tooltip-content="Hide Video"
                  >
                    <TVCancel
                      className="btn-toolbar size-8 mt-0.5"
                      onClick={() => toggleVideo()}
                    />
                  </a>
                  <Tooltip
                    id="tt-videofile"
                    place={"bottom-start"}
                    style={{
                      backgroundColor: "gray", //"oklch(var(--b3))",
                      color: "lightgray", //"oklch(var(--bc))",
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                <a
                  data-tooltip-id="tt-videofile"
                  data-tooltip-content="Show Video"
                >
                  <TVRetro
                    className="btn-toolbar size-8 mt-0.5"
                    onClick={() => toggleVideo()}
                  />
                </a>
                <Tooltip
                  id="tt-videofile"
                  place={"bottom-start"}
                  style={{
                    backgroundColor: "gray", //"oklch(var(--b3))",
                    color: "lightgray", //"oklch(var(--bc))",
                  }}
                />
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="absolute top-0 left-0 w-full h-full">
        {/* <FullScreen handle={handle}> */}
        <div
          className="flex-col bg-base-200 w-full"
          style={{ height: `${window.innerHeight - 40}px` }}
        >
          {/* <div className="flex justify-between">
            <div className="flex gap-2 py-1">
              {isFullscreen ? (
                <ArrowsPointingInIcon
                  className="btn-toolbar"
                  onClick={() => toggleFullscreen()}
                />
              ) : (
                <ArrowsPointingOutIcon
                  className="btn-toolbar"
                  onClick={() => toggleFullscreen()}
                />
              )}
              <UserIcon
                className="btn-toolbar"
                onClick={() => toggleServer()}
              />
              {isCourtVertical ? (
                <ArrowsUpDownIcon
                  className="btn-toolbar"
                  onClick={() => togglePlayerSide()}
                />
              ) : (
                <ArrowsRightLeftIcon
                  className="btn-toolbar"
                  onClick={() => togglePlayerSide()}
                />
              )}
              <button disabled={undoStack.length <= 1}>
                <UndoMulti
                  icon={true}
                  className={
                    undoStack.length <= 1
                      ? "btn-toolbar-disabled size-8"
                      : "btn-toolbar size-8"
                  }
                  onClick={onUndoMulti}
                />
              </button>
              <button disabled={undoStack.length <= 1}>
                <Undo
                  icon={true}
                  className={
                    undoStack.length <= 1
                      ? "btn-toolbar-disabled size-8"
                      : "btn-toolbar size-8"
                  }
                  onClick={onUndo}
                />
              </button>
              <button disabled={redoStack.length === 0}>
                <Redo
                  icon={true}
                  className={
                    redoStack.length === 0
                      ? "btn-toolbar-disabled size-8"
                      : "btn-toolbar size-8"
                  }
                  onClick={onRedo}
                />
              </button>
              <button disabled={redoStack.length === 0}>
                <RedoMulti
                  icon={true}
                  className={
                    redoStack.length === 0
                      ? "btn-toolbar-disabled size-8"
                      : "btn-toolbar size-8"
                  }
                  onClick={onRedoMulti}
                />
              </button>
              <button>
                <EditMatchState
                  icon={true}
                  className="btn-toolbar size-7"
                  onClick={onEditMatchState}
                />
              </button>
            </div>
            <div className="flex gap-2">
              {isShowingVideo ? (
                <div className="flex gap-2">
                  <div className="flex">
                    <input
                      type="file"
                      id="selectedVideoFile"
                      style={{ display: "none" }}
                      onChange={handleVideoSelected}
                      onClick={(event) => {
                        event.target.value = null;
                      }}
                    />
                    <a
                      data-tooltip-id="tt-videofile"
                      data-tooltip-content="Select local video file"
                    >
                      <FilmIcon
                        className="btn-toolbar size-8"
                        onClick={() =>
                          document.getElementById("selectedVideoFile").click()
                        }
                      />
                    </a>
                    <Tooltip
                      id="tt-videofile"
                      place={"bottom-start"}
                      style={{
                        backgroundColor: "gray", //"oklch(var(--b3))",
                        color: "lightgray", //"oklch(var(--bc))",
                      }}
                    />
                    <a
                      data-tooltip-id="tt-videofile"
                      data-tooltip-content="Hide Video"
                    >
                      <TVCancel
                        className="btn-toolbar size-8 mt-0.5"
                        onClick={() => toggleVideo()}
                      />
                    </a>
                    <Tooltip
                      id="tt-videofile"
                      place={"bottom-start"}
                      style={{
                        backgroundColor: "gray", //"oklch(var(--b3))",
                        color: "lightgray", //"oklch(var(--bc))",
                      }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <a
                    data-tooltip-id="tt-videofile"
                    data-tooltip-content="Show Video"
                  >
                    <TVRetro
                      className="btn-toolbar size-8 mt-0.5"
                      onClick={() => toggleVideo()}
                    />
                  </a>
                  <Tooltip
                    id="tt-videofile"
                    place={"bottom-start"}
                    style={{
                      backgroundColor: "gray", //"oklch(var(--b3))",
                      color: "lightgray", //"oklch(var(--bc))",
                    }}
                  />
                </>
              )}
            </div>
          </div> */}
          {/* {doToolbar()} */}
          <div
            className="bg-green-50"
            style={{ height: `${paddingHeight}px` }}
          ></div>
          {isPortrait ? <>{doPortraitLayout()}</> : <>{doLandscapeLayout()}</>}
        </div>
        {/* </FullScreen> */}
      </div>

      <input
        type="checkbox"
        id="modal-current-match-state"
        className="modal-toggle"
      />
      <div className="modal">
        <div className="modal-box sm:w-8/12 w-full max-w-xl h-[80vh]">
          <div className="flex justify-between mb-4">
            <h3 className="mb-4 font-bold"></h3>
            <div className="modal-action -mt-1">
              <label htmlFor="modal-current-match-state">
                <XMarkIcon className="w-6 h-6 cursor-pointer" />
              </label>
            </div>
          </div>
          <div className="flex flex-col">
            <div>
              <CurrentMatchState
                match={match}
                update={() => forceUpdate((n) => !n)}
                onSaveMatchState={() => doSaveMatchState()}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CodingPage;
