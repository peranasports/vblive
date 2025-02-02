import { useEffect, useRef } from "react";
import { writeText, colourForEfficiency } from "../utils/Utils";
import { max } from "lodash";

function SummaryStatsChart({ match, teamAstats, teamBstats, width, phrases }) {
  const canvasRef = useRef(null);
  const ref = useRef(null);
  const colour1 = "#3498db";
  const colour2 = "#e74c3c";

  const tr = (text) => {
    if (phrases) {
      const t = phrases.filter((p) => p.english.toLowerCase() === text.toLowerCase());
      if (t.length > 0) {
        return t[0].translation.length > 0 ? t[0].translation : text;
      }
    }
    return text;
  };

  const draw = (ctx) => {
    var xmargin = 10;
    var topmargin = 40;
    const canvas = canvasRef.current;
    var w = width;
    var ww = w - xmargin * 2;
    var w3 = w / 3;
    var h = 560;
    var h3 = h / 3;

    var fontsize = 10;
    var zzw = w3 - 4;
    var zw1 = (zzw * 3) / 4;
    var zw2 = zzw - zw1;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, canvas.height);

    var gap = 0;
    var hh = 200;
    ctx.strokeStyle = "lightgray";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(xmargin + ww / 4, topmargin + gap);
    ctx.lineTo(xmargin + ww / 4, topmargin + hh);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(xmargin + ww / 4 + (ww * 0.75) / 2, topmargin + gap);
    ctx.lineTo(xmargin + ww / 4 + (ww * 0.75) / 2, topmargin + hh);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(xmargin + ww, topmargin + gap);
    ctx.lineTo(xmargin + ww, topmargin + hh);
    ctx.stroke();

    if (teamAstats && teamBstats) {
      drawComparisonBar(
        ctx,
        xmargin,
        topmargin + 10,
        ww,
        tr("Aces"),
        teamAstats?.Serve3,
        teamBstats?.Serve3
      );
      drawComparisonBar(
        ctx,
        xmargin,
        topmargin + 50,
        ww,
        tr("Attacks"),
        teamAstats?.Spike3,
        teamBstats?.Spike3
      );
      drawComparisonBar(
        ctx,
        xmargin,
        topmargin + 90,
        ww,
        tr("Blocks"),
        teamAstats?.BlckSolo,
        teamBstats?.BlckSolo
      );
      drawComparisonBar(
        ctx,
        xmargin,
        topmargin + 130,
        ww,
        tr("Opp. Errors"),
        teamAstats.TotalPoints -
          (teamAstats?.Serve3 + teamAstats?.Spike3 + teamAstats?.BlckSolo),
        teamBstats.TotalPoints -
          (teamBstats?.Serve3 + teamBstats?.Spike3 + teamBstats?.BlckSolo)
      );
      drawComparisonBar(
        ctx,
        xmargin,
        topmargin + 170,
        ww,
        tr("Total"),
        teamAstats.TotalPoints,
        teamBstats.TotalPoints
      );

      const yso = 210;
      drawSideoutBar(
        ctx,
        xmargin,
        yso,
        ww / 2,
        tr("% Points SO"),
        parseInt(teamAstats?.SideOutPercent[0]),
        parseInt(teamAstats?.pointPercent)
      );
      drawSideoutBar(
        ctx,
        xmargin + ww / 2,
        yso,
        ww / 2,
        tr("% Points BP"),
        parseInt(teamBstats?.SideOutPercent[0]),
        parseInt(teamBstats?.pointPercent)
      );

      const xmargin2 = 45;
      var yb = 380;
      const wb = (w - xmargin2 * 2) / 6;
      drawStatsBars(ctx, xmargin2, yb, wb, colour1, teamAstats, 0);
      drawStatsBars(ctx, xmargin2 + 5 * wb, yb, wb, colour2, teamBstats, 1);

      drawDerrotaBars(
        ctx,
        xmargin2 + wb,
        yb,
        wb * 4,
        colour1,
        colour2,
        teamAstats,
        teamBstats
      );

      yb = yb + 160;
      drawSetStats(ctx, xmargin, yb, w - xmargin * 2, teamAstats, teamBstats);
    }
  };

  const drawSetStatsForTeam = (ctx, x, y, width, team, maxpoints) => {
    var colours = ["#3498db", "#e74c3c", "#f39c12", "#2ecc71"];
    var h = 100;
    var yb = y + h;
    var dh = h / maxpoints;
    var gap = 4;
    var dw = (width - gap * 6) / 5;
    var x1 = x + gap;
    var fontsize = 12;

    for (var i = 0; i < match.sets.length; i++) {
      yb = y + h;
      const stats =
        team === 0
          ? match.sets[i].teamAStatsItems[0]
          : match.sets[i].teamBStatsItems[0];
      const aces = stats.Serve3 * dh;
      yb -= aces;
      ctx.fillStyle = colours[3];
      ctx.fillRect(x1, yb, dw, aces);
      const attacks = stats.Spike3 * dh;
      yb -= attacks;
      ctx.fillStyle = colours[2];
      ctx.fillRect(x1, yb, dw, attacks);
      const blocks = stats.BlckSolo * dh;
      yb -= blocks;
      ctx.fillStyle = colours[1];
      ctx.fillRect(x1, yb, dw, blocks);
      const setscore =
        team === 0 ? match.sets[i].HomeScore : match.sets[i].AwayScore;
      const opperrs =
        (setscore - stats.Serve3 - stats.Spike3 - stats.BlckSolo) * dh;
      yb -= opperrs;
      ctx.fillStyle = colours[0];
      ctx.fillRect(x1, yb, dw, opperrs);

      writeText(
        {
          ctx: ctx,
          text: team === 0 ? match.sets[i].HomeScore : match.sets[i].AwayScore,
          x: x1 + dw / 2,
          y: yb - 12,
        },
        { textAlign: "center", fontSize: fontsize, fontFamily: "Trebuchet MS" }
      );

      writeText(
        { ctx: ctx, text: i + 1, x: x1 + dw / 2, y: y + h + 4 },
        { textAlign: "center", fontSize: fontsize, fontFamily: "Trebuchet MS" }
      );

      x1 += dw + gap;
    }
  };

  const drawSetStats = (ctx, x, y, width, stats1, stats2) => {
    var h = 100;
    var dw = width / 7;
    var ws = dw * 2.5;
    var wm = dw * 2;
    var hh = h / 4;
    var fontsize = 12;

    var labels = [tr("OPP. ERRORS"), tr("BLOCKS"), tr("ATTACKS"), tr("ACES")];
    var colours = ["#3498db", "#e74c3c", "#f39c12", "#2ecc71"];

    var x1 = x + ws;
    var yt = y;
    for (var i = 0; i < labels.length; i++) {
      ctx.fillStyle = colours[i];
      ctx.fillRect(x1, yt, wm, hh);
      writeText(
        { ctx: ctx, text: labels[i].toUpperCase(), x: x1 + wm / 2, y: yt + 8 },
        { textAlign: "center", fontSize: fontsize, fontFamily: "Trebuchet MS" }
      );
      yt += hh;
    }
    writeText(
      { ctx: ctx, text: tr("SETS").toUpperCase(), x: x1 + wm / 2, y: y + h + 6 },
      { textAlign: "center", fontSize: 12, fontFamily: "Trebuchet MS" }
    );

    var maxpoints = 0;
    for (var mset of match.sets) {
      maxpoints = Math.max(maxpoints, mset.HomeScore, mset.AwayScore);
    }
    const sx = ((5 - match.sets.length) * dw) / 4;
    drawSetStatsForTeam(ctx, x + sx, y, ws, 0, maxpoints);
    drawSetStatsForTeam(ctx, x + ws + wm + sx, y, ws, 1, maxpoints);
  };

  const drawDerrotaBars = (
    ctx,
    x,
    y,
    width,
    colour1,
    colour2,
    stats1,
    stats2
  ) => {
    var h = 96;
    var dh = h / 3;
    var xmargin = 10;
    var x1 = x + xmargin;
    var w = (width - xmargin * 2) / 6;
    var wm = w * 4;
    var fontsize = 16;
    var yt = y + 8;

    ctx.fillStyle = colour1;
    ctx.fillRect(x1 + w / 2, y, w, h);

    ctx.fillStyle = colour2;
    ctx.fillRect(x1 + w * 5 - w / 2, y, w, h);

    writeText(
      { ctx: ctx, text: tr("SERVE").toUpperCase(), x: x1 + (w * 6) / 2, y: yt },
      { textAlign: "center", fontSize: fontsize, fontFamily: "Trebuchet MS" }
    );
    writeText(
      { ctx: ctx, text: "?", x: x1 + w, y: yt },
      { textAlign: "center", fontSize: fontsize, fontFamily: "Trebuchet MS" }
    );
    writeText(
      { ctx: ctx, text: "?", x: x1 + w * 5, y: yt },
      { textAlign: "center", fontSize: fontsize, fontFamily: "Trebuchet MS" }
    );
    yt = yt + dh;
    writeText(
      { ctx: ctx, text: tr("BLOCK").toUpperCase(), x: x1 + (w * 6) / 2, y: yt },
      { textAlign: "center", fontSize: fontsize, fontFamily: "Trebuchet MS" }
    );
    writeText(
      { ctx: ctx, text: "?", x: x1 + w, y: yt },
      { textAlign: "center", fontSize: fontsize, fontFamily: "Trebuchet MS" }
    );
    writeText(
      { ctx: ctx, text: "?", x: x1 + w * 5, y: yt },
      { textAlign: "center", fontSize: fontsize, fontFamily: "Trebuchet MS" }
    );
    yt = yt + dh;
    writeText(
      { ctx: ctx, text: tr("TRANSITION").toUpperCase(), x: x1 + (w * 6) / 2, y: yt },
      { textAlign: "center", fontSize: fontsize, fontFamily: "Trebuchet MS" }
    );
    writeText(
      { ctx: ctx, text: "?", x: x1 + w, y: yt },
      { textAlign: "center", fontSize: fontsize, fontFamily: "Trebuchet MS" }
    );
    writeText(
      { ctx: ctx, text: "?", x: x1 + w * 5, y: yt },
      { textAlign: "center", fontSize: fontsize, fontFamily: "Trebuchet MS" }
    );
    yt = yt + dh;
    writeText(
      { ctx: ctx, text: tr("DEFEAT").toUpperCase(), x: x1 + (w * 6) / 2, y: yt },
      { textAlign: "center", fontSize: 12, fontFamily: "Trebuchet MS" }
    );
  };

  const drawStatsBar = (ctx, x, y, width, text, colour, value, orientation) => {
    var h = 30;
    var fontsize = 10;
    var w1 = width / 3;
    var w2 = width - w1;
    const yt = y + 2;
    if (orientation === 0) {
      writeText(
        { ctx: ctx, text: text.toUpperCase(), x: x + w1 - 2, y: yt },
        { textAlign: "right", fontSize: fontsize, fontFamily: "Trebuchet MS" }
      );

      const w3 = (value / 100) * w2;
      ctx.fillStyle = colour;
      ctx.fillRect(x + w1, y, w3, h / 2);
      writeText(
        { ctx: ctx, text: value + "%", x: x + w1 + w3 + 2, y: yt },
        { textAlign: "left", fontSize: fontsize, fontFamily: "Trebuchet MS" }
      );
    } else {
      writeText(
        { ctx: ctx, text: text.toUpperCase(), x: x + w1 * 3 + 2, y: yt },
        { textAlign: "left", fontSize: fontsize, fontFamily: "Trebuchet MS" }
      );

      const w3 = (value / 100) * w2;
      ctx.fillStyle = colour;
      ctx.fillRect(x + w1 + w2 - w3, y, w3, h / 2);
      writeText(
        { ctx: ctx, text: value + "%", x: x + w1 + w2 - w3 - 2, y: yt },
        { textAlign: "right", fontSize: fontsize, fontFamily: "Trebuchet MS" }
      );
    }
  };

  const drawStatsBars = (ctx, x, y, width, colour, stats, orientation) => {
    drawStatsBar(
      ctx,
      x,
      y,
      width,
      tr("%S+"),
      colour,
      parseInt((stats?.Serve4 / stats?.ServeTotal) * 100),
      orientation
    );
    drawStatsBar(
      ctx,
      x,
      y + 20,
      width,
      tr("%R#"),
      colour,
      parseInt((stats?.PassPerfect / stats?.PassTotal) * 100),
      orientation
    );
    drawStatsBar(
      ctx,
      x,
      y + 40,
      width,
      tr( "%Eff_R"),
      colour,
      parseInt(
        ((stats?.PassPerfect + stats?.PassPositive) / stats?.PassTotal) * 100
      ),
      orientation
    );
    drawStatsBar(
      ctx,
      x,
      y + 60,
      width,
      tr("%A#"),
      colour,
      parseInt((stats?.Spike3 / stats?.SpikeTotal) * 100),
      orientation
    );
    drawStatsBar(
      ctx,
      x,
      y + 80,
      width,
      tr("%Eff_A"),
      colour,
      parseInt(stats?.SpikeEfficiency * 100),
      orientation
    );
  };

  const drawSideoutBar = (ctx, x, y, width, text, value1, value2) => {
    var h = 120;
    var fontsize = 12;
    const yt = y + h;
    const yb = y + h - 4;

    writeText(
      { ctx: ctx, text: text.toUpperCase(), x: x + width / 2, y: yt + 10 },
      { textAlign: "center", fontSize: fontsize, fontFamily: "Trebuchet MS" }
    );

    ctx.strokeStyle = "lightgray";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x + 10, yb);
    ctx.lineTo(x + width - 10, yb);
    ctx.stroke();

    const xgap = 10;
    const w = width / 5;
    const x1 = x + width / 2 - xgap / 2 - w;
    const x2 = x + width / 2 + xgap / 2;
    const h1 = ((value1 / 100) * h) / 2;
    const h2 = ((value2 / 100) * h) / 2;
    ctx.fillStyle = colour1;
    ctx.fillRect(x1, yb - h1, w, h1);
    writeText(
      { ctx: ctx, text: value1 + "%", x: x1 + w / 2, y: yb - h1 - 12 },
      { textAlign: "center", fontSize: fontsize, fontFamily: "Trebuchet MS" }
    );
    ctx.fillStyle = colour2;
    ctx.fillRect(x2, yb - h2, w, h2);
    writeText(
      { ctx: ctx, text: value2 + "%", x: x2 + w / 2, y: yb - h2 - 12 },
      { textAlign: "center", fontSize: fontsize, fontFamily: "Trebuchet MS" }
    );
  };

  const drawComparisonBar = (ctx, x, y, width, text, value1, value2) => {
    var h = 40;
    var fontsize = 12;

    const x1 = width / 4;
    const x2 = width - x1;
    const yt = y + 6;

    writeText(
      { ctx: ctx, text: text.toUpperCase(), x: x + x1 - 5, y: yt },
      { textAlign: "right", fontSize: fontsize, fontFamily: "Trebuchet MS" }
    );

    const w1 = (value1 / (value1 + value2)) * x2;
    const w2 = x2 - w1;
    ctx.fillStyle = colour1;
    ctx.fillRect(x + x1, y, w1, h / 2);
    writeText(
      { ctx: ctx, text: value1, x: x + x1 + w1 / 2, y: yt },
      { textAlign: "center", fontSize: fontsize, fontFamily: "Trebuchet MS" }
    );
    ctx.fillStyle = colour2;
    ctx.fillRect(x + x1 + w1, y, w2, h / 2);
    writeText(
      { ctx: ctx, text: value2, x: x + x1 + w1 + w2 / 2, y: yt },
      { textAlign: "center", fontSize: fontsize, fontFamily: "Trebuchet MS" }
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const ratio = window.devicePixelRatio;
    const height = 800;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.getContext("2d").scale(ratio, ratio);
    draw(context);
  }, [draw]);

  return (
    <div ref={ref} className="cursor-pointer">
      <canvas id="canvas" ref={canvasRef} />
    </div>
  );
}

export default SummaryStatsChart;
