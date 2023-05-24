import React from "react";
import { eventString, DVEventString } from "../utils/DVWFile";
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
} from "../utils/StatsItem";

function EventItem({ event, isSelected, onEventSelected }) {
  const doEventSelect = () => {
    onEventSelected(event);
  };

  const background = () => {
    if (isSelected === false) {
      return "mb-2 rounded-xl card-compact bg-gray-700 hover:bg-base-300";
    } else {
      return "mb-2 rounded-xl card-compact bg-blue-800 hover:bg-blue-900";
    }
  };

  const getEventStringColor = (e) => {
    var s = "pl-2 pt-1 text-sm font-semibold";
    if (e.EventType === 20 || e.EventType === 250) {
      s += " text-gray-600";
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
  };

  const getLandingImpact = (ev) => {
    if (ev.vertData.landingpeakgs !== undefined) {
      var cn = "badge badge-error gap-2";
      if (ev.vertData.landingpeakgs < 10) {
        cn = "badge badge-success gap-2";
      } else if (ev.vertData.landingpeakgs < 20) {
        cn = "badge badge-warning gap-2";
      }
      return { value: ev.vertData.landingpeakgs, classname: cn };
    } else {
      return { value: "", className: "" };
    }
  };

  const getEventInfo = (e) => {
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
    var stxt = "pl-2 pt-1 text-sm font-semibold " + subcolor;
    return <p className={stxt}>{sub}</p>;
  };

  const isHomePlayer = (e) => {
    if (e.Player) {
      if (e.dvString !== undefined) {
        return e.dvString.substring(0, 1) === "*";
      } else {
        return e.homePlayer;
      }
    } else {
      return false;
    }
  };

  return (
    <div className={background()} onClick={() => doEventSelect()}>
      <div className="">
        {isHomePlayer(event) ? (
          <div className="text-left bg-gray-900 text-gray-500">
            <p className="pl-2 text-md font-semibold">
              {event.Player.shirtNumber}. {event.Player.NickName.toUpperCase()}
            </p>
          </div>
        ) : (
          <div className="text-right bg-gray-900 text-gray-500">
            {event.Player ? (
              <p className="pr-2 text-md font-semibold">
                {event.Player.shirtNumber}.{" "}
                {event.Player.NickName.toUpperCase()}
              </p>
            ) : (
              <></>
            )}
          </div>
        )}
        <div className="flex justify-between">
          <div className="flex gap-1">
            {event.DVGrade === undefined ? (
              getEventInfo(event)
            ) : (
              <p className={getEventStringColor(event)}>
                {DVEventString(event)}
              </p>
            )}
            {event.radar === null || event.radar === undefined ? (
              <></>
            ) : (
              <div className="badge badge-info gap-2 mt-1 mx-2">
                {event.radar.speed}
              </div>
            )}
          </div>
          <p className="pr-2 pt-1 text-sm font-semibold">
            ({event.Drill.GameNumber}) {event.TeamScore}-{event.OppositionScore}{" "}
            R{event.Row}
          </p>
        </div>
        {event.vertData === undefined ? (
          <></>
        ) : (
          <div className="flex pb-2">
            <div className="badge badge-info gap-2 mx-2">
              {event.vertData.vertinches.toFixed(1)}"
            </div>
            <div className={getLandingImpact(event).classname}>
              {getLandingImpact(event).value}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventItem;
