import { PercentColours } from "../utils/PercentColours";
import { getEventDescription } from "../utils/PSVBFile";
import {
  kSkillBlock,
  kSkillPass,
  kSkillDefense,
  kSubstitution,
  kSkillCommentary,
  kSkillCoachTag,
  kOppositionScore,
  kOppositionHitKill,
  kOppositionServeAce,
  kSkillTimeout,
  kSkillTechTimeout,
  kSkillSettersCall,
  kOppositionServeError,
  kOppositionError,
  kOppositionHitError,
  createStatsItem,
  addStatsItem,
  calculateAllStats,
} from "../utils/StatsItem";

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
  ctx.font = "condensed " + fontSize + "px " + fontFamily;
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
    var lts = [0, 0, 3, 3, 3, 3];
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
  const s = `${d.getFullYear()}${pad(d.getMonth() + 1, 2)}${pad(d.getDate(), 2)}${pad(d.getHours(), 2)}${pad(d.getMinutes(), 2)}${pad(d.getSeconds(), 2)}`;
  return s;
}

export function functionTabSecondary(selected, rn, name, func) {
  return (
    <>
      <div
        className={
          selected ? "px-2 py-1 bg-secondary text-secondary-content cursor-pointer" : "px-2 py-1 bg-transparent text-base-content cursor-pointer"
        }
        onClick={() => func(rn)}
      >
        {name}
      </div>
    </>
  );
};

export function functionTabPrimary(selected, rn, name, func) {
  return (
    <>
      <div
        className={
          selected ? "px-2 py-1 bg-primary text-secondary-content cursor-pointer" : "px-2 py-1 bg-transparent text-base-content cursor-pointer"
        }
        onClick={() => func(rn)}
      >
        {name}
      </div>
    </>
  );
};

export function convertSecondsToMMSS(secs) {
  const minutes = Math.floor(secs / 60);
  const seconds = secs - minutes * 60;
  return pad(minutes, 2) + ":" + pad(seconds, 2);
}
