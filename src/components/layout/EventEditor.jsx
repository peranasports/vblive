import React, { useEffect, useState } from "react";
import EventDetailSelector from "./EventDetailSelector";
import {
  kSkillServe,
  kSkillPass,
  kSkillSet,
  kSkillAttack,
  kSkillBlock,
  kSkillCover,
  kSkillDefense,
  kSkillFreeball,
  kSkillSpike,
} from "../utils/Constants";

function EventEditor({
  isPortrait,
  event,
  isCurrentEvent,
  team,
  onPlayerChanged,
  onSkillChanged,
  onSubskillChanged,
  onSetterCallsChanged,
  onAttackCombosChanged,
  onBlocksChanged,
  onGradeChanged,
}) {
  const [players, setPlayers] = useState([]);
  const [sortedAttackCombos, setSortedAttackCombos] = useState([]);
  const [sortedSetterCalls, setSortedSetterCalls] = useState([]);
  const [useDVAnnotations, setUseDVAnnotations] = useState(true);
  // const skills = [
  //   "Serve",
  //   "Pass",
  //   "Set",
  //   "Attack",
  //   "Block",
  //   "Dig",
  //   "Freeball",
  //   "Cover",
  // ];
  const skills = useDVAnnotations
    ? ["S", "R", "E", "A", "B", "D", "F", "C"]
    : ["SER", "REC", "SET", "ATT", "BLK", "DIG", "FRB", "COV"];

  const dvgrades = ["=", "/", "!", "-", "+", "#"];
  // var gr1 = ["Error", "S1", "S2", "Ace", "S3", "Speed"];
  // var gr1err = ["", "Net", "Out Long", "Out Side"];
  // var gr2 = ["Error", "P1", "P2", "P3"];
  // var gr3 = ["Error", "", "Set Assist", ""];
  // var gr4 = ["Error", "In Play", "In Play", "Kill"];
  // var gr4err = ["", "Out", "Blocked", "Net", "Net Touch"];
  // var gr5 = ["Error", "Control", "Solo", "Block Assist"];
  // var gr6 = ["BHE", "Dig", "Dig 2", "Dig 3"];
  // var hr = ["", "Off-speed", "Dump", "Power", "Off-Block"];
  // var sr = ["", "Jump", "Jump-Float", "Float", "Topspin"];
  // var settypes = ["", "1", "2", "3", "4", "5"];

  const subskills = [
    [],
    ["Jump", "Jump-Float", "Float", "Topspin"],
    ["NA", "Left", "Midline", "Right"],
    ["Jump", "Standing", "Running"],
    ["Off-speed", "Dump", "Power", "Off-Block"],
    ["Control", "Solo", "Block Assist"],
    [],
    [],
    [],
  ];
  const grades = [
    [],
    ["=", "/", "!", "-", "+", "#"],
    ["=", "/", "!", "-", "+", "#"],
    ["=", "/", "!", "-", "+", "#"],
    ["=", "/", "!", "-", "+", "#"],
    ["=", "/", "!", "-", "+", "#"],
    ["=", "/", "!", "-", "+", "#"],
    ["=", "/", "!", "-", "+", "#"],
    ["=", "/", "!", "-", "+", "#"],
    ["=", "/", "!", "-", "+", "#"],
  ];
  const attackcombos = [
    " ~",
    "V5",
    "V6",
    "V8",
    "VP",
    "V0",
    "VB",
    "VR",
    "XO",
    "XQ",
    "XS",
    "X9",
    "XT",
    "X3",
    "X4",
    "XP",
    "X0",
    "XB",
    "XR",
    "X5",
    "X6",
    "X8",
    "X1",
    "X7",
    "X2",
    "XM",
    "XG",
    "XC",
    "XD",
    "XL",
    "CB",
    "CF",
    "CS",
    "PP",
  ];
  const settercalls = [" ~", "K1", "K2", "K7", "KM", "KS"];
  const blocks = ["B0", "B1", "B2", "B3", "BS", "BU"];

  // const getOutcomeIndex = (outcome) => {
  //   const serveoutcomes = [
  //     kServeIn,
  //     kServeFootfault,
  //     kServeAce,
  //     kServeWinner,
  //     kServeLet,
  //     kServeOut,
  //   ];
  //   const returnoutcomes = [
  //     kReturnIn,
  //     kReturnUnforcedError,
  //     kReturnForcingError,
  //     kReturnWinner,
  //   ];
  //   const rallyoutcomes = [
  //     kRallyOutcomeIn,
  //     kRallyOutcomeWinner,
  //     kRallyOutcomeUnforcedError,
  //     kRallyOutcomeForcingError,
  //     kRallyOutcomePassingShot,
  //     kRallyOutcomeOutPassingShot,
  //     kRallyOutcomeNetted,
  //     kRallyOutcomePutAway,
  //   ];

  //   if (event.skill === 0) {
  //     const idx = serveoutcomes.indexOf(outcome);
  //     return idx;
  //   } else if (event.skill === 1) {
  //     const idx = returnoutcomes.indexOf(outcome);
  //     return idx;
  //   } else if (event.skill === 2 || event.skill === 3) {
  //     const idx = rallyoutcomes.indexOf(outcome);
  //     return idx;
  //   }
  //   return 0;
  // };

  const doPlayerChanged = (selitem) => {
    const player = team.players.filter(
      (pl) => pl.shirtNumber.toString() === players[selitem]
    );
    onPlayerChanged({
      FirstName: player[0].FirstName,
      LastName: player[0].LastName,
      ShirtNumber: player[0].shirtNumber,
    });
  };

  const doSkillChanged = (selitem) => {
    event.EventType = selitem + 1;
    onSkillChanged(selitem + 1);
  };

  const doSubskillChanged = (selitem) => {
    event.SubEvent = selitem;
    onSubskillChanged(selitem);
  };

  const doSetterCallsChanged = (selitem) => {
    event.setterCall = sortedSetterCalls[selitem];
    onSetterCallsChanged(sortedSetterCalls[selitem]);
  };

  const doAttackCombosChanged = (selitem) => {
    event.attackCombo = sortedAttackCombos[selitem];
    onAttackCombosChanged(sortedAttackCombos[selitem]);
  };

  const doBlocksChanged = (selitem) => {
    event.NumberOfBlocks = blocks[selitem];
    onBlocksChanged(blocks[selitem]);
  };

  const doGradeChanged = (selitem) => {
    event.EventGrade = selitem;
    onGradeChanged(selitem);
  };

  const playerName = (player) => {
    const initial = player.FirstName
      ? player.FirstName.length === 0
        ? ""
        : player.FirstName.substring(0, 1) + "."
      : "";
    const playerLastName =
      player.LastName !== null ? player.LastName.toUpperCase() : "";
    return initial + " " + playerLastName;
  };

  const doInit = () => {
    var pls = [];
    for (var li of team.currentLineup) {
      pls.push(li.playerNumber.toString());
      if (li.subPlayer && pls.includes(li.subPlayer.shirtNumber) === false) {
        pls.push(li.subPlayer.shirtNumber.toString());
      }
    }
    // for (var pl of team.players) {
    //   pls.push(pl.shirtNumber.toString());
    // }
    setPlayers(pls);
    setSortedAttackCombos(attackcombos.sort());
    setSortedSetterCalls(settercalls.sort());
  };

  useEffect(() => {
    if (team) {
      doInit();
    }
  }, [event]);

  if (event === null) {
    return <></>;
  }

  return (
    <>
      <div className="flex-col space-y-1 bg-base-100 rounded-md">
        {isPortrait ? (
          <>
            <div className="w-full">
              <EventDetailSelector
                items={players}
                selectedItem={players.indexOf(event.player.ShirtNumber)}
                onSelectionChanged={(selitem) => doPlayerChanged(selitem)}
              />
            </div>
            <div className="w-full">
              <EventDetailSelector
                items={skills}
                selectedItem={event.EventType - 1}
                // selectedSubitem={
                //   event.skill === 0 ? event.subskill1 : event.hand
                // }
                onSelectionChanged={(selitem) => doSkillChanged(selitem)}
              />
            </div>
            <div className="w-full">
              <EventDetailSelector
                items={grades[event.EventType]}
                selectedItem={event.EventGrade}
                onSelectionChanged={(selitem) => doGradeChanged(selitem)}
              />
            </div>
          </>
        ) : (
          <>
            {/* <div className="flex gap-2 w-full"> */}
            <div className="">
              <EventDetailSelector
                items={players}
                selectedItem={players.indexOf(
                  event.player.ShirtNumber.toString()
                )}
                onSelectionChanged={(selitem) => doPlayerChanged(selitem)}
              />
            </div>
            <div className="">
              <EventDetailSelector
                items={skills}
                selectedItem={event.EventType - 1}
                // selectedSubitem={
                //   event.skill === 0 ? event.subskill1 : event.hand
                // }
                onSelectionChanged={(selitem) => doSkillChanged(selitem)}
              />
            </div>
            {/* </div> */}
          </>
        )}
        <div className="w-full">
          <EventDetailSelector
            items={subskills[event.EventType]}
            selectedItem={event.SubEvent}
            onSelectionChanged={(selitem) => doSubskillChanged(selitem)}
            // isDisabled={!isCurrentEvent}
          />
        </div>
        {event.EventType === kSkillSet ? (
          <div className="w-full">
            <EventDetailSelector
              items={sortedSetterCalls}
              selectedItem={sortedSetterCalls.indexOf(event.setterCall)}
              onSelectionChanged={(selitem) => doSetterCallsChanged(selitem)}
            />
          </div>
        ) : (
          <></>
        )}
        {event.EventType === kSkillSpike ? (
          <>
            <div className="w-full">
              <EventDetailSelector
                items={blocks}
                selectedItem={blocks.indexOf(event.NumberOfBlocks)}
                onSelectionChanged={(selitem) => doBlocksChanged(selitem)}
              />
            </div>
            <div className="w-full">
              <EventDetailSelector
                items={sortedAttackCombos}
                selectedItem={sortedAttackCombos.indexOf(event.attackCombo)}
                onSelectionChanged={(selitem) => doAttackCombosChanged(selitem)}
              />
            </div>
          </>
        ) : (
          <></>
        )}
        {/* <div className="w-full">
          <EventDetailSelector
            items={grades[event.EventType]}
            selectedItem={event.EventGrade}
            onSelectionChanged={(selitem) => doGradeChanged(selitem)}
          />
        </div> */}
      </div>
    </>
  );
}

export default EventEditor;
