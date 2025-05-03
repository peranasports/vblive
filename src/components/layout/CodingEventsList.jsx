import React, { useEffect } from "react";
import { getEventResult, playerInitialAndName } from "../utils/Utils";
import { DVEventString } from "../utils/DVWFile";

function CodingEventsList({
  events,
  sizeEventsList,
  selectedEvent,
  onEventSelected,
}) {
  const [thisSelectedEvent, setThisSelectedEvent] =
    React.useState(selectedEvent);
  const [, forceUpdate] = React.useState(0);

  const doSelectEvent = (evt) => {
    setThisSelectedEvent(evt);
    onEventSelected(evt);
    forceUpdate((n) => !n);
  };

  useEffect(() => {
    setThisSelectedEvent(selectedEvent);
  }, [selectedEvent]);

  useEffect(() => {
    const elem = document.activeElement;
    if (elem) {
      elem?.blur();
    }
    const index = events.findIndex((evt) => evt === thisSelectedEvent);
    const element = document.getElementById(index);
    if (element) {
      // 👇 Will scroll smoothly to the top of the next section
      element.scrollIntoView({
        behavior: "smooth",
        // block: "nearest",
        // inline: "start",
      });
    }
    forceUpdate((n) => !n);
  }, [thisSelectedEvent]);

  const eventClassName = (event) => {
    var str =
      selectedEvent === event
        ? "bg-primary/50 flex-col p-1 cursor-pointer w-full"
        : "bg-base-100 flex-col p-1 cursor-pointer w-full";
    const res = getEventResult(event);
    if (res !== 0) {
      str += " border-b border-base-content";
    } else {
      str += " border-b border-base-300";
    }
    return str;
  };

  return (
    <>
      <div
        className="bg-base-100 overflow-y-scroll border-2 border-base-300 p-1"
        style={{ height: `${sizeEventsList?.height}px` }}
      >
        {events &&
          events
            .sort((a, b) => b.timestampseconds - a.timestampseconds)
            .map((evt, index) => (
              <div className="flex mt-0.5">
                <div
                  className="w-1"
                  style={{ backgroundColor: evt.teamColour }}
                ></div>
                <div
                  className={
                    eventClassName(evt)
                    // selectedEvent === evt
                    //   ? "bg-primary/50 flex-col p-1 border-b border-base-300 cursor-pointer w-full"
                    //   : "bg-base-100 flex-col p-1 border-b border-base-300 cursor-pointer w-full"
                  }
                  id={index}
                  key={index}
                  onClick={() => doSelectEvent(evt)}
                >
                  <div className="flex justify-between">
                    <div className="font-medium text-xs">
                      {playerInitialAndName(evt)}
                    </div>
                    <div className="font-medium text-xs">
                      {evt.TeamScore} - {evt.OppositionScore}
                      {/* {realGameScores(evt)} */}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="font-normal text-xs">
                      {/* {eventTypes[evt.skill]} */}
                      {DVEventString(evt)}
                    </div>
                    <div className="text-xs">R{evt.Row}</div>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </>
  );
}

export default CodingEventsList;
