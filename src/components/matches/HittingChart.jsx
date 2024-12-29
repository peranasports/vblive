import { useEffect, useRef, useState } from "react";
import {
  writeText,
  colourForEfficiency,
  stringToPoint,
  zoneFromString,
} from "../utils/Utils";
import { orderBy } from "lodash";
import { CartesianAxis } from "recharts";

const zoneorders = [4, 3, 2, 7, 8, 9, 5, 6, 1];

function HittingChart({ matches, events, rows, drawMode, onEventsSelected }) {
  const canvasRef = useRef(null);
  const ref = useRef(null);
  const [allZoneEvents, setAllZoneEvents] = useState([]);
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);

  const getAttackCombo = (code) => {
    for (var match of matches) {
      var acs = match.attackCombos.filter((ac) => {
        return ac.code === code;
      });
      if (acs.length > 0) {
        return acs[0];
      }
    }
    return null;
  };

  const drawVBStatsBallPath = (ctx, e, xscale, yscale) => {
    var xgap = 40;
    var tgap = 60;

    var x = xgap;
    var y = tgap;
    var fontsize = 10;

    if (
      e.BallStartString === undefined ||
      e.BallEndString === undefined ||
      e.BallStartString === "" ||
      e.BallEndString === ""
    ) {
      return;
    }

    var ptMid = stringToPoint(e.BallMidString);
    var ptStart = stringToPoint(e.BallStartString);
    var ptEnd = stringToPoint(e.BallEndString);
    if (ptEnd.y > 100) {
      ptEnd.y = 200 - ptEnd.y;
      ptEnd.x = 100 - ptEnd.x;
      ptStart.y = 200 - ptStart.y;
      ptStart.x = 100 - ptStart.x;
      if (ptMid.x !== 0 && ptMid.y !== 0) {
        ptMid.y = 100; //200 - ptMid.y;
        ptMid.x = 100 - ptMid.x;
      }
    }

    var spx = x + ptStart.x * xscale;
    var spy = y + ptStart.y * yscale;
    var epx = x + ptEnd.x * xscale;
    var epy = y + ptEnd.y * yscale;
    var mpx = x + ptMid.x * xscale;
    var mpy = y + ptMid.y * yscale;

    ctx.save();
    ctx.strokeStyle = "white"; //"#7f8c8d";
    ctx.fillStyle = "white"; //"#7f8c8d";
    if (e.EventGrade === 0) {
      ctx.fillStyle = "#ff0000";
      ctx.strokeStyle = "#ff0000";
    } else if (e.EventGrade === 3) {
      ctx.fillStyle = "#00ff00";
      ctx.strokeStyle = "#00ff00";
    }

    ctx.lineWidth = 1; //0.5;
    ctx.beginPath();
    ctx.moveTo(spx, spy);
    if (ptMid.x !== 0 && ptMid.y !== 0) {
      ctx.lineTo(mpx, mpy);
      ctx.lineTo(epx, epy);
    } else {
      ctx.lineTo(epx, epy);
    }
    ctx.stroke();
    // ctx.fillStyle = '#000000'
    // ctx.fillRect(spx - 3, spy - 3, 6, 6)
    ctx.restore();
  };

  const drawBallPath = (ctx, acobject, xscale, yscale) => {
    // if (coneno == 0 || coneno > 8) {
    //     return;
    // }

    var xgap = 40;
    var tgap = 60;

    var x = xgap;
    var y = tgap;
    var fontsize = 10;

    var evs = acobject.events;
    var pc = evs.length > 0 ? (acobject.kills * 100) / evs.length : 0;

    for (var ne = 0; ne < evs.length; ne++) {
      var e = evs[ne];
      if (e.BallStartString === "" || e.BallEndString === "") {
        continue;
      }

      var ptStart = stringToPoint(e.BallStartString);
      var ptEnd = stringToPoint(e.BallEndString);
      // if (ptEnd.y > 50)
      // {
      //     ptEnd.y = 50 - ptEnd.y
      //     ptEnd.x = 100 - ptEnd.x
      //     ptStart.y = 50 - ptStart.y
      //     ptStart.x = 100 - ptStart.x
      // }

      var spx = x + ptStart.x * xscale;
      var spy = y + ptStart.y * yscale;
      var epx = x + ptEnd.x * xscale;
      var epy = y + ptEnd.y * yscale;

      const colors = ["red", "white", "white", "green"];
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors[e.EventGrade];
      ctx.moveTo(spx, spy);
      ctx.lineTo(epx, epy);
      ctx.stroke();
      ctx.fillStyle = colors[e.EventGrade];
      ctx.fillRect(spx - 3, spy - 3, 6, 6);
      ctx.closePath();
    }
  };

  const drawHittingCone = (ctx, acobject, xscale, yscale) => {
    // if (coneno == 0 || coneno > 8) {
    //     return;
    // }

    var xgap = 40;
    var tgap = 60;

    var x = xgap;
    var y = tgap;
    var fontsize = 10;

    var evs = acobject.events;
    var pc = evs.length > 0 ? (acobject.kills * 100) / evs.length : 0;

    for (var ne = 0; ne < evs.length; ne++) {
      var e = evs[ne];
      if (e.coneNumber === undefined) {
        continue;
      }
      var coneno = parseInt(e.coneNumber);
      if (coneno === 0 || coneno > 8) {
        continue;
      }
      var ac = getAttackCombo(e.attackCombo);
      if (ac != null) {
        //                drawAttackCombo(ctx, ac);
        var ptStart = ac.hittingPoint;
        if (ptStart.x === undefined && ptStart.y === undefined) {
          ptStart = stringToPoint(e.ballStart);
        }
        ptStart = { x: 100 - ptStart.x, y: 100 - ptStart.y };
        if (ac.targetHitter === "F") {
          var cones = [
            [
              { x: 98, y: 0 },
              { x: 100, y: 96 },
              { x: 88, y: 96 },
              { x: 98, y: 0 },
            ],
            [
              { x: 98, y: 0 },
              { x: 88, y: 96 },
              { x: 73, y: 92 },
              { x: 98, y: 0 },
            ],
            [
              { x: 98, y: 0 },
              { x: 72, y: 96 },
              { x: 57, y: 90 },
              { x: 98, y: 0 },
            ],
            [
              { x: 98, y: 0 },
              { x: 54, y: 96 },
              { x: 34, y: 84 },
              { x: 98, y: 0 },
            ],
            [
              { x: 98, y: 0 },
              { x: 28, y: 92 },
              { x: 0, y: 70 },
              { x: 98, y: 0 },
            ],
            [
              { x: 98, y: 0 },
              { x: 15, y: 59 },
              { x: 2, y: 39 },
              { x: 98, y: 0 },
            ],
            [
              { x: 98, y: 0 },
              { x: 9, y: 36 },
              { x: 2, y: 0 },
              { x: 98, y: 0 },
            ],
          ];
          var textPt = [
            { x: 94, y: 86 },
            { x: 81, y: 88 },
            { x: 67, y: 85 },
            { x: 49, y: 81 },
            { x: 20, y: 76 },
            { x: 17, y: 44 },
            { x: 15, y: 18 },
          ];

          var nn = coneno - 1;
          {
            ctx.beginPath();
            var sxx = 100 - ptStart.x;
            var syy = 100 - ptStart.y;
            var spx = x + sxx * xscale;
            var spy = y + syy * 2 * yscale;
            ctx.moveTo(spx, spy);
            for (var mm = 1; mm < 3; mm++) {
              var xx = 100 - cones[nn][mm].x;
              var yy = 100 - cones[nn][mm].y;
              var px = x + xx * xscale;
              var py = y + yy * yscale;
              ctx.lineTo(px, py);
            }
            ctx.lineTo(spx, spy);
            ctx.closePath();
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fill();
            ctx.lineWidth = 0.1;
            ctx.strokeStyle = "#555555";
            ctx.stroke();

            var xx = 100 - textPt[nn].x;
            var yy = 100 - textPt[nn].y;
            var px = x + xx * xscale;
            var py = y + yy * yscale;
            var dx = 20;
            writeText(
              {
                ctx: ctx,
                text: evs.length.toString(),
                x: px - dx,
                y: py - dx,
                width: dx * 2,
              },
              { textAlign: "centre", fontSize: fontsize }
            );
            writeText(
              {
                ctx: ctx,
                text: pc.toFixed(0) + "%",
                x: px - dx,
                y: py,
                width: dx * 2,
              },
              { textAlign: "centre", fontSize: fontsize }
            );
          }
        } else if (ac.targetHitter === "B") {
          var cones = [
            [
              { x: 2, y: 0 },
              { x: 0, y: 96 },
              { x: 12, y: 96 },
              { x: 2, y: 0 },
            ],
            [
              { x: 2, y: 0 },
              { x: 27, y: 92 },
              { x: 12, y: 96 },
              { x: 2, y: 0 },
            ],
            [
              { x: 2, y: 0 },
              { x: 43, y: 90 },
              { x: 28, y: 96 },
              { x: 2, y: 0 },
            ],
            [
              { x: 2, y: 0 },
              { x: 66, y: 84 },
              { x: 46, y: 96 },
              { x: 2, y: 0 },
            ],
            [
              { x: 2, y: 0 },
              { x: 100, y: 70 },
              { x: 72, y: 92 },
              { x: 2, y: 0 },
            ],
            [
              { x: 2, y: 0 },
              { x: 98, y: 39 },
              { x: 85, y: 59 },
              { x: 2, y: 0 },
            ],
            [
              { x: 2, y: 0 },
              { x: 98, y: 0 },
              { x: 91, y: 36 },
              { x: 2, y: 0 },
            ],
          ];
          var textPt = [
            { x: 4, y: 86 },
            { x: 19, y: 87 },
            { x: 33, y: 86 },
            { x: 52, y: 82 },
            { x: 80, y: 76 },
            { x: 83, y: 44 },
            { x: 87, y: 18 },
          ];

          var nn = coneno - 1;
          {
            ctx.beginPath();
            var sxx = 100 - ptStart.x;
            var syy = 100 - ptStart.y;
            var spx = x + sxx * xscale;
            var spy = y + syy * 2 * yscale;
            ctx.moveTo(spx, spy);
            for (var mm = 1; mm < 3; mm++) {
              var xx = 100 - cones[nn][mm].x;
              var yy = 100 - cones[nn][mm].y;
              var px = x + xx * xscale;
              var py = y + yy * yscale;
              ctx.lineTo(px, py);
            }
            ctx.lineTo(spx, spy);
            ctx.closePath();
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fill();
            ctx.lineWidth = 0.1;
            ctx.strokeStyle = "#555555";
            ctx.stroke();

            var xx = 100 - textPt[nn].x;
            var yy = 100 - textPt[nn].y;
            var px = x + xx * xscale;
            var py = y + yy * yscale;
            var dx = 20;
            writeText(
              {
                ctx: ctx,
                text: evs.length.toString(),
                x: px - dx,
                y: py - dx,
                width: dx * 2,
              },
              { textAlign: "centre", fontSize: fontsize }
            );
            writeText(
              {
                ctx: ctx,
                text: pc.toFixed(0) + "%",
                x: px - dx,
                y: py,
                width: dx * 2,
              },
              { textAlign: "centre", fontSize: fontsize }
            );
          }
        } else {
          var cones = [
            [
              { x: 50, y: 0 },
              { x: 100, y: 40 },
              { x: 66, y: 54 },
              { x: 50, y: 0 },
            ],
            [
              { x: 50, y: 0 },
              { x: 100, y: 80 },
              { x: 80, y: 90 },
              { x: 50, y: 0 },
            ],
            [
              { x: 50, y: 0 },
              { x: 80, y: 90 },
              { x: 60, y: 92 },
              { x: 50, y: 0 },
            ],
            [
              { x: 50, y: 0 },
              { x: 60, y: 92 },
              { x: 40, y: 92 },
              { x: 50, y: 0 },
            ],
            [
              { x: 50, y: 0 },
              { x: 40, y: 92 },
              { x: 20, y: 90 },
              { x: 50, y: 0 },
            ],
            [
              { x: 50, y: 0 },
              { x: 0, y: 90 },
              { x: 20, y: 92 },
              { x: 50, y: 0 },
            ],
            [
              { x: 50, y: 0 },
              { x: 33, y: 54 },
              { x: 0, y: 40 },
              { x: 50, y: 0 },
            ],
            [
              { x: 50, y: 0 },
              { x: 60, y: 54 },
              { x: 40, y: 54 },
              { x: 50, y: 0 },
            ],
          ];
          var textPt = [
            { x: 80, y: 40 },
            { x: 90, y: 78 },
            { x: 70, y: 83 },
            { x: 50, y: 84 },
            { x: 30, y: 83 },
            { x: 10, y: 78 },
            { x: 20, y: 40 },
            { x: 50, y: 46 },
          ];
          var nn = coneno - 1;
          {
            ctx.beginPath();
            var sxx = 100 - ptStart.x;
            var syy = 100 - ptStart.y;
            var spx = x + sxx * xscale;
            var spy = y + syy * 2 * yscale;
            ctx.moveTo(spx, spy);
            for (var mm = 1; mm < 3; mm++) {
              try {
                var xx = 100 - cones[nn][mm].x;
                var yy = 100 - cones[nn][mm].y;
                var px = x + xx * xscale;
                var py = y + yy * yscale;
                ctx.lineTo(px, py);
              } catch (error) {
                console.log(error);
              }
            }
            ctx.lineTo(spx, spy);
            ctx.closePath();
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fill();
            ctx.lineWidth = 0.1;
            ctx.strokeStyle = "#555555";
            ctx.stroke();

            var xx = 100 - textPt[nn].x;
            var yy = 100 - textPt[nn].y;
            var px = x + xx * xscale;
            var py = y + yy * yscale;
            var dx = 20;
            writeText(
              {
                ctx: ctx,
                text: evs.length.toString(),
                x: px - dx,
                y: py - dx,
                width: dx * 2,
              },
              { textAlign: "centre", fontSize: fontsize }
            );
            writeText(
              {
                ctx: ctx,
                text: pc.toFixed(0) + "%",
                x: px - dx,
                y: py,
                width: dx * 2,
              },
              { textAlign: "centre", fontSize: fontsize }
            );
          }
        }
      }
    }
  };

  const draw = (ctx) => {
    const canvas = canvasRef.current;
    var xh = window.innerHeight;
    var xw = window.innerWidth;
    canvas.width = xw;
    canvas.height = xh;
    // console.log('canvas width, height', canvas.width, canvas.height)
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight2}px`;

    var topmargin = 60;
    var bottommargin = 60;

    var height = xh - (topmargin + bottommargin);
    var h = height / 2;
    var h3 = h / 3;
    var w = h;
    var w3 = w / 3;
    setDx(w3);
    setDy(h3);

    var xscale = w / 100.0;
    var yscale = h / 100.0;

    var xmargin = 40; //(xw - w) / 2

    ctx.fillStyle = "#3498db";
    ctx.fillRect(0, 0, w + xmargin * 2, xh);

    var y = topmargin;
    ctx.fillStyle = "#f39c12";
    ctx.fillRect(xmargin, y, w, h);
    ctx.fillStyle = "#e67e22";
    ctx.fillRect(xmargin, y + h - h3, w, h3);

    var y = topmargin + h;
    ctx.fillStyle = "#f39c12";
    ctx.fillRect(xmargin, y, w, h);
    ctx.fillStyle = "#e67e22";
    ctx.fillRect(xmargin, y, w, h3);

    var fontsize = 10;
    var zzw = w3 - 4;
    var zw1 = (zzw * 3) / 4;
    var zw2 = zzw - zw1;

    // writeText(
    //   {
    //     ctx: ctx,
    //     text: "Click on a zone to view video clips of attacks in that zone",
    //     x: 10,
    //     y: 10,
    //     width: w,
    //   },
    //   { textAlign: "centre", fontSize: 12 }
    // );

    var grandtotal = 0;
    var allzoneevents = [];
    var acobjects = [];
    for (var z = 0; z < 9; z++) {
      var zoneevents = [];
      allzoneevents.push(zoneevents);
      for (var nr = 0; nr < rows.length; nr++) {
        var row = rows[nr];
        var a = events[row - 1][z];
        for (var ne = 0; ne < a.length; ne++) {
          zoneevents.push(a[ne]);
          if (a[ne].Drill.match.app !== "VBStats") {
            var acs =
              acobjects.length > 0
                ? acobjects.filter(
                    (obj) => obj.attackCombo.code === a[ne].attackCombo
                  )
                : null;
            if (acs === null || acs.length === 0) {
              var ac = getAttackCombo(a[ne].attackCombo);
              if (ac !== null) {
                acobjects.push({
                  attackCombo: ac,
                  events: [a[ne]],
                  kills: a[ne].DVGrade === "#" ? 1 : 0,
                });
              }
            } else {
              var acobject = acs[0];
              acobject.events.push(a[ne]);
              acobject.kills += a[ne].DVGrade === "#" ? 1 : 0;
            }
          }
        }
        grandtotal += a.length;
      }
    }

    x = xmargin;
    y = topmargin + h;

    // writeText({ctx: ctx, text: 'ROW ' + row, x: x, y: 30}, {textAlign: 'left', fontSize: fontsize * 2 });

    for (var z = 0; z < 9; z++) {
      var a = allzoneevents[zoneorders[z] - 1];
      var total = a.length;
      if (total === 0) {
        x += w3;
        if (x >= w + xmargin - 1) {
          x = xmargin;
          y += h3;
        }
        continue;
      }
      var plsobjs = [];
      if (total > 0) {
        var pc = (total * 100) / grandtotal;
        var tx = x;
        var ty = y + 4;
        var tw = 30;
        var th = 16;

        var pls = [];
        var bps = 0;
        var bes = 0;

        for (var ne = 0; ne < a.length; ne++) {
          var e = a[ne];
          if (e.Drill.match.app === "VBStats") {
            if (e.EventGrade === 3) {
              bps++;
            } else if (e.EventGrade === 0) {
              bes++;
            }
            if (
              pls.filter(
                (obj) =>
                  obj.FirstName + "_" + obj.LastName ===
                  e.Player.FirstName + "_" + e.Player.LastName
              ).length === 0
            ) {
              pls.push(e.Player);
            }
          } else {
            if (e.UserDefined01.length > 0 && e.DVGrade === "#") {
              bps++;
            } else if (
              e.UserDefined01.length > 0 &&
              (e.DVGrade === "=" || e.DVGrade === "/")
            ) {
              bes++;
            }
            if (
              pls.filter(
                (obj) =>
                  obj.FirstName + "_" + obj.LastName ===
                  e.Player.FirstName + "_" + e.Player.LastName
              ).length === 0
            ) {
              pls.push(e.Player);
            }
          }
        }
        var pck = (bps * 100) / total;
        var eff = ((bps - bes) * 100) / total;

        // if (bps != 0)
        {
          var color = colourForEfficiency(eff);
          ctx.fillStyle = color;
          ctx.fillRect(x, y, w3, h3);
        }

        writeText(
          { ctx: ctx, text: total.toString(), x: tx + 4, y: ty, width: w3 },
          { textAlign: "left", fontSize: fontsize }
        );
        writeText(
          {
            ctx: ctx,
            text: pc.toFixed(0) + "%",
            x: tx + w3 - 4,
            y: ty,
            width: w3 - 4,
          },
          { textAlign: "right", fontSize: fontsize }
        );
        ty += th;

        if (bps > 0) {
          var ss =
            bps.toString() +
            "K " +
            pck.toFixed(0) +
            "K% " +
            eff.toFixed(0) +
            "Eff";
          writeText(
            { ctx: ctx, text: ss, x: tx + w3 - 4, y: ty, width: w3 - 8 },
            { textAlign: "right", fontSize: fontsize }
          );
        } else {
          writeText(
            {
              ctx: ctx,
              text: bps.toString(),
              x: tx + w3 - 4,
              y: ty,
              width: tw,
            },
            { textAlign: "right", fontSize: fontsize }
          );
        }
        ty += th;

        for (var np = 0; np < pls.length; np++) {
          var pl = pls[np];
          var count = 0;
          for (var ne = 0; ne < a.length; ne++) {
            var e = a[ne];
            if (
              e.Player.FirstName + "_" + e.Player.LastName ===
              pl.FirstName + "_" + pl.LastName
            ) {
              count++;
            }
          }
          plsobjs.push({ player: pl, count: count });
        }
      }

      plsobjs = orderBy(plsobjs, "count", "desc");
      for (var npl = 0; npl < plsobjs.length; npl++) {
        var obj = plsobjs[npl];
        tx = x;
        writeText(
          {
            ctx: ctx,
            text: obj.player.NickName.toUpperCase(),
            x: tx + 2,
            y: ty,
            width: w3 - tw,
          },
          { textAlign: "left", fontSize: fontsize, fontFamily: "Inter var" }
        );
        writeText(
          {
            ctx: ctx,
            text: obj.count.toString(),
            x: tx + w3 - 4,
            y: ty,
            width: w3 - 4,
          },
          { textAlign: "right", fontSize: fontsize }
        );
        ty += th;
      }

      x += w3;
      if (x >= w + xmargin - 1) {
        x = xmargin;
        y += h3;
      }
    }

    var y = topmargin;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(xmargin, y, w, h);
    var x = xmargin;
    var y = topmargin + h;
    y -= h3;
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + w + 10, y);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();

    var y = topmargin + h;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(xmargin, y, w, h);

    var x = xmargin;
    var y = topmargin + h;
    y += h3;
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + w + 10, y);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();

    y += h3;
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#bdc3c7";
    ctx.stroke();
    y = topmargin + h;
    x += w3;
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + h);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#bdc3c7";
    ctx.stroke();
    x += w3;
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + h);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "#bdc3c7";
    ctx.stroke();

    //net
    ctx.beginPath();
    ctx.moveTo(xmargin / 2, topmargin + h);
    ctx.lineTo(w + xmargin * 1.5, topmargin + h);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    if (matches[0].app === "VBStats") {
      for (var r = 0; r < 6; r++) {
        if (rows.filter((obj) => obj === (r + 1).toString()).length === 0) {
          continue;
        }
        for (var z = 0; z < 9; z++) {
          var a = events[r][z];
          for (var ne = 0; ne < a.length; ne++) {
            var e = a[ne];
            drawVBStatsBallPath(ctx, e, xscale, yscale);
          }
        }
      }
    } else {
      for (var nac = 0; nac < acobjects.length; nac++) {
        if (drawMode === 0) {
          drawBallPath(ctx, acobjects[nac], xscale, yscale);
        } else if (drawMode === 1) {
          drawHittingCone(ctx, acobjects[nac], xscale, yscale);
        }
      }
    }
    setAllZoneEvents(allzoneevents);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.style.width = "50%";
    canvas.style.height = "50%";
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    draw(context);
  }, [events]);

  const onMouseDown = (e) => {
    const canvas = canvasRef.current;
    var x = e.nativeEvent.offsetX;
    var y = e.nativeEvent.offsetY - canvas.offsetHeight / 2;
    const line = Math.floor(y / dx);
    const col = Math.floor((x - 40) / dy);
    if (col >= 0 && col < 3 && line >= 0 && line < 2) {
      const zone = zoneorders[line * 3 + col] - 1;
      const evs = allZoneEvents[zone];
      onEventsSelected(evs);
    }
  };

  return (
    <div ref={ref}>
      <canvas id="canvas" ref={canvasRef} onMouseDown={onMouseDown} />
    </div>
  );
}

export default HittingChart;
