import React, { useEffect, useRef, useState } from "react";
import {
  Canvas,
  Circle,
  Rect,
  Line,
  FabricText,
  StaticCanvas,
  Polyline,
  FabricObject,
  Group,
} from "fabric"; // browser
import { v4 as uuidv4 } from "uuid";
import {
  rolerecopppos,
  rolerecpos,
  roleattpos,
  roleattopppos,
  rolebasepos,
  roleservepos,
  rolesideoutopppos,
} from "../utils/PlayerPositions";
import {
  kStageServe,
  kStagePass,
  kStageSet,
  kStageAttack,
  kStageBlock,
  kStageDefense,
  kStageFreeball,
  kStageCover,
  kSkillServe,
  kSkillPass,
  kSkillSet,
  kSkillSpike,
  kSkillBlock,
  kSkillDefense,
  kSkillFreeball,
  kSkillCover,
  kEventModifierLastTouchError,
  kEventModifierLastSpikeError,
  kEventModifierLastSpikeKill,
} from "../utils/Constants";
import { useTimer } from "react-timer-hook";
import { getArrowHeadPoints, rotateTeam } from "../utils/Utils";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
function CodingCourt2({
  isVertical,
  courtSize,
  topTeam,
  bottomTeam,
  servingTeam,
  startingTeam,
  startingStage,
  currentSide,
  onCreateEvents,
  onModifyEvent,
  updated,
}) {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [layers, setLayers] = useState([]);
  const [layerCourt, setLayerCourt] = useState(null);
  const [layerTeamAPlayers, setLayerTeamAPlayers] = useState(null);
  const [layerTeamBPlayers, setLayerTeamBPlayers] = useState(null);
  const [layerBall, setLayerBall] = useState(null);
  // const [diameter, setDiameter] = useState(0);
  const [layerStage, setLayerStage] = useState(null);
  const [courtArea, setCourtArea] = useState(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [currentStage, setCurrentStage] = useState(startingStage);
  const [currentPositionStage, setCurrentPositionStage] =
    useState(startingStage);
  const [currentTeam, setCurrentTeam] = useState(startingTeam);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [endPoint, setEndPoint] = useState({ x: 0, y: 0 });
  const [midPoint, setMidPoint] = useState({ x: 0, y: 0 });
  const [midPoint2, setMidPoint2] = useState({ x: 0, y: 0 });
  const [currentPasser, setCurrentPasser] = useState(null);
  const [currentDigger, setCurrentDigger] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);
  const [lastSpikeEvent, setLastSpikeEvent] = useState(null);
  const [linePoints, setLinePoints] = useState([]);
  const [arrowHeadPoints, setArrowHeadPoints] = useState([]);
  const [isBallIn, setIsBallIn] = useState(false);
  const [line1, setLine1] = useState(null);
  const [arrow, setArrow] = useState(null);
  const [setErrorMenu, setSetErrorMenu] = useState(null);
  const [passErrorMenu, setPassErrorMenu] = useState(null);
  const [spikeKillMenu, setSpikeKillMenu] = useState(null);
  const [spikeErrorMenu, setSpikeErrorMenu] = useState(null);
  const [blockedMenu, setBlockedMenu] = useState(null);
  const [textStage, setTextStage] = useState(null);
  const [midCircle, setMidCircle] = useState(null);
  const [midCircle2, setMidCircle2] = useState(null);
  const [netObject, setNetObject] = useState(null);
  const [blockBack, setBlockBack] = useState(false);
  const [blockForward, setBlockForward] = useState(false);
  const [attackingTeam, setAttackingTeam] = useState(null);
  const [defendingTeam, setDefendingTeam] = useState(null);
  const [topTeamPlayerDiscs, setTopTeamPlayerDiscs] = useState([]);
  const [bottomTeamPlayerDiscs, setBottomTeamPlayerDiscs] = useState([]);
  const [netAnimation, setNetAnimation] = useState(null);
  const [subTeam, setSubTeam] = useState(null);
  const [subPlayers, setSubPlayers] = useState(null);
  const [subPlayer, setSubPlayer] = useState(null);
  const [, forceUpdate] = useState(0);
  let diameter = 0;
  const diaconst = 160;
  const { restart, pause } = useTimer({ onExpire: () => doMidpoint() });

  const doCourtLayer = (initCanvas, ca) => {
    if (!ca) return;
    const rect = new Rect({
      width: ca.width,
      height: ca.height,
      fill: "orange",
      stroke: "white",
      strokeWidth: ca.scale * 10,
      left: ca.left,
      top: ca.top,
      id: uuidv4(),
    });
    initCanvas.add(rect);
    if (isVertical) {
      const rect = new Rect({
        width: ca.width,
        height: ca.attackLine * 2,
        fill: "darkorange",
        stroke: "white",
        strokeWidth: ca.scale * 10,
        left: ca.left,
        top: ca.top + ca.width - ca.attackLine,
        id: uuidv4(),
      });
      initCanvas.add(rect);
      const centerline = new Line(
        [ca.left, ca.top + ca.width, ca.left + ca.width, ca.top + ca.width],
        {
          stroke: "white",
          strokeWidth: ca.scale * 10,
          id: uuidv4(),
        }
      );
      initCanvas.add(centerline);
      var topteamtext = new AnimatedText({
        // fill: "rgba(255, 255, 255, .40",
        fill: null,
        strokeWidth: 2 * ca.scale,
        left: courtSize?.width / 2,
        top: 70 * ca.scale,
        text: topTeam.name.toUpperCase() + " R" + topTeam.rotation,
        fontSize: 80 * ca.scale,
        angle: isVertical ? 0 : -Math.PI / 2,
        min: topTeam.name === currentTeam?.name ? 20 : 80,
        max: 80,
        opacity: 80,
        id: uuidv4(),
      });
      initCanvas.add(topteamtext);
      if (topTeam.name === currentTeam?.name) {
        requestAnimationFrame(function animate() {
          topteamtext.animateOpacity();
          initCanvas.requestRenderAll();
          requestAnimationFrame(animate);
        });
      }
      // const btnPlus = new Rect({
      //   width: 32, ////100 * ca.scale,
      //   height: 32, //100 * ca.scale,
      //   fill: "green",
      //   stroke: "transparent",
      //   left: 0,
      //   top: 0,
      //   id: uuidv4(),
      //   selectable: true,
      //   evented: true,
      // });
      // initCanvas.add(btnPlus);
      // btnPlus.on("selected", (element) => {
      //   // do stuff here
      //   console.log("selected", element);
      // });
      // btnPlus.on("mousedown", () => {
      //   console.log("on mousedown rect");
      // });
      // var plus = new FabricText("+", {
      //   fontSize: 40,
      //   fontFamily: "Helvetica",
      //   fontWeight: 600,
      //   left: 0,
      //   top: -10,
      //   fill: "white",
      // });
      // initCanvas.add(plus);

      var bottomteamtext = new AnimatedText({
        // fill: "rgba(255, 255, 255, .40",
        fill: null,
        strokeWidth: 2 * ca.scale,
        left: courtSize?.width / 2,
        top: courtSize?.height - 60 * ca.scale,
        text: bottomTeam.name.toUpperCase() + " R" + bottomTeam.rotation,
        fontSize: 80 * ca.scale,
        angle: isVertical ? 0 : -Math.PI / 2,
        min: bottomTeam.name === currentTeam?.name ? 20 : 80,
        max: 80,
        opacity: 80,
        id: uuidv4(),
      });
      initCanvas.add(bottomteamtext);
      if (bottomTeam.name === currentTeam?.name) {
        requestAnimationFrame(function animate() {
          bottomteamtext.animateOpacity();
          initCanvas.requestRenderAll();
          requestAnimationFrame(animate);
        });
      }
    } else {
      const rect = new Rect({
        width: ca.attackLine * 2,
        height: ca.height,
        fill: "darkorange",
        stroke: "white",
        strokeWidth: ca.scale * 10,
        left: ca.left + ca.width / 2 - ca.attackLine,
        top: ca.top,
        id: uuidv4(),
      });
      initCanvas.add(rect);
      const centerline = new Line(
        [
          ca.left + ca.width / 2,
          ca.top,
          ca.left + ca.width / 2,
          ca.top + ca.height,
        ],
        {
          stroke: "white",
          strokeWidth: ca.scale * 10,
          id: uuidv4(),
        }
      );
      initCanvas.add(centerline);
      var topteamtext = new AnimatedText({
        // fill: "rgba(255, 255, 255, .40",
        fill: null,
        strokeWidth: 2 * ca.scale,
        top: courtSize?.height / 2,
        left: 60 * ca.scale,
        text: topTeam.name.toUpperCase() + " R" + topTeam.rotation,
        fontSize: 80 * ca.scale,
        angle: isVertical ? 0 : -Math.PI / 2,
        min: topTeam.name === currentTeam?.name ? 20 : 80,
        max: 80,
        opacity: 80,
        id: uuidv4(),
      });
      initCanvas.add(topteamtext);
      if (topTeam.name === currentTeam?.name) {
        requestAnimationFrame(function animate() {
          topteamtext.animateOpacity();
          initCanvas.requestRenderAll();
          requestAnimationFrame(animate);
        });
      }
      var bottomteamtext = new AnimatedText({
        // fill: "rgba(255, 255, 255, .40",
        fill: null,
        strokeWidth: 2 * ca.scale,
        top: courtSize?.height / 2,
        left: courtSize?.width - 60 * ca.scale,
        text: bottomTeam.name.toUpperCase() + " R" + bottomTeam.rotation,
        fontSize: 80 * ca.scale,
        angle: isVertical ? 0 : -Math.PI / 2,
        min: bottomTeam.name === currentTeam?.name ? 20 : 80,
        max: 80,
        opacity: 80,
        id: uuidv4(),
      });
      initCanvas.add(bottomteamtext);
      if (bottomTeam.name === currentTeam?.name) {
        requestAnimationFrame(function animate() {
          bottomteamtext.animateOpacity();
          initCanvas.requestRenderAll();
          requestAnimationFrame(animate);
        });
      }
    }

    if (currentStage === kStageServe) {
      return;
    }

    var xline = new Polyline(linePoints, {
      stroke: "lightgray",
      fill: "transparent",
      strokeDashArray: [30 * ca.scale, 10 * ca.scale],
      strokeWidth: 10 * ca.scale,
      id: uuidv4(),
    });
    initCanvas.add(xline);
    initCanvas.renderAll();
    var xarrow = new Polyline(arrowHeadPoints, {
      stroke: "transparent",
      fill: "lightgray",
      id: uuidv4(),
    });
    initCanvas.add(xarrow);
    initCanvas.renderAll();

    if (midPoint.x !== 0 && midPoint.y !== 0) {
      const w = 40;
      const h = 40;
      const x1 = isVertical ? courtSize?.width - w : courtSize?.width / 2;
      const y1 = isVertical ? courtSize?.height / 2 : courtSize?.height - h;
      // const x2 = isVertical ? courtSize.width - w : courtSize.width / 2 - w;
      // const y2 = isVertical ? courtSize.height / 2 - h : courtSize.height - h;
      const x2 = isVertical ? midPoint.x - w / 2 : midPoint.x - w / 2;
      const y2 = isVertical ? midPoint.y - h / 2 : midPoint.y - h / 2;

      // var seterrormenu = new Circle({
      //   radius: 20,
      //   fill: "rgba(255, 0, 0, .80",
      //   left: x1,
      //   top: y1,
      //   id: uuidv4(),
      // });
      // initCanvas.add(seterrormenu);
      // setSetErrorMenu({
      //   x: x1,
      //   y: y1,
      //   width: w,
      //   height: h,
      // });
      // var settext1 = new AnimatedText({
      //   fill: null,
      //   left: x1 + w / 2,
      //   top: y1 + 14,
      //   text: "SET",
      //   fontSize: 12,
      //   angle: 0,
      //   min: 100,
      //   max: 100,
      //   opacity: 100,
      //   id: uuidv4(),
      // });
      // initCanvas.add(settext1);
      // var settext2 = new AnimatedText({
      //   fill: null,
      //   left: x1 + w / 2,
      //   top: y1 + 28,
      //   text: "ERR",
      //   fontSize: 12,
      //   angle: 0,
      //   min: 100,
      //   max: 100,
      //   opacity: 100,
      //   id: uuidv4(),
      // });
      // initCanvas.add(settext2);
    } else {
      setSetErrorMenu(null);
      setPassErrorMenu(null);
      setSpikeKillMenu(null);
    }

    // courtLayer = { ...courtLayer, objects: [...courtLayer.objects, rect.id] };
    // courtLayer.objects.forEach((id) => {
    //   let object = getObjectById(id);
    //   if (object) {
    //     object.set("visible", true);
    //   }
    // });
    // initCanvas.renderAll();
  };

  // const diameter = 160 * ca.scale;
  const doMenu = (initCanvas, ca) => {
    if (!ca) return;
    if (currentStage === kStageServe) {
      return;
    }
    const w = 60;
    const h = 40;
    const gap = 1;
    const x1 = isVertical
      ? courtSize?.width - w
      : courtSize?.width / 2 - (2 * w + 2 * gap);
    const y1 = isVertical ? courtSize?.height / 2 - (2 * h + 2 * gap) : 0;
    const x2 = isVertical ? courtSize?.width - w : x1 + w + gap;
    const y2 = isVertical ? y1 + h + gap : y1;
    const x3 = isVertical ? courtSize?.width - w : x2 + w + gap;
    const y3 = isVertical ? y2 + h + gap : y2;
    const x4 = isVertical ? courtSize?.width - w : x3 + w + gap;
    const y4 = isVertical ? y3 + h + gap : y3;
    var seterrormenu = new Rect({
      width: w,
      height: h,
      fill: "rgba(255, 0, 0, 1.0",
      left: x1,
      top: y1,
      id: uuidv4(),
    });
    initCanvas.add(seterrormenu);
    setSetErrorMenu({
      x: x1,
      y: y1,
      width: w,
      height: h,
    });
    var seterrortext1 = new FabricText("SET", {
      fontSize: 11,
      fontFamily: "Helvetica",
      fontWeight: 900,
      left: x1 + w / 2,
      top: y1 + 14,
      fill: "white",
      originX: "center",
      originY: "center",
    });
    initCanvas.add(seterrortext1);
    var seterrortext2 = new FabricText("ERROR", {
      fontSize: 11,
      fontFamily: "Helvetica",
      fontWeight: 900,
      left: x1 + w / 2,
      top: y1 + 14 + 14,
      fill: "white",
      originX: "center",
      originY: "center",
    });
    initCanvas.add(seterrortext2);
    var passerrormenu = new Rect({
      width: w,
      height: h,
      fill: "rgba(255, 0, 0, 1.0",
      left: x2,
      top: y2,
      id: uuidv4(),
    });
    initCanvas.add(passerrormenu);
    setPassErrorMenu({
      x: x2,
      y: y2,
      width: w,
      height: h,
    });
    const tt = lastSpikeEvent ? "DIG" : "PASS";
    var passerrortext1 = new FabricText(tt, {
      fontSize: 11,
      fontFamily: "Helvetica",
      fontWeight: 900,
      left: x2 + w / 2,
      top: y2 + 14,
      fill: "white",
      originX: "center",
      originY: "center",
    });
    initCanvas.add(passerrortext1);
    var passerrortext2 = new FabricText("ERROR", {
      fontSize: 11,
      fontFamily: "Helvetica",
      fontWeight: 900,
      left: x2 + w / 2,
      top: y2 + 14 + 14,
      fill: "white",
      originX: "center",
      originY: "center",
    });
    initCanvas.add(passerrortext2);
    if (lastSpikeEvent) {
      if (blockBack) {
        var blockedmenu = new Rect({
          width: w,
          height: h,
          fill: "rgba(255, 0, 0, 1.0",
          left: x3,
          top: y3,
          id: uuidv4(),
        });
        initCanvas.add(blockedmenu);
        setBlockedMenu({
          x: x3,
          y: y3,
          width: w,
          height: h,
        });
        setSpikeErrorMenu({
          x: x3,
          y: y3,
          width: w,
          height: h,
        });
        var blockedtext1 = new FabricText("BLOCKED", {
          fontSize: 11,
          fontFamily: "Helvetica",
          fontWeight: 900,
          left: x3 + w / 2,
          top: y3 + h / 2,
          fill: "white",
          originX: "center",
          originY: "center",
        });
        initCanvas.add(blockedtext1);
      } else if (currentStage === kStageAttack) {
        var killmenu = new Rect({
          width: w,
          height: h,
          fill: "rgba(0, 128, 0, 1.0",
          left: x3,
          top: y3,
          id: uuidv4(),
        });
        initCanvas.add(killmenu);
        setSpikeKillMenu({
          x: x3,
          y: y3,
          width: w,
          height: h,
        });
        var killtext1 = new FabricText("SPIKE", {
          fontSize: 11,
          fontFamily: "Helvetica",
          fontWeight: 900,
          left: x3 + w / 2,
          top: y3 + 14,
          fill: "white",
          originX: "center",
          originY: "center",
        });
        initCanvas.add(killtext1);
        var killtext2 = new FabricText("KILL", {
          fontSize: 11,
          fontFamily: "Helvetica",
          fontWeight: 900,
          left: x3 + w / 2,
          top: y3 + 14 + 14,
          fill: "white",
          originX: "center",
          originY: "center",
        });
        initCanvas.add(killtext2);
        var spikeerrormenu = new Rect({
          width: w,
          height: h,
          fill: "rgba(255, 0, 0, 1.0",
          left: x4,
          top: y4,
          id: uuidv4(),
        });
        initCanvas.add(spikeerrormenu);
        setSpikeErrorMenu({
          x: x4,
          y: y4,
          width: w,
          height: h,
        });
        var spikeerrortext1 = new FabricText("SPIKE", {
          fontSize: 11,
          fontFamily: "Helvetica",
          fontWeight: 900,
          left: x4 + w / 2,
          top: y4 + 14,
          fill: "white",
          originX: "center",
          originY: "center",
        });
        initCanvas.add(spikeerrortext1);
        var spikeerrortext2 = new FabricText("ERROR", {
          fontSize: 11,
          fontFamily: "Helvetica",
          fontWeight: 900,
          left: x4 + w / 2,
          top: y4 + 14 + 14,
          fill: "white",
          originX: "center",
          originY: "center",
        });
        initCanvas.add(spikeerrortext2);
      }
    }
  };

  const removePlayerDiscs = (discs) => {
    discs.forEach((grp) => {
      canvas.remove(grp);
    });
  };

  const doPlayerToken = (x, y, li, team, ca) => {
    let objs = [];
    // const diameter = 160 * ca.scale;
    if (diameter === 0) {
      diameter = diaconst * ca.scale;
    }
    const innerdiameter = diameter * 0.66;
    const fontSize = 70 * ca.scale;
    const isTopTeam = team.name === topTeam.name;

    // const dot = new Circle({
    //   radius: 4 * ca.scale,
    //   fill: "black",
    //   left: x,
    //   top: y,
    //   id: uuidv4(),
    // });
    // objs.push(dot);

    const teamcolour1 =
      isLibero(li) || (li.liberoNumber && li.liberoNumber !== "")
        ? "white"
        : isTopTeam
        ? topTeam.colour
          ? topTeam.colour
          : "lime"
        : bottomTeam.colour
        ? bottomTeam.colour
        : "purple";
    const teamcolour2 =
      isLibero(li) || (li.liberoNumber && li.liberoNumber !== "")
        ? isTopTeam
          ? topTeam.colour
            ? topTeam.colour
            : "lime"
          : bottomTeam.colour
          ? bottomTeam.colour
          : "purple"
        : "white";
    const isServer =
      servingTeam.name === team.name && li.currentPosition === "1";
    const isSelected = li.selected && li.selected === true;
    const ww = isSelected ? 16 * ca.scale : 4 * ca.scale; //isServer ? 8 * ca.scale : 4 * ca.scale;
    const fillcolour = isSelected ? "rgba(254, 20, 147, 1.0)" : teamcolour1;
    const circlex = new Circle({
      radius: diameter / 2 + ww,
      fill: fillcolour,
      // stroke: isSelected ? "black" : "transparent",
      // strokeWidth: 1,
      left: x - ww,
      top: y - ww,
      id: uuidv4(),
    });
    objs.push(circlex);
    const hhh = (diameter - innerdiameter) / 2;
    const lblx = new Rect({
      width: diameter + ww * 2,
      height: hhh + ww * 2,
      fill: fillcolour,
      // strokeWidth: sw,
      left: x - ww,
      top: diameter + y - hhh - ww,
      id: uuidv4(),
    });
    objs.push(lblx);
    // }

    const circle = new Circle({
      radius: diameter / 2,
      fill: teamcolour1,
      opacity: isSelected ? 1 : 0.1,
      left: x,
      top: y,
      id: uuidv4(),
    });
    objs.push(circle);
    const circle2 = new Circle({
      radius: innerdiameter / 2,
      fill: li.role1 === "S" ? "yellow" : teamcolour2,
      left: x + (diameter - innerdiameter) / 2,
      top: y + (diameter - innerdiameter) / 2,
      id: uuidv4(),
    });
    objs.push(circle2);
    var realnumber = li.playerNumber.toString();
    if (li.liberoNumber && li.liberoNumber !== "") {
      console.log("libero", li.liberoNumber, " player", li.playerNumber);
      realnumber = li.liberoNumber;
    } else if (li.subPlayer) {
      realnumber = li.subPlayer.shirtNumber;
    }
    if (li.role1 === "S") {
      realnumber += "*";
    }
    const number = new FabricText(realnumber, {
      fontSize: 80 * ca.scale,
      fontFamily: "Helvetica",
      fontWeight: 1000,
      left: x + diameter / 2,
      top: diameter + y - diameter / 2,
      fill: "black",
      stroke: "white",
      strokeWidth: 4 * ca.scale,
      originX: "center",
      originY: "center",
    });
    objs.push(number);

    const offset = +4 * ca.scale;
    const hh = (diameter - innerdiameter) / 2;
    const lbl = new Rect({
      width: diameter, //80 * ca.scale,
      height: hh + offset,
      fill: "white",
      stroke: "transparent",
      strokeWidth: 0.5,
      left: x,
      top: diameter + y - hh,
      id: uuidv4(),
    });
    objs.push(lbl);
    const ll = li.currentPosition + " - " + li.role1;
    const lbltext = new FabricText(ll, {
      fontSize: 30 * ca.scale,
      fontFamily: "Helvetica",
      fontWeight: 400,
      left: x + diameter / 2,
      top: diameter + y - hh / 2 + offset,
      fill: "black",
      originX: "center",
      originY: "center",
    });
    objs.push(lbltext);

    if (li.liberoNumber && li.liberoNumber !== "") {
      const lbl = new Rect({
        width: diameter / 3, //80 * ca.scale,
        height: diameter / 4,
        fill: "red",
        stroke: "transparent",
        strokeWidth: 0.5,
        left: x,
        top: y,
        id: uuidv4(),
      });
      objs.push(lbl);
      var ln = li.subPlayer
        ? li.subPlayer.shirtNumber.toString()
        : li.playerNumber.toString();
      const libero = new FabricText(ln, {
        fontSize: 40 * ca.scale,
        fontFamily: "Helvetica",
        fontWeight: 400,
        left: x + diameter / 6,
        top: y + diameter / 8,
        fill: "white",
        originX: "center",
        originY: "center",
      });
      objs.push(libero);
    } else if (li.subPlayer) {
      const lbl = new Rect({
        width: diameter / 3, //80 * ca.scale,
        height: diameter / 4,
        fill: "blue",
        stroke: "transparent",
        strokeWidth: 0.5,
        left: x,
        top: y,
        id: uuidv4(),
      });
      objs.push(lbl);
      var ln = li.playerNumber.toString();
      const libero = new FabricText(ln, {
        fontSize: 40 * ca.scale,
        fontFamily: "Helvetica",
        fontWeight: 400,
        left: x + diameter / 6,
        top: y + diameter / 8,
        fill: "white",
        originX: "center",
        originY: "center",
      });
      objs.push(libero);
    }

    return objs;
  };

  const doPlayersTeamLayer = (initCanvas, team, ca) => {
    if (!ca) return;
    if (!team || !team.players) return;
    if (team.name === topTeam.name) {
      removePlayerDiscs(topTeamPlayerDiscs);
      setTopTeamPlayerDiscs([]);
    } else {
      removePlayerDiscs(bottomTeamPlayerDiscs);
      setBottomTeamPlayerDiscs([]);
    }
    let grps = [];
    // const diameter = 160 * ca.scale;
    // const innerdiameter = 100 * ca.scale;
    // const fontSize = 70 * ca.scale;
    const isTopTeam = team.name === topTeam.name;
    const rotation = team.rotation;
    console.log(team.name, rotation);
    var ppos = roleservepos; //roleorigpos; //origpos[rotation - 1];
    if (currentPositionStage === kStageServe) {
      if (team.name !== servingTeam.name) {
        ppos = team.isOppPassing ? rolerecopppos : rolerecpos;
      }
    } else if (currentPositionStage === kStagePass) {
      if (team.name !== servingTeam.name) {
        ppos = team.isOppPassing ? roleattopppos : roleattpos;
      } else {
        ppos = rolebasepos;
      }
    } else if (currentPositionStage === kStageDefense) {
      if (team.name !== attackingTeam?.name) {
        ppos = team.isOppPassing ? roleattopppos : roleattpos;
      } else {
        ppos = rolebasepos;
      }
    } else if (currentPositionStage === kStageAttack) {
      if (team.name === currentTeam?.name) {
        if (lastEvent?.skill === kSkillPass) {
          // ppos = team.isOppPassing ? roleattopppos : roleattpos;
          ppos = team.isOppPassing ? rolesideoutopppos : roleattpos;
        }
      } else {
        ppos = rolebasepos;
      }
    }

    diameter = diaconst * ca.scale;
    for (var index = 0; index < 6; index++) {
      let objs = [];
      const li = team.currentLineup.filter(
        (p) => p.position === (index + 1).toString()
      );
      const pos = ppos[li[0].role1][rotation - 1]; // ppos[index];
      if (isVertical) {
        const x = isTopTeam
          ? (pos.x * ca.width) / 100 - diameter / 2
          : ((100 - pos.x) * ca.width) / 100 - diameter / 2;
        const y = isTopTeam
          ? (pos.y * ca.width) / 100 - diameter / 2
          : ca.width + ((100 - pos.y) * ca.width) / 100 - diameter / 2;
        li[0].pos = {
          x: ca.left + x,
          y: ca.top + y,
        };
        objs = doPlayerToken(ca.left + x, ca.top + y, li[0], team, ca);
      } else {
        var x = isTopTeam
          ? (pos.x * ca.height) / 100
          : ((100 - pos.x) * ca.height) / 100;
        var y = isTopTeam
          ? (pos.y * ca.height) / 100
          : ca.height + ((100 - pos.y) * ca.height) / 100;
        li[0].pos = {
          x: ca.left + y - diameter / 2,
          y: ca.top + ca.height - x - diameter / 2,
        };

        objs = doPlayerToken(
          ca.left + y - diameter / 2,
          ca.top + ca.height - x - diameter / 2,
          li[0],
          team,
          ca
        );
      }
      let gr = new Group(objs, { id: uuidv4() });
      initCanvas.add(gr);
      grps.push(gr);
    }
    var ii = 0;
    var gap = 8;
    for (var index = 6; index < 8; index++) {
      let objs = [];
      const li = team.currentLineup.filter(
        (p) => p.position === (index + 1).toString()
      );
      // const pos = ppos[li[0].role1][rotation - 1]; // ppos[index];
      if (isVertical) {
        const lmargin = 20 * ca.scale;
        const x = lmargin;
        const y = isTopTeam
          ? ca.top + ii * diameter + ii * gap
          : ca.top +
            ca.height -
            2 * (diameter + gap) +
            gap +
            ii * diameter +
            ii * gap;
        li[0].pos = {
          x: x,
          y: y,
        };
        objs = doPlayerToken(x, y, li[0], team, ca);
      } else {
        const tmargin = 10;
        const x = isTopTeam
          ? ca.left + ii * diameter + ii * gap
          : ca.left +
            ca.width -
            2 * (diameter + gap) +
            gap +
            ii * diameter +
            ii * gap;
        const y = tmargin;
        li[0].pos = {
          x: x,
          y: y,
        };
        objs = doPlayerToken(x, y, li[0], team, ca);
      }
      ii++;
      let gr = new Group(objs, { id: uuidv4() });
      initCanvas.add(gr);
      grps.push(gr);
    }

    if (team.name === topTeam.name) {
      setTopTeamPlayerDiscs(grps);
    } else {
      setBottomTeamPlayerDiscs(grps);
    }
  };

  const doBallLayer = (initCanvas, ca) => {
    if (!ca) return;
    if (initCanvas) {
      let pts = [];
      let apts = [];
      if (midPoint2.x !== 0 && midPoint2.y !== 0) {
        const x1 = startPoint.x;
        const y1 = startPoint.y;
        const x2 = midPoint.x;
        const y2 = midPoint.y;
        const x3 = midPoint2.x;
        const y3 = midPoint2.y;
        const x4 = endPoint.x;
        const y4 = endPoint.y;
        const isIn = checkBallIsIn(endPoint);
        pts = [
          { x: x1, y: y1 },
          { x: x2, y: y2 },
          { x: x3, y: y3 },
          { x: x4, y: y4 },
        ];
        apts = getArrowHeadPoints(
          { x: x3, y: y3 },
          { x: x4, y: y4 },
          100 * ca.scale,
          0.3
        );
      } else if (midPoint.x !== 0 && midPoint.y !== 0) {
        const x1 = startPoint.x;
        const y1 = startPoint.y;
        const x2 = midPoint.x;
        const y2 = midPoint.y;
        const x3 = endPoint.x;
        const y3 = endPoint.y;
        const isIn = checkBallIsIn(endPoint);
        pts = [
          { x: x1, y: y1 },
          { x: x2, y: y2 },
          { x: x3, y: y3 },
        ];
        apts = getArrowHeadPoints(
          { x: x2, y: y2 },
          { x: x3, y: y3 },
          100 * ca.scale,
          0.3
        );
      } else {
        const x1 = startPoint.x;
        const y1 = startPoint.y;
        const x2 = endPoint.x;
        const y2 = endPoint.y;
        const isIn = checkBallIsIn(endPoint);
        pts = [
          { x: x1, y: y1 },
          { x: x2, y: y2 },
        ];
        apts = getArrowHeadPoints(
          { x: x1, y: y1 },
          { x: x2, y: y2 },
          100 * ca.scale,
          0.3
        );
      }
      setLinePoints(pts);
      setArrowHeadPoints(apts);

      const isIn = checkBallIsIn(endPoint);

      if (line1) {
        initCanvas.remove(line1);
        setLine1(null);
      }
      if (arrow) {
        initCanvas.remove(arrow);
        setArrow(null);
        // console.log("remove arrow");
      }
      if (midCircle) {
        initCanvas.remove(midCircle);
        setMidCircle(null);
      }
      if (midCircle2) {
        initCanvas.remove(midCircle2);
        setMidCircle2(null);
      }
      if (netObject && !isDrawing) {
        cancelAnimationFrame(netAnimation);
        console.log("cancelAnimationFrame = ", netAnimation);
        initCanvas.remove(netObject);
        setNetObject(null);
      }

      var line = new Polyline(pts, {
        stroke: isIn ? "green" : "red",
        fill: "transparent",
        strokeWidth: 10 * ca.scale,
        id: uuidv4(),
      });
      initCanvas.add(line);
      initCanvas.renderAll();
      setLine1(line);

      var xarrow = new Polyline(apts, {
        stroke: "transparent",
        fill: isIn ? "green" : "red",
        id: uuidv4(),
      });
      initCanvas.add(xarrow);
      initCanvas.renderAll();
      setArrow(xarrow);

      if (midPoint.x !== 0 && midPoint.y !== 0) {
        const innetzone = isInNetZone(midPoint);
        if (innetzone && isDrawing) {
          const nz = ca.zones["net"];
          const x = ca.left + (nz.x / 100) * ca.width;
          const y = ca.top + (nz.y / 100) * ca.height;
          const w = isVertical ? ca.width : (nz.w / 100) * ca.width;
          const h = isVertical ? (nz.h / 100) * ca.height : ca.height;
          var net = new FlashingRect({
            width: w,
            height: h,
            fillcolorstring: "rgba(255, 0, 255, opacity)",
            left: x,
            top: y,
            min: 40,
            max: 80,
            opacity: 40,
            id: uuidv4(),
          });
          initCanvas.add(net);
          setNetObject(net);
          const na = requestAnimationFrame(function animate() {
            if (!isDrawing) {
              cancelAnimationFrame(netAnimation);
              return;
            }
            net.animateOpacity();
            initCanvas.requestRenderAll();
            const xna = requestAnimationFrame(animate);
            // console.log("xna = ", xna);
            setNetAnimation(xna);
          });
        } else {
          var circle = new PulsingCircle({
            fill: "rgba(255, 255, 255, .40",
            strokeWidth: 2 * ca.scale,
            left: midPoint.x,
            top: midPoint.y,
            min: 20,
            max: 100,
            rad: 100,
            id: uuidv4(),
          });
          initCanvas.add(circle);
          setMidCircle(circle);
          requestAnimationFrame(function animate() {
            circle.animateRadius();
            initCanvas.requestRenderAll();
            requestAnimationFrame(animate);
          });
        }
      }

      if (midPoint2.x !== 0 && midPoint2.y !== 0) {
        var circle2 = new PulsingCircle({
          fill: "rgba(255, 255, 255, .40",
          strokeWidth: 2 * ca.scale,
          left: midPoint2.x,
          top: midPoint2.y,
          min: 20,
          max: 100,
          rad: 100,
          id: uuidv4(),
        });
        initCanvas.add(circle2);
        setMidCircle2(circle2);
        requestAnimationFrame(function animate() {
          circle2.animateRadius();
          initCanvas.requestRenderAll();
          requestAnimationFrame(animate);
        });
      }
    }
  };

  const doStageLayer = (initCanvas, stage, ca) => {
    if (!ca) return;
    if (initCanvas) {
      const offset = isVertical ? 150 * ca.scale : 210 * ca.scale;
      const y = isVertical ? 70 * ca.scale : 70 * ca.scale;
      const x = isVertical
        ? courtSize?.width / 2
        : currentTeam.name === topTeam.name
        ? offset
        : courtSize?.width - offset;
      const yy = isVertical ? 0 * ca.scale : 10 * ca.scale;
      const ystage = isVertical
        ? currentTeam.name === topTeam.name
          ? y + offset - yy
          : courtSize?.height - offset - 10 * ca.scale + yy
        : currentTeam.name === topTeam.name
        ? courtSize?.height / 2
        : courtSize?.height / 2;

      if (textStage) {
        initCanvas.remove(textStage);
        setTextStage(null);
      }
      // if (!textStage) {
      var stagetext = new AnimatedText({
        // fill: "rgba(255, 255, 255, .40",
        fill: null,
        strokeWidth: 2 * ca.scale,
        left: x,
        top: ystage,
        text: stageText(stage).toUpperCase(),
        fontSize: 120 * ca.scale,
        angle: isVertical ? 0 : -Math.PI / 2,
        min: 20,
        max: 80,
        opacity: 80,
        id: uuidv4(),
      });
      initCanvas.add(stagetext);
      setTextStage(stagetext);
      requestAnimationFrame(function animate() {
        stagetext.animateOpacity();
        initCanvas.requestRenderAll();
        requestAnimationFrame(animate);
      });
      // } else {
      //   textStage.set({ text: stageText(currentStage).toUpperCase() });
      //   requestAnimationFrame(function animate() {
      //     textStage.animateOpacity();
      //     initCanvas.requestRenderAll();
      //     requestAnimationFrame(animate);
      //   });
      // }
    }
  };

  class PulsingCircle extends FabricObject {
    constructor(options = {}) {
      super(options);
      this.transparentCorners = false;
      this.objectCaching = false;
      this.animDirection = "up";

      // this.min = 20;
      // this.max = 50;
      // this.rad = 50;
    }

    animateRadius() {
      const interval = 2;

      if (this.rad >= this.min && this.rad <= this.max) {
        const actualInterval =
          this.animDirection === "up" ? interval : -interval;
        this.rad += actualInterval;
      }

      if (this.rad >= this.max) {
        this.animDirection = "down";
        this.rad -= interval;
      }
      if (this.rad <= this.min) {
        this.animDirection = "up";
        this.rad += interval;
      }
    }

    _render(ctx) {
      ctx.fillStyle = this.fill;
      ctx.beginPath();
      ctx.arc(0, 0, this.rad, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  class AnimatedText extends FabricObject {
    constructor(options = {}) {
      super(options);
      this.transparentCorners = false;
      this.objectCaching = false;
      this.animDirection = "up";
    }

    animateOpacity() {
      const interval = 0.5;

      if (this.opacity >= this.min && this.opacity <= this.max) {
        const actualInterval =
          this.animDirection === "up" ? interval : -interval;
        this.opacity += actualInterval;
      }

      if (this.opacity >= this.max) {
        this.animDirection = "down";
        this.opacity -= interval;
      }
      if (this.opacity <= this.min) {
        this.animDirection = "up";
        this.opacity += interval;
      }
    }

    _render(ctx) {
      const fontsize = this.fontSize ?? 80;
      const fontfamily = this.fontFamily ?? "Helvetica";
      const fontweight = this.fontWeight ?? "900";
      if (this.angle !== 0) {
        ctx.save();
        ctx.rotate(this.angle);
        ctx.textAlign = this.textAlign ?? "center";
        ctx.textBaseline = this.textBaseline ?? "middle";
        ctx.fillStyle =
          this.fill ?? `rgba(255, 255, 255, ${this.opacity / 100})`;
        ctx.font = `${fontweight} ${fontsize}px ${fontfamily}`;
        ctx.fillText(this.text, 0, 0);
        ctx.restore();
      } else {
        ctx.textAlign = this.textAlign ?? "center";
        ctx.textBaseline = this.textBaseline ?? "middle";
        ctx.fillStyle =
          this.fill ?? `rgba(255, 255, 255, ${this.opacity / 100})`;
        ctx.font = `${fontweight} ${fontsize}px ${fontfamily}`;
        ctx.fillText(this.text, 0, 0);
      }
    }
  }

  class FlashingRect extends FabricObject {
    constructor(options = {}) {
      super(options);
      this.transparentCorners = false;
      this.objectCaching = false;
      this.animDirection = "up";
    }

    animateOpacity() {
      const interval = 1;

      if (this.opacity >= this.min && this.opacity <= this.max) {
        const actualInterval =
          this.animDirection === "up" ? interval : -interval;
        this.opacity += actualInterval;
      }

      if (this.opacity >= this.max) {
        this.animDirection = "down";
        this.opacity -= interval;
      }
      if (this.opacity <= this.min) {
        this.animDirection = "up";
        this.opacity += interval;
      }

      // console.log("opacity", this.opacity);
    }

    _render(ctx) {
      const opa = this.opacity / 100;
      ctx.fillStyle = this.fillcolorstring.replace("opacity", opa.toString()); //`rgba(255, 255, 255, ${this.opacity / 100})`;
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }
  }

  const doInit = (initCanvas) => {
    var ca = courtArea;
    if (
      !ca ||
      ca.isVertical !== isVertical ||
      courtSize?.width !== canvasWidth ||
      courtSize?.height !== canvasHeight
    ) {
      ca = calculateCourtDimensions();
    }
    setCourtArea(ca);
    doCourtLayer(initCanvas, ca);
    doPlayersTeamLayer(initCanvas, topTeam, ca);
    doPlayersTeamLayer(initCanvas, bottomTeam, ca);
    doStageLayer(initCanvas, currentStage, ca);
    // doMenu(initCanvas, ca);
  };

  // useEffect(() => {
  //   doStageLayer(canvas, currentStage, courtArea);
  // }, [currentStage]);

  useEffect(() => {
    // document.body.style.overflow = "hidden";
    // disableBodyScroll(document);
    const initCanvas = new StaticCanvas(canvasRef.current, {
      backgroundColor: "blue",
      width: courtSize?.width,
      height: courtSize?.height,
    });
    setCanvas(initCanvas);
    doInit(initCanvas);
    return () => {
      initCanvas.dispose();
      // document.body.style.overflow = "auto";
      // enableBodyScroll(document);
    };
  }, [
    // isDrawing,
    courtSize,
    isVertical,
    currentSide,
    currentTeam,
    updated,
    startingStage,
    startingTeam,
    currentStage,

    topTeam?.rotation,
    bottomTeam?.rotation,
  ]);

  useEffect(() => {
    // doPlayersTeamLayer(canvas, topTeam, courtArea);
    // doPlayersTeamLayer(canvas, bottomTeam, courtArea);
    doBallLayer(canvas, courtArea);
  }, [startPoint, endPoint, midPoint, midPoint2]);

  useEffect(() => {
    if (startingStage === kStageAttack) {
      setAttackingTeam(startingTeam);
      setDefendingTeam(
        startingTeam.name === topTeam.name ? bottomTeam : topTeam
      );
    }
    setCurrentStage(startingStage);
    setCurrentPositionStage(startingStage);
    setCurrentTeam(startingTeam);
  }, [startingStage, startingTeam]);

  useEffect(() => {
    doStageLayer(canvas, layerStage, currentStage, courtArea);
    // doMenu(canvas, courtArea);
    // doChangePosition();
  }, [currentStage]);

  useEffect(() => {
    doPlayersTeamLayer(canvas, topTeam, courtArea);
    doPlayersTeamLayer(canvas, bottomTeam, courtArea);
  }, [selectedPlayer]);

  const getObjectById = (id) => {
    return canvas?.getObjects().find((obj) => obj.id === id);
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

  const passingTeam = () => {
    return servingTeam.name === topTeam.name ? bottomTeam : topTeam;
  };

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

  function isPointInsideRect(pt, rect) {
    return (
      pt.x >= rect.x &&
      pt.x <= rect.x + rect.w &&
      pt.y >= rect.y &&
      pt.y <= rect.y + rect.h
    );
  }

  function findFrontRowMiddleBlocker(team) {
    const players = team.currentLineup.filter((p) => p.role1.includes("MB"));
    for (var player of players) {
      if (
        player.currentPosition === "3" ||
        player.currentPosition === "2" ||
        player.currentPosition === "4"
      ) {
        return player;
      }
    }
    return null;
  }

  function findPlayerInRole(team, role) {
    const player = {
      ...team.currentLineup.filter((p) => p.role1.includes(role))[0],
    };
    return player;
  }

  function findNearestPlayer(pt, team, exceptRole) {
    if (!team) {
      console.log("team is null");
      return null;
    }
    console.log("Point ", pt.x, pt.y);
    // const diameter = 160 * courtArea.scale;
    var nearest = null;
    var distance = 1000;
    for (var index = 0; index < 6; index++) {
      const li = team.currentLineup[index];
      const pos = li.pos;
      // li.pos is at top left so find center point
      const xleft = pos.x;
      const ytop = pos.y;
      const xcentre = pos.x + diameter / 2;
      const ycentre = pos.y + diameter / 2;
      const isinplayerzone = isPointInsideRect(pt, {
        x: xleft,
        y: ytop,
        w: diameter,
        h: diameter,
      });
      if (isinplayerzone) {
        return { ...li };
      }
      const d = Math.sqrt(
        Math.pow(pt.x - xcentre, 2) + Math.pow(pt.y - ycentre, 2)
      );
      console.log(li.playerNumber, xcentre, ycentre, d);
      if (d < distance) {
        if (exceptRole && li.role1 === exceptRole) {
          continue;
        }
        distance = d;
        nearest = { ...li };
      }
    }
    return nearest;
  }

  const checkLibero = (player) => {
    if (player.liberoNumber && player.liberoNumber !== "") {
      const team = player.team === topTeam.name ? topTeam : bottomTeam;
      const libero = team.currentLineup.filter(
        (p) => p.playerNumber === player.liberoNumber
      )[0];
      if (libero) {
        return libero;
      }
    }
    return checkRealPlayer(player);
  };

  const checkRealPlayer = (player) => {
    if (player.subPlayer) {
      return {
        playerFirstName: player.subPlayer.FirstName,
        playerLastName: player.subPlayer.LastName,
        playerNumber: player.subPlayer.shirtNumber,
      };
    } else {
      return player;
    }
  };

  function doEvent(midpoint) {
    var skill = kSkillServe;
    var server = null;
    var setter = null;
    var passer = null;
    var hitter = null;
    var digger = null;
    var freeballer = null;
    var coverer = null;
    var blockers = [];

    var events = [];
    if (currentStage === kStageServe) {
      setLastSpikeEvent(null);
      server = {
        ...servingTeam.currentLineup.filter(
          (p) => p.currentPosition === "1"
        )[0],
      };
      if (midpoint.x === 0 && midpoint.y === 0) {
        const res = checkBallIsIn(endPoint);
        if (res) {
          // passer = {
          //   ...findNearestPlayer(endPoint, passingTeam()),
          // };
          // passer.grade = 0;
          // console.log("passer = ", passer);
          server.grade = 5;
        } else {
          server.grade = 0;
        }
      } else {
        // passer = {
        //   ...findNearestPlayer(
        //     midpoint,
        //     servingTeam.name === topTeam.name ? bottomTeam : topTeam
        //   ),
        // };
        passer = currentPasser;
        // console.log("passer = ", passer);
        const passteam = passingTeam();
        passer.grade = gradePassing(endPoint, passteam);
        // console.log("passing grade", passer.grade);
        const overpass = checkOverpass(endPoint); // checkBallIsIn(endPoint);
        if (overpass) {
          // overpass
          const freeballteam =
            passteam.name === topTeam.name ? bottomTeam : topTeam;
          freeballer = {
            ...findNearestPlayer(endPoint, freeballteam, "S"),
          };
          setAttackingTeam(freeballteam);
          setDefendingTeam(passteam);
          setCurrentTeam(freeballteam);
          setCurrentStage(kStageAttack);
          setCurrentPositionStage(kStageAttack);
          // setter = {
          //   ...freeballteam.currentLineup.filter((p) => p.role1 === "S")[0],
          // };
        } else {
          setAttackingTeam(passteam);
          setDefendingTeam(servingTeam);
          setCurrentTeam(passteam);
          setCurrentStage(kStageAttack);
          setCurrentPositionStage(kStageAttack);
        }
      }
      if (server.grade !== 5 && server.grade !== 0 && passer) {
        server.grade = passer.grade === 1 ? 4 : 6 - passer.grade;
      }
      let realplayer = checkRealPlayer(server);
      const serveevent = {
        ballstart: convertToTSCoord(startPoint),
        ballend: convertToTSCoord(
          midPoint.x !== 0 && midPoint.y !== 0 ? midPoint : endPoint
        ),
        ballmid: { x: 0, y: 0 },
        skill: kSkillServe,
        grade: server.grade,
        setter: setter,
        server: realplayer,
        passer: passer,
        hitter: hitter,
        digger: digger,
        blockers: blockers,
        player: {
          firstName: realplayer.playerFirstName,
          lastName: realplayer.playerLastName,
          shirtNumber: realplayer.playerNumber,
        },
        team: servingTeam,
        rotation: servingTeam.rotation,
      };
      events.push(serveevent);
      if (passer) {
        const realpasser = checkLibero(passer);
        const passevent = {
          ballstart: convertToTSCoord(midPoint),
          ballend: convertToTSCoord(endPoint),
          ballmid: { x: 0, y: 0 },
          skill: kSkillPass,
          grade: passer.grade,
          setter: setter,
          server: server,
          passer: realpasser,
          hitter: hitter,
          digger: digger,
          blockers: blockers,
          player: {
            firstName: realpasser.playerFirstName,
            lastName: realpasser.playerLastName,
            shirtNumber: realpasser.playerNumber,
          },
          team: passingTeam(),
          rotation: passingTeam().rotation,
        };
        events.push(passevent);
        setLastEvent(passevent);
      }
      if (freeballer) {
        const tm = passingTeam().name === topTeam.name ? bottomTeam : topTeam;
        let realplayer = checkRealPlayer(freeballer);
        const freeballevent = {
          ballstart: convertToTSCoord(endPoint),
          ballend: { x: 0, y: 0 },
          ballmid: { x: 0, y: 0 },
          skill: kSkillFreeball,
          grade: 4,
          setter: setter,
          server: server,
          passer: passer,
          hitter: hitter,
          digger: digger,
          freeballer: realplayer,
          blockers: blockers,
          player: {
            firstName: realplayer.playerFirstName,
            lastName: realplayer.playerLastName,
            shirtNumber: realplayer.playerNumber,
          },
          team: tm,
          rotation: tm.rotation,
        };
        events.push(freeballevent);
      }
      if (setter) {
        const tm = freeballer ? servingTeam : passingTeam();
        let realplayer = checkRealPlayer(setter);
        const setevent = {
          ballstart: convertToTSCoord(endPoint),
          ballend: { x: 0, y: 0 },
          ballmid: { x: 0, y: 0 },
          skill: kSkillSet,
          grade: 4,
          setter: realplayer,
          server: server,
          passer: passer,
          hitter: hitter,
          digger: digger,
          blockers: blockers,
          player: {
            firstName: realplayer.playerFirstName,
            lastName: realplayer.playerLastName,
            shirtNumber: realplayer.playerNumber,
          },
          team: tm,
          rotation: tm.rotation,
        };
        events.push(setevent);
      }
    } else if (currentStage === kStageAttack) {
      setter = {
        ...attackingTeam?.currentLineup.filter((p) => p.role1 === "S")[0],
      };
      hitter = {
        ...findNearestPlayer(startPoint, attackingTeam, "S"),
      };
      if (midpoint.x === 0 && midpoint.y === 0) {
        const res = checkBallIsIn(endPoint);
        if (res) {
          hitter.grade = 5;
        } else {
          hitter.grade = 0;
        }
      } else {
        if (netObject) {
          setBlockBack(false);
          setBlockForward(false);
          const attteam = currentTeam;
          const defteam =
            currentTeam.name === topTeam.name ? bottomTeam : topTeam;
          const courtside = isBlockedToOwnCourt(endPoint, attteam);
          if (courtside === false) {
            setBlockForward(true);
            digger = {
              ...findNearestPlayer(endPoint, defteam, "S"),
            };
            const blocker = findFrontRowMiddleBlocker(defteam);
            if (blocker) {
              const realplayer = checkRealPlayer(blocker);
              blockers.push({ ...realplayer });
            }
            digger.grade = 3;
            setAttackingTeam(defteam);
            setDefendingTeam(attteam);
            setCurrentTeam(defteam);
            setCurrentStage(kStageAttack);
            setCurrentPositionStage(kStageAttack);
          } else {
            setBlockBack(true);
            coverer = {
              ...findNearestPlayer(endPoint, attteam, "S"),
            };
            const blocker = findFrontRowMiddleBlocker(defteam);
            if (blocker) {
              const realplayer = checkRealPlayer(blocker);
              blockers.push({ ...realplayer });
            }
            hitter.grade = 2;
            coverer.grade = 4;
            setAttackingTeam(attteam);
            setDefendingTeam(defteam);
            setCurrentTeam(attteam);
            setCurrentStage(kStageAttack);
            setCurrentPositionStage(kStageAttack);
          }
          console.log("digger = ", digger);
        } else {
          digger = currentDigger;
          // console.log("digger = ", digger);
          digger.grade = gradePassing(endPoint, defendingTeam);
          // console.log("digging grade", digger.grade);
          const overpass = checkOverpass(endPoint); //isin = checkBallIsIn(endPoint);
          if (overpass) {
            // overpass
            const freeballteam =
              defendingTeam.name === topTeam.name ? bottomTeam : topTeam;
            freeballer = {
              ...findNearestPlayer(endPoint, freeballteam, "S"),
            };
            setAttackingTeam(freeballteam);
            setDefendingTeam(defendingTeam);
            setCurrentTeam(freeballteam);
            setCurrentStage(kStageAttack);
            setCurrentPositionStage(kStageAttack);
          } else {
            setAttackingTeam(defendingTeam);
            setDefendingTeam(attackingTeam);
            setCurrentTeam(defendingTeam);
            setCurrentPositionStage(kStageAttack);
          }
        }
      }
      if (digger) {
        hitter.grade = hitter.grade
          ? hitter.grade
          : digger.grade === 1
          ? 4
          : digger.grade === 5
          ? 2
          : 6 - digger.grade;
      }
      if (setter && setter.playerNumber !== hitter.playerNumber) {
        let realplayer = checkRealPlayer(setter);
        const setevent = {
          ballstart: convertToTSCoord(endPoint),
          ballend: { x: 0, y: 0 },
          ballmid: { x: 0, y: 0 },
          skill: kSkillSet,
          grade: 4,
          setter: realplayer,
          server: server,
          passer: passer,
          hitter: hitter,
          digger: digger,
          blockers: blockers,
          player: {
            firstName: realplayer.playerFirstName,
            lastName: realplayer.playerLastName,
            shirtNumber: realplayer.playerNumber,
          },
          team: attackingTeam,
          rotation: attackingTeam.rotation,
        };
        events.push(setevent);
      }
      let realplayer = checkRealPlayer(hitter);
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
        hitter: realplayer,
        digger: digger,
        blockers: blockers,
        player: {
          firstName: realplayer.playerFirstName,
          lastName: realplayer.playerLastName,
          shirtNumber: realplayer.playerNumber,
        },
        team: attackingTeam,
        rotation: attackingTeam?.rotation,
      };
      setLastSpikeEvent(hitevent);
      events.push(hitevent);
      if (blockers.length > 0) {
        blockers.forEach((blocker) => {
          const blockevent = {
            ballstart: convertToTSCoord(midPoint),
            ballend: convertToTSCoord(endPoint),
            ballmid: { x: 0, y: 0 },
            skill: kSkillBlock,
            grade: 4,
            setter: setter,
            server: server,
            passer: passer,
            hitter: hitter,
            digger: digger,
            blockers: blockers,
            player: {
              firstName: blocker.playerFirstName,
              lastName: blocker.playerLastName,
              shirtNumber: blocker.playerNumber,
            },
            team: defendingTeam,
            rotation: defendingTeam.rotation,
          };
          events.push(blockevent);
        });
      }
      if (digger) {
        const realdigger = checkLibero(digger);
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
          digger: realdigger,
          blockers: blockers,
          player: {
            firstName: realdigger.playerFirstName,
            lastName: realdigger.playerLastName,
            shirtNumber: realdigger.playerNumber,
          },
          team: defendingTeam,
          rotation: defendingTeam.rotation,
        };
        events.push(digevent);
        setLastEvent(digevent);
      }
      if (coverer) {
        const realcoverer = checkLibero(coverer);
        const coverevent = {
          ballstart: convertToTSCoord(midPoint),
          ballend: convertToTSCoord(endPoint),
          ballmid: { x: 0, y: 0 },
          skill: kSkillCover,
          grade: 4,
          setter: setter,
          server: server,
          passer: passer,
          hitter: hitter,
          digger: digger,
          blockers: blockers,
          coverer: realcoverer,
          player: {
            firstName: realcoverer.playerFirstName,
            lastName: realcoverer.playerLastName,
            shirtNumber: realcoverer.playerNumber,
          },
          team: attackingTeam,
          rotation: attackingTeam.rotation,
        };
        events.push(coverevent);
        setLastEvent(coverevent);
      }
      if (freeballer) {
        let realplayer = checkRealPlayer(freeballer);
        const freeballevent = {
          ballstart: convertToTSCoord(endPoint),
          ballend: { x: 0, y: 0 },
          ballmid: { x: 0, y: 0 },
          skill: kSkillFreeball,
          grade: 5,
          setter: setter,
          server: server,
          passer: passer,
          hitter: hitter,
          digger: digger,
          freeballer: realplayer,
          blockers: blockers,
          player: {
            firstName: realplayer.playerFirstName,
            lastName: realplayer.playerLastName,
            shirtNumber: realplayer.playerNumber,
          },
          team: attackingTeam,
          rotation: attackingTeam.rotation,
        };
        events.push(freeballevent);
      }

      // if (setter) {
      //   const setevent = {
      //     ballstart: convertToTSCoord(endPoint),
      //     ballend: { x: 0, y: 0 },
      //     ballmid: { x: 0, y: 0 },
      //     skill: kSkillSet,
      //     grade: 4,
      //     setter: setter,
      //     server: server,
      //     passer: passer,
      //     hitter: hitter,
      //     digger: digger,
      //     blockers: blockers,
      //     player: {
      //       firstName: setter.playerFirstName,
      //       lastName: setter.playerLastName,
      //       shirtNumber: setter.playerNumber,
      //     },
      //     team: freeballer ? attackingTeam : defendingTeam,
      //   };
      //   events.push(setevent);
      // }
    }

    onCreateEvents(events);
  }

  const checkBallIsIn = (pt) => {
    const side = currentTeam.name === topTeam.name ? 0 : 1;
    var isIn = true;
    const endPoint = convertToTSCoord(pt);
    if (midPoint.x === 0 && midPoint.y === 0) {
      isIn =
        side === 0
          ? isVertical
            ? isInZone(endPoint, courtArea.zones["serveBottom"])
            : isInZone(endPoint, courtArea.zones["serveRight"])
          : isVertical
          ? isInZone(endPoint, courtArea.zones["serveTop"])
          : isInZone(endPoint, courtArea.zones["serveLeft"]);
    }
    setIsBallIn(isIn);
    return isIn;
  };

  const checkOverpass = (pt) => {
    const side = currentTeam.name === topTeam.name ? 0 : 1;
    var isIn = true;
    const endPoint = convertToTSCoord(pt);
    if (midPoint.x !== 0 && midPoint.y !== 0) {
      isIn =
        side === 0
          ? isInZone(endPoint, courtArea.zones["rallyBottom"])
          : isInZone(endPoint, courtArea.zones["rallyTop"]);

      // isIn =
      //   side === 0
      //     ? isVertical
      //       ? isInZone(endPoint, courtArea.zones["rallyBottom"])
      //       : isInZone(endPoint, courtArea.zones["rallyRight"])
      //     : isVertical
      //     ? isInZone(endPoint, courtArea.zones["rallyTop"])
      //     : isInZone(endPoint, courtArea.zones["rallyLeft"]);
    }
    setIsBallIn(isIn);
    return isIn;
  };

  const isBlockedToOwnCourt = (pt, team) => {
    const side = team.name === topTeam.name ? 0 : 1;
    var isIn = true;
    const endPoint = convertToTSCoord(pt);
    isIn =
      side === 1
        ? isVertical
          ? isInZone(endPoint, courtArea.zones["rallyTop"])
          : isInZone(endPoint, courtArea.zones["rallyLeft"])
        : isVertical
        ? isInZone(endPoint, courtArea.zones["rallyBottom"])
        : isInZone(endPoint, courtArea.zones["rallyRight"]);
    return isIn;
  };

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

  const isInOppostionCourt = (pt) => {
    const side = currentTeam.name === topTeam.name ? 0 : 1;
    var isIn = true;
    const endPoint = convertToTSCoord(pt);
    isIn =
      side === 1
        ? isVertical
          ? isInZone(endPoint, courtArea.zones["rallyFromTop"])
          : isInZone(endPoint, courtArea.zones["rallyFromLeft"])
        : isVertical
        ? isInZone(endPoint, courtArea.zones["rallyFromBottom"])
        : isInZone(endPoint, courtArea.zones["rallyFromRight"]);
    return isIn;
  };

  const isInNetZone = (pt) => {
    const side = currentTeam.name === topTeam.name ? 0 : 1;
    var isIn = true;
    const endPoint = convertToTSCoord(pt);
    isIn = isInZone(endPoint, courtArea.zones["net"]);
    return isIn;
  };

  const calculateCourtDimensions = () => {
    if (!courtSize) return null;

    setCanvasWidth(courtSize?.width);
    setCanvasHeight(courtSize?.height);
    var xmargin = isVertical ? 200 : 300;
    var ymargin = isVertical ? 300 : 200;
    var baseWidth = isVertical ? 900 : 1800;
    var baseHeight = isVertical ? 1800 : 900;
    var attackLine = isVertical ? 300 : 300;
    var tramWidth = 27;
    var serviceLine = 108;
    var netPost = 91;
    var postWidth = 20;

    var scalew = courtSize?.width / (baseWidth + xmargin * 2);
    var scaleh = courtSize?.height / (baseHeight + ymargin * 2);
    var scale = scaleh < scalew ? scaleh : scalew;

    xmargin = (courtSize?.width - (baseWidth + tramWidth * 2) * scale) / 2;
    ymargin = (courtSize?.height - baseHeight * scale) / 2;

    baseWidth = baseWidth * scale;
    baseHeight = baseHeight * scale;
    tramWidth = tramWidth * scale;
    serviceLine = serviceLine * scale;
    attackLine = attackLine * scale;
    netPost = netPost * scale;
    postWidth = postWidth * scale;

    xmargin = (courtSize?.width - baseWidth) / 2;
    ymargin = (courtSize?.height - baseHeight) / 2;

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
      zones["net"] = { x: 0, y: 45, w: 100, h: 10 };
    } else {
      zones["serveLeft"] = { x: 0, y: 0, w: 50, h: 100 };
      zones["serveRight"] = { x: 50, y: 0, w: 50, h: 100 };
      zones["rallyRight"] = { x: 0, y: 50, w: 50, h: 100 };
      zones["rallyLeft"] = { x: 0, y: 50, w: 100, h: 100 };
      zones["serveFromLeft"] = { y: 0, x: -25, h: 100, w: 25 };
      zones["serveFromRight"] = { y: 0, x: 100, h: 100, w: 25 };
      zones["rallyFromRight"] = { x: 50, y: 0, w: 50, h: 100 };
      zones["rallyFromLeft"] = { x: 0, y: 0, w: 50, h: 100 };
      zones["net"] = { x: 45, y: 0, w: 10, h: 100 };
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
    diameter = diaconst * scale;
    return ca;
  };

  const isInSetMenu = (pt) => {
    if (!pt || !setErrorMenu) return false;
    return (
      pt.x >= setErrorMenu.x &&
      pt.x <= setErrorMenu.x + setErrorMenu.width &&
      pt.y >= setErrorMenu.y &&
      pt.y <= setErrorMenu.y + setErrorMenu.height
    );
  };

  const isInPassMenu = (pt) => {
    if (!pt || !passErrorMenu) return false;
    return (
      pt.x >= passErrorMenu.x &&
      pt.x <= passErrorMenu.x + passErrorMenu.width &&
      pt.y >= passErrorMenu.y &&
      pt.y <= passErrorMenu.y + passErrorMenu.height
    );
  };

  const isInKillMenu = (pt) => {
    if (!pt || !spikeKillMenu) return false;
    return (
      pt.x >= spikeKillMenu.x &&
      pt.x <= spikeKillMenu.x + spikeKillMenu.width &&
      pt.y >= spikeKillMenu.y &&
      pt.y <= spikeKillMenu.y + spikeKillMenu.height
    );
  };

  const isInSpikeErrorMenu = (pt) => {
    if (!pt || !spikeErrorMenu) return false;
    return (
      pt.x >= spikeErrorMenu.x &&
      pt.x <= spikeErrorMenu.x + spikeErrorMenu.width &&
      pt.y >= spikeErrorMenu.y &&
      pt.y <= spikeErrorMenu.y + spikeErrorMenu.height
    );
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
      const y = pt.y; // 100 - pt.x;
      const x = pt.x;
      return (
        y >= zone.x &&
        y <= zone.x + zone.w &&
        x >= zone.y &&
        x <= zone.y + zone.h
      );
    }
  };

  function doMidpoint() {
    if (isDrawing) {
      const inoppcourt = isInOppostionCourt(endPoint);
      if (inoppcourt) {
        if (midPoint.x !== 0 || midPoint.y !== 0) {
          const isin = checkBallIsIn(endPoint);
          if (!isin) {
            setMidPoint2({
              x: endPoint.x,
              y: endPoint.y,
            });
            setCurrentPositionStage(kStageAttack);
            setCurrentTeam(
              currentTeam.name === topTeam.name ? bottomTeam : topTeam
            );
          }
        } else {
          const mp = {
            x: endPoint.x,
            y: endPoint.y,
          };
          setMidPoint(mp);
          if (currentStage === kStageServe) {
            const passer = {
              ...findNearestPlayer(
                mp,
                servingTeam.name === topTeam.name ? bottomTeam : topTeam,
                "S"
              ),
            };
            // console.log("passer = ", passer);
            setCurrentPasser(passer);
          } else {
            const digger = {
              ...findNearestPlayer(mp, defendingTeam, "S"),
            };
            // console.log("digger = ", digger);
            setCurrentDigger(digger);
          }
          setCurrentPositionStage(
            currentStage === kStageServe ? kStagePass : kStageDefense
          );
        }
      }
    }
  }

  function startTimer() {
    if (midPoint.x === 0 && midPoint.y === 0) {
      const time = new Date();
      let ms = time.getMilliseconds() + 150;
      time.setMilliseconds(ms);
      restart(time);
    } else if (midPoint2.x === 0 && midPoint2.y === 0) {
      // const time = new Date();
      // let ms = time.getMilliseconds() + 300;
      // time.setMilliseconds(ms);
      // restart(time);
    }
  }

  function checkPlayerTokenClicked(pt) {
    const teams = [topTeam, bottomTeam];
    for (var i = 0; i < teams.length; i++) {
      const team = teams[i];
      for (var index = 0; index < team.currentLineup.length; index++) {
        const li = team.currentLineup[index];
        const pos = li.pos;
        const dia = diaconst * courtArea.scale;
        const isinplayerzone = isPointInsideRect(pt, {
          x: pos.x,
          y: pos.y,
          w: dia,
          h: dia,
        });
        if (isinplayerzone) {
          return li;
        }
      }
    }
    return null;
  }

  const isFrontRow = (player) => {
    const isfrontrow =
      player.currentPosition === "2" ||
      (player.currentPosition === "3") | (player.currentPosition === "4");
    return isfrontrow;
  };

  const isBackRow = (player) => {
    const isbackrow =
      player.currentPosition === "1" ||
      (player.currentPosition === "5") | (player.currentPosition === "6");
    return isbackrow;
  };

  const doLiberoSwap = (player) => {
    if (currentStage !== kStageServe) {
      return player;
    }
    if (!player) {
      setSelectedPlayer(null);
      return;
    }
    // for (var i = 0; i < topTeam.currentLineup.length; i++) {
    //   const li = topTeam.currentLineup[i];
    //   li.selected = false;
    // }
    // for (var i = 0; i < bottomTeam.currentLineup.length; i++) {
    //   const li = bottomTeam.currentLineup[i];
    //   li.selected = false;
    // }

    if (isLibero(selectedPlayer)) {
      if (isLibero(player)) {
        if (selectedPlayer.team === player.team) {
          if (
            player.team === selectedPlayer.team &&
            player.playerNumber === selectedPlayer.playerNumber
          ) {
            selectedPlayer.selected = false;
            setSelectedPlayer(null);
            return;
          }
          const team = player.team === topTeam.name ? topTeam : bottomTeam;
          for (var i = 0; i < 6; i++) {
            const li = team.currentLineup[i];
            if (li.liberoNumber && li.liberoNumber !== "") {
              li.liberoNumber = selectedPlayer.playerNumber.toString();
              selectedPlayer.selected = false;
              setSelectedPlayer(null);
              return;
            }
          }
          selectedPlayer.selected = false;
          setSelectedPlayer(player);
          player.selected = true;
          return;
        } else {
          selectedPlayer.selected = false;
          player.selected = true;
          setSelectedPlayer(player);
          return;
        }
      }
      if (player.team === selectedPlayer.team && isBackRow(player)) {
        const team = player.team === topTeam.name ? topTeam : bottomTeam;
        for (var i = 0; i < team.currentLineup.length; i++) {
          const li = team.currentLineup[i];
          li.selected = false;
          li.liberoNumber = "";
          if (li.playerNumber === player.playerNumber) {
            li.liberoNumber = selectedPlayer.playerNumber.toString();
          }
        }
        selectedPlayer.selected = false;
        setSelectedPlayer(null);
        for (var i = 0; i < team.currentLineup.length; i++) {
          const li = team.currentLineup[i];
          console.log("liberoNumber", li);
        }
      }
    } else {
      if (selectedPlayer && selectedPlayer !== player) {
        selectedPlayer.selected = false;
      }
      player.selected = !player.selected;
      setSelectedPlayer(player.selected ? player : null);
      setSubTeam(player.team === topTeam.name ? topTeam : bottomTeam);
    }
  };

  const isLibero = (player) => {
    if (!player) return false;
    if (player.role1 === "L1" || player.role1 === "L2") {
      return true;
    }
  };

  const doRotate = (team) => {
    console.log("team rotation", team.rotation, topTeam.rotation);
    rotateTeam(team);
    console.log("topTeam rotation", topTeam.rotation);
    // var rot = team.rotation;
    // rot = rot + 1;
    // if (rot > 6) rot = 1;
    // team.rotation = rot;
    forceUpdate((n) => !n);
  };

  const doSetError = (e) => {
    console.log("in setErrorMenu");
    const setter = {
      ...attackingTeam.currentLineup.filter((p) => p.role1 === "S")[0],
    };
    let realplayer = checkRealPlayer(setter);
    const setevent = {
      ballstart: convertToTSCoord(endPoint),
      ballend: { x: 0, y: 0 },
      ballmid: { x: 0, y: 0 },
      skill: kSkillSet,
      grade: 0,
      setter: realplayer,
      server: null,
      passer: null,
      hitter: null,
      digger: null,
      blockers: null,
      player: {
        firstName: realplayer.playerFirstName,
        lastName: realplayer.playerLastName,
        shirtNumber: realplayer.playerNumber,
      },
      team: attackingTeam,
      rotation: attackingTeam.rotation,
    };
    onCreateEvents([setevent]);
  };

  const doDigError = (e) => {
    onModifyEvent(kEventModifierLastTouchError, null);
    return;
  };

  const doSpikeError = (e) => {
    const blocker = findFrontRowMiddleBlocker(defendingTeam);
    onModifyEvent(kEventModifierLastSpikeKill, [blocker]);
  };

  const doSpikeKill = (e) => {
    const blocker = findFrontRowMiddleBlocker(defendingTeam);
    onModifyEvent(kEventModifierLastSpikeError, [blocker]);
  };

  function mousedown(e) {
    const pt = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    domousedown(pt);
  }

  function domousedown(pt) {
    // console.log("mousedown");
    setNetObject(null);
    const selplayer = checkPlayerTokenClicked(pt);
    if (selplayer) {
      doLiberoSwap(selplayer);
    }
    // if (isInSetMenu(pt)) {
    //   console.log("in setErrorMenu");
    //   const setter = {
    //     ...attackingTeam.currentLineup.filter((p) => p.role1 === "S")[0],
    //   };
    //   const setevent = {
    //     ballstart: convertToTSCoord(endPoint),
    //     ballend: { x: 0, y: 0 },
    //     ballmid: { x: 0, y: 0 },
    //     skill: kSkillSet,
    //     grade: 0,
    //     setter: setter,
    //     server: null,
    //     passer: null,
    //     hitter: null,
    //     digger: null,
    //     blockers: null,
    //     player: {
    //       firstName: setter.playerFirstName,
    //       lastName: setter.playerLastName,
    //       shirtNumber: setter.playerNumber,
    //     },
    //     team: attackingTeam,
    //     rotation: attackingTeam.rotation,
    //   };
    //   onCreateEvents([setevent]);
    //   return;
    // } else if (isInPassMenu(pt)) {
    //   console.log("in passErrorMenu");
    //   onModifyEvent(kEventModifierLastTouchError, null);
    //   // if (blockBack) {
    //   //   const blocker = findFrontRowMiddleBlocker(defendingTeam);
    //   //   onModifyEvent(kEventModifierLastSpikeError, [blocker]);
    //   // } else if (blockForward) {
    //   //   const blocker = findFrontRowMiddleBlocker(defendingTeam);
    //   //   onModifyEvent(kEventModifierLastSpikeKill, [blocker]);
    //   // } else if (lastEvent.passer || lastEvent.digger) {
    //   //   onModifyEvent(kEventModifierLastTouchError, null);
    //   // }
    //   // onCreateEvents([lastEvent]);
    //   return;
    // } else if (isInKillMenu(pt)) {
    //   console.log("in spikeKillMenu");
    //   const blocker = findFrontRowMiddleBlocker(defendingTeam);
    //   onModifyEvent(kEventModifierLastSpikeKill, [blocker]);
    // } else if (isInSpikeErrorMenu(pt)) {
    //   console.log("in spikeErrorMenu");
    //   const blocker = findFrontRowMiddleBlocker(defendingTeam);
    //   onModifyEvent(kEventModifierLastSpikeError, [blocker]);
    // }

    var isIn = false;
    if (currentStage === kStageServe) {
      isIn = isInServingZone(pt);
    } else {
      isIn = isInRallyZone(pt);
    }
    if (!isIn) return;

    setIsDrawing(true);
    setStartPoint(pt);
    setEndPoint(pt);
    setMidPoint({
      x: 0,
      y: 0,
    });
  }

  // function mousedown(e) {
  //   // console.log("mousedown");
  //   setNetObject(null);
  //   if (isInSetMenu({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })) {
  //     console.log("in setErrorMenu");
  //     const setter = {
  //       ...attackingTeam.currentLineup.filter((p) => p.role1 === "S")[0],
  //     };
  //     const setevent = {
  //       ballstart: convertToTSCoord(endPoint),
  //       ballend: { x: 0, y: 0 },
  //       ballmid: { x: 0, y: 0 },
  //       skill: kSkillSet,
  //       grade: 0,
  //       setter: setter,
  //       server: null,
  //       passer: null,
  //       hitter: null,
  //       digger: null,
  //       blockers: null,
  //       player: {
  //         firstName: setter.playerFirstName,
  //         lastName: setter.playerLastName,
  //         shirtNumber: setter.playerNumber,
  //       },
  //       team: attackingTeam,
  //       rotation: attackingTeam.rotation,
  //     };
  //     onCreateEvents([setevent]);
  //     return;
  //   } else if (
  //     isInPassMenu({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })
  //   ) {
  //     console.log("in passErrorMenu");
  //     if (blockBack) {
  //       const blocker = findFrontRowMiddleBlocker(defendingTeam);
  //       onModifyEvent(kEventModifierLastSpikeError, [blocker]);
  //     } else if (blockForward) {
  //       const blocker = findFrontRowMiddleBlocker(defendingTeam);
  //       onModifyEvent(kEventModifierLastSpikeKill, [blocker]);
  //     } else if (lastEvent.passer || lastEvent.digger) {
  //       onModifyEvent(kEventModifierLastTouchError, null);
  //     }
  //     // onCreateEvents([lastEvent]);
  //     return;
  //   }
  //   var isIn = false;
  //   if (currentStage === kStageServe) {
  //     isIn = isInServingZone({
  //       x: e.nativeEvent.offsetX,
  //       y: e.nativeEvent.offsetY,
  //     });
  //   } else {
  //     isIn = isInRallyZone({
  //       x: e.nativeEvent.offsetX,
  //       y: e.nativeEvent.offsetY,
  //     });
  //   }
  //   if (!isIn) return;

  //   setIsDrawing(true);
  //   setStartPoint({
  //     x: e.nativeEvent.offsetX,
  //     y: e.nativeEvent.offsetY,
  //   });
  //   setEndPoint({
  //     x: e.nativeEvent.offsetX,
  //     y: e.nativeEvent.offsetY,
  //   });
  //   setMidPoint({
  //     x: 0,
  //     y: 0,
  //   });
  // }

  // function mousemove(e) {
  //   if (!isDrawing) return;
  //   // if (
  //   //   endPoint.x !== e.nativeEvent.offsetX ||
  //   //   endPoint.y !== e.nativeEvent.offsetY
  //   // ) {
  //   //   pause();
  //   // } else {
  //   //   startTimer();
  //   // }
  //   // console.log("mousemove");
  //   const pt = {
  //     x: e.nativeEvent.offsetX,
  //     y: e.nativeEvent.offsetY,
  //   };
  //   setEndPoint(pt);
  //   startTimer();
  // }

  function mousemove(e) {
    domousemove({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  }

  function domousemove(pt) {
    if (!isDrawing) return;
    // console.log("mousemove");
    setEndPoint(pt);
    startTimer();
  }

  function mouseup(e) {
    domouseup({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  }

  function domouseup(pt) {
    if (!isDrawing) return;
    // console.log("mouseup");
    setIsDrawing(false);
    if (startPoint.x === endPoint.x && startPoint.y === endPoint.y) {
      setStartPoint({ x: 0, y: 0 });
      setEndPoint({ x: 0, y: 0 });
      return;
    }
    if (
      currentStage === kStageServe &&
      isInServingZone(pt) &&
      isInServingZone(startPoint)
    ) {
      setStartPoint({ x: 0, y: 0 });
      setEndPoint({ x: 0, y: 0 });
      return;
    }
    var mp = midPoint;
    if (midPoint.x === endPoint.x && midPoint.y === endPoint.y) {
      mp = { x: 0, y: 0 };
      setMidPoint(mp);
    }
    doEvent(mp);
  }

  // function mouseup(e) {
  //   if (!isDrawing) return;
  //   // console.log("mouseup");
  //   setIsDrawing(false);
  //   if (startPoint.x === endPoint.x && startPoint.y === endPoint.y) {
  //     setStartPoint({ x: 0, y: 0 });
  //     setEndPoint({ x: 0, y: 0 });
  //     return;
  //   }
  //   var mp = midPoint;
  //   if (midPoint.x === endPoint.x && midPoint.y === endPoint.y) {
  //     mp = { x: 0, y: 0 };
  //     setMidPoint(mp);
  //   }
  //   doEvent(mp);
  // }

  // function touchstart(e) {
  //   // const isIn = isInServingZone({
  //   //   x: e.nativeEvent.offsetX,
  //   //   y: e.nativeEvent.offsetY,
  //   // });
  //   // if (!isIn) return;

  //   setIsDrawing(true);
  //   setStartPoint({
  //     x: e.touches[0].pageX - canvasRef.current.offsetLeft,
  //     y: e.touches[0].pageY - canvasRef.current.offsetTop,
  //   });
  //   setEndPoint({
  //     x: e.touches[0].pageX - canvasRef.current.offsetLeft,
  //     y: e.touches[0].pageY - canvasRef.current.offsetTop,
  //   });
  //   setMidPoint({
  //     x: 0,
  //     y: 0,
  //   });
  // }

  function touchstart(e) {
    domousedown({
      x: e.touches[0].pageX - canvasRef.current.offsetLeft,
      y: e.touches[0].pageY - canvasRef.current.offsetTop,
    });
    // // const isIn = isInServingZone({
    // //   x: e.nativeEvent.offsetX,
    // //   y: e.nativeEvent.offsetY,
    // // });
    // // if (!isIn) return;

    // setIsDrawing(true);
    // setStartPoint({
    //   x: e.touches[0].pageX - canvasRef.current.offsetLeft,
    //   y: e.touches[0].pageY - canvasRef.current.offsetTop,
    // });
    // setEndPoint({
    //   x: e.touches[0].pageX - canvasRef.current.offsetLeft,
    //   y: e.touches[0].pageY - canvasRef.current.offsetTop,
    // });
    // setMidPoint({
    //   x: 0,
    //   y: 0,
    // });
  }

  function touchmove(e) {
    domousemove({
      x: e.touches[0].pageX - canvasRef.current.offsetLeft,
      y: e.touches[0].pageY - canvasRef.current.offsetTop,
    });
    // if (!isDrawing) return;
    // startTimer();
    // setEndPoint({
    //   x: e.touches[0].pageX - canvasRef.current.offsetLeft,
    //   y: e.touches[0].pageY - canvasRef.current.offsetTop,
    // });
  }
  function touchend(e) {
    domouseup({
      x: e.changedTouches[0].pageX - canvasRef.current.offsetLeft,
      y: e.changedTouches[0].pageY - canvasRef.current.offsetTop,
    });

    // if (!isDrawing) return;
    // setIsDrawing(false);
    // var mp = midPoint;
    // if (midPoint.x === endPoint.x && midPoint.y === endPoint.y) {
    //   mp = { x: 0, y: 0 };
    //   setMidPoint(mp);
    // }
    // doEvent(mp);
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

  const doSelectSubPlayer = (pl) => {
    if (!pl) return;
    selectedPlayer.subPlayer = pl;
    selectedPlayer.selected = false;
    setSelectedPlayer(null);
    pl.subPlayerNumber = selectedPlayer.playerNumber;
    document.getElementById("modal-sub").checked = false;
  };

  const doSub = () => {
    if (!subTeam) {
      return;
    }
    var pls = [];
    for (var pl of subTeam.players) {
      var ok = true;
      for (var li of subTeam.currentLineup) {
        if (pl.shirtNumber === li.playerNumber) {
          ok = false;
          break;
        }
      }
      if (ok) {
        pls.push(pl);
      }
    }
    setSubPlayers(pls);
    document.getElementById("modal-sub").checked = true;
  };

  const doDoSub = () => {
    document.getElementById("modal-sub").checked = false;
  };

  const doToolbarLayout = () => {
    return (
      <div
        className={
          isVertical
            ? courtSize?.toolbarAtTop
              ? "flex gap-0.5 justify-center"
              : "flex-col gap-1 content-center"
            : courtSize?.toolbarAtTop
            ? "flex gap-1 justify-center"
            : "flex-col gap-1 content-center"
        }
      >
        {courtSize?.width > 350 ? (
          <>
            <button
              className="btn bg-purple-500 py-1 btn-sm h-[40px] w-[50px] text-xs text-white rounded-sm"
              onClick={() => doSub()}
            >
              SUB
            </button>
            <button
              className="btn bg-cyan-500 py-1 btn-sm h-[40px] w-[50px] text-xs text-white rounded-sm"
              onClick={() => doRotate(topTeam)}
            >
              ROTATE TEAM A
            </button>
          </>
        ) : (
          <></>
        )}
        <button
          className="btn bg-red-700 py-1 btn-sm h-[40px] w-[54px] text-xs text-white rounded-sm"
          onClick={() => doSetError()}
        >
          SET ERROR
        </button>
        <button
          className="btn bg-red-700 py-1 btn-sm h-[40px] w-[54px] text-xs text-white rounded-sm"
          onClick={() => doDigError()}
        >
          DIG ERROR
        </button>
        <button
          className="btn bg-green-700 py-1 btn-sm h-[40px] w-[54px] text-xs text-white rounded-sm"
          onClick={() => doSpikeKill()}
        >
          SPIKE KILL
        </button>
        <button
          className="btn bg-red-700 py-1 btn-sm h-[40px] w-[54px] text-xs text-white rounded-sm"
          onClick={() => doSpikeError()}
        >
          SPIKE ERROR
        </button>
        {courtSize?.width > 350 ? (
          <button
            className="btn bg-cyan-500 py-1 btn-sm h-[40px] w-[54px] text-xs text-white rounded-sm"
            onClick={() => doRotate(bottomTeam)}
          >
            ROTATE TEAM B
          </button>
        ) : (
          // <button
          //   className="btn bg-purple-500 py-1 btn-sm h-[40px] w-[40px] text-xs text-white rounded-sm"
          //   onClick={() => doSub()}
          // >
          //   ...
          // </button>
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn bg-purple-500 py-1 btn-sm h-[40px] w-[40px] text-xs text-white rounded-sm"
            >
              ... ⬇️
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-1 w-40 p-2 shadow-sm"
            >
              <li>
                <a onClick={() => doSub()}>SUBSTITUTION</a>
              </li>
              <li>
                <a onClick={() => doRotate(topTeam)}>ROTATE TEAM A</a>
              </li>
              <li>
                <a onClick={() => doRotate(bottomTeam)}>ROTATE TEAM B</a>
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (isVertical) {
    return (
      <>
        <div className={courtSize?.toolbarAtTop ? "flex-col" : "flex"}>
          {doToolbarLayout()}
          <canvas
            ref={canvasRef}
            id="canvas"
            onMouseDown={mousedown}
            onMouseMove={mousemove}
            onMouseUp={mouseup}
            onTouchStart={touchstart}
            onTouchMove={touchmove}
            onTouchEnd={touchend}
            // width={courtSize?.width}
            // height={courtSize?.height}
          />
          {/* <div className={courtSize?.toolbarAtTop ? "flex gap-1 content-center bg-green-300" : "flex gap-1 content-center bg-red-300"}>
            <button
              className="btn bg-purple-500 py-1 btn-sm h-[40px] w-[60px] text-xs text-white rounded-sm"
              onClick={() => doSub()}
            >
              SUB
            </button>
            <button
              className="btn bg-cyan-500 py-1 btn-sm h-[40px] w-[60px] text-xs text-white rounded-sm"
              onClick={() => doRotate(topTeam)}
            >
              ROTATE TEAM A
            </button>
            <button
              className="btn bg-red-700 py-1 btn-sm h-[40px] w-[60px] text-xs text-white rounded-sm"
              onClick={() => doSetError()}
            >
              SET ERROR
            </button>
            <button
              className="btn bg-red-700 py-1 btn-sm h-[40px] w-[60px] text-xs text-white rounded-sm"
              onClick={() => doDigError()}
            >
              DIG ERROR
            </button>
            <button
              className="btn bg-green-700 py-1 btn-sm h-[40px] w-[60px] text-xs text-white rounded-sm"
              onClick={() => doSpikeKill()}
            >
              SPIKE ERROR
            </button>
            <button
              className="btn bg-red-700 py-1 btn-sm h-[40px] w-[60px] text-xs text-white rounded-sm"
              onClick={() => doSpikeError()}
            >
              SPIKE ERROR
            </button>
            <button
              className="btn bg-cyan-500 py-1 btn-sm h-[40px] w-[60px] text-xs text-white rounded-sm"
              onClick={() => doRotate(bottomTeam)}
            >
              ROTATE TEAM B
            </button>
          </div> */}
        </div>

        <input type="checkbox" id="modal-sub" className="modal-toggle" />
        <div className="modal">
          <div className="modal-box sm:w-6/12 w-full max-w-5xl h-[50vh]">
            <div className="flex justify-between mb-4">
              <h3 className="mb-4 font-bold">
                Substitution for {selectedPlayer?.playerNumber}.{" "}
                {selectedPlayer?.playerFirstName}{" "}
                {selectedPlayer?.playerLastName}
              </h3>
              <div className="modal-action -mt-1">
                <label htmlFor="modal-sub">
                  <XMarkIcon className="w-6 h-6 cursor-pointer" />
                </label>
              </div>
            </div>
            <div className="flex flex-col">
              <div>
                <ul className="overflow-y-auto h-[40vh]">
                  {subPlayers &&
                    subPlayers.map((pl, index) => {
                      return (
                        <li
                          key={index}
                          className="flex justify-between items-center border-b border-gray-200 py-2 px-4 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            doSelectSubPlayer(pl);
                          }}
                        >
                          <span className="text-sm font-medium">
                            {pl.shirtNumber} - {pl.FirstName} {pl.LastName}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              </div>
              <div className="flex justify-end">
                <div className="modal-action">
                  <label htmlFor="modal-sub" className="btn btn-sm btn-info">
                    Close
                  </label>
                </div>
                <div className="modal-action">
                  <label
                    htmlFor="modal-sub"
                    className="btn btn-sm btn-info ml-4"
                    onClick={() => doDoSub()}
                  >
                    Save
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <div className={courtSize?.toolbarAtTop ? "flex-col" : "flex"}>
        {doToolbarLayout()}
        {/* <div className="flex gap-1 h-[40px] justify-center ">
          <button
            className="btn bg-red-700 py-1 btn-sm h-[40px] w-[60px] text-xs text-white rounded-sm"
            onClick={() => doSetError()}
          >
            SET ERROR
          </button>
          <button
            className="btn bg-red-700 py-1 btn-sm h-[40px] w-[60px] text-xs text-white rounded-sm"
            onClick={() => doDigError()}
          >
            DIG ERROR
          </button>
          <button
            className="btn bg-green-700 py-1 btn-sm h-[40px] w-[60px] text-xs text-white rounded-sm"
            onClick={() => doSpikeKill()}
          >
            SPIKE ERROR
          </button>
          <button
            className="btn bg-red-700 py-1 btn-sm h-[40px] w-[60px] text-xs text-white rounded-sm"
            onClick={() => doSpikeError()}
          >
            SPIKE ERROR
          </button>
        </div> */}
        <canvas
          ref={canvasRef}
          id="canvas"
          onMouseDown={mousedown}
          onMouseMove={mousemove}
          onMouseUp={mouseup}
          onTouchStart={touchstart}
          onTouchMove={touchmove}
          onTouchEnd={touchend}
          // width={courtSize?.width}
          // height={courtSize?.height}
        />
      </div>
    );
  }
}

export default CodingCourt2;
