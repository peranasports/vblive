import React from "react";
import { eventString, DVEventString } from "../utils/DVWFile";
import { getEventDescription } from "../utils/PSVBFile";
import { QueueListIcon, DocumentMinusIcon } from "@heroicons/react/24/solid";
import { getEventInfo, getEventStringColor } from "../utils/Utils";
import { DocumentPlusIcon } from "@heroicons/react/24/outline";
function EventItem({ event, isSelected, onEventSelected }) {
  const [,forceUpdate] = React.useState(0);

  const doEventSelect = () => {
    onEventSelected(event);
  };

  const background = () => {
    if (isSelected === false) {
      return "rounded-none card-compact p-1 border border-base-300 text-base-content bg-base-100 hover:bg-base-200 hover:opacity-75 cursor-pointer";
    } else {
      return "rounded-none card-compact p-1 border border-base-300 text-accent-content bg-accent hover:bg-accent-focus hover:opacity-75 cursor-pointer";
    }
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

  const doGetEventInfo = (e) => {
    const ss = getEventInfo(e);
    var stxt = "pl-2 pt-1 text-sm font-semibold " + ss.subcolor;
    return <p className={stxt}>{ss.sub}</p>;
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

  const togglePlaylist = () => {
    event.playlist = event.playlist ? false : true;
    forceUpdate((n) => !n);
  };

  return (
    <div className={background()} onClick={() => doEventSelect()}>
      <div className="">
        {isHomePlayer(event) ? (
          <div
            className={
              isSelected ? "text-left bg-accent-focus" : "text-left bg-base-200"
            }
          >
            <p className="pl-2 text-sm font-semibold text-base-content">
              {event.Player.shirtNumber}. {event.Player.NickName.toUpperCase()}
            </p>
          </div>
        ) : (
          <div
            className={
              isSelected
                ? "text-right bg-accent-focus"
                : "text-left bg-base-200"
            }
          >
            {event.Player ? (
              <p className="pr-2 text-sm font-semibold text-base-content">
                {event.Player.shirtNumber}.{" "}
                {event.Player.NickName.toUpperCase()}
              </p>
            ) : (
              <></>
            )}
          </div>
        )}
        <div className="flex justify-between">
          <div className="flex gap-1 mt-1">
            {event.DVGrade === undefined ? (
              doGetEventInfo(event)
            ) : (
              <div className="flex gap-1 text-sm">
                <p className={getEventStringColor(event)}>
                  {DVEventString(event)}
                </p>
              </div>
            )}
            {event.radar === null || event.radar === undefined ? (
              <></>
            ) : (
              <div className="badge badge-info gap-2 mt-1 mx-2">
                {event.radar.speed}
              </div>
            )}
          </div>
          <div className="flex gap-1 mr-1">
            <p className="pr-2 pt-1 text-sm font-semibold">
              [ {event.Drill.GameNumber} ] {event.TeamScore}-
              {event.OppositionScore} R{event.Row}
            </p>
            {event.playlist ? (
              <div className="tooltip tooltip-left" data-tip="Remove from play list">
                <DocumentMinusIcon
                  className="w-6 h6 text-warning mt-1"
                  onClick={() => togglePlaylist()}
                />
              </div>
            ) : (
              <div className="tooltip tooltip-left" data-tip="Add to play list">
                <DocumentPlusIcon
                  className="w-6 h6 text-base-content mt-1"
                  onClick={() => togglePlaylist()}
                />
              </div>
            )}
          </div>
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
