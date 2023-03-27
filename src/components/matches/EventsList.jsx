import { useState, useEffect } from "react";
import EventItem from "./EventItem";

function EventsList({ match, filters, selectedSet, doSelectEvent }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedGuids, setSelectedGuids] = useState(null)
  const [selectedEventTypes, setSelectedEventTypes] = useState(null)
  const [selectedEventResults, setSelectedEventResults] = useState(null)
  const [selectedJumpHeights, setSelectedJumpHeights] = useState(null)

  const onEventSelected = (ev) => {
    setSelectedEvent(ev);
    doSelectEvent(ev);
  };

  const doFilters = () =>
  {
    var guids = []
    if (filters.teamAPlayers.length === 1 && filters.teamAPlayers[0].value === 0)
    {
      for (var nta=0; nta<match.teamA.players.length; nta++)
      {
        guids.push(match.teamA.players[nta].Guid)
      }
    }
    else
    {
      for (var nta=0; nta<filters.teamAPlayers.length; nta++)
      {
        guids.push(filters.teamAPlayers[nta].guid)
      }
    }
    if (filters.teamBPlayers.length === 1 && filters.teamBPlayers[0].value === 0)
    {
      for (var nta=0; nta<match.teamB.players.length; nta++)
      {
        guids.push(match.teamB.players[nta].Guid)
      }
    }
    else
    {
      for (var nta=0; nta<filters.teamBPlayers.length; nta++)
      {
        guids.push(filters.teamBPlayers[nta].guid)
      }
    }
    setSelectedGuids(guids)

    var eventtypes = []
    if (filters.eventTypes.length === 1 && filters.eventTypes[0].value === 0)
    {
      for (var nta=1; nta<6; nta++)
      {
        eventtypes.push(nta)
      }
    }
    else if (filters.eventTypes.length === 1 && filters.eventTypes[0].value === 1000)
    {
      eventtypes.push(1)
      eventtypes.push(3)
      eventtypes.push(4)
      eventtypes.push(5)
      eventtypes.push(20)
    }
    else
    {
      for (var nta=0; nta<filters.eventTypes.length; nta++)
      {
        eventtypes.push(filters.eventTypes[nta].value)
      }
    }

    var eventresults = []
    if (filters.eventResults.length === 1 && filters.eventResults[0].value === 0)
    {
      eventresults.push("=")
      eventresults.push("-")
      eventresults.push("/")
      eventresults.push("+")
      eventresults.push("#")
    }
    else
    {
      for (var nta=0; nta<filters.eventResults.length; nta++)
      {
        eventresults.push(filters.eventResults[nta].label)
      }
    }

    var jumpheights = []
    for (var nta=0; nta<filters.jumpHeights.length; nta++)
    {
      jumpheights.push(filters.jumpHeights[nta].value)
    }

    var landingimpacts = []
    for (var nta=0; nta<filters.landingImpacts.length; nta++)
    {
      landingimpacts.push(filters.landingImpacts[nta].value)
    }


    for (var ns=0; ns<match.sets.length; ns++)
    {
      var fes = []
      var s = match.sets[ns]
      for (var ne=0; ne<s.events.length; ne++)
      {
        const e = s.events[ne]
        if (guids.includes(e.Player.Guid) === false) continue
        if (eventtypes.includes(e.EventType) === false) continue
        if (eventresults.includes(e.DVGrade) === false) continue
        if (e.vertData !== undefined)
        {
          const jh = Number.parseInt(e.vertData.vertinches / 10) + 1
          if (jumpheights.includes(jh) === false && jumpheights.includes(0) === false) continue;

          var li = Number.parseInt(e.vertData.landingpeakgs / 10) + 1
          if (li > 3) li = 3
          if (landingimpacts.includes(li) === false && landingimpacts.includes(0) === false) continue;
        }
        fes.push(e)
      }
      s.filteredEvents = fes
    }
  }

  useEffect(() => {
    if (filters !== undefined && filters !== null)
    {
      doFilters()
    }
    else
    {
      for (var ns=0; ns<match.sets.length; ns++)
      {
        var s = match.sets[ns]
        s.filteredEvents = s.events
      }
    }
  }, [filters, match])

  useEffect(() => {
    const element = document.getElementById(selectedSet);
    if (element) 
    {
      // 👇 Will scroll smoothly to the top of the next section
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedSet])

  if (match === undefined || match.sets[0].filteredEvents === undefined)
  {
    return <></>
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
                key = {eid}
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
