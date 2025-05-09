import moment from "moment";
import {
  addStatsItem,
  calculateAllStats,
  createStatsItem,
  doEvent,
} from "./StatsItem.js";
import {
  generateUUID,
  inside,
  pad,
  stringToPoint,
  tryParseDateFromString,
  unzipBuffer,
} from "./Utils";
import { myunzip } from "./zip.js";

const kSkillServe = 1;
const kSkillPass = 2;
const kSkillSet = 3;
const kSkillSpike = 4;
const kSkillBlock = 5;
const kSkillDefense = 6;
const kSkillFreeball = 7;
const kSkillCover = 7;
const kSkillCoachTag = 8;
const kSkillEndOfSet = 9;
const kSkillTransitionSO = 10;
const kSkillTransitionPoint = 11;
const kSkillPointWonServe = 12;
const kSkillPointLostServe = 13;
const kSkillPointWonReceive = 14;
const kSkillPointLostReceive = 15;
const kSkilliCodaAttack = 16;
const kSkilliCodaDefense = 17;
const kSkillCodeError = 18;
const kSkillOppositionError = 19;
const kSkillSettersCall = 20;

const kOppositionScore = 100;
const kOppositionError = 101;
const kOppositionHitKill = 102;
const kOppositionHitError = 103;
const kOppositionServeError = 104;
const kOppositionServeAce = 105;
const kSkillCommentary = 200;
const kSkillTimeout = 201;
const kSkillTechTimeout = 202;
const kSubstitution = 250;
const kSkillOppositionServe = 401;
const kSkillOppositionSpike = 404;

const kServeH = 1;
const kServeM = 2;
const kServeQ = 3;
const kServeO = 4;

const kPassH = 1;
const kPassM = 2;
const kPassQ = 3;
const kPassO = 4;

const kSpikeH = 1;
const kSpikeM = 2;
const kSpikeQ = 3;
const kSpikeT = 4;
const kSpikeU = 5;
const kSpikeF = 6;
const kSpikeO = 7;

var currentGame = null;
var isSideOut = false;

export function initWithDVWCompressedBuffer(buf) {
  var buffer = unzipBuffer(buf);
  if (!buffer) {
    buffer = myunzip(buf);
  }
  // console.log(buffer)
  if (!buffer) {
    // toast.error("Invalid DataVolley data.");
    return;
  } else {
    return generateMatch(buffer);
  }
}

var index = 1;
var rows = [0, 1, 6, 5, 4, 3, 2];
var ets = ["S", "R", "E", "A", "B", "D", "F"];
var egs = ["=", "-", "/", "!", "+", "", "#"];

var homelineup = [];
var awaylineup = [];

var attackCombo = "";

var isPractice = false;
var homelibs = [];
var awaylibs = [];
var match = null;
var matchdate = null;
var homeTeam = null;
var awayTeam = null;
var homeSetter = 0;
var awaySetter = 0;
var homerow = 0;
var awayrow = 0;
var homescore = 0;
var awayscore = 0;
var subevent = 0;
var currentGame = 1;
var sc = "";
var passEvent = "";
var homeServing = true;
var scores = "0-0";
var genday;
var ssecs = [
  "[3MATCH]",
  "[3TEAMS]",
  "[3MORE]",
  "[3SET]",
  "[3PLAYERS-H]",
  "[3PLAYERS-V]",
  "[3ATTACKCOMBINATION]",
  "[3SETTERCALL]",
  "[3SCOUT]",
  "[3VIDEO]",
  "[3COMMENTS]",
];

export function generateMatch(str) {
  var lastvp = -1;
  var keyvp = 0;
  homerow = 0;
  awayrow = 0;
  homescore = 0;
  awayscore = 0;
  homeTeam = null;
  awayTeam = null;
  dateAtVideoPositionZero = null;

  var a = str.split(/\r?\n/);
  if (a.length == 0 || a[0] !== "[3DATAVOLLEYSCOUT]") {
    return null;
  }

  var linecount = a.length;

  var section;
  var gamenumber = 1;
  for (var nl = 1; nl < a.length; nl++) {
    var s = a[nl];
    subevent = 0;
    if (s.includes("GENERATOR-DAY")) {
      genday = s;
    }
    if (ssecs.filter((ss) => ss === s).length > 0) {
      section = ssecs.findIndex((ss) => ss === s);
    }
    // if (section === -1)
    // {
    //     continue
    // }
    switch (section) {
      case 0: //match
        {
          var sm = s.split(";");
          if (sm.length >= 13) {
            matchdate = sm[0];
            var matchtime = sm[1];
            if (matchtime.length == 0) {
              matchtime = "00:00:00";
            }
            match = {};
            match.events = [];
            match.players = [];
            match.oppositionPlayers = [];
            match.drills = [];
            match.attackCombos = [];
            match.setterCalls = [];
            match.HomeScore = 0;
            match.AwayScore = 0;
            const datestr = matchdate + " " + matchtime.replace(/\./g, ":");
            match.TrainingDate = tryParseDateFromString(datestr, "mdy");
            if (match.TrainingDate === undefined) {
              match.TrainingDate = tryParseDateFromString(datestr, "ymd");
              if (match.TrainingDate === undefined) {
                let tk1s = matchdate.split("/");
                let day = Number.parseInt(tk1s[0]);
                let month = Number.parseInt(tk1s[1]);
                if (month > 12) {
                  const temp = day;
                  day = month;
                  month = temp;
                }
                const year = Number.parseInt(tk1s[2]);
                let hour = 0;
                let minute = 0;
                let second = 0;
                let tk2s = matchtime.split(".");
                if (tk2s.length == 1) {
                  tk2s = matchtime.split(":");
                }
                if (tk2s.length >= 3) {
                  hour = Number.parseInt(tk2s[0]);
                  minute = Number.parseInt(tk2s[1]);
                  second = Number.parseInt(tk2s[2]);
                }
                const dd = new Date(year, month - 1, day, hour, minute, second);
                match.TrainingDate = dd;
              }
            }
            match.tournamentName = sm[3];
            match.dvstring = s;
          }
        }
        break;
      case 1: //teams
        {
          var sm = s.split(";");
          if (sm.length >= 7) {
            var desc = sm[1];
            var descx = unzipBuffer(desc);
            var name = descx === null ? desc : descx;
            if (homeTeam === null) {
              homeTeam = {};
              homeTeam.Name = name;
              homeTeam.Code = sm[0];
              match.Team = homeTeam;
              match.teamA = homeTeam;
              match.teamA.players = [];
            } else {
              awayTeam = {};
              awayTeam.Name = name;
              awayTeam.Code = sm[0];
              match.Opposition = awayTeam;
              match.teamB = awayTeam;
              match.teamB.players = [];
            }
          }
        }
        break;
      case 2: //more
        {
          var sm = s.split(";");
          if (sm.length >= 7) {
            match.venue = sm[3];
          } else if (sm.length >= 2) {
            homeSetter = parseInt(sm[1]);
            awaySetter = parseInt(sm[2]);
          }
        }
        break;
      case 3: //sets
        {
          var sm = s.split(";");
          if (sm.length >= 7) {
            var setScore = sm[4];
            if (setScore.length !== 0) {
              var token1 = sm[1];
              var d = {};
              d.match = match;
              d.events = [];
              d.players = [];
              d.oppositionPlayers = [];
              for (var np = 0; np < match.players.length; np++) {
                var pl = match.players[np];
                d.players.push(pl);
              }
              for (var np = 0; np < match.oppositionPlayers.length; np++) {
                var pl = match.oppositionPlayers[np];
                d.oppositionPlayers.push(pl);
              }
              d.GameNumber = gamenumber;
              if (
                match.drills.filter((obj) => obj.GameNumber === gamenumber)
                  .length === 0
              ) {
                match.drills.push(d);
              }
              d.trainingSession = match;
              d.drillDuration = duration;

              var setScore = sm[4];
              var duration = parseInt(sm[5]);
              if (setScore.length > 0) {
                var scs = setScore.split("-");
                var xhomescore = parseInt(scs[0]);
                var xawayscore = parseInt(scs[1]);
                d.HomeScore = xhomescore;
                d.AwayScore = xawayscore;
                var mhs = parseInt(match.HomeScore);
                var mas = parseInt(match.AwayScore);
                var winningscore = gamenumber > 4 ? 15 : 25;
                if (xhomescore >= winningscore || xhomescore >= winningscore) {
                  if (xhomescore > xawayscore + 1) {
                    mhs++;
                  } else if (xawayscore > xhomescore + 1) {
                    mas++;
                  }
                }
                match.HomeScore = mhs;
                match.AwayScore = mas;
              }
            }
            gamenumber++;
          }
        }
        break;
      case 4: // home players
        {
          var sm = s.split(";");
          if (sm.length >= 7) {
            var pl = createPlayer(s);
            if (pl != null) {
              match.players.push(pl);
              match.teamA.players.push(pl);
              pl.shirtNumber = parseInt(sm[1]);

              var spos = sm[13];
              if (spos.length > 0) {
                var posname = [
                  "",
                  "Libero",
                  "Pass/Hitter",
                  "Opposite",
                  "Middle",
                  "Setter",
                ];
                var npos = parseInt(spos);
                if (pl.Positions.filter((obj) => obj === npos).length === 0) {
                  pl.Positions.push(npos);
                }
                if (npos == 1) {
                  if (homelibs.filter((obj) => obj === pl).length === 0) {
                    homelibs.push(pl);
                  }
                }
              }
              if (
                match.players.filter((obj) => obj.Guid === pl.Guid).length === 0
              ) {
                match.players.push(pl);
              }
              for (var nd = 0; nd < match.drills.length; nd++) {
                var d = match.drills[nd];
                if (
                  d.players.filter((obj) => obj.Guid === pl.Guid).length === 0
                ) {
                  d.players.push(pl);
                }
              }
            }
          }
        }
        break;
      case 5: // away players
        {
          var sm = s.split(";");
          if (sm.length >= 7) {
            var pl = createPlayer(s);
            if (pl != null) {
              match.oppositionPlayers.push(pl);
              match.teamB.players.push(pl);
              pl.shirtNumber = parseInt(sm[1]);

              var spos = sm[13];
              if (spos.length > 0) {
                var posname = [
                  "",
                  "Libero",
                  "Pass/Hitter",
                  "Opposite",
                  "Middle",
                  "Setter",
                ];
                var npos = parseInt(spos);
                if (pl.Positions.filter((obj) => obj === npos).length === 0) {
                  pl.Positions.push(npos);
                }
                if (npos == 1) {
                  if (awaylibs.filter((obj) => obj === pl).length === 0) {
                    awaylibs.push(pl);
                  }
                }
              }
              if (
                match.oppositionPlayers.filter((obj) => obj.Guid === pl.Guid)
                  .length === 0
              ) {
                match.oppositionPlayers.push(pl);
              }
              for (var nd = 0; nd < match.drills.length; nd++) {
                var d = match.drills[nd];
                if (
                  d.oppositionPlayers.filter((obj) => obj.Guid === pl.Guid)
                    .length === 0
                ) {
                  d.oppositionPlayers.push(pl);
                }
              }
            }
          }
        }
        break;
      case 6: //attack combinations
        {
          var sm = s.split(";");
          if (sm.length >= 11) {
            var ac = getAttackCombination(s);
            if (
              ac !== null &&
              match.attackCombos.filter((obj) => obj.code === ac.code)
                .length === 0
            ) {
              match.attackCombos.push(ac);
            }
            if (attackCombo.length > 0) {
              attackCombo += "|";
            }
            attackCombo += s;
          }
        }
        break;
      case 7: //setter calls
        {
          var sm = s.split(";");
          if (sm.length > 8) {
            var sc = getSettersCall(s);
            if (
              sc !== null &&
              match.setterCalls.filter((obj) => obj.code === sc.code).length ===
                0
            ) {
              match.setterCalls.push(sc);
            }
          }
        }
        break;
      case 8: //scout
        {
          processScoutLine(s);
        }
        break;
      case 9: // video
      case 10: // comment
        {
          if (s.startsWith("http") === true) {
            match.videoUrl = s;
          } else if (s.startsWith(";http") === true) {
            match.videoUrl = s.substring(1);
          } else if (s.startsWith(";offset=") === true) {
            match.videoOffset = Number.parseInt(s.substring(8));
          }
        }
        break;
    }
  }

  match.UserDefined2 = attackCombo;

  // convert to cones
  var evs = match.events;
  for (var ne = 0; ne < evs.length; ne++) {
    var e = evs[ne];
    if (e.EventType !== kSkillSpike) {
      continue;
    }

    var coneno = e.endZone;
    if (match.isZone) {
      var endPoint = stringToPoint(e.BallEndString);
      if (endPoint === null) {
        continue;
      }
      endPoint = { x: 100 - endPoint.x, y: 100 - endPoint.y };

      var ac = fetchAttackComboByCode(e.attackCombo);
      if (ac !== null) {
        // const canvas = document.getElementById("canvas");
        // const ctx = canvas.getContext("2d");

        var startzone = e.startZone;
        if (realTargetHitter(ac) === "F") {
          var cones = [
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 88, y: 100 },
            { x: 87, y: 0 },
            { x: 88, y: 0 },
            { x: 88, y: 0 },
            { x: 88, y: 100 },
            { x: 70, y: 100 },
            { x: 87, y: 0 },
            { x: 88, y: 0 },
            { x: 88, y: 0 },
            { x: 70, y: 100 },
            { x: 56, y: 100 },
            { x: 87, y: 0 },
            { x: 88, y: 0 },
            { x: 88, y: 0 },
            { x: 56, y: 100 },
            { x: 22, y: 100 },
            { x: 87, y: 0 },
            { x: 88, y: 0 },
            { x: 88, y: 0 },
            { x: 22, y: 100 },
            { x: 0, y: 100 },
            { x: 0, y: 70 },
            { x: 88, y: 0 },
            { x: 88, y: 0 },
            { x: 0, y: 70 },
            { x: 0, y: 40 },
            { x: 87, y: 0 },
            { x: 88, y: 0 },
            { x: 88, y: 0 },
            { x: 0, y: 40 },
            { x: 0, y: 0 },
            { x: 87, y: 0 },
            { x: 88, y: 0 },
          ];
          for (var nn = 0; nn < 7; nn++) {
            // ctx.beginPath()
            // ctx.moveTo(cones[nn * 5 + 0].x, cones[nn * 5 + 0].y)
            var polygon = [];
            var pt = [];
            pt.push(cones[nn * 5 + 0].x);
            pt.push(cones[nn * 5 + 0].y);
            polygon.push(pt);
            for (var mm = 1; mm < 5; mm++) {
              // ctx.lineTo(cones[nn * 5 + mm].x, cones[nn * 5 + mm].y)
              var pt = [];
              pt.push(cones[nn * 5 + mm].x);
              pt.push(cones[nn * 5 + mm].y);
              polygon.push(pt);
            }
            // if (ctx.isPointInPath(endPoint.x, endPoint.y))
            if (inside([endPoint.x, endPoint.y], polygon)) {
              coneno = nn + 1;
              break;
            }
          }
        } else if (realTargetHitter(ac) === "B") {
          var cones = [
            { x: 0, y: 0 },
            { x: 0, y: 100 },
            { x: 12, y: 100 },
            { x: 11, y: 0 },
            { x: 12, y: 0 },
            { x: 12, y: 0 },
            { x: 28, y: 100 },
            { x: 12, y: 100 },
            { x: 11, y: 0 },
            { x: 12, y: 0 },
            { x: 12, y: 0 },
            { x: 44, y: 100 },
            { x: 28, y: 100 },
            { x: 11, y: 0 },
            { x: 12, y: 0 },
            { x: 12, y: 0 },
            { x: 80, y: 100 },
            { x: 44, y: 100 },
            { x: 11, y: 0 },
            { x: 12, y: 0 },
            { x: 12, y: 0 },
            { x: 100, y: 80 },
            { x: 100, y: 100 },
            { x: 80, y: 100 },
            { x: 12, y: 0 },
            { x: 12, y: 0 },
            { x: 100, y: 44 },
            { x: 100, y: 80 },
            { x: 11, y: 0 },
            { x: 12, y: 0 },
            { x: 12, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 44 },
            { x: 11, y: 0 },
            { x: 12, y: 0 },
          ];

          for (var nn = 0; nn < 7; nn++) {
            var polygon = [];
            var pt = [];
            pt.push(cones[nn * 5 + 0].x);
            pt.push(cones[nn * 5 + 0].y);
            polygon.push(pt);
            for (var mm = 1; mm < 5; mm++) {
              var pt = [];
              pt.push(cones[nn * 5 + mm].x);
              pt.push(cones[nn * 5 + mm].y);
              polygon.push(pt);
            }
            if (inside([endPoint.x, endPoint.y], polygon)) {
              coneno = nn + 1;
              break;
            }
          }
          if (startzone == 2) {
            // DLog("startzone=%d cone=%d %@-%@ %", startzone, coneno, e.BallStartString, e.BallEndString, e.dvString);
          }
        } //if (ac.realTargetHitter isEqualToString:"Q"])
        else {
          var cones = [
            { x: 50, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 54 },
            { x: 60, y: 54 },
            { x: 100, y: 54 },
            { x: 100, y: 100 },
            { x: 80, y: 100 },
            { x: 80, y: 54 },
            { x: 80, y: 54 },
            { x: 80, y: 100 },
            { x: 60, y: 100 },
            { x: 60, y: 54 },
            { x: 60, y: 54 },
            { x: 60, y: 100 },
            { x: 40, y: 100 },
            { x: 40, y: 54 },
            { x: 40, y: 54 },
            { x: 40, y: 100 },
            { x: 20, y: 100 },
            { x: 20, y: 54 },
            { x: 20, y: 54 },
            { x: 20, y: 100 },
            { x: 0, y: 100 },
            { x: 0, y: 54 },
            { x: 50, y: 0 },
            { x: 40, y: 54 },
            { x: 0, y: 54 },
            { x: 0, y: 0 },
            { x: 50, y: 0 },
            { x: 60, y: 54 },
            { x: 40, y: 54 },
            { x: 50, y: 0 },
          ];
          for (var nn = 0; nn < 8; nn++) {
            var polygon = [];
            var pt = [];
            pt.push(cones[nn * 4 + 0].x);
            pt.push(cones[nn * 4 + 0].y);
            polygon.push(pt);
            for (var mm = 1; mm < 4; mm++) {
              var pt = [];
              pt.push(cones[nn * 4 + mm].x);
              pt.push(cones[nn * 4 + mm].y);
              polygon.push(pt);
            }
            if (inside([endPoint.x, endPoint.y], polygon)) {
              coneno = nn + 1;
              break;
            }
          }
        }
      }
    }
    e.coneNumber = coneno;
  }

  match.sets = match.drills;
  var dd = matchdate.split("/");
  match.code =
    dd[0] +
    "." +
    dd[1] +
    "." +
    dd[2] +
    "~" +
    match.teamA.Code +
    "vs" +
    match.teamB.Code;
  // console.log("match = ", match);
  return match;
}

function createPlayer(s) {
  var pl = null;
  var sm = s.split(";");
  if (sm.length >= 16) {
    if (sm[10] === "Player") {
      return null;
    }
    //dealing with unicode
    var desc = sm[9];
    var descx = unzipBuffer(desc);
    var lastname = descx == null ? desc : descx;
    desc = sm[10];
    descx = unzipBuffer(desc);
    var firstname = descx == null ? desc : descx;
    desc = sm[11];
    descx = unzipBuffer(desc);
    var nickname = descx == null ? desc : descx;

    // var tmppath = [NSString stringWithFormat:@"%@/txt.txt", DOCSFOLDER];
    // NSError *err;
    // [desc writeToFile:tmppath atomically:NO encoding:NSUTF8StringEncoding error:&err];
    // var sxsj = [NSString stringWithContentsOfFile:tmppath encoding:NSShiftJISStringEncoding error:&err];
    // var nickname = descx == nil ? desc : descx;

    pl = {};
    pl.FirstName = firstname;
    pl.LastName = lastname;
    pl.NickName = nickname === "" ? lastname : nickname;
    pl.Guid = generateUUID();
    pl.Positions = [];
  }
  return pl;
}

function getAttackCombination(s) {
  var sm = s.split(";");
  var code = sm[0];

  var desc = sm[4];
  var descx = unzipBuffer(desc);
  var acname = descx == null ? desc : descx;

  var ac = {};
  ac.trainingSession = match;
  ac.code = code;
  ac.approach = sm[2];
  ac.ballType = sm[3];
  ac.name = acname;
  ac.startZone = sm[1];
  ac.coords = sm[7];
  ac.targetHitter = sm[8];
  ac.isBackcourt = parseInt(sm[9]);
  var x = parseInt(sm[7]) % 100;
  var y = (parseInt(sm[7]) - x) / 100;
  ac.hittingPoint = { x: x, y: y };

  return ac;
}

function getSettersCall(s) {
  var sm = s.split(";");
  var code = sm[0];

  var desc = sm[2];
  var descx = unzipBuffer(desc);
  var name = descx == null ? desc : descx;

  var sc = {};
  sc.trainingSession = match;
  sc.code = code;
  sc.name = name;

  var ss = "";
  for (var n = 5; n < 9; n++) {
    var sn = sm[n];
    if (sn.length > 0) {
      if (ss.length > 0) {
        ss += "|";
      }
      ss += sn;
    }
  }

  sc.coords = ss;
  return sc;
}

function fetchAttackComboByCode(code) {
  var acs = match.attackCombos.filter((obj) => obj.code == code);
  if (acs.length === 1) {
    return acs[0];
  }
  return null;
}

function fetchPlayerInMatch(players, shirtNumber) {
  var pls = players.filter((obj) => obj.shirtNumber == shirtNumber);
  if (pls.length === 1) {
    return pls[0];
  }
  return null;
}

var lastTime = 0;
var lastvp = 0;
var keyvp = 0;
var dateAtVideoPositionZero = null;
var videoposoffset = 0;

// function processScoutLine(s) {
//     var shouldUpdate = false
//     var sm = s.split(";");
//     if (sm.length < 9) {
//         return shouldUpdate;
//     }
//     var coneno = 0;
//     var thisgame = currentGame;
//     if (isPractice == false) {
//         var stg = sm[8];
//         if (stg.length > 0) {
//             thisgame = parseInt(stg)
//         }
//     }
//     var g = match.drills[thisgame - 1]
//     if (g === undefined || g === null) {
//         return false;
//     }

//     currentGame = thisgame;
//     var code = sm[0];
//     var isHome = code.substring(0, 1) === "*"
//     var tm = isHome ? match.Team : match.Opposition;
//     var currentHomeLineup = [];
//     var currentAwayLineup = [];
//     var currentRotation = "";
//     var pos = 1;
//     homelineup = [];
//     currentHomeLineup = [];
//     awaylineup = [];
//     currentAwayLineup = [];
//     var cc1 = code.substring(0, 2)
//     var cc2 = code.substring(4, 8)
//     if (code.length == 8 && cc1 === "*P" && cc2 === ">LUp") {
//         for (var nr = 0; nr < 6; nr++) {
//             var nh = parseInt(sm[(14 + nr)]);

//             var pl = fetchPlayerInMatch(match.players, nh);
//             if (pl != null) {
//                 currentHomeLineup.push(pl);
//                 if (homelineup.filter(obj => obj.Guid === pl.Guid).length === 0) {
//                     homelineup.push(pl);
//                 }
//             }

//             var ah = parseInt(sm[(20 + nr)]);
//             pl = fetchPlayerInMatch(match.oppositionPlayers, ah);
//             if (pl != null) {
//                 currentAwayLineup.push(pl);
//                 if (awaylineup.filter(obj => obj.Guid === pl.Guid).length === 0) {
//                     awaylineup.push(pl);
//                 }
//             }
//         }

//         for (var np = 0; np < homelibs.length; np++) {
//             var pl = homelibs[np]
//             if (homelineup.filter(obj => obj.Guid === pl.Guid).length === 0) {
//                 homelineup.push(pl);
//             }
//         }
//         currentRotation = "";
//         pos = 1;
//         for (var np = 0; np < homelineup.length; np++) {
//             var pl = homelineup[np]
//             if (currentRotation.length > 0) {
//                 currentRotation += ",";
//             }
//             currentRotation += pl.Guid;
//             pos++;
//         }
//         g.StartingLineup = currentRotation;

//         for (var np = 0; np < awaylibs.length; np++) {
//             var pl = awaylibs[np]
//             if (awaylineup.filter(obj => obj.Guid === pl.Guid).length === 0) {
//                 awaylineup.push(pl);
//             }
//         }
//         var currentOppRotation = "";
//         pos = 1;
//         for (var np = 0; np < awaylineup.length; np++) {
//             var pl = awaylineup[np]
//             if (currentOppRotation.length > 0) {
//                 currentOppRotation += ",";
//             }
//             currentOppRotation += pl.Guid;
//             pos++;
//         }
//         g.OppositionStartingLineup = currentOppRotation;
//     }

//     if (code.length < 3) {
//         return shouldUpdate;
//     }

//     var eventCreated = false;
//     var vp = 0;
//     var tt = sm[7];
//     var sn = parseInt(code.substring(1, 3));
//     if (code.length >= 6 /* && tt != nil && tt.length > 0 */) {
//         var pls = isHome ? match.players : match.oppositionPlayers
//         var pl = fetchPlayerInMatch(pls, sn);
//         var net = 0;
//         var neg = 0;
//         var et = code.substring(3, 4);
//         var se = code.substring(4, 5);
//         var eg = code.substring(5, 6);
//         var homePlayer = isHome;
//         if (et === "S") {
//             if (homePlayer) {
//                 homeServing = true;
//             }
//             else {
//                 homeServing = false;
//             }
//         }
//         else if (et === "R") {
//             if (homePlayer) {
//                 homeServing = false;
//             }
//             else {
//                 homeServing = true;
//             }
//         }
//         if (tt.length == 0) {
//             tt = lastTime;
//         }
//         else {
//             lastTime = tt;
//         }

//         vp = 0;
//         if (sm.length > 12) {
//             var xnet = ets.indexOf(et)
//             if (xnet != -1) {
//                 var svp = sm[12];
//                 if (svp.length > 0) {
//                     vp = parseInt(svp)
//                     // for occasions when match was coded from segmented videos
//                     if (vp < lastvp && ((lastvp - (vp + keyvp)) > 1000)) {
//                         keyvp = lastvp;
//                     }
//                     vp += keyvp;
//                     lastvp = vp;
//                 }
//             }
//         }
//         var ts2 = null;
//         if (tt.length > 0) {
//             var ttt = matchdate + " " + tt.replace('.', ':')
//             ts2 = tryParseDateFromString(ttt, "mdy")
//             if (ts2 === undefined) {
//                 ts2 = tryParseDateFromString(ttt, "ymd")
//             }
//             if (ts2 === undefined) {
//                 ts2 = tryParseDateFromString(ttt, "dmy")
//             }
//             if (dateAtVideoPositionZero === null || dateAtVideoPositionZero === undefined) {
//                 dateAtVideoPositionZero = ts2;
//             }
//         }
//         if (vp != 0) {
//             if (videoposoffset === 0) {
//                 videoposoffset = vp;
//                 dateAtVideoPositionZero = new Date(ts2.getTime() - vp * 1000);
//             }
//             if (dateAtVideoPositionZero === null || dateAtVideoPositionZero === undefined) {
//                 dateAtVideoPositionZero = match.TrainingDate;
//             }
//             ts2 = new Date(dateAtVideoPositionZero.getTime() + vp * 1000);
//         }

//         var bs = "";
//         var be = "";
//         coneno = 0;
//         if ((et === "S" || et === "A") && code.length >= 11) {
//             var accode = code.substring(6, 8);
//             var atc = fetchAttackComboByCode(accode);

//             var xs = [83, 83, 50, 17, 17, 50, 17, 50, 83];
//             var yss = [210, 210, 210, 210, 210, 210, 210, 210, 210];
//             var ysa = [183, 100, 100, 100, 183, 183, 150, 150, 150];
//             var xe = [17, 17, 50, 83, 83, 50, 83, 50, 17];
//             var ye = [17, 83, 83, 83, 17, 17, 50, 50, 50];

//             var startzone = parseInt(code.substring(9, 10)) - 1;
//             var endzone = parseInt(code.substring(10, 11)) - 1;
//             if (startzone >= 0 && endzone >= 0) {
//                 var subendzone = code.length > 11 ? code.substring(11, 12) : "";
//                 // srand((int)time(NULL));
//                 var rxs = 0; //(rand() % 20) - 10;
//                 var rys = 0; //rand() % 5;

//                 const min = -4;
//                 const max = 4;
//                 var rxe = Math.random() * (max - min); //0; //(rand() % 10) - 5;
//                 var rye = Math.random() * (max - min); //(rand() % 10) - 5;

//                 var xendx = parseInt(xe[endzone]);
//                 var xendy = parseInt(ye[endzone]);
//                 if (subendzone === "A") {
//                     match.isZone = true;
//                     xendx -= 8;
//                     xendy -= 8;
//                 }
//                 else if (subendzone === "B") {
//                     match.isZone = true;
//                     xendx -= 8;
//                     xendy += 8;
//                 }
//                 else if (subendzone === "C") {
//                     match.isZone = true;
//                     xendx += 8;
//                     xendy += 8;
//                 }
//                 else if (subendzone === "D") {
//                     match.isZone = true;
//                     xendx += 8;
//                     xendy -= 8;
//                 }
//                 else if (subendzone === "~") {
//                     coneno = endzone + 1;
//                     rxe = 0; //(rand() % 20) - 10;
//                     rye = 0; //(rand() % 20) - 10;
//                 }

//                 if (et === "S") {
//                     bs = (xs[startzone] + rxs).toString() + "," + yss[startzone].toString();
//                 }
//                 else {
//                     if (atc != null) {
//                         var apt = atc.hittingPoint;
//                         if (apt.x === undefined && apt.y === undefined) {
//                             bs = (xs[startzone] + rxs).toString() + "," + ysa[startzone].toString();
//                         }
//                         else {
//                             bs = apt.x.toString() + "," + (100 + (50 - apt.y) * 2).toString();
//                         }
//                     }
//                     else {
//                         bs = (xs[startzone] + rxs).toString() + "," + (ysa[startzone] + rys).toString();
//                     }
//                 }
//                 be = (xendx + rxe).toString() + "," + (xendy + rye).toString();
//                 var endPoint = { x: xendx, y: xendy };
//             }
//         }
//         net = ets.indexOf(et);
//         if (net == kSkillSet - 1) {
//             net = kSkillSettersCall - 1;
//         }
//         if (net != -1) {
//             var neg = egs.indexOf(eg)
//             if (neg >= 0) {
//                 var ac = "";
//                 net += 1;
//                 var gr = neg;
//                 var err = 0;
//                 var netOK = true;
//                 var breakPoint = 0;
//                 switch (net) {
//                     case kSkillServe:
//                         {
//                             if (homescore == 6 && awayscore == 3) {
//                                 //                                NSLog(@"");
//                             }
//                             if (se === "H") {
//                                 subevent = kServeH;
//                             }
//                             else if (se === "M") {
//                                 subevent = kServeM;
//                             }
//                             else if (se === "Q") {
//                                 subevent = kServeQ;
//                             }
//                             else {
//                                 subevent = kServeO;
//                             }

//                             if (eg === "=") gr = 0;
//                             else if (eg === "/") gr = 5;
//                             else if (eg === "!") gr = 2;
//                             else if (eg === "-") gr = 1;
//                             else if (eg === "+") gr = 4;
//                             else if (eg === "#") {
//                                 gr = 3;
//                                 breakPoint = 1;
//                             }
//                             else gr = 1;
//                         }
//                         break;
//                     case kSkillPass:
//                         {
//                             if (se === "H") {
//                                 subevent = kPassH;
//                             }
//                             else if (se === "M") {
//                                 subevent = kPassM;
//                             }
//                             else if (se === "Q") {
//                                 subevent = kPassQ;
//                             }
//                             else {
//                                 subevent = kPassO;
//                             }
//                             passEvent = code;
//                             if (eg === "=") gr = 0;
//                             else if (eg === "/") { gr = 1; err = 1; }
//                             else if (eg === "-") gr = 1;
//                             else if (eg === "!") gr = 2;
//                             else if (eg === "+") { gr = 3; err = 1; }
//                             else if (eg === "#") gr = 3;
//                             else gr = 1;
//                         }
//                         break;
//                     case kSkillSet:
//                         {
//                             if (eg === "=") gr = 0;
//                             else if (eg === "-") gr = 1;
//                             else if (eg === "+") gr = 2;
//                             else if (eg === "#") gr = 3;
//                             else gr = 1;
//                         }
//                         break;
//                     case kSkillSettersCall:
//                         {
//                             if (code.length > 6) {
//                                 sc = code.substring(6, code.length);
//                             }
//                             if (eg === "=") gr = 0;
//                             else if (eg === "-") gr = 1;
//                             else if (eg === "+") gr = 2;
//                             else if (eg === "#") gr = 3;
//                             else gr = 1;
//                         }
//                         break;
//                     case kSkillSpike:
//                         {
//                             if (code.length > 6) {
//                                 ac = code.substring(6, 8);
//                             }
//                             if (se === "H") {
//                                 subevent = kSpikeH;
//                             }
//                             else if (se === "M") {
//                                 subevent = kSpikeM;
//                             }
//                             else if (se === "Q") {
//                                 subevent = kSpikeQ;
//                             }
//                             else if (se === "T") {
//                                 subevent = kSpikeT;
//                             }
//                             else if (se === "U") {
//                                 subevent = kSpikeU;
//                             }
//                             else if (se === "F") {
//                                 subevent = kSpikeF;
//                             }
//                             else {
//                                 subevent = kSpikeO;
//                             }

//                             if (eg === "=") gr = 0;
//                             else if (eg === "/") { gr = 0; err = 2; }
//                             else if (eg === "-") gr = 1;
//                             else if (eg === "!") { gr = 1; err = 2; }
//                             else if (eg === "+") gr = 2;
//                             else if (eg === "#") {
//                                 gr = 3;
//                                 if ((homePlayer && homeServing) ||
//                                     (!homePlayer && !homeServing)) {
//                                     breakPoint = 1;
//                                 }
//                             }
//                             else gr = 1;
//                         }
//                         break;
//                     case kSkillBlock:
//                         {
//                             if (eg === "=") gr = 0;
//                             else if (eg === "/") { gr = 0; err = 1; }
//                             else if (eg === "-") { gr = 1; err = 1; }
//                             else if (eg === "+") gr = 1;
//                             else if (eg === "#") {
//                                 gr = 2;
//                                 if ((homePlayer && homeServing) ||
//                                     (!homePlayer && !homeServing)) {
//                                     breakPoint = 1;
//                                 }
//                                 if (code.length > 12) {
//                                     var bt = code.substring(12, 13);
//                                     if (bt === "A")  //assist
//                                     {
//                                         gr = 3;
//                                     }
//                                     else if (bt === "T") //attempt
//                                     {
//                                     }
//                                 }
//                             }

//                             else gr = 1;
//                         }
//                         break;
//                     case kSkillDefense:
//                         {
//                             if (eg === "=") gr = 0;
//                             else if (eg === "/") { gr = 0; err = 1; }//over
//                             else if (eg === "-") { gr = 0; err = 2; }//poor
//                             else if (eg === "#") gr = 1;
//                             else gr = 1;
//                         }
//                         break;
//                     case kSkillFreeball:
//                         {
//                             if (eg === "=") gr = 0;
//                             else if (eg === "/") gr = 2; //no attack
//                             else if (eg === "-") gr = 2; //poor
//                             else if (eg === "+") gr = 2; //poor
//                             else if (eg === "#") gr = 1;
//                             else gr = 1;
//                         }
//                         break;
//                     default:
//                         {
//                             netOK = false;
//                         }
//                         break;
//                 }
//                 if (netOK) {
//                     eventCreated = true;
//                     var ev = null;
//                     if (homePlayer) {
//                         ev = createEvent(index, pl, g, ts2, net, subevent, breakPoint, gr, err, bs, be, homescore, awayscore, homerow, ac, sc, null, homeSetter, s, vp);
//                     }
//                     else {
//                         ev = createEvent(index, pl, g, ts2, net, subevent, breakPoint, gr, err, bs, be, homescore, awayscore, awayrow, ac, sc, null, awaySetter, s, vp);
//                     }
//                     if (net == kSkillSpike) {
//                         ev.UserDefined01 = passEvent;
//                         if (code.length >= 9) {
//                             var sz = code.substring(9, 10);
//                             ev.startZone = sz;
//                             ev.endZone = coneno.toString();
//                         }
//                         sc = "";
//                     }
//                     if (net == kSkillSpike || net == kSkillServe) {
//                         passEvent = "";
//                     }
//                     ev.EventId = pad(index * 10, 4);
//                     index++;
//                 }
//             }
//         }
//         else {
//             //                                NSLog(@"ETS = %@", ets);
//         }
//     }

//     if ((sn == 0 || isNaN(sn)) && !eventCreated) {
//         if (code.substring(1, 2) === "p") {
//             var sscores = code.substring(2, code.length);
//             var sss = sscores.split(":");
//             if (sss.length == 2) {
//                 homescore = parseInt(sss[0]);
//                 awayscore = parseInt(sss[1]);
//                 g.AwayScore = awayscore;
//                 g.HomeScore = homescore;
//                 scores = homescore.toString() + "-" + awayscore.toString();
//                 shouldUpdate = true;
//             }
//         }
//         else if (code.substring(1, 2) === "c") {
//             if (code.length < 7) {

//             }
//             else {
//                 var outpl = parseInt(code.substring(2, 4));
//                 var inpl = parseInt(code.substring(5, 7));
//                 vp = 0;
//                 if (sm.length > 12) {
//                     var svp = sm[12];
//                     if (svp.length > 0) {
//                         vp = parseInt(svp);
//                         if (vp > lastvp + (60 * 10))    // if vp is more than 10 minutes different then something wrong
//                         {
//                             vp = lastvp;
//                         }
//                         lastvp = vp;
//                     }
//                 }
//                 var ts2;
//                 if (tt.length > 0) {
//                     ts2 = new Date(matchdate + " " + tt.replace('.', ':'))
//                     if (dateAtVideoPositionZero == null) {
//                         dateAtVideoPositionZero = ts2;
//                     }
//                 }
//                 if (vp != 0) {
//                     if (videoposoffset == 0) {
//                         videoposoffset = vp;
//                         dateAtVideoPositionZero = new Date(ts2.toTimeString() - vp * 1000);
//                     }
//                     if (dateAtVideoPositionZero == null || dateAtVideoPositionZero === undefined) {
//                         dateAtVideoPositionZero = match.TrainingDate;
//                     }
//                     ts2 = new Date(dateAtVideoPositionZero.getTime() + vp * 1000);
//                 }

//                 if (code.substring(0, 1) === "*")    // home
//                 {
//                     var ipl = fetchPlayerInMatch(match.players, inpl);
//                     var opl = fetchPlayerInMatch(match.players, outpl);
//                     if (ipl !== null && opl !== null)
//                     {
//                         createEvent(index, opl, g, ts2, kSubstitution, 0, 0, 0, 0, "", "", homescore, awayscore, homerow, null, null, ipl.Guid, homeSetter, s, vp);
//                         index++;
//                     }
//                 }
//                 else if (code.substring(0, 1) === "a")    // away
//                 {
//                     var ipl = fetchPlayerInMatch(match.oppositionPlayers, inpl);
//                     var opl = fetchPlayerInMatch(match.oppositionPlayers, outpl);
//                     if (ipl !== null && opl !== null)
//                     {
//                         createEvent(index, opl, g, ts2, kSubstitution, 0, 0, 0, 0, "", "", homescore, awayscore, awayrow, null, null, ipl.Guid, awaySetter, s, vp);
//                         index++;
//                     }
//                 }
//             }
//         }
//         else if (code.length > 6 && code.substring(0, 7) === "**Drill") {
//             match.isTraining = true;
//             isPractice = true;
//             var lastg = match.drills[currentGame - 1];
//             lastg.IsLocked = true;
//             currentGame++;
//         }
//         else if ((code.substring(0, 2) === "**") && (code.substring(3, 6) === "set")) {
//             homescore = 0;
//             awayscore = 0;
//             var ssno = parseInt(code.substring(2, 3));
//             var lastg = match.drills[ssno - 1];
//             lastg.IsLocked = true;
//             currentGame = parseInt(sm[8]);
//         }
//         else if (code.substring(1, 2) === "z") {
//             var r = 0;
//             if (code.substring(0, 1) === "*")    // home setter pos
//             {
//                 r = parseInt(code.substring(2, 3));
//                 homerow = parseInt(rows[r]);
//                 match.homerow = homerow;
//                 var xx = parseInt(sm[9]) + 13;
//                 homeSetter = parseInt(sm[xx]);
//                 g.PrimarySetter = fetchPlayerInMatch(match.players, homeSetter);
//                 if (g.PrimarySetter.Positions.filter(obj => obj === 5).length === 0) {
//                     g.PrimarySetter.Positions.push(5)
//                 }
//             }
//             else if (code.substring(0, 1) === "a")    // home
//             {
//                 // away setter
//                 r = parseInt(code.substring(2, 3));
//                 awayrow = parseInt(rows[r]);
//                 match.awayrow = awayrow;
//                 var xx = parseInt(sm[10]) + 19;
//                 awaySetter = parseInt(sm[xx]);
//                 g.oppPrimarySetter = fetchPlayerInMatch(match.oppositionPlayers, awaySetter);
//                 if (g.oppPrimarySetter.Positions.filter(obj => obj === 5).length === 0) {
//                     g.oppPrimarySetter.Positions.push(5)
//                 }
//             }
//         }
//     }

//     if (match.videoStartTime == null && dateAtVideoPositionZero != null) {
//         match.videoStartTime = dateAtVideoPositionZero;
//     }
//     return shouldUpdate;

// }

function processScoutLine(s) {
  var shouldUpdate = false;
  var sm = s.split(";");
  if (sm.length < 9) {
    return shouldUpdate;
  }
  var coneno = 0;
  var thisgame = currentGame;
  if (isPractice == false) {
    var stg = sm[8];
    if (stg.length > 0) {
      thisgame = parseInt(stg);
    }
  }
  var g = match.drills[thisgame - 1];
  if (g === undefined || g === null) {
    return false;
  }

  currentGame = thisgame;
  var code = sm[0];
  var isHome = code.substring(0, 1) === "*";
  var tm = isHome ? match.Team : match.Opposition;
  var currentHomeLineup = [];
  var currentAwayLineup = [];
  var currentRotation = "";
  var pos = 1;
  homelineup = [];
  currentHomeLineup = [];
  awaylineup = [];
  currentAwayLineup = [];
  var cc1 = code.substring(0, 2);
  var cc2 = code.substring(4, 8);
  if (code.length == 8 && cc1 === "*P" && cc2 === ">LUp") {
    for (var nr = 0; nr < 6; nr++) {
      var nh = parseInt(sm[14 + nr]);

      var pl = fetchPlayerInMatch(match.players, nh);
      if (pl != null) {
        currentHomeLineup.push(pl);
        if (homelineup.filter((obj) => obj.Guid === pl.Guid).length === 0) {
          homelineup.push(pl);
        }
      }

      var ah = parseInt(sm[20 + nr]);
      pl = fetchPlayerInMatch(match.oppositionPlayers, ah);
      if (pl != null) {
        currentAwayLineup.push(pl);
        if (awaylineup.filter((obj) => obj.Guid === pl.Guid).length === 0) {
          awaylineup.push(pl);
        }
      }
    }

    for (var np = 0; np < homelibs.length; np++) {
      var pl = homelibs[np];
      if (homelineup.filter((obj) => obj.Guid === pl.Guid).length === 0) {
        homelineup.push(pl);
      }
    }
    currentRotation = "";
    pos = 1;
    for (var np = 0; np < homelineup.length; np++) {
      var pl = homelineup[np];
      if (currentRotation.length > 0) {
        currentRotation += ",";
      }
      currentRotation += pl.Guid;
      pos++;
    }
    g.StartingLineup = currentRotation;

    for (var np = 0; np < awaylibs.length; np++) {
      var pl = awaylibs[np];
      if (awaylineup.filter((obj) => obj.Guid === pl.Guid).length === 0) {
        awaylineup.push(pl);
      }
    }
    var currentOppRotation = "";
    pos = 1;
    for (var np = 0; np < awaylineup.length; np++) {
      var pl = awaylineup[np];
      if (currentOppRotation.length > 0) {
        currentOppRotation += ",";
      }
      currentOppRotation += pl.Guid;
      pos++;
    }
    g.OppositionStartingLineup = currentOppRotation;
  }

  if (code.length < 3) {
    return shouldUpdate;
  }

  var eventCreated = false;
  var vp = 0;
  var tt = sm[7];
  var sn = parseInt(code.substring(1, 3));
  if (code.length >= 6 /* && tt != nil && tt.length > 0 */) {
    var pls = isHome ? match.players : match.oppositionPlayers;
    var pl = fetchPlayerInMatch(pls, sn);
    var net = 0;
    var neg = 0;
    var et = code.substring(3, 4);
    var se = code.substring(4, 5);
    var eg = code.substring(5, 6);
    var homePlayer = isHome;
    if (et === "S") {
      if (homePlayer) {
        homeServing = true;
      } else {
        homeServing = false;
      }
    } else if (et === "R") {
      if (homePlayer) {
        homeServing = false;
      } else {
        homeServing = true;
      }
    }
    if (tt.length == 0) {
      tt = lastTime;
    } else {
      lastTime = tt;
    }

    vp = 0;
    if (sm.length > 12) {
      var xnet = ets.indexOf(et);
      if (xnet != -1) {
        var svp = sm[12];
        if (svp.length > 0) {
          vp = parseInt(svp);
          // // for occasions when match was coded from segmented videos
          // if (vp < lastvp && ((lastvp - (vp + keyvp)) > 1000)) {
          //     keyvp = lastvp;
          // }
          // vp += keyvp;
          // lastvp = vp;
        }
      }
    }
    var ts2 = null;
    if (tt.length > 0) {
      var ttt = matchdate + " " + tt.split(".").join(":");
      ts2 = new Date(moment(ttt, "MM/DD/YYYY HH:mm:ss"));
      // ts2 = tryParseDateFromString(ttt, "mdy");
      // if (ts2 === undefined) {
      //   ts2 = tryParseDateFromString(ttt, "ymd");
      // }
      // if (ts2 === undefined) {
      //   ts2 = tryParseDateFromString(ttt, "dmy");
      // }
      if (
        dateAtVideoPositionZero === null ||
        dateAtVideoPositionZero === undefined
      ) {
        dateAtVideoPositionZero = ts2;
      }
    }
    if (vp != 0) {
      if (videoposoffset === 0) {
        videoposoffset = vp;
        if (ts2 !== null && ts2 !== undefined) {
          dateAtVideoPositionZero = new Date(ts2.getTime() - vp * 1000);
        }
      }
      if (
        dateAtVideoPositionZero === null ||
        dateAtVideoPositionZero === undefined
      ) {
        dateAtVideoPositionZero = match.TrainingDate;
      }
      ts2 = new Date(dateAtVideoPositionZero.getTime() + vp * 1000);
    }

    var bs = "";
    var be = "";
    coneno = 0;
    if ((et === "S" || et === "A") && code.length >= 11) {
      var accode = code.substring(6, 8);
      var atc = fetchAttackComboByCode(accode);

      var xs = [83, 83, 50, 17, 17, 50, 17, 50, 83];
      var yss = [210, 210, 210, 210, 210, 210, 210, 210, 210];
      var ysa = [183, 100, 100, 100, 183, 183, 150, 150, 150];
      var xe = [17, 17, 50, 83, 83, 50, 83, 50, 17];
      var ye = [17, 83, 83, 83, 17, 17, 50, 50, 50];

      var startzone = parseInt(code.substring(9, 10)) - 1;
      var endzone = parseInt(code.substring(10, 11)) - 1;
      if (startzone >= 0 && endzone >= 0) {
        var subendzone = code.length > 11 ? code.substring(11, 12) : "";
        // srand((int)time(NULL));
        var rxs = 0; //(rand() % 20) - 10;
        var rys = 0; //rand() % 5;

        const min = -4;
        const max = 4;
        var rxe = Math.random() * (max - min); //0; //(rand() % 10) - 5;
        var rye = Math.random() * (max - min); //(rand() % 10) - 5;

        var xendx = parseInt(xe[endzone]);
        var xendy = parseInt(ye[endzone]);
        if (subendzone === "A") {
          match.isZone = true;
          xendx -= 8;
          xendy -= 8;
        } else if (subendzone === "B") {
          match.isZone = true;
          xendx -= 8;
          xendy += 8;
        } else if (subendzone === "C") {
          match.isZone = true;
          xendx += 8;
          xendy += 8;
        } else if (subendzone === "D") {
          match.isZone = true;
          xendx += 8;
          xendy -= 8;
        } else if (subendzone === "~") {
          coneno = endzone + 1;
          rxe = 0; //(rand() % 20) - 10;
          rye = 0; //(rand() % 20) - 10;
        }

        if (et === "S") {
          bs =
            (xs[startzone] + rxs).toString() + "," + yss[startzone].toString();
        } else {
          if (atc != null) {
            var apt = atc.hittingPoint;
            if (apt.x === undefined && apt.y === undefined) {
              bs =
                (xs[startzone] + rxs).toString() +
                "," +
                ysa[startzone].toString();
            } else {
              bs = apt.x.toString() + "," + (100 + (50 - apt.y) * 2).toString();
            }
          } else {
            bs =
              (xs[startzone] + rxs).toString() +
              "," +
              (ysa[startzone] + rys).toString();
          }
        }
        be = (xendx + rxe).toString() + "," + (xendy + rye).toString();
        var endPoint = { x: xendx, y: xendy };
      }
    }
    net = ets.indexOf(et);
    if (net == kSkillSet - 1) {
      net = kSkillSettersCall - 1;
    }
    if (net != -1) {
      var neg = egs.indexOf(eg);
      if (neg >= 0) {
        var ac = "";
        net += 1;
        var gr = neg;
        var err = 0;
        var netOK = true;
        var breakPoint = 0;
        switch (net) {
          case kSkillServe:
            {
              if (homescore == 6 && awayscore == 3) {
                //                                NSLog("");
              }
              if (se === "H") {
                subevent = kServeH;
              } else if (se === "M") {
                subevent = kServeM;
              } else if (se === "Q") {
                subevent = kServeQ;
              } else {
                subevent = kServeO;
              }

              if (eg === "=") gr = 0;
              else if (eg === "/") gr = 5;
              else if (eg === "!") gr = 2;
              else if (eg === "-") gr = 1;
              else if (eg === "+") gr = 4;
              else if (eg === "#") {
                gr = 3;
                breakPoint = 1;
              } else gr = 1;
            }
            break;
          case kSkillPass:
            {
              if (se === "H") {
                subevent = kPassH;
              } else if (se === "M") {
                subevent = kPassM;
              } else if (se === "Q") {
                subevent = kPassQ;
              } else {
                subevent = kPassO;
              }
              passEvent = code;
              if (eg === "=") gr = 0;
              else if (eg === "/") {
                gr = 1;
                err = 1;
              } else if (eg === "-") gr = 1;
              else if (eg === "!") gr = 2;
              else if (eg === "+") {
                gr = 3;
                err = 1;
              } else if (eg === "#") gr = 3;
              else gr = 1;
            }
            break;
          case kSkillSet:
            {
              if (eg === "=") gr = 0;
              else if (eg === "-") gr = 1;
              else if (eg === "+") gr = 2;
              else if (eg === "#") gr = 3;
              else gr = 1;
            }
            break;
          case kSkillSettersCall:
            {
              if (code.length > 6) {
                sc = code.substring(6, code.length);
              }
              if (eg === "=") gr = 0;
              else if (eg === "-") gr = 1;
              else if (eg === "+") gr = 2;
              else if (eg === "#") gr = 3;
              else gr = 1;
            }
            break;
          case kSkillSpike:
            {
              if (code.length > 6) {
                ac = code.substring(6, 8);
              }
              if (se === "H") {
                subevent = kSpikeH;
              } else if (se === "M") {
                subevent = kSpikeM;
              } else if (se === "Q") {
                subevent = kSpikeQ;
              } else if (se === "T") {
                subevent = kSpikeT;
              } else if (se === "U") {
                subevent = kSpikeU;
              } else if (se === "F") {
                subevent = kSpikeF;
              } else {
                subevent = kSpikeO;
              }

              if (eg === "=") gr = 0;
              else if (eg === "/") {
                gr = 0;
                err = 2;
              } else if (eg === "-") gr = 1;
              else if (eg === "!") {
                gr = 1;
                err = 2;
              } else if (eg === "+") gr = 2;
              else if (eg === "#") {
                gr = 3;
                if (
                  (homePlayer && homeServing) ||
                  (!homePlayer && !homeServing)
                ) {
                  breakPoint = 1;
                }
              } else gr = 1;
            }
            break;
          case kSkillBlock:
            {
              if (eg === "=") gr = 0;
              else if (eg === "/") {
                gr = 0;
                err = 1;
              } else if (eg === "-") {
                gr = 1;
                err = 1;
              } else if (eg === "+") gr = 1;
              else if (eg === "#") {
                gr = 2;
                if (
                  (homePlayer && homeServing) ||
                  (!homePlayer && !homeServing)
                ) {
                  breakPoint = 1;
                }
                if (code.length > 12) {
                  var bt = code.substring(12, 13);
                  if (bt === "A") {
                    //assist
                    gr = 3;
                  } else if (bt === "T") {
                    //attempt
                  }
                }
              } else gr = 1;
            }
            break;
          case kSkillDefense:
            {
              if (eg === "=") gr = 0;
              else if (eg === "/") {
                gr = 0;
                err = 1;
              } //over
              else if (eg === "-") {
                gr = 0;
                err = 2;
              } //poor
              else if (eg === "#") gr = 1;
              else gr = 1;
            }
            break;
          case kSkillFreeball:
            {
              if (eg === "=") gr = 0;
              else if (eg === "/") gr = 2; //no attack
              else if (eg === "-") gr = 2; //poor
              else if (eg === "+") gr = 2; //poor
              else if (eg === "#") gr = 1;
              else gr = 1;
            }
            break;
          default:
            {
              netOK = false;
            }
            break;
        }
        if (netOK) {
          eventCreated = true;
          var ev = null;
          if (homePlayer) {
            ev = createEvent(
              index,
              pl,
              g,
              ts2,
              net,
              subevent,
              breakPoint,
              gr,
              err,
              bs,
              be,
              homescore,
              awayscore,
              homerow,
              ac,
              sc,
              null,
              homeSetter,
              s,
              vp
            );
          } else {
            ev = createEvent(
              index,
              pl,
              g,
              ts2,
              net,
              subevent,
              breakPoint,
              gr,
              err,
              bs,
              be,
              homescore,
              awayscore,
              awayrow,
              ac,
              sc,
              null,
              awaySetter,
              s,
              vp
            );
          }
          if (net == kSkillSpike) {
            ev.UserDefined01 = passEvent;
            ev.isSideOut = isSideOut;
            passEvent = "";
            isSideOut = false;
            if (code.length >= 9) {
              var sz = code.substring(9, 10);
              ev.startZone = sz;
              ev.endZone = coneno.toString();
            }
            sc = "";
          }
          if (net == kSkillServe) {
            passEvent = "";
            isSideOut = true;
          }
          ev.EventId = pad(index * 10, 4);
          index++;
        }
      }
    } else {
      //                                NSLog("ETS = %", ets);
    }
  }

  if ((sn == 0 || isNaN(sn)) && !eventCreated) {
    if (code.substring(1, 2) === "p") {
      var sscores = code.substring(2, code.length);
      var sss = sscores.split(":");
      if (sss.length == 2) {
        homescore = parseInt(sss[0]);
        awayscore = parseInt(sss[1]);
        g.AwayScore = awayscore;
        g.HomeScore = homescore;
        scores = homescore.toString() + "-" + awayscore.toString();
        shouldUpdate = true;
      }
    } else if (code.substring(1, 2) === "c") {
      if (code.length < 7) {
      } else {
        var outpl = parseInt(code.substring(2, 4));
        var inpl = parseInt(code.substring(5, 7));
        vp = 0;
        if (sm.length > 12) {
          var svp = sm[12];
          if (svp.length > 0) {
            vp = parseInt(svp);
            if (vp > lastvp + 60 * 10) {
              // if vp is more than 10 minutes different then something wrong
              vp = lastvp;
            }
            lastvp = vp;
          }
        }
        var ts2;
        if (tt.length > 0) {
          var ttt = matchdate + " " + tt.split(".").join(":");
          ts2 = new Date(moment(ttt, "MM/DD/YYYY HH:mm:ss"));
          // ts2 = new Date(matchdate + " " + tt.replace(".", ":"));
          if (dateAtVideoPositionZero == null) {
            dateAtVideoPositionZero = ts2;
          }
        }
        if (vp != 0) {
          if (videoposoffset == 0) {
            videoposoffset = vp;
            dateAtVideoPositionZero = new Date(ts2.toTimeString() - vp * 1000);
          }
          if (
            dateAtVideoPositionZero == null ||
            dateAtVideoPositionZero === undefined
          ) {
            dateAtVideoPositionZero = match.TrainingDate;
          }
          ts2 = new Date(dateAtVideoPositionZero.getTime() + vp * 1000);
        }

        if (code.substring(0, 1) === "*") {
          // home
          var ipl = fetchPlayerInMatch(match.players, inpl);
          var opl = fetchPlayerInMatch(match.players, outpl);
          if (ipl !== null && opl !== null) {
            createEvent(
              index,
              opl,
              g,
              ts2,
              kSubstitution,
              0,
              0,
              0,
              0,
              "",
              "",
              homescore,
              awayscore,
              homerow,
              null,
              null,
              ipl.Guid,
              homeSetter,
              s,
              vp
            );
            index++;
          }
        } else if (code.substring(0, 1) === "a") {
          // away
          var ipl = fetchPlayerInMatch(match.oppositionPlayers, inpl);
          var opl = fetchPlayerInMatch(match.oppositionPlayers, outpl);
          if (ipl !== null && opl !== null) {
            createEvent(
              index,
              opl,
              g,
              ts2,
              kSubstitution,
              0,
              0,
              0,
              0,
              "",
              "",
              homescore,
              awayscore,
              awayrow,
              null,
              null,
              ipl.Guid,
              awaySetter,
              s,
              vp
            );
            index++;
          }
        }
      }
    } else if (code.length > 6 && code.substring(0, 7) === "**Drill") {
      match.isTraining = true;
      isPractice = true;
      var lastg = match.drills[currentGame - 1];
      lastg.IsLocked = true;
      currentGame++;
    } else if (
      code.substring(0, 2) === "**" &&
      code.substring(3, 6) === "set"
    ) {
      homescore = 0;
      awayscore = 0;
      var ssno = parseInt(code.substring(2, 3));
      var lastg = match.drills[ssno - 1];
      lastg.IsLocked = true;
      currentGame = parseInt(sm[8]);
    } else if (code.substring(1, 2) === "z") {
      var r = 0;
      if (code.substring(0, 1) === "*") {
        // home setter pos
        r = parseInt(code.substring(2, 3));
        homerow = parseInt(rows[r]);
        match.homerow = homerow;
        var xx = parseInt(sm[9]) + 13;
        if (sm[xx].length > 0) {
          homeSetter = parseInt(sm[xx]);
          g.PrimarySetter = fetchPlayerInMatch(match.players, homeSetter);
          if (
            g.PrimarySetter.Positions.filter((obj) => obj === 5).length === 0
          ) {
            g.PrimarySetter.Positions.push(5);
          }
        } else {
          console.log(s);
        }
      } else if (code.substring(0, 1) === "a") {
        // home
        // away setter
        r = parseInt(code.substring(2, 3));
        awayrow = parseInt(rows[r]);
        match.awayrow = awayrow;
        var xx = parseInt(sm[10]) + 19;
        if (sm[xx].length > 0) {
          awaySetter = parseInt(sm[xx]);
          g.oppPrimarySetter = fetchPlayerInMatch(
            match.oppositionPlayers,
            awaySetter
          );
          if (g.oppPrimarySetter) {
            if (!g.oppPrimarySetter.Positions) {
              g.oppPrimarySetter.Positions = [];
            }
            if (
              g.oppPrimarySetter.Positions.filter((obj) => obj === 5).length ===
              0
            ) {
              g.oppPrimarySetter.Positions.push(5);
            }
          }
        }
      }
    }
  }

  if (match.videoStartTime == null && dateAtVideoPositionZero != null) {
    match.videoStartTime = dateAtVideoPositionZero;
  }
  return shouldUpdate;
}

function createEvent(
  eindex,
  pl,
  g,
  ts2,
  et,
  se,
  se2,
  grade,
  err,
  bs,
  be,
  xhomescore,
  xawayscore,
  row,
  ud,
  scall,
  subGuid,
  setter,
  dvs,
  vp
) {
  var ev = {};
  ev.Player = pl;
  ev.Drill = g;
  ev.TimeStamp = ts2;
  ev.EventId = eindex.toString();
  ev.EventType = et;
  ev.SubEvent = se;
  ev.SubEvent2 = se2;
  ev.ErrorType = err;
  ev.VideoPosition = vp;
  if (grade == 0.5) {
    ev.EventGrade = 0;
    ev.ErrorType = 1;
  } else {
    ev.EventGrade = grade;
  }
  ev.TeamScore = xhomescore;
  ev.OppositionScore = xawayscore;
  ev.Row = row;
  ev.BallStartString = bs;
  ev.BallEndString = be;
  ev.attackCombo = ud;
  ev.settersCall = scall;
  ev.substitution = subGuid;
  ev.setter = setter;
  ev.dvString = dvs;

  ev.AdvanceCode1 = AdvanceCode(6, 8, ev);
  ev.AdvanceCode2 = AdvanceCode(8, 9, ev);
  ev.AdvanceCode3 = AdvanceCode(9, 10, ev);
  ev.AdvanceCode4 = AdvanceCode(10, 11, ev);
  ev.AdvanceCode5 = AdvanceCode(11, 12, ev);
  ev.ExtraCode1 = AdvanceCode(12, 13, ev);
  ev.ExtraCode2 = AdvanceCode(13, 14, ev);
  ev.ExtraCode3 = AdvanceCode(14, 15, ev);
  ev.DVGrade = AdvanceCode(5, 6, ev);

  var gr = 0;
  if (et === kSkillPass) {
    if (ev.DVGrade === "=") gr = 0;
    else if (ev.DVGrade === "/") gr = 0.5;
    else if (ev.DVGrade === "-") gr = 1;
    else if (ev.DVGrade === "!") gr = 2;
    else if (ev.DVGrade === "+") gr = 3;
    else if (ev.DVGrade === "#") gr = 3;
  }
  ev.passingGrade = gr;

  switch (ev.EventType) {
    case 1:
      ev.EventString = "Serve ";
      break;
    case 2:
      ev.EventString = "Pass ";
      break;
    case 3:
      ev.EventString = "Set ";
      break;
    case 4:
      ev.EventString = "Spike ";
      break;
    case 5:
      ev.EventString = "Block ";
      break;
    case 6:
      ev.EventString = "Dig ";
      break;
    case 7:
      ev.EventString = "Cover";
      break;
    case 20:
      ev.EventString = "Setter Calls ";
      break;
    case 250:
      ev.EventString = "Substitution ";
      break;
    default:
      break;
  }

  ev.NumberOfBlocks = "";
  if (ev.ExtraCode2.length > 0) {
    if (ev.ExtraCode2 === "~") {
      ev.NumberOfBlocks = "BU";
    } else {
      const n = Number.parseInt(ev.ExtraCode2);

      if (n >= 0 && n < 5) {
        var str = ["B0", "B1", "B2", "B3", "BS"];
        ev.NumberOfBlocks = str[n];
      }
    }
  }

  g.events.push(ev);
  match.events.push(ev);

  return ev;
}

function AdvanceCode(start, end, ev) {
  var tokens = ev.dvString.split(";");
  if (tokens.length == 0) {
    return "";
  }
  var s = tokens[0];
  if (s.length >= end) {
    return s.substring(start, end);
  }
  return "";
}

function realTargetHitter(ac) {
  if (ac.targetHitter.length == 1 && ac.targetHitter !== "-") {
    return ac.targetHitter;
  }

  var startZone = ac.startZone;

  if (ac.ballType === "Q") {
    return "C";
  } else if (ac.ballType === "O" && startZone == 3) {
    return "S";
  }

  if (startZone == 2 || startZone == 1 || startZone == 9) {
    return "B";
  } else if (startZone == 4 || startZone == 5 || startZone == 7) {
    return "F";
  } else {
    if (ac.isBackcourt) {
      return "P";
    }
    var pt = ac.hittingPoint;
    if (pt.x < 50) {
      return "F";
    } else {
      return "B";
    }
  }
  return "";
}

export function parseLatestDVWStats(latest, m) {
  if (latest === null || latest.length <= 0) {
    return m;
  }

  for (var n = 0; n < latest.length; n++) {
    var ls = latest[n];
    var buffer = unzipBuffer(ls.contents);
    if (buffer !== null) {
      // console.log('buffer =======', buffer)
      match = m;
      processScoutLine(buffer);
    }
  }
  return match;
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

export function calculateDVWStats(m) {
  if (m == null || m.drills === undefined) {
    return null;
  }
  //prepare sets
  for (var sn = 0; sn < m.drills.length; sn++) {
    var game = m.drills[sn];
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
    for (var sn = 0; sn < m.drills.length; sn++) {
      var game = m.drills[sn];
      if (game.events == undefined) {
        continue;
      }
      var si = getPlayerStatsItem(pl, game);
      var siteam = createStatsItem(null, game);
      for (var en = 0; en < game.events.length; en++) {
        var ev = game.events[en];
        if (ev.Player === null) {
          continue;
        }
        if (ev.Player.Guid === pl.Guid) {
          si = doEvent(ev, si);
        }
        if (
          m.teamA.players.filter((obj) => obj.Guid === ev.Player.Guid).length >
          0
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
      var game = m.drills[sn - 1];
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
    for (var sn = 0; sn < m.drills.length; sn++) {
      var game = m.drills[sn];
      if (game.events == undefined) {
        continue;
      }
      var si = getPlayerStatsItem(pl, game);
      var siteam = createStatsItem(null, game);
      for (var en = 0; en < game.events.length; en++) {
        var ev = game.events[en];
        if (ev.Player === null) {
          continue;
        }
        if (ev.Player.Guid === pl.Guid) {
          si = doEvent(ev, si);
        }
        if (
          m.teamB.players.filter((obj) => obj.Guid === ev.Player.Guid).length >
          0
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
      var game = m.drills[sn - 1];
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
    var game = m.drills[sn - 1];
  }

  return m;
}

export function eventString(e) {
  var s = "";
  switch (e.EventType) {
    case 1:
      s += "Serve ";
      break;
    case 2:
      s += "Pass ";
      break;
    case 3:
      s += "Set ";
      break;
    case 4:
      s += "Spike ";
      break;
    case 5:
      s += "Block ";
      break;
    case 6:
      s += "Dig ";
      break;
    case 7:
      s += "Cover";
      break;
    case 20:
      s += "Setter Calls ";
      break;
    case 250:
      s += "Substitution ";
      break;
    default:
      break;
  }
  const gr1 = ["Error", "1", "2", "Ace", "3", "Speed"];
  const gr1err = ["", "Net", "Out Long", "Out Side"];
  const gr2 = ["Error", "1", "2", "3"];
  const gr3 = ["Error", "", "Set Assist", ""];
  const gr4 = ["Error", "In Play", "In Play", "Kill"];
  const gr4err = ["", "Out", "Blocked", "Net", "Net Touch"];
  const gr5 = ["Error", "Control", "Solo", "Block Assist"];
  const gr6 = ["Error", "1", "2", "3"];
  const hr = ["", "Off-speed", "Dump", "Power", "Off-Block"];
  const sr = ["", "Jump", "Jump-Float", "Float", "Topspin"];

  const eerr = e.ErrorType;
  const eg = e.EventGrade;
  if (eg < 0) eg = 0;
  var sub = e.SubEvent;
  const sub2 = e.SubEvent2;
  const set = 0;
  if (sub >= 110) {
    const x = sub % 1000;
    set = x - 110;
    sub = (sub - x) / 1000;
  }

  switch (e.EventType) {
    case 1:
      s += gr1[eg];
      if (sub > 0) {
        s += " " + sr[sub];
      }
      if (eg == 0 && eerr > 0) {
        s += " (" + gr1err[eerr] + ")";
      }
      break;
    case 2:
      if (eg >= gr2.length) break;
      s += gr2[eg];
      break;
    case 3:
      s += gr3[eg];
      break;
    case 4: {
      {
        var numblocks = "";
        if (sub2 != 0) {
          numblocks = " " + (sub2 - 1).toString() + "B";
        }
        if (eg == 0) {
          {
            s += gr4[0];
            if (eerr > 0) {
              s += " (" + gr4err[eerr] + ")";
            }
            s += numblocks;
            break;
          }
        } else if (eg == 1 || eg == 2) {
          if (sub == 0) {
            s += gr4[2] + numblocks;
            break;
          } //if (sub != 3)
          else {
            if (sub < 0 || sub >= hr.length) {
              sub = 0;
            }
            s += gr4[2] + " " + hr[sub] + numblocks;
            break;
          }
        } else {
          if (sub > 0 && sub != 3 && sub < hr.length) {
            s += gr4[3] + " " + hr[sub] + numblocks;
            break;
          } else {
            s += gr4[3] + numblocks;
            break;
          }
        }
      }
    }
    case 5: {
      const n = eg;
      if (n > 3) {
        break;
      }
      if (eg == 3) {
        if (sub == 0) {
          n = 2;
        }
      }
      s += gr5[n];
      break;
    }
    case 6:
      if (eg < gr6.length) {
        s += gr6[eg];
        break;
      } else {
        break;
      }
    case kSkillSettersCall: {
      s += e.settersCall.substring(0, 2); // setters call
      break;
    }
    case 250: {
      break;
    }
  }
  return s;
}

export function DVEventString(e) {
  if (e.DVGrade === undefined) {
    // PSVB
  } else {
    var sc =
      e.settersCall != undefined && e.settersCall.length >= 2
        ? e.settersCall.substring(0, 2)
        : "";
    if (e.EventType == kSubstitution) {
      var sub = null;
      var substr = sub == null ? "" : "";
      return e.EventString;
    } else if (e.EventType == kSkillSpike) {
      const aitems = ["", "H", "M", "Q", "T", "U", "F", "O"];
      var sse = "";
      if (
        e.SubEvent !== undefined &&
        e.SubEvent < aitems.length &&
        e.SubEvent >= 0
      ) {
        sse = aitems[e.SubEvent];
      } else {
        sse = "?";
      }
      return (
        e.DVGrade +
        " " +
        e.EventString +
        " - " +
        e.attackCombo +
        " - " +
        sc +
        " - " +
        e.ExtraCode1 +
        " " +
        sse +
        " - " +
        e.NumberOfBlocks
      );
    } else if (e.EventType == kSkillSettersCall) {
      return e.DVGrade + " " + e.EventString + " - " + sc;
    } else {
      return e.DVGrade + " " + e.EventString;
    }
  }
}
