import { useState, useEffect } from "react";
import EventItem from "./EventItem";

function EventsList({
  matches,
  team,
  filters,
  selectedSet,
  doSelectEvent,
  onFilter,
  collapseAll,
}) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedPlayerNames, setSelectedPlayerNames] = useState(null);
  const [selectedEventTypes, setSelectedEventTypes] = useState(null);
  const [selectedEventResults, setSelectedEventResults] = useState(null);
  const [selectedJumpHeights, setSelectedJumpHeights] = useState(null);
  const [collapseData, setCollapseData] = useState(null);
  const [, forceUpdate] = useState(0);

  const onEventSelected = (ev) => {
    setSelectedEvent(ev);
    doSelectEvent(ev);
  };

  const doFilters = () => {
    var plnames = [];
    if (
      filters.teamAPlayers.length === 1 &&
      filters.teamAPlayers[0].value === 0
    ) {
      for (var match of matches) {
        const tm = team === match.teamA.Name ? match.teamA : match.teamB;
        for (var pl of tm.players) {
          const plname = pl.FirstName + " " + pl.LastName.toUpperCase();
          if (plnames.includes(plname) === false) {
            plnames.push(plname);
          }
        }
      }
    } else {
      for (var nta = 0; nta < filters.teamAPlayers.length; nta++) {
        plnames.push(filters.teamAPlayers[nta].guid);
      }
    }
    if (
      filters.teamBPlayers.length === 1 &&
      filters.teamBPlayers[0].value === 0
    ) {
      for (var match of matches) {
        const tm = team === match.teamA.Name ? match.teamB : match.teamA;
        for (var pl of tm.players) {
          const plname = pl.FirstName + " " + pl.LastName.toUpperCase();
          if (plnames.includes(plname) === false) {
            plnames.push(plname);
          }
        }
      }
    } else {
      for (var nta = 0; nta < filters.teamBPlayers.length; nta++) {
        plnames.push(filters.teamBPlayers[nta].guid);
      }
    }
    setSelectedPlayerNames(plnames);

    var games = [];
    if (filters.games.length === 1 && filters.games[0].value === 0) {
      for (var match of matches) {
        for (var ng = 1; ng <= match.sets.length; ng++) {
          if (games.includes(ng) === false) {
            games.push(ng);
          }
        }
      }
    } else {
      for (var nta = 0; nta < filters.games.length; nta++) {
        games.push(filters.games[nta].value);
      }
    }

    var rotations = [];
    if (filters.rotations.length === 1 && filters.rotations[0].value === 0) {
      for (var nr = 1; nr <= 6; nr++) {
        rotations.push(nr);
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

    var mes = [];
    for (var match of matches) {
      for (var ns = 0; ns < match.sets.length; ns++) {
        var fes = [];
        var s = match.sets[ns];
        for (var ne = 0; ne < s.events.length; ne++) {
          const e = s.events[ne];
          if (games.includes(e.Drill.GameNumber) === false) continue;
          if (rotations.includes(e.Row) === false) continue;
          if (
            e.Player &&
            plnames.includes(
              e.Player.FirstName + " " + e.Player.LastName.toUpperCase()
            ) === false
          )
            continue;
          if (eventtypes.includes(e.EventType) === false) continue;
          if (eventresults.includes(e.DVGrade) === false) continue;
          if (eventtypes.includes(20) && e.EventType === 20) {
            if (
              settercalls.includes(e.settersCall.substring(0, 2)) === false &&
              settercalls.includes("All Calls") === false
            ) {
              continue;
            }
          } else if (eventtypes.includes(4) && e.EventType === 4) {
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

            if (
              attackcombos.includes(e.attackCombo) === false &&
              attackcombos.includes("All Combos") === false
            ) {
              continue;
            }

            if (
              settercalls.includes(e.settersCall.substring(0, 2)) === false &&
              settercalls.includes("All Calls") === false
            ) {
              continue;
            }

            var ht = e.SubEvent;
            if (ht > 6) ht = 6;
            if (
              hittypes.includes(ht) === false &&
              hittypes.includes(0) === false
            )
              continue;

            var bt = e.ExtraCode2 === "~" ? 5 : Number.parseInt(e.ExtraCode2);
            if (
              blocktypes.includes(bt) === false &&
              blocktypes.includes(6) === false
            )
              continue;
          }
          fes.push(e);
          mes.push(e);
        }
        s.filteredEvents = fes;
      }
    }
    onFilter(mes);
  };

  useEffect(() => {
    if (filters !== undefined && filters !== null) {
      doFilters();
    } else {
      for (var match of matches) {
        for (var ns = 0; ns < match.sets.length; ns++) {
          var s = match.sets[ns];
          s.filteredEvents = s.events;
        }
      }
    }
  }, [filters, matches]);

  useEffect(() => {
    var cd = {};
    for (var match of matches) {
      for (var ns = 0; ns < match.sets.length; ns++) {
        var s = cd[match.guid];
        if (!s) {
          s = [false];
          for (var i = 0; i < match.sets.length; i++) {
            s.push(collapseAll);
          }
          cd[match.guid] = s;
        }
      }
      setCollapseData(cd);
    }
  }, [collapseAll]);

  useEffect(() => {}, [collapseData]);

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
        // block: "nearest",
        // inline: "start",
      });
    }
    forceUpdate((n) => !n);
  }, [selectedSet]);

  if (
    matches === undefined ||
    matches[0].sets[0].filteredEvents === undefined
  ) {
    return <></>;
  }

  const isCollapse = (match, set) => {
    if (collapseData === null) return false;
    if (!set) {
      return collapseData[match.guid][0];
    }
    return collapseData[match.guid][set.GameNumber];
  };

  const matchDesc = (match) => {
    if (team === match.teamA.Name) {
      return "(H) " + match.teamB.Name;
    } else {
      return "(A) " + match.teamA.Name;
    }
  };

  const showSetEvents = (match, id) => {
    return (
      <>
        {match.sets.map((set, sid) => (
          <details
            key={sid}
            open={!isCollapse(match, set)}
            className="bg-base-200"
            id={sid + 1}
          >
            <summary className="font-bold text-md ml-7">
              <a className="px-2">
                {" "}
                SET {set.GameNumber} ({set.HomeScore} - {set.AwayScore})
              </a>
            </summary>
            <div>
              {set.filteredEvents.map((event, eid) => (
                <EventItem
                  key={eid}
                  event={event}
                  isSelected={event === selectedEvent}
                  onEventSelected={(ev) => onEventSelected(ev)}
                />
              ))}
            </div>
            {/* </div> */}
          </details>
        ))}
      </>
    );
  };

  return (
    <>
      <div className="bg-base-300">
        {matches.length > 1 ? (
          <>
            {matches &&
              matches.map((match, mid) => (
                <details key={mid} open={!isCollapse(match, null)} className="">
                  <summary className="font-bold text-md p-1 h-6">
                    {matchDesc(match)}
                    {/* <div className="">{matchDesc(match)}</div>
                    <div className="">
                      {match.HomeScore} - {match.AwayScore}
                    </div> */}
                  </summary>
                  <div className="flex justify-between h-6">
                    <div className="flex ml-10 mb-1 font-medium text-md">
                      {match.TrainingDate.toLocaleDateString()}
                    </div>
                    <div className="flex mr-1 mb-1 font-medium text-md">
                      {match.HomeScore} - {match.AwayScore}
                    </div>
                  </div>
                  <div>{showSetEvents(match, mid)}</div>
                </details>
              ))}
          </>
        ) : (
          showSetEvents(matches[0], 0)
        )}
      </div>
    </>
  );
}

export default EventsList;
