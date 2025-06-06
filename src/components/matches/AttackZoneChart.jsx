import { useEffect, useRef } from "react";
import { colourForEfficiency, writeText } from "../utils/Utils";

function AttackZoneChart({ matches, team, events, row, onEventsSelected }) {
  const canvasRef = useRef(null);
  const ref = useRef(null);
  const zoneorders = [4, 3, 2, 7, 8, 9, 5, 6, 1];

  const draw = (ctx) => {
    var xmargin = 20;
    var topmargin = 60;
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.82;
    // console.log('canvas width, height', canvas.width, canvas.height)
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight * 0.78}px`;
    var w = 280;
    var w3 = w / 3;
    var h = 280;
    var h3 = h / 3;

    var fontsize = 10;
    var zzw = w3 - 4;
    var zw1 = (zzw * 3) / 4;
    var zw2 = zzw - zw1;

    ctx.fillStyle = "#3498db";
    ctx.fillRect(0, 0, w + xmargin * 2, canvas.height);

    var y = topmargin;
    ctx.fillStyle = "#f39c12";
    ctx.fillRect(xmargin, y, w, h);
    ctx.fillStyle = "#e67e22";
    ctx.fillRect(xmargin, y, w, h3);

    var grandtotal = 0;
    for (var z = 0; z < 9; z++) {
      var a = events[row - 1][z];
      grandtotal += a.length;
    }

    x = xmargin;
    y = topmargin;

    // writeText(
    //   { ctx: ctx, text: "ROW " + row, x: x, y: 30 },
    //   { textAlign: "left", fontSize: fontsize * 2 }
    // );

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

    var x = xmargin;
    var y = topmargin;
    for (var z = 0; z < 9; z++) {
      var a = events[row - 1][zoneorders[z] - 1];
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
          tx = x;
          writeText(
            {
              ctx: ctx,
              text: pl.shirtNumber + ". " + pl.NickName.toUpperCase(),
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

    // ctx.strokeStyle = '#ffffff';
    // ctx.lineWidth = 2
    // ctx.strokeRect(xmargin, topmargin, w, h)
    // var x = xmargin
    // var y = topmargin
    // y += h3
    // ctx.beginPath()
    // ctx.moveTo(x - 10, y)
    // ctx.lineTo(x + w + 10, y)
    // ctx.strokeStyle = '#ffffff';
    // ctx.lineWidth = 3
    // ctx.stroke()

    // y += h3
    // ctx.moveTo(x, y)
    // ctx.lineTo(x + w, y)
    // ctx.lineWidth = 0.5
    // ctx.strokeStyle = '#bdc3c7';
    // ctx.stroke()
    // y = topmargin
    // x += w3
    // ctx.moveTo(x, y)
    // ctx.lineTo(x, y + h)
    // ctx.lineWidth = 0.5
    // ctx.strokeStyle = '#bdc3c7';
    // ctx.stroke()
    // x += w3
    // ctx.moveTo(x, y)
    // ctx.lineTo(x, y + h)
    // ctx.lineWidth = 0.5
    // ctx.strokeStyle = '#bdc3c7';
    // ctx.stroke()

    // //net
    // ctx.beginPath()
    // ctx.moveTo(xmargin/2, topmargin)
    // ctx.lineTo(w + xmargin * 1.5, topmargin)
    // ctx.lineWidth = 3
    // ctx.strokeStyle = '#000000';
    // ctx.stroke()
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

  const onMouseDown = (e) => {
    var x = e.nativeEvent.offsetX;
    var y = e.nativeEvent.offsetY;
    const line = Math.floor((y - 60) / 90);
    const col = Math.floor((x - 20) / 90);
    const evs = events[row - 1][zoneorders[line * 3 + col] - 1];
    onEventsSelected(evs, zoneorders[line * 3 + col]);
  };

  return (
    <div ref={ref} className="cursor-pointer">
      <canvas id="canvas" ref={canvasRef} onMouseDown={onMouseDown}/>
    </div>
  );
}

export default AttackZoneChart;
