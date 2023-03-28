import { useState, useEffect } from "react";
import EventItem from "./EventItem";

function EventsList({ match, filters, selectedSet, doSelectEvent }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedGuids, setSelectedGuids] = useState(null);
  const [selectedEventTypes, setSelectedEventTypes] = useState(null);
  const [selectedEventResults, setSelectedEventResults] = useState(null);
  const [selectedJumpHeights, setSelectedJumpHeights] = useState(null);

  const onEventSelected = (ev) => {
    setSelectedEvent(ev);
    doSelectEvent(ev);
  };

  const doFilters = () => {
    var guids = [];
    if (
      filters.teamAPlayers.length === 1 &&
      filters.teamAPlayers[0].value === 0
    ) {
      for (var nta = 0; nta < match.teamA.players.length; nta++) {
        guids.push(match.teamA.players[nta].Guid);
      }
    } else {
      for (var nta = 0; nta < filters.teamAPlayers.length; nta++) {
        guids.push(filters.teamAPlayers[nta].guid);
      }
    }
    if (
      filters.teamBPlayers.length === 1 &&
      filters.teamBPlayers[0].value === 0
    ) {
      for (var nta = 0; nta < match.teamB.players.length; nta++) {
        guids.push(match.teamB.players[nta].Guid);
      }
    } else {
      for (var nta = 0; nta < filters.teamBPlayers.length; nta++) {
        guids.push(filters.teamBPlayers[nta].guid);
      }
    }
    setSelectedGuids(guids);

    var games = []
    if (
      filters.games.length === 1 &&
      filters.games[0].value === 0
    ) {
      for (var ng=1; ng<=match.sets.length; ng++)
      {
        games.push(ng)
      }
    } else {
      for (var nta = 0; nta < filters.games.length; nta++) {
        games.push(filters.games[nta].value);
      }
    }

    var rotations = []
    if (
      filters.rotations.length === 1 &&
      filters.rotations[0].value === 0
    ) {
      for (var nr=1; nr<=6; nr++)
      {
        rotations.push(nr)
      }
    } else {
      for (var nta = 0; nta < filters.rotations.length; nta++) {
        rotations.push(filters.rotations[nta].value);
      }
    }

    var eventtypes = [];
    if (filters.eventTypes.length === 1 && filters.eventTypes[0].value === 0) {
      for (var nta = 1; nta < 6; nta++) {
        eventtypes.push(nta);
      }
    } else if (
      filters.eventTypes.length === 1 &&
      filters.eventTypes[0].value === 1000
    ) {
      eventtypes.push(1);
      eventtypes.push(3);
      eventtypes.push(4);
      eventtypes.push(5);
      eventtypes.push(20);
    } else {
      for (var nta = 0; nta < filters.eventTypes.length; nta++) {
        eventtypes.push(filters.eventTypes[nta].value);
      }
    }

    var eventresults = [];
    if (
      filters.eventResults.length === 1 &&
      filters.eventResults[0].value === 0
    ) {
      eventresults.push("=");
      eventresults.push("/");
      eventresults.push("-");
      eventresults.push("!");
      eventresults.push("+");
      eventresults.push("#");
    } else {
      for (var nta = 0; nta < filters.eventResults.length; nta++) {
        eventresults.push(filters.eventResults[nta].label);
      }
    }

    var hittypes = [];
    for (var nta = 0; nta < filters.hitTypes.length; nta++) {
      hittypes.push(filters.hitTypes[nta].value);
    }

    var attacktypes = [];
    for (var nta = 0; nta < filters.attackTypes.length; nta++) {
      attacktypes.push(filters.attackTypes[nta].value);
    }

    var blocktypes = [];
    for (var nta = 0; nta < filters.blockTypes.length; nta++) {
      blocktypes.push(filters.blockTypes[nta].value);
    }

    var attackcombos = [];
    for (var nta = 0; nta < filters.attackCombos.length; nta++) {
      attackcombos.push(filters.attackCombos[nta].label);
    }

    var settercalls = [];
    for (var nta = 0; nta < filters.setterCalls.length; nta++) {
      settercalls.push(filters.setterCalls[nta].label);
    }

    for (var ns = 0; ns < match.sets.length; ns++) {
      var fes = [];
      var s = match.sets[ns];
      for (var ne = 0; ne < s.events.length; ne++) {
        const e = s.events[ne];
        if (games.includes(e.Drill.GameNumber) === false) continue;
        if (rotations.includes(e.Row) === false) continue;
        if (guids.includes(e.Player.Guid) === false) continue;
        if (eventtypes.includes(e.EventType) === false) continue;
        if (eventresults.includes(e.DVGrade) === false) continue;
        if (eventtypes.includes(20) && e.EventType === 20) {
          if ((settercalls.includes(e.settersCall.substring(0, 2)) === false) && 
              (settercalls.includes("All Calls") === false))
          {
            continue
          }
        }
        else if (eventtypes.includes(4) && e.EventType === 4) {
          const ats = ["", "H", "P", "T", ""];
          const at = ats.indexOf(e.ExtraCode1);
          if (at === -1) {
            if (attacktypes.includes(0) === false) {
              continue;
            }
          } else if (
            attacktypes.includes(ht) === false &&
            attacktypes.includes(0) === false
          )
            continue;

          if ((attackcombos.includes(e.attackCombo) === false) &&
              (attackcombos.includes("All Combos") === false))
          {
            continue
          }

          if ((settercalls.includes(e.settersCall.substring(0, 2)) === false) && 
              (settercalls.includes("All Calls") === false))
          {
            continue
          }

          var ht = e.SubEvent;
          if (ht > 6) ht = 6;
          if (hittypes.includes(ht) === false && hittypes.includes(0) === false)
            continue;

          var bt = e.ExtraCode2 === "~" ? 5 : Number.parseInt(e.ExtraCode2);
          if (
            blocktypes.includes(bt) === false &&
            blocktypes.includes(6) === false
          )
            continue;
        }

        fes.push(e);
      }
      s.filteredEvents = fes;
    }
  };

  useEffect(() => {
    if (filters !== undefined && filters !== null) {
      doFilters();
    } else {
      for (var ns = 0; ns < match.sets.length; ns++) {
        var s = match.sets[ns];
        s.filteredEvents = s.events;
      }
    }
  }, [filters, match]);

  useEffect(() => {
    const elem = document.activeElement;
    if (elem) {
      elem?.blur();
    }
    const element = document.getElementById(selectedSet);
    if (element) {
      // 👇 Will scroll smoothly to the top of the next section
      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  }, [selectedSet]);

  if (match === undefined || match.sets[0].filteredEvents === undefined) {
    return <></>;
  }

  return (
    <>
      <div className="bg-gray-800">
        {match.sets.map((set, id) => (
          <div
            key={id}
            tabIndex={0}
            className="collapse collapse-arrow collapse-open border border-base-300 bg-base-500"
          >
            <input type="checkbox" className="peer" />
            <div className="collapse-title">
              <div className="flex justify-between">
                <p>Set {id + 1}</p>
                <p>
                  {set.HomeScore} - {set.AwayScore}
                </p>
              </div>
            </div>
            <div className="collapse-content" id={set.GameNumber}>
              {set.filteredEvents.map((event, eid) => (
                <EventItem
                  key={eid}
                  event={event}
                  isSelected={event === selectedEvent}
                  onEventSelected={(ev) => onEventSelected(ev)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default EventsList;
