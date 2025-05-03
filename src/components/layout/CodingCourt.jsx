import { useEffect, useRef, useState } from "react";
import { useTimer } from "react-timer-hook";
import { toast } from "react-toastify";
import { drawArrowHead } from "../utils/Utils";
import {
  kSkillServe,
  kSkillPass,
  kSkillSet,
  kSkillSpike,
  kSkillBlock,
  kSkillDefense,
  kSkillFreeball,
  kSkillCover,
  kSkillCoachTag,
  kStageAttack,
  kStageSet,
  kStageBlock,
  kStageDefense,
  kStageFreeball,
  kStageCover,
} from "../utils/Constants";
import { kStagePass, kStageServe } from "../utils/Constants";

export default function CodingCourt({
  isVertical,
  courtSize,
  topTeam,
  bottomTeam,
  servingTeam,
  startingTeam,
  startingStage,
  currentSide,
  onCreateEvents,
  updated,
}) {
  const canvas = useRef();
  const ref = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [endPoint, setEndPoint] = useState({ x: 0, y: 0 });
  const [midPoint, setMidPoint] = useState({ x: 0, y: 0 });
  const [courtArea, setCourtArea] = useState(null);
  const [isBallIn, setIsBallIn] = useState(false);
  const [currentStage, setCurrentStage] = useState(startingStage);
  const [currentTeam, setCurrentTeam] = useState(startingTeam);
  const [attackingTeam, setAttackingTeam] = useState(null);
  const [defendingTeam, setDefendingTeam] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  // const [currentState, setCurrentState] = useState({
  //   stage: kStageServe,
  // });
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({ onExpire: () => doMidpoint() });

  const recpos = [
    [
      { x: 8, y: 30 },
      { x: 16, y: 45 },
      { x: 55, y: 80 },
      { x: 90, y: 75 },
      { x: 82, y: 38 },
      { x: 50, y: 32 },
    ], // R1 - S1
    [
      { x: 40, y: 62 },
      { x: 16, y: 33 },
      { x: 8, y: 70 },
      { x: 33, y: 85 },
      { x: 82, y: 45 },
      { x: 50, y: 25 },
    ], // R2 - S6
    [
      { x: 70, y: 68 },
      { x: 52, y: 30 },
      { x: 25, y: 36 },
      { x: 20, y: 75 },
      { x: 82, y: 38 },
      { x: 90, y: 85 },
    ], // R3 - S5
    [
      { x: 92, y: 85 },
      { x: 50, y: 30 },
      { x: 20, y: 33 },
      { x: 10, y: 10 },
      { x: 80, y: 35 },
      { x: 85, y: 65 },
    ], // R4 - S4
    [
      { x: 44, y: 85 },
      { x: 85, y: 40 },
      { x: 52, y: 30 },
      { x: 33, y: 10 },
      { x: 22, y: 32 },
      { x: 16, y: 66 },
    ], // R5 - S3
    [
      { x: 30, y: 85 },
      { x: 85, y: 40 },
      { x: 90, y: 85 },
      { x: 70, y: 16 },
      { x: 50, y: 28 },
      { x: 16, y: 45 },
    ], // R6 - S2
  ];

  const recposopp = [
    [
      { x: 12, y: 52 },
      { x: 16, y: 68 },
      { x: 55, y: 82 },
      { x: 82, y: 38 },
      { x: 54, y: 28 },
      { x: 24, y: 32 },
    ], // R1 - S1
    [
      { x: 40, y: 62 },
      { x: 16, y: 33 },
      { x: 8, y: 70 },
      { x: 33, y: 85 },
      { x: 82, y: 45 },
      { x: 50, y: 25 },
    ], // R2 - S6
    [
      { x: 80, y: 68 },
      { x: 70, y: 30 },
      { x: 45, y: 28 },
      { x: 20, y: 42 },
      { x: 82, y: 45 },
      { x: 90, y: 85 },
    ], // R3 - S5
    [
      { x: 90, y: 85 },
      { x: 80, y: 28 },
      { x: 52, y: 20 },
      { x: 26, y: 28 },
      { x: 75, y: 50 },
      { x: 85, y: 65 },
    ], // R4 - S4
    [
      { x: 50, y: 85 },
      { x: 85, y: 66 },
      { x: 80, y: 33 },
      { x: 50, y: 16 },
      { x: 16, y: 30 },
      { x: 10, y: 66 },
    ], // R5 - S3
    [
      { x: 30, y: 85 },
      { x: 85, y: 60 },
      { x: 90, y: 85 },
      { x: 75, y: 32 },
      { x: 48, y: 29 },
      { x: 16, y: 35 },
    ], // R6 - S2
  ];

  const basepos = [
    [
      { x: 16, y: 40 },
      { x: 0, y: 90 },
      { x: 50, y: 90 },
      { x: 100, y: 90 },
      { x: 50, y: 33 },
      { x: 84, y: 40 },
    ], // R1 - S1
    [
      { x: 16, y: 40 },
      { x: 50, y: 33 },
      { x: 50, y: 90 },
      { x: 0, y: 90 },
      { x: 100, y: 90 },
      { x: 84, y: 40 },
    ], // R2 - S6
    [
      { x: 16, y: 40 },
      { x: 50, y: 33 },
      { x: 84, y: 40 },
      { x: 0, y: 90 },
      { x: 100, y: 90 },
      { x: 50, y: 90 },
    ], // R3 - S5
    [
      { x: 0, y: 90 },
      { x: 50, y: 33 },
      { x: 84, y: 40 },
      { x: 16, y: 40 },
      { x: 100, y: 90 },
      { x: 50, y: 90 },
    ], // R4 - S4
    [
      { x: 0, y: 90 },
      { x: 100, y: 90 },
      { x: 84, y: 40 },
      { x: 16, y: 40 },
      { x: 50, y: 33 },
      { x: 50, y: 90 },
    ], // R5 - S3
    [
      { x: 0, y: 90 },
      { x: 100, y: 90 },
      { x: 50, y: 90 },
      { x: 16, y: 40 },
      { x: 50, y: 33 },
      { x: 84, y: 40 },
    ], // R6 - S2
  ];

  const origpos = [
    [
      { x: 16, y: 22 },
      { x: 16, y: 66 },
      { x: 50, y: 66 },
      { x: 84, y: 66 },
      { x: 84, y: 22 },
      { x: 50, y: 22 },
    ],
    [
      { x: 50, y: 22 },
      { x: 16, y: 22 },
      { x: 16, y: 66 },
      { x: 50, y: 66 },
      { x: 84, y: 66 },
      { x: 84, y: 22 },
    ],
    [
      { x: 84, y: 22 },
      { x: 50, y: 22 },
      { x: 16, y: 22 },
      { x: 16, y: 66 },
      { x: 50, y: 66 },
      { x: 84, y: 66 },
    ],
    [
      { x: 84, y: 66 },
      { x: 84, y: 22 },
      { x: 50, y: 22 },
      { x: 16, y: 22 },
      { x: 16, y: 66 },
      { x: 50, y: 66 },
    ],
    [
      { x: 50, y: 66 },
      { x: 84, y: 66 },
      { x: 84, y: 22 },
      { x: 50, y: 22 },
      { x: 16, y: 22 },
      { x: 16, y: 66 },
    ],
    [
      { x: 16, y: 66 },
      { x: 50, y: 66 },
      { x: 84, y: 66 },
      { x: 84, y: 22 },
      { x: 50, y: 22 },
      { x: 16, y: 22 },
    ],
  ];

  const drawCourtLines = (ctx, ca) => {
    ctx.beginPath();

    // ctx.fillStyle = '#0044ff';
    // ctx.fillRect(ca.left, ca.top, ca.width, ca.height);

    ctx.lineWidth = ca.scale * 2;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 5 * ca.scale;

    ctx.strokeRect(ca.left, ca.top, ca.width, ca.height);

    if (isVertical) {
      ctx.moveTo(ca.left - ca.netPost, ca.top + ca.height / 2);
      ctx.lineTo(ca.left + ca.width + ca.netPost, ca.top + ca.height / 2);
      ctx.stroke();
    } else {
      ctx.moveTo(ca.left + ca.width / 2, ca.top - ca.netPost);
      ctx.lineTo(ca.left + ca.width / 2, ca.top + ca.height + ca.netPost);
      ctx.stroke();
    }

    ctx.fillStyle = "#ffffff";
    if (isVertical) {
      ctx.fillRect(
        ca.left - ca.netPost - ca.postWidth / 2,
        ca.top + ca.height / 2 - ca.postWidth / 2,
        ca.postWidth,
        ca.postWidth
      );
      ctx.fillRect(
        ca.left + ca.width + ca.netPost - ca.postWidth / 2,
        ca.top + ca.height / 2 - ca.postWidth / 2,
        ca.postWidth,
        ca.postWidth
      );
    } else {
      ctx.fillRect(
        ca.left + ca.width / 2 - ca.postWidth / 2,
        ca.top - ca.netPost - ca.postWidth / 2,
        ca.postWidth,
        ca.postWidth
      );
      ctx.fillRect(
        ca.left + ca.width / 2 - ca.postWidth / 2,
        ca.top + ca.height + ca.netPost - ca.postWidth / 2,
        ca.postWidth,
        ca.postWidth
      );
    }

    if (isVertical) {
      ctx.moveTo(ca.left, ca.top + ca.height / 2 - ca.attackLine);
      ctx.lineTo(ca.left + ca.width, ca.top + ca.height / 2 - ca.attackLine);
      ctx.stroke();

      ctx.moveTo(ca.left, ca.top + ca.height / 2 + ca.attackLine);
      ctx.lineTo(ca.left + ca.width, ca.top + ca.height / 2 + ca.attackLine);
      ctx.stroke();
    } else {
      ctx.moveTo(ca.left + ca.width / 2 - ca.attackLine, ca.top);
      ctx.lineTo(ca.left + ca.width / 2 - ca.attackLine, ca.top + ca.height);
      ctx.stroke();

      ctx.moveTo(ca.left + ca.width / 2 + ca.attackLine, ca.top);
      ctx.lineTo(ca.left + ca.width / 2 + ca.attackLine, ca.top + ca.height);
      ctx.stroke();
    }

    // if (isVertical) {
    //   ctx.moveTo(ca.left + ca.width / 2, ca.top + ca.serviceLine);
    //   ctx.lineTo(ca.left + ca.width / 2, ca.top + ca.height - ca.serviceLine);
    //   ctx.stroke();

    //   ctx.moveTo(ca.left + ca.width / 2, ca.top);
    //   ctx.lineTo(ca.left + ca.width / 2, ca.top + 10 * ca.scale);
    //   ctx.stroke();

    //   ctx.moveTo(ca.left + ca.width / 2, ca.top + ca.height - 10 * ca.scale);
    //   ctx.lineTo(ca.left + ca.width / 2, ca.top + ca.height);
    //   ctx.stroke();
    // } else {
    //   ctx.moveTo(ca.left + ca.serviceLine, ca.top + ca.height / 2);
    //   ctx.lineTo(ca.left + ca.width - ca.serviceLine, ca.top + ca.height / 2);
    //   ctx.stroke();

    //   ctx.moveTo(ca.left, ca.top + ca.height / 2);
    //   ctx.lineTo(ca.left + 10 * ca.scale, ca.top + ca.height / 2);
    //   ctx.stroke();

    //   ctx.moveTo(ca.left + ca.width - 10 * ca.scale, ca.top + ca.height / 2);
    //   ctx.lineTo(ca.left + ca.width, ca.top + ca.height / 2);
    //   ctx.stroke();
    // }
  };

  const stageText = (stage) => {
    switch (stage) {
      case kStageServe:
        return "Serve";
      case kStagePass:
        return "Pass";
      case kStageSet:
        return "Set";
      case kStageAttack:
        return "Attack";
      case kStageBlock:
        return "Block";
      case kStageDefense:
        return "Defense";
      case kStageFreeball:
        return "Freeball";
      case kStageCover:
        return "Cover";
      default:
        return "";
    }
  };

  const drawCourt = (ctx, ca) => {
    ctx.fillStyle = "orange"; //"#0044ff";
    ctx.fillRect(ca.left, ca.top, ca.width, ca.height);
    ctx.fillStyle = "darkorange";
    if (isVertical) {
      ctx.fillRect(
        ca.left,
        ca.top + ca.width - ca.attackLine,
        ca.width,
        ca.attackLine * 2
      );
    } else {
      ctx.fillRect(
        ca.left + ca.width / 2 - ca.attackLine,
        ca.top,
        ca.attackLine * 2,
        ca.height
      );
    }

    if (!currentTeam) return;

    const tz = targetZone(ca);
    if (tz) {
      if (isVertical) {
        const xx = ca.width / (100 * ca.scale);
        const yy = ca.height / (100 * ca.scale);
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(
          ca.left + tz.x * xx * ca.scale,
          ca.top + tz.y * yy * ca.scale,
          tz.w * xx * ca.scale,
          tz.h * yy * ca.scale
        );
      } else {
        const xx = ca.height / (100 * ca.scale);
        const yy = ca.width / (100 * ca.scale);
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(
          ca.left + tz.y * yy * ca.scale,
          ca.top + tz.x * xx * ca.scale, // - tz.w * xx * ca.scale,
          tz.h * yy * ca.scale,
          tz.w * xx * ca.scale
        );
      }
    }

    drawCourtLines(ctx, ca);
    const y = isVertical ? 70 * ca.scale : 70 * ca.scale;
    drawTeamName(ctx, ca, topTeam, 10, y);
    const xx = isVertical ? 40 * ca.scale : 40 * ca.scale;
    const pl2y = isVertical ? courtSize?.height - xx : courtSize?.width - xx;
    drawTeamName(ctx, ca, bottomTeam, 10, pl2y);
    const offset = isVertical ? 150 * ca.scale : 150 * ca.scale;
    const yy = isVertical ? 0 * ca.scale : 10 * ca.scale;
    const ystage = isVertical
      ? currentTeam.name === topTeam.name
        ? y + offset - yy
        : courtSize?.height - offset - 10 * ca.scale + yy
      : currentTeam.name === topTeam.name
      ? y + offset - yy
      : courtSize?.width - offset - 10 * ca.scale + yy;

    drawStage(ctx, ca, currentTeam, 10, ystage);
    drawPlayers(ctx, ca, topTeam);
    drawPlayers(ctx, ca, bottomTeam);
  };

  const drawPlayers = (ctx, ca, team) => {
    if (!team || !team.players) return;

    const diameter = 80 * ca.scale;
    const fontSize = 80 * ca.scale;
    const isTopTeam = team.name === topTeam.name;
    const rotation = team.rotation;
    var ppos =
      servingTeam.name === team.name
        ? origpos[rotation - 1]
        : team.isOppPassing
        ? recposopp[rotation - 1]
        : recpos[rotation - 1];
    if (currentStage === kStageAttack) {
      ppos = basepos[rotation - 1];
    }
    for (var index = 0; index < 6; index++) {
      const li = team.currentLineup.filter(
        (p) => p.position === (index + 1).toString()
      );
      const pos = ppos[index];
      if (isVertical) {
        const x = isTopTeam
          ? (pos.x * ca.width) / 100
          : ((100 - pos.x) * ca.width) / 100;
        const y = isTopTeam
          ? (pos.y * ca.width) / 100
          : ca.width + ((100 - pos.y) * ca.width) / 100;
        li[0].pos = { x: ca.left + x, y: ca.top + y };
        ctx.fillStyle = isTopTeam
          ? topTeam.colour
            ? topTeam.colour
            : "lime"
          : bottomTeam.colour
          ? bottomTeam.colour
          : "magenta";
        ctx.beginPath();
        ctx.arc(ca.left + x, ca.top + y, diameter, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ca.left + x, ca.top + y, diameter * 0.65, 0, 2 * Math.PI);
        ctx.fill();
        // ctx.strokeStyle = "black";
        // // ctx.lineWidth = 2 * ca.scale;
        // ctx.stroke();
        if (li.length > 0) {
          ctx.fillStyle = "black";
          ctx.font = `1000 ${fontSize}px Arial`;
          ctx.fillText(
            li[0].playerNumber,
            ca.left + x,
            ca.top + y + fontSize * 0.35
          );
        }
      } else {
        var x = isTopTeam
          ? (pos.x * ca.height) / 100
          : ((100 - pos.x) * ca.height) / 100;
        var y = isTopTeam
          ? (pos.y * ca.height) / 100
          : ca.height + ((100 - pos.y) * ca.height) / 100;
        li[0].pos = { x: ca.left + y, y: ca.top + ca.height - x };
        ctx.fillStyle = isTopTeam
          ? topTeam.colour
            ? topTeam.colour
            : "lime"
          : bottomTeam.colour
          ? bottomTeam.colour
          : "magenta";
        ctx.beginPath();
        ctx.arc(ca.left + y, ca.top + ca.height - x, diameter, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(
          ca.left + y,
          ca.top + ca.height - x,
          diameter * 0.65,
          0,
          2 * Math.PI
        );
        ctx.fill();
        // ctx.strokeStyle = "black";
        // // ctx.lineWidth = 2 * ca.scale;
        // ctx.stroke();
        if (li.length > 0) {
          ctx.fillStyle = "black";
          ctx.font = `1000 ${fontSize}px Arial`;
          ctx.fillText(
            li[0].playerNumber,
            ca.left + y,
            ca.top + ca.height - x + fontSize * 0.35
          );
        }
      }
    }
  };

  const calculateCourtDimensions = () => {
    setCanvasWidth(courtSize?.width);
    setCanvasHeight(courtSize?.height);
    var xmargin = isVertical ? 200 : 300;
    var ymargin = isVertical ? 300 : 200;
    var baseWidth = isVertical ? 900 : 1800;
    var baseHeight = isVertical ? 1800 : 900;
    var attackLine = isVertical ? 300 : 300;
    var tramWidth = 27;
    var serviceLine = 108;
    // var serveZoneDepth = 40;
    var netPost = 91;
    var postWidth = 20;

    // var scalew = ref.current.clientWidth / (baseWidth + xmargin * 2);
    // var scaleh = ref.current.clientHeight / (baseHeight + ymargin * 2);
    var scalew = courtSize?.width / (baseWidth + xmargin * 2);
    var scaleh = courtSize?.height / (baseHeight + ymargin * 2);
    var scale = scaleh < scalew ? scaleh : scalew;
    // var scale = scaleh < scalew ? scaleh * 2 : scalew * 2;
    // console.log('scalew sclaeh scale', scalew, scaleh, scale)

    xmargin = (courtSize?.width - (baseWidth + tramWidth * 2) * scale) / 2;
    ymargin = (courtSize?.height - baseHeight * scale) / 2;

    baseWidth = baseWidth * scale;
    baseHeight = baseHeight * scale;
    tramWidth = tramWidth * scale;
    serviceLine = serviceLine * scale;
    attackLine = attackLine * scale;
    // serveZoneDepth = serveZoneDepth * scale
    netPost = netPost * scale;
    postWidth = postWidth * scale;

    xmargin = (ref.current.clientWidth - baseWidth) / 2;
    ymargin = (ref.current.clientHeight - baseHeight) / 2;

    var zones = {};
    if (isVertical) {
      zones["serveTop"] = { x: 0, y: 0, w: 100, h: 50 };
      zones["serveBottom"] = { x: 0, y: 50, w: 100, h: 50 };
      zones["rallyBottom"] = { x: 0, y: 0, w: 100, h: 50 };
      zones["rallyTop"] = { x: 0, y: 50, w: 100, h: 50 };
      zones["serveFromTop"] = { x: 0, y: -25, w: 100, h: 25 };
      zones["serveFromBottom"] = { x: 0, y: 100, w: 100, h: 25 };
      zones["rallyFromBottom"] = { x: 0, y: 50, w: 100, h: 50 };
      zones["rallyFromTop"] = { x: 0, y: 0, w: 100, h: 50 };
    } else {
      zones["serveLeft"] = { x: 0, y: 0, w: 100, h: 50 };
      zones["serveRight"] = { x: 0, y: 50, w: 100, h: 50 };
      zones["rallyRight"] = { x: 0, y: 0, w: 100, h: 50 };
      zones["rallyLeft"] = { x: 0, y: 50, w: 100, h: 50 };
      zones["serveFromLeft"] = { y: -25, x: 0, h: 25, w: 50 };
      zones["serveFromRight"] = { y: 100, x: 0, h: 25, w: 50 };
      zones["rallyFromRight"] = { x: 0, y: 50, w: 100, h: 50 };
      zones["rallyFromLeft"] = { x: 0, y: 0, w: 100, h: 50 };
    }
    const ca = {
      left: xmargin,
      top: ymargin,
      width: baseWidth,
      height: baseHeight,
      netPost: netPost,
      attackLine: attackLine,
      postWidth: postWidth,
      tramWidth: tramWidth,
      serviceLine: serviceLine,
      scale: scale,
      isVertical: isVertical,
      zones: zones,
    };
    setCourtArea(ca);
    return ca;
  };

  const drawTeamName = (ctx, ca, team, x, y) => {
    if (team.name === currentTeam?.name) {
      ctx.fillStyle = "darkmagenta";
    } else {
      ctx.fillStyle = "lightgray";
    }
    var fontSize = ca ? 70 * ca.scale : 70;
    if (fontSize < 70 * ca.scale) fontSize = 70 * ca.scale;
    else if (fontSize > 200 * ca.scale) fontSize = 200 * ca.scale;
    ctx.textAlign = "center";
    if (isVertical) {
      //   ctx.fillRect(x - 5, y - 16, courtSize?.width - 10, 20);
      //   ctx.fillStyle = "#ffffff";
      ctx.font = `500 ${fontSize}px Arial`;
      ctx.fillText(team.name.toUpperCase(), courtSize?.width / 2, y);
    } else {
      ctx.save();
      // ctx.translate(x, y);
      ctx.rotate(-Math.PI / 2);
      ctx.font = `500 ${fontSize}px Arial`;
      ctx.fillText(team.name.toUpperCase(), -courtSize?.height / 2, y);
      ctx.restore();
    }
  };

  const drawStage = (ctx, ca, team, x, y) => {
    ctx.fillStyle = "lightGray";
    var fontSize = ca ? 100 * ca.scale : 100;
    if (fontSize < 100 * ca.scale) fontSize = 100 * ca.scale;
    else if (fontSize > 200 * ca.scale) fontSize = 200 * ca.scale;
    ctx.textAlign = "center";
    if (isVertical) {
      //   ctx.fillRect(x - 5, y - 16, courtSize?.width - 10, 20);
      //   ctx.fillStyle = "#ffffff";
      ctx.font = `900 ${fontSize}px Helvetica`;
      ctx.fillText(
        stageText(currentStage).toUpperCase(),
        courtSize?.width / 2,
        y
      );
    } else {
      ctx.save();
      //   ctx.translate(x, y);
      ctx.rotate(-Math.PI / 2);
      ctx.font = `900 ${fontSize}px Helvetica`;
      ctx.fillText(
        stageText(currentStage).toUpperCase(),
        -courtSize?.height / 2,
        y
      );
      ctx.restore();
    }
  };

  const isInZone = (pt, zone) => {
    if (!pt || !zone) return false;
    if (isVertical) {
      return (
        pt.x >= zone.x &&
        pt.x <= zone.x + zone.w &&
        pt.y >= zone.y &&
        pt.y <= zone.y + zone.h
      );
    } else {
      const y = 100 - pt.x;
      const x = pt.y;
      return (
        y >= zone.x &&
        y <= zone.x + zone.w &&
        x >= zone.y &&
        x <= zone.y + zone.h
      );
    }

    // if (isVertical) {
    //   return (
    //     pt.x >= zone.x &&
    //     pt.x <= zone.x + zone.w &&
    //     pt.y >= zone.y &&
    //     pt.y <= zone.y + zone.h
    //   );
    // } else {
    //   return (
    //     pt.y >= zone.x &&
    //     pt.y <= zone.x + zone.w &&
    //     pt.x >= zone.y &&
    //     pt.x <= zone.y + zone.h
    //   );
    // }
  };

  useEffect(() => {
    setCurrentStage(startingStage);
    setCurrentTeam(startingTeam);
  }, [startingStage, startingTeam]);

  useEffect(() => {
    if (!canvas.current) return;

    // setCurrentStage(startingStage);
    // setCurrentTeam(startingTeam);
    // clear canvas
    const ctx = canvas.current.getContext("2d");
    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

    var ca = courtArea;
    if (
      !ca ||
      ca.isVertical !== isVertical ||
      courtSize?.width !== canvasWidth ||
      courtSize?.height !== canvasHeight
    ) {
      ca = calculateCourtDimensions();
      drawCourt(ctx, ca);
      return;
    } else {
      drawCourt(ctx, ca);
    }

    const isIn = checkBallIsIn(endPoint);

    var colour = isIn ? "green" : "#ff0000";
    if (isDrawing) {
      if (midPoint.x !== 0 && midPoint.y !== 0) {
        ctx.strokeStyle = colour;
        ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
        ctx.beginPath();
        ctx.arc(midPoint.x, midPoint.y, 200 * ca.scale, 0, 2 * Math.PI);
        ctx.fill();
        // ctx.stroke();
      }

      // draw the line
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      if (midPoint.x !== 0 && midPoint.y !== 0) {
        ctx.lineTo(midPoint.x, midPoint.y);
      }
      ctx.lineTo(endPoint.x, endPoint.y);
      // ctx.closePath();
      ctx.strokeStyle = colour;
      ctx.lineWidth = 5;
      ctx.stroke();
      if (midPoint.x !== 0 && midPoint.y !== 0) {
        drawArrowHead(ctx, midPoint, endPoint, 16, 0.3, colour, colour);
      } else {
        drawArrowHead(ctx, startPoint, endPoint, 16, 0.3, colour, colour);
      }
    } else {
      drawBallPath(ctx, startPoint, endPoint, midPoint, ca);
    }
  }, [
    isDrawing,
    startPoint,
    endPoint,
    midPoint,
    courtSize,
    isVertical,
    currentSide,
    currentStage,
    currentTeam,
    updated,
  ]);

  const drawBallPath = (ctx, startPoint, endPoint, midPoint, ca) => {
    if (startPoint.x === 0 && startPoint.y === 0) return;
    if (midPoint.x !== 0 && midPoint.y !== 0) {
      ctx.beginPath();
      ctx.arc(midPoint.x, midPoint.y, 20 * ca.scale, 0, 2 * Math.PI);
      ctx.strokeStyle = "gray";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    const colour = "gray";
    ctx.strokeStyle = colour;
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    if (midPoint.x !== 0 && midPoint.y !== 0) {
      ctx.lineTo(midPoint.x, midPoint.y);
    }
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.stroke();
    ctx.setLineDash([]);
    if (midPoint.x !== 0 && midPoint.y !== 0) {
      drawArrowHead(ctx, midPoint, endPoint, 16, 0.3, colour, colour);
    } else {
      drawArrowHead(ctx, startPoint, endPoint, 16, 0.3, colour, colour);
    }
  };

  const targetZone = (ca) => {
    if (!ca) return null;
    var tz = null;
    // if (currentStage === kStageFirstServeDeuce) {
    //   tz =
    //     currentSide === 0
    //       ? isVertical
    //         ? ca.zones["deuceServeBottom"]
    //         : ca.zones["deuceServeRight"]
    //       : isVertical
    //       ? ca.zones["deuceServeTop"]
    //       : ca.zones["deuceServeLeft"];
    // } else if (currentStage === kStageFirstServeAd) {
    //   tz =
    //     currentSide === 0
    //       ? isVertical
    //         ? ca.zones["adServeBottom"]
    //         : ca.zones["adServeRight"]
    //       : isVertical
    //       ? ca.zones["adServeTop"]
    //       : ca.zones["adServeLeft"];
    // } else if (currentStage === kStageSecondServeDeuce) {
    //   tz =
    //     currentSide === 0
    //       ? isVertical
    //         ? ca.zones["deuceServeBottom"]
    //         : ca.zones["deuceServeRight"]
    //       : isVertical
    //       ? ca.zones["deuceServeTop"]
    //       : ca.zones["deuceServeLeft"];
    // } else if (currentStage === kStageSecondServeAd) {
    //   tz =
    //     currentSide === 0
    //       ? isVertical
    //         ? ca.zones["adServeBottom"]
    //         : ca.zones["adServeRight"]
    //       : isVertical
    //       ? ca.zones["adServeTop"]
    //       : ca.zones["adServeLeft"];
    // } else if (
    //   currentStage === kStageFirstReturnDeuce ||
    //   currentStage === kStageFirstReturnAd ||
    //   currentStage === kStageSecondReturnDeuce ||
    //   currentStage === kStageSecondReturnAd
    // ) {
    //   tz =
    //     currentSide === 0
    //       ? isVertical
    //         ? ca.zones["rallyBottom"]
    //         : ca.zones["rallyRight"]
    //       : isVertical
    //       ? ca.zones["rallyTop"]
    //       : ca.zones["rallyLeft"];
    // } else if (currentStage === kStageRally) {
    //   tz =
    //     currentSide === 0
    //       ? isVertical
    //         ? ca.zones["rallyBottom"]
    //         : ca.zones["rallyRight"]
    //       : isVertical
    //       ? ca.zones["rallyTop"]
    //       : ca.zones["rallyLeft"];
    // }
    return tz;
  };

  const checkBallIsIn = (pt) => {
    const side = currentTeam.name === topTeam.name ? 0 : 1;
    var isIn = false;
    const endPoint = convertToTSCoord(pt);
    // if (currentStage === kStageServe) {
    isIn =
      side === 0
        ? isVertical
          ? isInZone(endPoint, courtArea.zones["serveBottom"])
          : isInZone(endPoint, courtArea.zones["serveRight"])
        : isVertical
        ? isInZone(endPoint, courtArea.zones["serveTop"])
        : isInZone(endPoint, courtArea.zones["serveLeft"]);
    // }
    setIsBallIn(isIn);
    return isIn;
  };

  function findNearestPlayer(pt, team) {
    var nearest = null;
    var distance = 1000;
    for (var index = 0; index < 6; index++) {
      const li = team.currentLineup[index];
      const pos = li.pos;
      const x = isVertical ? pos.x : pos.x;
      const y = isVertical ? pos.y : pos.y;
      const d = Math.sqrt(Math.pow(pt.x - x, 2) + Math.pow(pt.y - y, 2));
      if (d < distance) {
        distance = d;
        nearest = { ...li };
      }
    }
    return nearest;
  }
  function isPointInsideRect(pt, rect) {
    return (
      pt.x >= rect.x &&
      pt.x <= rect.x + rect.w &&
      pt.y >= rect.y &&
      pt.y <= rect.y + rect.h
    );
  }

  function gradePassing(pt, team) {
    var grade = 1;
    const zones = isVertical
      ? [
          [
            { x: 25, y: 82, w: 25, h: 18 },
            { x: 0, y: 66, w: 75, h: 33 },
            { x: 0, y: 40, w: 100, h: 60 },
            { x: 0, y: 0, w: 100, h: 100 },
          ],
          [
            { x: 50, y: 100, w: 25, h: 18 },
            { x: 25, y: 100, w: 75, h: 33 },
            { x: 0, y: 100, w: 100, h: 60 },
            { x: 0, y: 100, w: 100, h: 100 },
          ],
        ]
      : [
          [
            { x: 82, y: 50, w: 18, h: 25 },
            { x: 66, y: 25, w: 33, h: 75 },
            { x: 40, y: 0, w: 60, h: 100 },
            { x: 0, y: 0, w: 100, h: 100 },
          ],
          [
            { x: 100, y: 25, w: 18, h: 25 },
            { x: 100, y: 0, w: 33, h: 75 },
            { x: 100, y: 0, w: 60, h: 100 },
            { x: 100, y: 0, w: 100, h: 100 },
          ],
        ];
    const w = isVertical ? courtArea.width : courtArea.height;
    const isTopTeam = team.name === topTeam.name;
    const zz = isTopTeam ? zones[0] : zones[1];
    for (var index = 0; index < zz.length; index++) {
      var rect = { ...zz[index] };
      rect.x = courtArea.left + (rect.x * w) / 100;
      rect.y = courtArea.top + (rect.y * w) / 100;
      rect.w = (rect.w * w) / 100;
      rect.h = (rect.h * w) / 100;
      if (isPointInsideRect(pt, rect)) {
        grade = 5 - index;
        break;
      }
    }
    return grade;
  }

  const passingTeam = () => {
    return servingTeam.name === topTeam.name ? bottomTeam : topTeam;
  };

  function doEvent(midpoint) {
    var skill = kSkillServe;
    var server = null;
    var setter = null;
    var passer = null;
    var hitter = null;
    var digger = null;
    var blockers = [];

    var events = [];
    if (currentStage === kStageServe) {
      server = {
        ...servingTeam.currentLineup.filter((p) => p.position === "1")[0],
      };
      if (midpoint.x === 0 && midpoint.y === 0) {
        const res = checkBallIsIn(endPoint);
        if (res) {
          passer = {
            ...findNearestPlayer(endPoint, passingTeam()),
          };
          passer.grade = 0;
          console.log("passer = ", passer);
          server.grade = 5;
        } else {
          server.grade = 0;
        }
      } else {
        passer = {
          ...findNearestPlayer(
            midpoint,
            servingTeam.name === topTeam.name ? bottomTeam : topTeam
          ),
        };
        console.log("passer = ", passer);
        const passteam = passingTeam();
        passer.grade = gradePassing(endPoint, passteam);
        console.log("passing grade", passer.grade);
        setter = {
          ...passteam.currentLineup.filter((p) => p.role1 === "S")[0],
        };
        console.log("setter = ", setter);
        setAttackingTeam(passteam);
        setDefendingTeam(servingTeam);
        setCurrentTeam(passteam);
        setCurrentStage(kStageAttack);
      }
      if (server.grade !== 5 && server.grade !== 0 && passer) {
        server.grade = passer.grade === 1 ? 4 : 6 - passer.grade;
      }
      const serveevent = {
        ballstart: convertToTSCoord(startPoint),
        ballend: convertToTSCoord(
          midPoint.x !== 0 && midPoint.y !== 0 ? midPoint : endPoint
        ),
        ballmid: { x: 0, y: 0 },
        skill: kSkillServe,
        grade: server.grade,
        setter: setter,
        server: server,
        passer: passer,
        hitter: hitter,
        digger: digger,
        blockers: blockers,
        player: {
          firstName: server.playerFirstName,
          lastName: server.playerLastName,
          shirtNumber: server.playerNumber,
        },
        team: servingTeam,
      };
      events.push(serveevent);
      if (passer) {
        const passevent = {
          ballstart: convertToTSCoord(midPoint),
          ballend: convertToTSCoord(endPoint),
          ballmid: { x: 0, y: 0 },
          skill: kSkillPass,
          grade: passer.grade,
          setter: setter,
          server: server,
          passer: passer,
          hitter: hitter,
          digger: digger,
          blockers: blockers,
          player: {
            firstName: passer.playerFirstName,
            lastName: passer.playerLastName,
            shirtNumber: passer.playerNumber,
          },
          team: passingTeam(),
        };
        events.push(passevent);
      }
      if (setter) {
        const setevent = {
          ballstart: convertToTSCoord(endPoint),
          ballend: { x: 0, y: 0 },
          ballmid: { x: 0, y: 0 },
          skill: kSkillSet,
          grade: 5,
          setter: setter,
          server: server,
          passer: passer,
          hitter: hitter,
          digger: digger,
          blockers: blockers,
          player: {
            firstName: setter.playerFirstName,
            lastName: setter.playerLastName,
            shirtNumber: setter.playerNumber,
          },
          team: passingTeam(),
        };
        events.push(setevent);
      }
    } else if (currentStage === kStageAttack) {
      hitter = {
        ...findNearestPlayer(startPoint, attackingTeam),
      };
      if (midpoint.x === 0 && midpoint.y === 0) {
        const res = checkBallIsIn(endPoint);
        if (res) {
          hitter.grade = 5;
        } else {
          hitter.grade = 0;
        }
      } else {
        digger = {
          ...findNearestPlayer(midpoint, defendingTeam),
        };
        console.log("digger = ", digger);
        digger.grade = gradePassing(endPoint, defendingTeam);
        console.log("digging grade", digger.grade);
        setter = {
          ...defendingTeam.currentLineup.filter((p) => p.role1 === "S")[0],
        };
        console.log("setter = ", setter);
        setAttackingTeam(defendingTeam);
        setDefendingTeam(attackingTeam);
        setCurrentTeam(defendingTeam);
      }
      if (digger) {
        hitter.grade = digger.grade === 1 ? 4 : 6 - digger.grade;
      }
      const hitevent = {
        ballstart: convertToTSCoord(startPoint),
        ballend: convertToTSCoord(
          midPoint.x !== 0 && midPoint.y !== 0 ? midPoint : endPoint
        ),
        ballmid: { x: 0, y: 0 },
        skill: kSkillSpike,
        grade: hitter.grade,
        setter: setter,
        server: server,
        passer: passer,
        hitter: hitter,
        digger: digger,
        blockers: blockers,
        player: {
          firstName: hitter.playerFirstName,
          lastName: hitter.playerLastName,
          shirtNumber: hitter.playerNumber,
        },
        team: attackingTeam,
      };
      events.push(hitevent);
      if (digger) {
        const digevent = {
          ballstart: convertToTSCoord(midPoint),
          ballend: convertToTSCoord(endPoint),
          ballmid: { x: 0, y: 0 },
          skill: kSkillDefense,
          grade: digger.grade,
          setter: setter,
          server: server,
          passer: passer,
          hitter: hitter,
          digger: digger,
          blockers: blockers,
          player: {
            firstName: digger.playerFirstName,
            lastName: digger.playerLastName,
            shirtNumber: digger.playerNumber,
          },
          team: defendingTeam,
        };
        events.push(digevent);
      }
      if (setter) {
        const setevent = {
          ballstart: convertToTSCoord(endPoint),
          ballend: { x: 0, y: 0 },
          ballmid: { x: 0, y: 0 },
          skill: kSkillSet,
          grade: 5,
          setter: setter,
          server: server,
          passer: passer,
          hitter: hitter,
          digger: digger,
          blockers: blockers,
          player: {
            firstName: setter.playerFirstName,
            lastName: setter.playerLastName,
            shirtNumber: setter.playerNumber,
          },
          team: defendingTeam,
        };
        events.push(setevent);
      }
    }

    onCreateEvents(events);
    // var skill = 2;
    // var subskill1 = 0;
    // var subskill2 = null;
    // var outcome = null;
    // var hand = 0;
    // if (currentStage === kStageFirstServeDeuce) {
    //   skill = 0;
    //   subskill1 = 0;
    //   outcome = isBallIn ? 0 : 5;
    //   setCurrentStage(
    //     isBallIn ? kStageFirstReturnDeuce : kStageSecondServeDeuce
    //   );
    // } else if (currentStage === kStageFirstServeAd) {
    //   skill = 0;
    //   subskill1 = 0;
    //   outcome = isBallIn ? 0 : 5;
    //   setCurrentStage(isBallIn ? kStageFirstReturnAd : kStageSecondServeAd);
    // } else if (currentStage === kStageSecondServeDeuce) {
    //   skill = 0;
    //   subskill1 = 1;
    //   outcome = isBallIn ? 0 : 5;
    //   setCurrentStage(isBallIn ? kStageSecondReturnDeuce : kStageFirstServeAd);
    // } else if (currentStage === kStageSecondServeAd) {
    //   skill = 0;
    //   subskill1 = 0;
    //   outcome = isBallIn ? 0 : 5;
    //   setCurrentStage(isBallIn ? kStageSecondReturnAd : kStageFirstServeDeuce);
    // } else if (
    //   currentStage === kStageFirstReturnDeuce ||
    //   currentStage === kStageFirstReturnAd ||
    //   currentStage === kStageSecondReturnDeuce ||
    //   currentStage === kStageSecondReturnAd
    // ) {
    //   skill = 1;
    //   subskill2 = 2; // topspin
    //   outcome = isBallIn ? 0 : 1;
    //   setCurrentStage(
    //     isBallIn
    //       ? kStageRally
    //       : pointNumber % 2 !== 0
    //       ? kStageFirstServeDeuce
    //       : kStageFirstServeAd
    //   );
    // } else if (currentStage === kStageRally) {
    //   skill = 2;
    //   subskill2 = 1; // topspin
    //   outcome = isBallIn ? 0 : 2;
    //   setCurrentStage(
    //     isBallIn
    //       ? kStageRally
    //       : pointNumber % 2 !== 0
    //       ? kStageFirstServeDeuce
    //       : kStageFirstServeAd
    //   );
    // }
    // const event = {
    //   skill: skill,
    //   subskill1: subskill1,
    //   subskill2: subskill2,
    //   hand: hand,
    //   outcome: outcome,
    //   startPoint: convertToTSCoord(startPoint),
    //   endPoint: convertToTSCoord(endPoint),
    // };

    // const isIn = checkBallIsIn(endPoint);

    // onCreateEvents(event);
    // const stage = { stage: currentStage };
    // setUndoStack([...undoStack, stage]);
  }

  function startTimer() {
    if (midPoint.x === 0 && midPoint.y === 0) {
      const time = new Date();
      time.setSeconds(time.getSeconds() + 0.75);
      restart(time);
    }
  }

  function doMidpoint() {
    if (isDrawing) {
      setMidPoint({
        x: endPoint.x,
        y: endPoint.y,
      });
    }
  }

  const isInServingZone = (pt) => {
    const side = currentTeam.name === topTeam.name ? 0 : 1;
    var isIn = true;
    const endPoint = convertToTSCoord(pt);
    if (currentStage === kStageServe) {
      isIn =
        side === 0
          ? isVertical
            ? isInZone(endPoint, courtArea.zones["serveFromTop"])
            : isInZone(endPoint, courtArea.zones["serveFromLeft"])
          : isVertical
          ? isInZone(endPoint, courtArea.zones["serveFromBottom"])
          : isInZone(endPoint, courtArea.zones["serveFromRight"]);
    }
    return isIn;
  };

  const isInRallyZone = (pt) => {
    const side = currentTeam.name === topTeam.name ? 0 : 1;
    var isIn = true;
    const endPoint = convertToTSCoord(pt);
    if (currentStage !== kStageServe) {
      isIn =
        side === 0
          ? isVertical
            ? isInZone(endPoint, courtArea.zones["rallyFromTop"])
            : isInZone(endPoint, courtArea.zones["rallyFromLeft"])
          : isVertical
          ? isInZone(endPoint, courtArea.zones["rallyFromBottom"])
          : isInZone(endPoint, courtArea.zones["rallyFromRight"]);
    }
    return isIn;
  };

  function mousedown(e) {
    var isIn = false;
    if (currentStage === kStageServe) {
      isIn = isInServingZone({
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      });
    } else {
      isIn = isInRallyZone({
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      });
    }
    if (!isIn) return;

    setIsDrawing(true);
    setStartPoint({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    });
    setEndPoint({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    });
    setMidPoint({
      x: 0,
      y: 0,
    });
  }
  function mousemove(e) {
    if (!isDrawing) return;
    startTimer();
    setEndPoint({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    });
  }
  function mouseup(e) {
    if (!isDrawing) return;
    setIsDrawing(false);
    var mp = midPoint;
    if (midPoint.x === endPoint.x && midPoint.y === endPoint.y) {
      mp = { x: 0, y: 0 };
      setMidPoint(mp);
    }
    doEvent(mp);
  }

  function touchstart(e) {
    // const isIn = isInServingZone({
    //   x: e.nativeEvent.offsetX,
    //   y: e.nativeEvent.offsetY,
    // });
    // if (!isIn) return;

    setIsDrawing(true);
    setStartPoint({
      x: e.touches[0].pageX - ref.current.offsetLeft,
      y: e.touches[0].pageY - ref.current.offsetTop,
    });
    setEndPoint({
      x: e.touches[0].pageX - ref.current.offsetLeft,
      y: e.touches[0].pageY - ref.current.offsetTop,
    });
    setMidPoint({
      x: 0,
      y: 0,
    });
  }
  function touchmove(e) {
    if (!isDrawing) return;
    startTimer();
    setEndPoint({
      x: e.touches[0].pageX - ref.current.offsetLeft,
      y: e.touches[0].pageY - ref.current.offsetTop,
    });
  }
  function touchend(e) {
    if (!isDrawing) return;
    setIsDrawing(false);
    var mp = midPoint;
    if (midPoint.x === endPoint.x && midPoint.y === endPoint.y) {
      mp = { x: 0, y: 0 };
      setMidPoint(mp);
    }
    doEvent(mp);
  }
  const convertToTSCoord = (pt) => {
    if (isVertical) {
      return {
        x: ((pt.x - courtArea.left) / courtArea.width) * 100,
        y: ((pt.y - courtArea.top) / courtArea.height) * 100,
      };
    } else {
      return {
        y: ((pt.x - courtArea.left) / courtArea.width) * 100,
        x: (1 - (pt.y - courtArea.top) / courtArea.height) * 100,
      };
    }
  };

  return (
    <div className="CodingCourt" ref={ref}>
      <canvas
        ref={canvas}
        onMouseDown={mousedown}
        onMouseMove={mousemove}
        onMouseUp={mouseup}
        onTouchStart={touchstart}
        onTouchMove={touchmove}
        onTouchEnd={touchend}
        width={courtSize?.width}
        height={courtSize?.height}
        // style={{ border: "1px solid #ff0000" }}
      ></canvas>
      {/* <canvas
        id="canvas1"
        ref={(ref) => (this.canvas1 = ref)}
        width="500"
        height="500"
        style={{ zIndex: 1, position: absolute, top: 0, left: 0 }}
      /> */}
    </div>
  );
}
