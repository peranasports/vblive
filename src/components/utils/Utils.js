import { PercentColours } from "../utils/PercentColours";
import { getEventDescription } from "../utils/PSVBFile";
import {
  kSkillBlock,
  kSkillCoachTag,
  kSkillDefense,
  kSkillPass
} from "./Constants";

import {
  addStatsItem,
  calculateAllStats,
  createStatsItem,
  kOppositionError,
  kOppositionHitError,
  kOppositionHitKill,
  kOppositionScore,
  kOppositionServeAce,
  kOppositionServeError,
  kSkillCommentary,
  kSkillTechTimeout,
  kSkillTimeout,
  kSubstitution
} from "../utils/StatsItem";
import { DVEventString } from "./DVWFile";

export function zipBuffer(inputstr) {
  // const input = new Uint8Array(inputstr);
  const pako = require("pako");
  const output = btoa(pako.deflate(inputstr, { to: "string" }));
  return output;
}

export function unzipBuffer(inputstr) {
  if (inputstr === undefined || inputstr.length === 0) {
    return null;
  }
  // console.log('unzipBuffer buffer length', inputstr.length)
  const pako = require("pako");
  var b64Data = inputstr;
  try {
    var strData = window.atob(b64Data);
  } catch (error) {
    return inputstr;
  }
  var len = strData.length;
  var bytes = new Uint8Array(len);
  var j = 0;
  for (var i = 4; i < len; i++) {
    bytes[j] = strData.charCodeAt(i);
    j++;
  }
  var binData = new Uint8Array(bytes);
  try {
    var buffer = pako.inflate(binData, { to: "string" });
  } catch (error) {
    // console.log('inflate', error)
    return null;
  }
  return buffer;
}

export function generateUUID() {
  // Public Domain/MIT
  var d = new Date().getTime(); //Timestamp
  var d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0; //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}

export function stringToPoint(s) {
  var a = s.split(",");
  if (a.length == 2) {
    var x = parseFloat(a[0]);
    var y = parseFloat(a[1]);
    return { x: x, y: y };
  }
  return null;
}

export function inside(point, vs) {
  // ray-casting algorithm based on
  // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

  var x = point[0],
    y = point[1];

  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i][0],
      yi = vs[i][1];
    var xj = vs[j][0],
      yj = vs[j][1];

    var intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

// multiple formats (e.g. yyyy/mm/dd (ymd) or mm-dd-yyyy (mdy) etc.)
export function tryParseDateFromString(
  dateStringCandidateValue,
  format = "ymd"
) {
  const candidate = (dateStringCandidateValue || ``)
    .split(/[ :\-\/]/g)
    .map(Number)
    .filter((v) => !isNaN(v));
  const toDate = () => {
    format = [...format].reduce((acc, val, i) => ({ ...acc, [val]: i }), {});
    const parts = [
      candidate[format.y],
      candidate[format.m] - 1,
      candidate[format.d],
    ].concat(candidate.length > 3 ? candidate.slice(3) : []);
    const checkDate = (d) =>
      (d.getDate &&
        ![d.getFullYear(), d.getMonth(), d.getDate()].find(
          (v, i) => v !== parts[i]
        ) &&
        d) ||
      undefined;

    return checkDate(new Date(Date.UTC(...parts)));
  };

  return candidate.length < 3 ? undefined : toDate();
}

export function writeText(info, style = {}) {
  const { ctx, text, x, y, width } = info;
  const {
    fontSize = 20,
    fontFamily = "Arial",
    color = "black",
    textAlign = "left",
    textBaseline = "top",
  } = style;

  ctx.beginPath();
  // ctx.font = "condensed " + fontSize + "px " + fontFamily;
  ctx.font = fontSize + "px " + fontFamily;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.stroke();
}

export function writeTextCentre(info, style = {}) {
  const { ctx, text, x, y, width } = info;
  const { fontFamily = "segoe", color = "black", textBaseline = "top" } = style;

  var textWidth = ctx.measureText(text).width;
  var xx = x + width / 2 - textWidth / 2;

  ctx.beginPath();
  ctx.font = info.fontsize + "px " + fontFamily;
  ctx.textAlign = "centre";
  ctx.textBaseline = textBaseline;
  ctx.fillStyle = color;
  ctx.fillText(text, xx, y);
  ctx.stroke();
}

export function zoneFromString(s) {
  var bottommidpts = [
    { x: 83.33, y: 183.33 },
    { x: 83.33, y: 116.67 },
    { x: 50, y: 116.67 },
    { x: 16.67, y: 116.67 },
    { x: 16.67, y: 183.33 },
    { x: 50, y: 183.33 },
    { x: 16.17, y: 150 },
    { x: 50, y: 150 },
    { x: 83.33, y: 150 },
  ];

  var topmidpts = [
    { x: 16.67, y: 16.67 },
    { x: 16.67, y: 83.33 },
    { x: 50, y: 83.33 },
    { x: 83.33, y: 83.33 },
    { x: 83.33, y: 16.67 },
    { x: 50, y: 16.67 },
    { x: 16.67, y: 50 },
    { x: 50, y: 50 },
    { x: 83.33, y: 50 },
  ];

  var pt = stringToPoint(s);
  if (pt === null) {
    return 0;
  }
  for (var n = 0; n < 9; n++) {
    var xpt = bottommidpts[n];
    var r = makeRectPolygon(xpt.x - 16.66, xpt.y - 16.66, 33.33, 33.33);
    if (inside([pt.x, pt.y], r)) {
      return n + 1;
    }
  }
  for (var n = 0; n < 9; n++) {
    var xpt = topmidpts[n];
    var r = makeRectPolygon(xpt.x - 16.66, xpt.y - 16.66, 33.33, 33.33);
    if (inside([pt.x, pt.y], r)) {
      return n + 1;
    }
  }
  return 0;
}

export function makeRectPolygon(x, y, w, h) {
  var polygon = [];
  var pt = [];
  pt.push(x);
  pt.push(y);
  polygon.push(pt);
  pt = [];
  pt.push(x + w);
  pt.push(y);
  polygon.push(pt);
  pt = [];
  pt.push(x + w);
  pt.push(y + h);
  polygon.push(pt);
  pt = [];
  pt.push(x);
  pt.push(y + h);
  polygon.push(pt);
  return polygon;
}

export function colourForEfficiency(eff) {
  var x = Math.round(eff / 4) + 100;
  var xx = LightenDarkenColor(PercentColours[x], 60);
  return "#" + xx;
}

export function LightenDarkenColor(col, amt) {
  col = parseInt(col.substring(1, 7), 16);
  return (
    ((col & 0x0000ff) + amt) |
    ((((col >> 8) & 0x00ff) + amt) << 8) |
    (((col >> 16) + amt) << 16)
  ).toString(16);
}

export function replaceItemInArray(a, oldItem, newItem) {
  var idx = a.indexOf(oldItem);
  if (idx === -1) {
    return a;
  } else {
    var newa = [];
    for (var n = 0; n < a.length; n++) {
      if (n === idx) {
        newa.push(newItem);
      } else {
        newa.push(a[n]);
      }
    }
    return newa;
  }
}

export function getTimingForEvent(ev) {
  try {
    var lts = [3, 3, 3, 3, 3, 3];
    var ds = [8, 8, 8, 8, 8, 8];
    const obj = localStorage.getItem("vblive_timings");
    if (obj !== null) {
      const vobj = JSON.parse(obj);
      lts = vobj.leadTimes.split(",");
      ds = vobj.durations.split(",");
    }
  } catch {
    return { leadTime: 0, duration: 8 };
  }
  if (ev.EventType === 1) {
    return { leadTime: lts[0], duration: ds[0] };
  } else if (ev.EventType === 2) {
    return { leadTime: lts[1], duration: ds[1] };
  } else if (ev.EventType === 3 || ev.EventType === 20) {
    return { leadTime: lts[2], duration: ds[2] };
  } else if (ev.EventType === 4) {
    return { leadTime: lts[3], duration: ds[3] };
  } else if (ev.EventType === 5) {
    return { leadTime: lts[4], duration: ds[4] };
  } else {
    return { leadTime: lts[5], duration: ds[5] };
  }
}

export function saveToPC(fileData, fname) {
  const blob = new Blob([fileData], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = fname;
  link.href = url;
  link.click();
}

export function makeFilename(filename, suffix, ext) {
  var fn = "";
  const tokens = filename.split(".");
  for (var nn = 0; nn < tokens.length - 1; nn++) {
    if (fn.length > 0) fn += ".";
    fn += tokens[nn];
  }
  const xx = ext === "" ? tokens[tokens.length - 1] : ext;
  if (filename.includes(suffix)) {
    return fn + "." + xx;
  } else {
    return (fn += "_" + suffix + "." + xx);
  }
}

export function getEventInfo(e) {
  var subcolor = "text-warning";
  var sub = "";
  var pl = e.Player;
  var firstname = pl && pl.FirstName ? pl.FirstName : "";
  var lastname = pl && pl.LastName ? pl.LastName.toUpperCase() : "";
  var plname = firstname + " " + lastname;

  if (e.EventGrade === 0) {
    subcolor = "text-error";
  } else if (e.EventGrade === 2 && e.EventType === kSkillBlock) {
    subcolor = "text-success";
  } else if (e.EventGrade === 3) {
    if (e.EventType !== kSkillPass && e.EventType !== kSkillDefense) {
      subcolor = "text-success";
    }
  }

  if (pl !== null) {
    plname = pl.shirtNumber + ". " + firstname + " " + lastname;
    if (e.EventType === kSubstitution) {
      subcolor = "text-info";
      sub += " Substitution";
      // Player *sp = [XAppDelegate fetchPlayerByGuid:e.UserDefined01];
    } else {
      sub += getEventDescription(e);
    }
  } else {
    plname = "";
    if (e.EventType == kOppositionError) {
      subcolor = "text-success";
      sub += " - Opposition Error";
    } else if (e.EventType == kOppositionServeError) {
      subcolor = "text-success";
      sub += " - Opposition Serve Error";
    } else if (e.EventType == kOppositionHitError) {
      subcolor = "text-success";
      sub += " - Opposition Hit Error";
    } else if (e.EventType == kOppositionScore) {
      subcolor = "text-error";
      sub += " - Opposition Score";
    } else if (e.EventType == kOppositionHitKill) {
      subcolor = "text-error";
      sub += " - Opposition Kill";
    } else if (e.EventType == kOppositionServeAce) {
      subcolor = "text-error";
      sub += " - Opposition Ace";
    } else if (e.EventType == kSkillCommentary) {
      subcolor = "text-info";
      sub += " - Commentary";
    } else if (e.EventType == kSkillTimeout) {
      subcolor = "text-info";
      sub += " Timeout #" + e.SubEvent;
      // Team *tm = [XAppDelegate fetchTeamByGuid:e.UserDefined01];
      // NSString *tname = tm == null ? @"" : tm.Name;
      // [sub appendFormat:@" %@ %@ #%@", tname, " - Timeout"], e.SubEvent];
    } else if (e.EventType == kSkillTechTimeout) {
      subcolor = "text-info";
      sub += " Tech Timeout #" + e.SubEvent;
    } else if (e.EventType == kSkillCoachTag) {
      subcolor = "text-info";
      sub += "Coach Tag";
    } else {
      plname = "Opposition";
      sub = getEventDescription(e);
    }
  }
  return { subcolor: subcolor, sub: sub };
}

export function getEventStringColor(e) {
  var s = "";
  if (e.EventType === 20 || e.EventType === 250) {
    s += " text-base-content";
  }
  if (e.EventGrade === 0) {
    s += " text-error";
  } else if (e.EventGrade === 3) {
    if (e.EventType === 1 || e.EventType === 4 || e.EventType === 5) {
      s += " text-success";
    } else {
      s += " text-info";
    }
  } else if (
    e.EventGrade === 3 &&
    e.EventGrade.EventType !== 2 &&
    e.EventGrade.EventType !== 3 &&
    e.EventGrade.EventType !== 20
  ) {
    s += " text-success";
  } else if (e.EventGrade === 2 && e.EventGrade.EventType === 5) {
    s += " text-success";
  } else {
    s += " text-warning";
  }
  return s;
}

export function getEventResult(e) {
  var res = 0;
  if (e.DVGrade && e.DVGrade === "=") {
    res = -1;
  } else if (e.DVGrade && e.DVGrade === "#") {
    if (e.EventType === 1 || e.EventType === 4 || e.EventType === 5) {
      res = 1;
    } else {
    }
  } else if (
    e.DVGrade && e.DVGrade === "#" &&
    e.EventGrade.EventType !== 2 &&
    e.EventGrade.EventType !== 3 &&
    e.EventGrade.EventType !== 20
  ) {
    res = 1;
  } else {
  }
  return res;
}

export function getMultiMatchesStatsItems(matches, team, selectedTeam) {
  var st = {
    teamAStatsItems: {},
    teamBStatsItems: {},
  };
  for (var m of matches) {
    for (var s of m.sets) {
      const hometeamsi = s.teamAStatsItems;
      // m.teamA.Name === team ? s.teamAStatsItems : s.teamBStatsItems;
      const awayteamsi = s.teamBStatsItems;
      // m.teamA.Name === team ? s.teamBStatstems : s.teamAStatsItems;
      for (var si of hometeamsi) {
        const plkey = si.player
          ? si.player.FirstName + "_" + si.player.LastName
          : si.Name;
        let plobj = st.teamAStatsItems[plkey];
        if (plobj === undefined) {
          plobj = createStatsItem(si.player, s);
          st.teamAStatsItems[plkey] = plobj;
        }
        addStatsItem(si, plobj);
        calculateAllStats(plobj);
      }
      for (var si of awayteamsi) {
        const plkey = si.player
          ? si.player.FirstName + "_" + si.player.LastName
          : si.Name;
        let plobj = st.teamBStatsItems[plkey];
        if (plobj === undefined) {
          plobj = createStatsItem(si.player, s);
          st.teamBStatsItems[plkey] = plobj;
        }
        addStatsItem(si, plobj);
        calculateAllStats(plobj);
      }
    }
  }
  var sis = [];
  if (selectedTeam === 0) {
    for (var key in st.teamAStatsItems) {
      sis.push(st.teamAStatsItems[key]);
    }
  } else {
    for (var key in st.teamBStatsItems) {
      sis.push(st.teamBStatsItems[key]);
    }
  }
  return sis;
}

export function dayTimeCode() {
  var d = new Date();
  const s = `${d.getFullYear()}${pad(d.getMonth() + 1, 2)}${pad(
    d.getDate(),
    2
  )}${pad(d.getHours(), 2)}${pad(d.getMinutes(), 2)}${pad(d.getSeconds(), 2)}`;
  return s;
}

export function functionTabSecondary(selected, rn, name, func) {
  return (
    <>
      <div
        className={
          selected
            ? "px-2 py-1 bg-secondary text-secondary-content cursor-pointer"
            : "px-2 py-1 bg-transparent text-base-content cursor-pointer"
        }
        onClick={() => func(rn)}
      >
        {name}
      </div>
    </>
  );
}

export function functionTabPrimary(selected, rn, name, func) {
  return (
    <>
      <div
        className={
          selected
            ? "px-2 py-1 bg-primary text-secondary-content cursor-pointer"
            : "px-2 py-1 bg-transparent text-base-content cursor-pointer"
        }
        onClick={() => func(rn)}
      >
        {name}
      </div>
    </>
  );
}

export function convertSecondsToMMSS(secs) {
  const minutes = Math.floor(secs / 60);
  const seconds = secs - minutes * 60;
  return pad(minutes, 2) + ":" + pad(seconds, 2);
}

export function escapeHtml(str) {
  var map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return str.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}

export function decodeHtml(str) {
  var map = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#039;": "'",
  };
  return str.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function (m) {
    return map[m];
  });
}

export function makePlaylist(events) {
  var evs = [];
  for (var ev of events) {
    var loc = 0;
    const tm = getTimingForEvent(ev);
    if (
      ev.Drill.match.videoStartTimeSeconds &&
      ev.Drill.match.videoOffset &&
      ev.Drill.match.videoOffset >= 0
    ) {
      const secondsSinceEpoch = Math.round(ev.TimeStamp.getTime() / 1000);
      loc =
        secondsSinceEpoch -
        ev.Drill.match.videoStartTimeSeconds +
        ev.Drill.match.videoOffset -
        tm.leadTime;
    } else {
      if (ev.VideoPosition !== undefined && ev.VideoPosition !== 0) {
        loc = ev.VideoPosition - tm.leadTime;
      }
    }

    var xx = "";
    var col = "";
    if (ev.DVGrade === undefined) {
      const ss = getEventInfo(ev);
      xx = ss.sub;
      col = ss.subcolor;
    } else {
      xx = DVEventString(ev);
      col = getEventStringColor(ev);
    }
    const evx = {
      playerName:
        ev.Player.shirtNumber + ". " + ev.Player.NickName.toUpperCase(),
      eventString: xx,
      eventStringColor: col,
      eventSubstring:
        "[S" +
        ev.Drill.GameNumber +
        "] " +
        ev.TeamScore +
        "-" +
        ev.OppositionScore +
        " R" +
        ev.Row,
      videoOnlineUrl: ev.Drill.match.videoOnlineUrl,
      videoPosition: loc,
      eventId: ev.EventId,
      matchVideo: ev.Drill.match.videoOnlineUrl
        ? ev.Drill.match.videoOnlineUrl
        : "",
    };
    evs.push(evx);
  }
  return evs;
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function drawArrowHead(ctx, bs, be, ahl, ahar, col, scolor) {
  ctx.lineWidth = 1.0;
  ctx.strokeStyle = scolor;
  ctx.fillStyle = col;

  var arrowOrigin = {};
  var arrowTip = {};
  var arrowHeadBase = {};
  var arrowHeadWing1 = {};
  var arrowHeadWing2 = {};
  var arrowHeadBase2 = {};
  var arrowHeadWing21 = {};
  var arrowHeadWing22 = {};
  var deltaX = 0.0;
  var deltaY = 0.0;

  var deltaXBase = 0.0;
  var deltaYBase = 0.0;

  var headToShaftRatio = 0.0;
  var deltaXWing = 0.0;
  var deltaYWing = 0.0;

  var mArrowLength;

  // The arrow origin will be at the center of the view
  arrowOrigin.x = bs.x;
  arrowOrigin.y = bs.y;

  // Create the path that will contain the arrow drawing instructions
  // and begin drawing.
  ctx.beginPath();
  //	CGPathMoveToPoint(arrowPath, NULL, arrowOrigin.x, arrowOrigin.y);

  // Calculate the arrow tip location from the polar coordinates
  deltaX = be.x - bs.x;
  deltaY = be.y - bs.y;
  arrowTip.x = be.x;
  arrowTip.y = be.y;

  mArrowLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  //	mArrowAngle = deltaY === 0 ? 0 : atan(-deltaX / deltaY);
  //	mArrowAngle = (mArrowAngle * 180) / PI;

  var mArrowHeadLength = ahl;
  var mArrowHeadAspectRatio = ahar;

  // Define the arrow shaft
  //	CGPathAddLineToPoint(arrowPath, NULL, arrowTip.x, arrowTip.y);

  headToShaftRatio = mArrowHeadLength / mArrowLength;
  deltaXBase = headToShaftRatio * deltaX;
  deltaYBase = headToShaftRatio * deltaY;
  // Calculate the location of the base of the arrow head
  arrowHeadBase.x = arrowTip.x - deltaXBase;
  arrowHeadBase.y = arrowTip.y - deltaYBase;

  arrowHeadBase2.x = arrowTip.x - deltaXBase / 2;
  arrowHeadBase2.y = arrowTip.y - deltaYBase / 2;

  // Calculate the wing tips of the arrow head
  deltaXWing = mArrowHeadAspectRatio * deltaXBase;
  deltaYWing = mArrowHeadAspectRatio * deltaYBase;
  arrowHeadWing1.x = arrowHeadBase.x - deltaYWing;
  arrowHeadWing1.y = arrowHeadBase.y + deltaXWing;
  arrowHeadWing2.x = arrowHeadBase.x + deltaYWing;
  arrowHeadWing2.y = arrowHeadBase.y - deltaXWing;

  arrowHeadWing21.x = arrowHeadBase2.x - deltaYWing / 2;
  arrowHeadWing21.y = arrowHeadBase2.y + deltaXWing / 2;
  arrowHeadWing22.x = arrowHeadBase2.x + deltaYWing / 2;
  arrowHeadWing22.y = arrowHeadBase2.y - deltaXWing / 2;

  // Define the arrow head wings
  ctx.moveTo(arrowTip.x, arrowTip.y);
  ctx.lineTo(arrowHeadWing1.x, arrowHeadWing1.y);
  ctx.lineTo(arrowHeadWing2.x, arrowHeadWing2.y);
  ctx.lineTo(arrowTip.x, arrowTip.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

export function getArrowHeadPoints(bs, be, ahl, ahar) {
  var arrowOrigin = {};
  var arrowTip = {};
  var arrowHeadBase = {};
  var arrowHeadWing1 = {};
  var arrowHeadWing2 = {};
  var arrowHeadBase2 = {};
  var arrowHeadWing21 = {};
  var arrowHeadWing22 = {};
  var deltaX = 0.0;
  var deltaY = 0.0;

  var deltaXBase = 0.0;
  var deltaYBase = 0.0;

  var headToShaftRatio = 0.0;
  var deltaXWing = 0.0;
  var deltaYWing = 0.0;

  var mArrowLength;

  // The arrow origin will be at the center of the view
  arrowOrigin.x = bs.x;
  arrowOrigin.y = bs.y;

  // Calculate the arrow tip location from the polar coordinates
  deltaX = be.x - bs.x;
  deltaY = be.y - bs.y;
  arrowTip.x = be.x;
  arrowTip.y = be.y;

  mArrowLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  var mArrowHeadLength = ahl;
  var mArrowHeadAspectRatio = ahar;

  headToShaftRatio = mArrowHeadLength / mArrowLength;
  deltaXBase = headToShaftRatio * deltaX;
  deltaYBase = headToShaftRatio * deltaY;
  // Calculate the location of the base of the arrow head
  arrowHeadBase.x = arrowTip.x - deltaXBase;
  arrowHeadBase.y = arrowTip.y - deltaYBase;

  arrowHeadBase2.x = arrowTip.x - deltaXBase / 2;
  arrowHeadBase2.y = arrowTip.y - deltaYBase / 2;

  // Calculate the wing tips of the arrow head
  deltaXWing = mArrowHeadAspectRatio * deltaXBase;
  deltaYWing = mArrowHeadAspectRatio * deltaYBase;
  arrowHeadWing1.x = arrowHeadBase.x - deltaYWing;
  arrowHeadWing1.y = arrowHeadBase.y + deltaXWing;
  arrowHeadWing2.x = arrowHeadBase.x + deltaYWing;
  arrowHeadWing2.y = arrowHeadBase.y - deltaXWing;

  arrowHeadWing21.x = arrowHeadBase2.x - deltaYWing / 2;
  arrowHeadWing21.y = arrowHeadBase2.y + deltaXWing / 2;
  arrowHeadWing22.x = arrowHeadBase2.x + deltaYWing / 2;
  arrowHeadWing22.y = arrowHeadBase2.y - deltaXWing / 2;

  const pts = [
    arrowTip,
    arrowHeadWing1,
    arrowHeadWing2,
    arrowTip,
  ];
  return pts;
}

export function playerInitialAndName(ev) {
  if (ev.player.FirstName === undefined) {
    return "";
  }
  const number = ev.player.ShirtNumber ? ev.player.ShirtNumber + ". " : "";
  const initial =
    ev.player.FirstName.length === 0
      ? ""
      : ev.player.FirstName.substring(0, 1) + ".";
  const playerLastName =
    ev.player.LastName !== null ? ev.player.LastName.toUpperCase() : "";
  return number + initial + " " + playerLastName;
}

export function realGameScores(e) {
  const gs = ["00", "15", "30", "40", "A"];
  const p1s = e.scores.player1GameScore < 4 ? gs[e.scores.player1GameScore] : e.scores.player1GameScore <= e.scores.player2GameScore ? "40" : "A";
  const p2s = e.scores.player2GameScore < 4 ? gs[e.scores.player2GameScore] : e.scores.player2GameScore <= e.scores.player1GameScore ? "40" : "A";
  return p1s + "-" + p2s;
}

export function eventString(e) {
  return eventString(e);
}

export function getOperatingSystem(window) {
  let operatingSystem = 'Not known';
  if (window.navigator.appVersion.indexOf('Win') !== -1) { operatingSystem = 'Windows OS'; }
  if (window.navigator.appVersion.indexOf('Mac') !== -1) { operatingSystem = 'MacOS'; }
  if (window.navigator.appVersion.indexOf('X11') !== -1) { operatingSystem = 'UNIX OS'; }
  if (window.navigator.appVersion.indexOf('Linux') !== -1) { operatingSystem = 'Linux OS'; }

  // return operatingSystem;
return window.navigator.appVersion;
}

export function getBrowser(window) {
  let currentBrowser = 'Not known';
  if (window.navigator.userAgent.indexOf('Chrome') !== -1) { currentBrowser = 'Google Chrome'; }
  else if (window.navigator.userAgent.indexOf('Firefox') !== -1) { currentBrowser = 'Mozilla Firefox'; }
  else if (window.navigator.userAgent.indexOf('MSIE') !== -1) { currentBrowser = 'Internet Exployer'; }
  else if (window.navigator.userAgent.indexOf('Edge') !== -1) { currentBrowser = 'Edge'; }
  else if (window.navigator.userAgent.indexOf('Safari') !== -1) { currentBrowser = 'Safari'; }
  else if (window.navigator.userAgent.indexOf('Opera') !== -1) { currentBrowser = 'Opera'; }
  else if (window.navigator.userAgent.indexOf('Opera') !== -1) { currentBrowser = 'YaBrowser'; }
  else { console.log('Others'); }

  return currentBrowser;
}

export function rotateTeam(team) {
  team.rotation = team.rotation === 6 ? 1 : team.rotation + 1;
  for (var i = 0; i < team.currentLineup.length; i++) {
    const pos = team.currentLineup[i].currentPosition;
    const newpos = pos === "1" ? "6" : (pos - 1).toString();
    team.currentLineup[i].currentPosition = newpos;
  }
};
