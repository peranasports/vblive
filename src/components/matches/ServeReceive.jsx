import { useEffect, useRef } from "react";
import { writeText, stringToPoint, colourForEfficiency } from "../utils/Utils";
import { zoneFromString } from "../utils/Utils";

function ServeReceive({ matches, team, stats, showPasses, showAttacks }) {
  const canvasRef = useRef(null);
  const ref = useRef(null);

  const getAttackComboOfEvent = (code) => {
    if (code == undefined) {
      return null;
    }
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

  const calculateZoneStats = (xevs) => {
    var events = [
      [[], [], [], [], [], [], [], [], []],
      [[], [], [], [], [], [], [], [], []],
      [[], [], [], [], [], [], [], [], []],
      [[], [], [], [], [], [], [], [], []],
      [[], [], [], [], [], [], [], [], []],
      [[], [], [], [], [], [], [], [], []],
      [[], [], [], [], [], [], [], [], []],
    ];

    var evs = xevs;

    if (evs.length === 0) {
      return events;
    }

    for (var ne = 0; ne < evs.length; ne++) {
      var e = evs[ne];
      var nacs =
        e.Drill.match.attackCombos === undefined
          ? 0
          : e.Drill.match.attackCombos.length;
      var ac = getAttackComboOfEvent(e.attackCombo);
      if ((nacs > 0 && ac != null && ac.targetHitter !== "-") || nacs == 0) {
        var row = e.Row - 1;
        var startZone = 0;
        if (nacs > 0) {
          if (ac.isBackcourt) {
            if (ac.targetHitter === "B") {
              startZone = 9;
            } else if (ac.targetHitter === "F") {
              startZone = 7;
            } else {
              startZone = 8;
            }
          } else {
            if (ac.targetHitter === "B") {
              startZone = 2;
            } else if (ac.targetHitter === "F") {
              startZone = 4;
            } else {
              startZone = 3;
            }
          }
        } else {
          startZone = zoneFromString(e.BallStartString);
        }
        if (startZone > 0 && e.Row !== undefined && isNaN(e.Row) === false) {
          try {
            events[e.Row - 1][startZone - 1].push(e);
          } catch (error) {
            console.log(e);
          }
        } else {
          // DLog(@"%@ %@", e.attackCombo, e.Player.LastName);
        }
      } else {
        // DLog(@"%@ %@", e.attackCombo, e.Player.LastName);
      }
    }
    for (var n = 0; n < 6; n++) {
      for (var m = 0; m < 9; m++) {
        for (var k = 0; k < events[n][m].length; k++) {
          events[6][m].push(events[n][m][k]);
        }
      }
    }
    return events;
  };

  const draw = (ctx) => {
    var xmargin = 20;
    var topmargin = 40;
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.82;
    // console.log('canvas width, height', canvas.width, canvas.height)
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight * 0.78}px`;
    var w = 270;
    var w3 = w / 3;
    var h = 270;
    var h3 = h / 3;

    var xscale = w / 100.0;
    var yscale = h / 100.0;

    var fontsize = 10;
    var zzw = w3 - 4;
    var zw1 = (zzw * 3) / 4;
    var zw2 = zzw - zw1;

    ctx.fillStyle = "#3498db";
    ctx.fillRect(0, 0, w + xmargin * 2, h + topmargin * 2);

    var y = topmargin;
    ctx.fillStyle = "#f39c12";
    ctx.fillRect(xmargin, y, w, h);
    ctx.fillStyle = "#e67e22";
    ctx.fillRect(xmargin, y, w, h3);

    x = xmargin;
    y = topmargin;

    var events = calculateZoneStats(stats.spikeEvents);

    writeText(
      {
        ctx: ctx,
        text: stats.Player.NickName.toUpperCase() + " RECEIVES",
        x: x,
        y: 10,
      },
      { textAlign: "left", fontSize: fontsize * 1.5 }
    );

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(xmargin, topmargin, w, h);
    var x = xmargin;
    var y = topmargin;
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
    y = topmargin;
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
    ctx.moveTo(xmargin / 2, topmargin);
    ctx.lineTo(w + xmargin * 1.5, topmargin);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    var rallies = stats.rallies;

    if (showAttacks) {
      var zoneorders = [4, 3, 2, 7, 8, 9, 5, 6, 1];
      var grandtotal = 0;
      for (var z = 0; z < 9; z++) {
        var a = events[6][z];
        grandtotal += a.length;
      }

      var x = xmargin;
      var y = topmargin;
      for (var z = 0; z < 9; z++) {
        var a = events[6][zoneorders[z] - 1];
        var total = a.length;
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
            } else {
              if (e.UserDefined01.length > 0 && e.DVGrade === "#") {
                bps++;
              } else if (
                e.UserDefined01.length > 0 &&
                (e.DVGrade === "=" || e.DVGrade === "/")
              ) {
                bes++;
              }
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
          var pck = (bps * 100) / total;
          var eff = ((bps - bes) * 100) / total;

          // if (bps != 0)
          {
            var color = colourForEfficiency(eff);
            ctx.fillStyle = color;
            ctx.fillRect(x + 1, y + 1, w3 - 2, h3 - 2);
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
              " " +
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
            tx = x;
            writeText(
              {
                ctx: ctx,
                text: pl.NickName.toUpperCase(),
                x: tx + 2,
                y: ty,
                width: w3 - tw,
              },
              { textAlign: "left", fontSize: fontsize, fontFamily: "Inter var" }
            );
            writeText(
              {
                ctx: ctx,
                text: count.toString(),
                x: tx + w3 - 4,
                y: ty,
                width: w3 - 4,
              },
              { textAlign: "right", fontSize: fontsize }
            );
            ty += th;
          }
        }

        x += w3;
        if (x >= w - 1) {
          x = xmargin;
          y += h3;
        }
      }
    }

    if (showPasses) {
      var x = xmargin;
      var y = topmargin;

      for (var ne = 0; ne < rallies.length; ne++) {
        var mr = rallies[ne];
        var e = mr.passEvent;
        if (
          e.BallStartString === undefined ||
          e.BallStartString === "" ||
          e.BallStartString === "0,0"
        ) {
          continue;
        }
        var pt = stringToPoint(e.BallStartString);
        if (pt.y < 0) {
          continue;
        }
        // if (pt.y < 50)
        {
          pt.y = 100 - pt.y;
          pt.x = 100 - pt.x;
        }
        // console.log(e.BallStartString, pt);

        var epx = x + pt.x * xscale;
        var epy = y + pt.y * yscale;

        ctx.fillStyle = "#7f8c8d";
        if (e.DVGrade === "=") {
          ctx.fillStyle = "#ff0000";
        } else if (e.DVGrade === "/") {
          ctx.fillStyle = "#9b59b6";
        } else if (e.DVGrade === "-") {
          ctx.fillStyle = "#9b59b6";
        } else if (e.DVGrade === "!") {
          ctx.fillStyle = "#16a085";
        } else if (e.DVGrade === "+") {
          ctx.fillStyle = "#16a085";
        } else if (e.DVGrade === "#") {
          ctx.fillStyle = "#00ff00";
        } else {
          ctx.fillStyle = "#7f8c8d";
        }

        // ctx.fillRect(epx -3, epy-3, 6, 6)
        var rad = 3;
        ctx.beginPath();
        ctx.arc(epx - rad, epy - rad, rad * 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        if (mr.sideout === true) {
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "#000000";
        } else if (mr.sideoutFirstBall === true) {
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "#ff00ff";
        } else {
          ctx.lineWidth = 1;
          ctx.strokeStyle = "#ffffff";
        }
        ctx.beginPath();
        ctx.arc(epx - rad, epy - rad, rad * 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.style.width = "50%";
    canvas.style.height = "50%";
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    draw(context);
  }, [draw]);

  return (
    <div ref={ref}>
      <canvas id="canvas" ref={canvasRef} />
    </div>
  );
}

export default ServeReceive;
