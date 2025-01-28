import { tryParseDateFromString, unzipBuffer } from "./Utils";
import {
  doEvent,
  createStatsItem,
  addStatsItem,
  calculateAllStats,
  kSkillPass,
  kSkillSpike,
} from "./StatsItem.js";
import { kSkillSettersCall } from "./StatsItem";
import { myzip, myunzip } from "./zip";

var currentGame = null;

export function initWithPSVBCompressedBuffer(buf) {
  // var buffer = unzipBuffer(buf);
  var buffer = "";
  buffer = unzipBuffer(buf);
  if (buffer === null || buffer.length === 0) {
    buffer = myunzip(buf);
  }
  return generateMatch(buffer);
}

function getPlayerStatsItem(pl, gm) {
  if (pl.statsItems === undefined) {
    pl.statsItems = [];
  }
  for (var sn = 0; sn < pl.statsItems.length; sn++) {
    var si = pl.statsItems[sn];
    if (si.set !== null && si.GameNumber === gm.GameNumber) {
      return si;
    }
  }
  si = createStatsItem(pl, gm);
  pl.statsItems.push(si);
  return si;
}

export function calculatePSVBStats(m) {
  if (m === undefined || m.sets === undefined) {
    return null;
  }
  //prepare sets
  for (var sn = 0; sn < m.sets.length; sn++) {
    var game = m.sets[sn];
    game.teamAStatsItems = [];
    var sia = createStatsItem(null, game);
    game.teamAStatsItems.push(sia);

    game.teamBStatsItems = [];
    var sib = createStatsItem(null, game);
    game.teamBStatsItems.push(sib);
  }

  //do team A
  for (var pn = 0; pn < m.teamA.players.length; pn++) {
    var pl = m.teamA.players[pn];
    if (pl.statsItems === undefined) {
      pl.statsItems = [];
      pl.statsItems.push(createStatsItem(pl, null));
    }
    for (var sn = 0; sn < m.sets.length; sn++) {
      var game = m.sets[sn];
      if (game.events === undefined) {
        continue;
      }
      var si = getPlayerStatsItem(pl, game);
      var siteam = createStatsItem(null, game);
      for (var en = 0; en < game.events.length; en++) {
        var ev = game.events[en];
        if (ev.PlayerGuid === pl.Guid) {
          si = doEvent(ev, si);
        }
        if (
          m.teamA.players.filter((obj) => obj.Guid === ev.PlayerGuid).length > 0
        ) {
          siteam = doEvent(ev, siteam);
        }
      }
      calculateAllStats(siteam);
      game.teamAStatsItems[0] = siteam;
      calculateAllStats(si);
    }
  }
  m.teamA.statsItems = [];
  var ssmatchteam = createStatsItem(null, null);
  m.teamA.statsItems.push(ssmatchteam);
  for (var pn = 0; pn < m.teamA.players.length; pn++) {
    pl = m.teamA.players[pn];
    var ssmatch = createStatsItem(pl, null);
    for (var sn = 1; sn < pl.statsItems.length; sn++) {
      var game = m.sets[sn - 1];
      game.teamAStatsItems.push(pl.statsItems[sn]);
      ssmatch = addStatsItem(pl.statsItems[sn], ssmatch);
      ssmatch.gamesPlayed++;
      ssmatchteam = addStatsItem(pl.statsItems[sn], ssmatchteam);
      ssmatchteam.gamesPlayed++;
    }
    calculateAllStats(ssmatch);
    pl.statsItems[0] = ssmatch;
    m.teamA.statsItems.push(ssmatch);
    calculateAllStats(ssmatchteam);
  }

  //do team B
  for (var pn = 0; pn < m.teamB.players.length; pn++) {
    var pl = m.teamB.players[pn];
    if (pl.statsItems === undefined) {
      pl.statsItems = [];
      pl.statsItems.push(createStatsItem(pl, null));
    }
    for (var sn = 0; sn < m.sets.length; sn++) {
      var game = m.sets[sn];
      if (game.events === undefined) {
        continue;
      }
      var si = getPlayerStatsItem(pl, game);
      var siteam = createStatsItem(null, game);
      for (var en = 0; en < game.events.length; en++) {
        var ev = game.events[en];
        if (ev.PlayerGuid === pl.Guid) {
          si = doEvent(ev, si);
        }
        if (
          m.teamB.players.filter((obj) => obj.Guid === ev.PlayerGuid).length > 0
        ) {
          siteam = doEvent(ev, siteam);
        }
      }
      calculateAllStats(siteam);
      game.teamBStatsItems[0] = siteam;
      calculateAllStats(si);
    }
  }
  m.teamB.statsItems = [];
  var ssmatchteam = createStatsItem(null, null);
  m.teamB.statsItems.push(ssmatchteam);
  for (var pn = 0; pn < m.teamB.players.length; pn++) {
    pl = m.teamB.players[pn];
    var ssmatch = createStatsItem(pl, null);
    for (var sn = 1; sn < pl.statsItems.length; sn++) {
      var game = m.sets[sn - 1];
      game.teamBStatsItems.push(pl.statsItems[sn]);
      ssmatch = addStatsItem(pl.statsItems[sn], ssmatch);
      ssmatch.gamesPlayed++;
      ssmatchteam = addStatsItem(pl.statsItems[sn], ssmatchteam);
      ssmatchteam.gamesPlayed++;
    }
    calculateAllStats(ssmatch);
    pl.statsItems[0] = ssmatch;
    m.teamB.statsItems.push(ssmatch);
    calculateAllStats(ssmatchteam);
  }

  for (var sn = 1; sn < pl.statsItems.length; sn++) {
    var game = m.sets[sn - 1];
  }
  return m;
}

export function parseLatestPSVBStats(latest, m) {
  if (latest === null || latest.length <= 0) {
    return;
  }

  for (var n = 0; n < latest.length; n++) {
    var ls = latest[n];
    var buffer = unzipBuffer(ls.contents);
    if (buffer !== null) {
      // console.log('buffer =======', buffer)
      psvbParseLatestStats(buffer, m);
    }
  }
  return m;
}

export function generateMatch(str) {
  var line = 0;

  var a = str.split(/\r?\n/);
  if (a.length === 0 || a[0] !== "PSVB") {
    return null;
  }
  line++;
  var json = a[line].split("~");
  var match = JSON.parse(json[1]);
  match.events = [];

  line++;
  json = a[line].split("~");
  if (json[1].includes(":null") === false && json[1].includes("(null)") === false) {
    match.tournament = JSON.parse(json[1]);
  }

  line++;
  json = a[line].split("~");
  if (json[1].includes(":null") === false && json[1].includes("(null)") === false) {
    match.venue = JSON.parse(json[1]);
  }

  line++;
  json = a[line].split("~");
  if (json[1].includes(":null") === false && json[1].includes("(null)") === false) {
    match.teamA = JSON.parse(json[1]);
  }

  line++;
  json = a[line].split("~");
  if (json[1].includes(":null") === false && json[1].includes("(null)") === false) {
    match.teamB = JSON.parse(json[1]);
  }

  line++;
  match.HomePlayers = [];
  match.AwayPlayers = [];
  match.teamA.players = [];
  match.teamB.players = [];
  for (var ln = line; ln < a.length; ln++) {
    json = a[ln].split("~");
    if (json[0] === "V") {
      var video = JSON.parse(json[1]);
      if (video.startTime !== undefined) {
        match.videoStartTime = new Date(video.startTime);
        if (video.url.includes("http")) {
          match.videoUrl = video.url;
        }
      }
    } else if (json[0] === "PH") {
      var player = JSON.parse(json[1]);
      match.teamA.players.push(player);
    } else if (json[0] === "PA") {
      var player = JSON.parse(json[1]);
      match.teamB.players.push(player);
    } else if (json[0] === "THP") {
      for (var n = 0; n < match.teamA.players.length; n++) {
        var pl = match.teamA.players[n];
        if (json[2] === pl.Guid) {
          pl.shirtNumber = json[1];
          break;
        }
      }
    } else if (json[0] === "TAP") {
      for (var n = 0; n < match.teamB.players.length; n++) {
        var pl = match.teamB.players[n];
        if (json[2] === pl.Guid) {
          pl.shirtNumber = json[1];
          break;
        }
      }
    } else if (json[0] === "MHP") {
      for (var n = 0; n < match.teamA.players.length; n++) {
        var pl = match.teamA.players[n];
        if (json[1] === pl.Guid) {
          match.HomePlayers.push(pl);
          break;
        }
      }
    } else if (json[0] === "MAP") {
      for (var n = 0; n < match.teamB.players.length; n++) {
        var pl = match.teamB.players[n];
        if (json[2] === pl.Guid) {
          match.AwayPlayers.push(pl);
          break;
        }
      }
    } else {
      psvbParseLatestStats(a[ln], match);
    }
  }
  return match;
}

function getVBStatsPlayerByGuid(guid, m) {
  var pls = m.teamA.players.filter((obj) => obj.Guid === guid);
  if (pls.length > 0) {
    return pls[0];
  }
  pls = m.teamB.players.filter((obj) => obj.Guid === guid);
  if (pls.length > 0) {
    return pls[0];
  }
  return null;
}

export function psvbParseLatestStats(str, match) {
  var lines = str.split(/\r?\n/);
  if (lines.length === 0) {
    return match;
  }

  for (var line = 0; line < lines.length; line++) {
    // console.log('line - lines[line]', line, lines[line])
    if (lines[line] === undefined) {
      continue;
    }
    var json = lines[line].split("~");
    try {
      if (json.length > 1) {
        if (json[0] === "DTHP") {
          try {
            if (currentGame.teamAplayers === undefined) {
              currentGame.teamAplayers = [];
            }
            var exists = false;
            var tpl = null;
            for (var nm = 0; nm < match.teamA.players.length; nm++) {
              var pl = match.teamA.players[nm];
              if (json[1] === pl.Guid) {
                tpl = pl;
                break;
              }
            }
            if (tpl !== null) {
              for (var tnm = 0; tnm < currentGame.teamAplayers.length; tnm++) {
                var xtpl = currentGame.teamAplayers[tnm];
                if (xtpl.Guid === tpl.Guid) {
                  exists = true;
                  break;
                }
              }
              if (exists === false) {
                currentGame.teamAplayers.push(tpl);
              }
            } else {
              currentGame.teamAplayers.push(tpl);
            }
          } catch (error) {
            console.log("psvbParseLatestStats DTHP", error);
          }
        } else if (json[0] === "DTHP") {
          try {
            if (currentGame.teamBplayers === undefined) {
              currentGame.teamBplayers = [];
            }
            var exists = false;
            var tpl = null;
            for (var nm = 0; nm < match.teamA.players.length; nm++) {
              var pl = match.teamB.players[nm];
              if (json[1] === pl.Guid) {
                tpl = pl;
                break;
              }
            }
            if (tpl !== null) {
              for (var tnm = 0; tnm < currentGame.teamBplayers.length; tnm++) {
                var xtpl = currentGame.teamBplayers[tnm];
                if (xtpl.Guid === tpl.Guid) {
                  exists = true;
                  break;
                }
              }
              if (exists === false) {
                currentGame.teamBplayers.push(tpl);
              }
            } else {
              currentGame.teamBplayers.push(tpl);
            }
          } catch (error) {
            console.log("psvbParseLatestStats DTAP", error);
          }
        } else if (json[0] === "Q") {
          try {
            if (json[1] === "(null)") {
              continue;
            }
            var game = JSON.parse(json[1]);
            game.match = match;
            if (match.sets === undefined) {
              match.sets = [];
            }
            if (game.GameNumber === 0) {
              if (currentGame === null) {
                game.GameNumber = match.sets.length + 1;
              } else {
                game.GameNumber = currentGame.GameNumber;
              }
            }
            var xgame = match.sets[game.GameNumber - 1];
            if (xgame !== undefined) {
              game.events = xgame.events;
              game.teamAplayers = xgame.teamAplayers;
              game.teamBplayers = xgame.teamBplayers;
              game.statsItems = xgame.statsItems;
            }
            match.sets[game.GameNumber - 1] = game;
            currentGame = game;
          } catch (error) {
            console.log("psvbParseLatestStats Q", error);
          }
        } else if (json[0] === "E" || json[0] === "MODE") {
          try {
            if (currentGame.events === undefined) {
              currentGame.events = [];
            }
            var ev = JSON.parse(json[1]);
            // console.log(ev.TeamScore, ev.OppositionScore)
            var pls = match.teamA.players.filter(
              (obj) => obj.Guid === ev.PlayerGuid
            );
            if (pls.length > 0) {
              ev.Player = pls[0];
              ev.homePlayer = true;
            } else {
              pls = match.teamB.players.filter(
                (obj) => obj.Guid === ev.PlayerGuid
              );
              if (pls.length > 0) {
                ev.Player = pls[0];
                ev.homePlayer = false;
              } else {
                ev.Player = null;
              }
            }
            if (ev.EventType === kSkillPass) {
              currentGame.passEvent = ev;
            } else if (ev.EventType === kSkillSpike) {
              if (currentGame.passEvent) {
                if ((currentGame.passEvent.homePlayer = ev.homePlayer)) {
                  ev.isSideOut = true;
                } else {
                  ev.isSideOut = false;
                }
                delete currentGame.passEvent;
              }
            }
            ev.TimeStamp = new Date(ev.TimeStamp);
            if (match.videoStartTime !== undefined) {
              if (typeof match.videoStartTime !== 'string') {
                const mvst = match.videoStartTime.getTime();
                const ets = ev.TimeStamp.getTime();
                ev.VideoPosition = (ets - mvst) / 1000;
              } else {
                ev.VideoPosition = 0;
              }
            }
            ev.Drill = currentGame;
            currentGame.events.push(ev);
            match.events.push(ev);
          } catch (error) {
            console.log("psvbParseLatestStats E", error);
          }
        } else if (json[0] === "SS") {
          try {
            if (match.ss === undefined) {
              match.ss = [];
            }
            var ss = JSON.parse(json[1]);
            var exist = false;
            for (var ns = 0; ns < match.ss.length; ns++) {
              if (ss.PlayerGuid === match.ss[ns].PlayerGuid) {
                match.ss[ns] = ss;
                exist = true;
                break;
              }
            }
            if (exist === false) {
              match.ss.push(ss);
            }
          } catch (error) {
            console.log("psvbParseLatestStats SS", error);
          }
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }
  return match;
}

export function getEventDescription(e) {
  var s = "";
  //   if (
  //     e.EventType === 100 ||
  //     e.EventType === 105 ||
  //     e.EventType === 101 ||
  //     e.EventType === 104
  //   ) {
  //     s += e.EventString + " - " + GradeStringExtra(e);
  //   } else {
  //     s += e.EventString + " - " + GradeStringExtra(e);
  //   }
  var xs = GradeStringExtra(e);
  var ss = xs !== "" ? e.EventString + " - " + xs : e.EventString;
  return ss;
}

export function GradeStringExtra(e) {
  var gr1 = ["Error", "S1", "S2", "Ace", "S3", "Speed"];
  var gr1err = ["", "Net", "Out Long", "Out Side"];
  var gr2 = ["Error", "P1", "P2", "P3"];
  var gr3 = ["Error", "", "Set Assist", ""];
  var gr4 = ["Error", "In Play", "In Play", "Kill"];
  var gr4err = ["", "Out", "Blocked", "Net", "Net Touch"];
  var gr5 = ["Error", "Control", "Solo", "Block Assist"];
  var gr6 = ["BHE", "Dig", "Dig 2", "Dig 3"];
  var hr = ["", "Off-speed", "Dump", "Power", "Off-Block"];
  var sr = ["", "Jump", "Jump-Float", "Float", "Topspin"];
  var settypes = ["", "1", "2", "3", "4", "5"];

  var eerr = e.ErrorType;
  var eg = e.EventGrade;
  if (eg < 0) eg = 0;
  var sub = e.SubEvent;
  var sub2 = e.SubEvent2;
  var set = 0;
  if (sub >= 110) {
    var x = sub % 1000;
    set = x - 110;
    //			set = sub -110;
    sub = (sub - x) / 1000;
  }

  switch (e.EventType) {
    case 1: {
      var s2 = gr1[eg];
      if (sub > 0) {
        s2 += " " + sr[sub];
      }
      if (eg == 0 && eerr > 0) {
        s2 += " (" + gr1err[eerr] + ")";
      }
      return s2;
    }
    case 2: {
      if (eg >= gr2.count) return "";
      return gr2[eg];
    }
    case 3: {
      return gr3[eg];
    }
    case 4: {
      var numblocks = sub2 == 0 ? "" : sub2 - 1 + "B";
      var setTypeStr = "";
      if (set >= 0 && set < settypes.count) {
        setTypeStr = settypes[set];
      } else {
        // DLog(@"Set type out of bounds %d", set);
      }
      if (e.EventGrade == 0) {
        {
          var s2 = setTypeStr + " " + gr4[0];
          if (eerr > 0) {
            s2 += " (" + gr4err[eerr] + ")";
          }
          s2 += numblocks;
          return s2;
        }
      } else if (eg == 1 || eg == 2) {
        if (sub == 0) {
          var ss = setTypeStr + " " + gr4[2] + numblocks;
          return ss;
        } //if (sub != 3)
        else {
          if (sub < 0 || sub >= hr.count) {
            sub = 0;
          }
          var ss = setTypeStr + " " + gr4[2] + " (" + hr[sub] + ")" + numblocks;
          return ss;
        }
      } else {
        if (sub > 0 && sub != 3 && sub < hr.count) {
          var ss = setTypeStr + " " + gr4[3] + " (" + hr[sub] + ")" + numblocks;
          return ss;
        } else {
          var ss = setTypeStr + " " + gr4[3] + numblocks;
          return ss;
        }
      }
    }

    case 5: {
      var n = eg;
      if (n > 3) {
        return "";
      }
      if (eg == 3) {
        if (sub == 0) {
          n = 2;
        }
      }
      return gr5[n];
    }
    case 6: {
      if (eg < gr6.count) {
        return gr6[eg];
      } else {
        return "";
      }
    }
    case kSkillSettersCall: {
      return e.settersCall; // setters call
    }
  }
  return "";
}
