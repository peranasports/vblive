import React, { useEffect, useState } from "react";
import Select from "react-select";

function VideoFilters({
  matches,
  team,
  teamAPlayers,
  teamBPlayers,
  games,
  rotations,
  eventTypes,
  eventResults,
  attackTypes,
  hitTypes,
  blockTypes,
  attackCombos,
  setterCalls,
  allFilters,
  updated,
  onDoFilters,
  //   selectedTeamAPlayers,
  //   selectedTeamBPlayers,
  //   selectedGames,
  //   selectedRotations,
  //   selectedEventTypes,
  //   selectedEventResults,
  //   selectedAttackTypes,
  //   selectedHitTypes,
  //   selectedBlockTypes,
  //   selectedAttackCombos,
  //   selectedSetterCalls,
}) {
  const [, forceUpdate] = useState(0);
  const [selectedTeamAPlayers, setSelectedTeamAPlayers] = useState([]);
  const [selectedTeamBPlayers, setSelectedTeamBPlayers] = useState([]);
  const [selectedGames, setSelectedGames] = useState([]);
  const [selectedRotations, setSelectedRotations] = useState([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState([]);
  const [selectedEventResults, setSelectedEventResults] = useState([]);
  const [selectedAttackTypes, setSelectedAttackTypes] = useState([]);
  const [selectedHitTypes, setSelectedHitTypes] = useState([]);
  const [selectedBlockTypes, setSelectedBlockTypes] = useState([]);
  const [selectedAttackCombos, setSelectedAttackCombos] = useState([]);
  const [selectedSetterCalls, setSelectedSetterCalls] = useState([]);

  useEffect(() => {
    setSelectedTeamAPlayers(allFilters ? allFilters.teamAPlayers : []);
    setSelectedTeamBPlayers(allFilters ? allFilters.teamBPlayers : []);
    setSelectedGames(allFilters ? allFilters.games : []);
    setSelectedRotations(allFilters ? allFilters.rotations : []);
    setSelectedEventTypes(allFilters ? allFilters.eventTypes : []);
    setSelectedEventResults(allFilters ? allFilters.eventResults : []);
    setSelectedAttackTypes(allFilters ? allFilters.attackTypes : []);
    setSelectedHitTypes(allFilters ? allFilters.hitTypes : []);
    setSelectedBlockTypes(allFilters ? allFilters.blockTypes : []);
    setSelectedAttackCombos(allFilters ? allFilters.attackCombos : []);
    setSelectedSetterCalls(allFilters ? allFilters.setterCalls : []);
    forceUpdate((n) => !n);
  }, [allFilters, updated]);

  const doFilters = () => {
    onDoFilters({
      teamAPlayers: selectedTeamAPlayers,
      teamBPlayers: selectedTeamBPlayers,
      eventTypes: selectedEventTypes,
      eventResults: selectedEventResults,
      attackTypes: selectedAttackTypes,
      hitTypes: selectedHitTypes,
      blockTypes: selectedBlockTypes,
      attackCombos: selectedAttackCombos,
      setterCalls: selectedSetterCalls,
      games: selectedGames,
      rotations: selectedRotations,
    });
  };

  function handleSelectEventTypes(data) {
    if (data.length === 0) {
      setSelectedEventTypes(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedEventTypes(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedEventTypes([data[data.length - 1]]);
      return;
    }
    setSelectedEventTypes(data);
  }

  function handleSelectGames(data) {
    if (data.length === 0) {
      setSelectedGames(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedGames(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedGames([data[data.length - 1]]);
      return;
    }
    setSelectedGames(data);
  }

  function handleSelectRotations(data) {
    if (data.length === 0) {
      setSelectedRotations(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedRotations(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedRotations([data[data.length - 1]]);
      return;
    }
    setSelectedRotations(data);
  }

  function handleSelectEventResults(data) {
    if (data.length === 0) {
      setSelectedEventResults(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedEventResults(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedEventResults([data[data.length - 1]]);
      return;
    }
    setSelectedEventResults(data);
  }

  function handleSelectAttackTypes(data) {
    if (data.length === 0) {
      setSelectedAttackTypes(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedAttackTypes(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedAttackTypes([data[data.length - 1]]);
      return;
    }
    setSelectedAttackTypes(data);
  }

  function handleSelectHitTypes(data) {
    if (data.length === 0) {
      setSelectedHitTypes(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedHitTypes(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedHitTypes([data[data.length - 1]]);
      return;
    }
    setSelectedHitTypes(data);
  }

  function handleSelectBlockTypes(data) {
    if (data.length === 0) {
      setSelectedBlockTypes(data);
      return;
    }
    if (data[0].value === 6 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedBlockTypes(ddd);
      return;
    } else if (data[data.length - 1].value === 6 && data.length > 1) {
      setSelectedBlockTypes([data[data.length - 1]]);
      return;
    }
    setSelectedBlockTypes(data);
  }

  function handleSelectAttackCombos(data) {
    if (data.length === 0) {
      setSelectedAttackCombos(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedAttackCombos(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedAttackCombos([data[data.length - 1]]);
      return;
    }
    setSelectedAttackCombos(data);
  }

  function handleSelectSetterCalls(data) {
    if (data.length === 0) {
      setSelectedSetterCalls(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedSetterCalls(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedSetterCalls([data[data.length - 1]]);
      return;
    }
    setSelectedSetterCalls(data);
  }

  function handleSelectTeamAPlayers(data) {
    if (data.length === 0) {
      setSelectedTeamAPlayers(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedTeamAPlayers(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedTeamAPlayers([data[data.length - 1]]);
      return;
    }
    setSelectedTeamAPlayers(data);
  }

  function handleSelectTeamBPlayers(data) {
    if (data.length === 0) {
      setSelectedTeamBPlayers(data);
      return;
    }
    if (data[0].value === 0 && data.length > 1) {
      var ddd = [];
      for (var nd = 1; nd < data.length; nd++) {
        ddd.push(data[nd]);
      }
      setSelectedTeamBPlayers(ddd);
      return;
    } else if (data[data.length - 1].value === 0 && data.length > 1) {
      setSelectedTeamBPlayers([data[data.length - 1]]);
      return;
    }
    setSelectedTeamBPlayers(data);
  }

  const getSelectedTheme = (theme) => {
return ({
      ...theme.colors,
      primary: "oklch(var(--p))",
      primary25: "oklch(var(--b3) / 0.5)",
      neutral0: "oklch(var(--b1))",
    });
  };

  const customStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      // height: 34,
      borderRadius: 6,
      backgroundColor: "oklch(var(--b2))",
      color: "oklch(var(--bc))",
      // backgroundColor: "rgba(255, 255, 255, 0.05)",
      // borderColor: state.isFocused ? "oklch(var(--p))" : "transparent",
      // ":hover": {
      //   borderColor: "transparent",
      // },
    }),
    clearIndicator: (baseStyles, state) => ({
      ...baseStyles,
      color: "oklch(var(--bc) / 0.5)",
      ":hover": { color: "oklch(var(--bc))" },
    }),
    dropdownIndicator: (baseStyles, state) => ({
      ...baseStyles,
      color: "oklch(var(--bc) / 0.5)",
      ":hover": { color: "oklch(var(--bc))" },
    }),
    valueContainer: (baseStyles, state) => ({
      ...baseStyles,
      padding: "0 8px",
    }),
    input: (baseStyles, state) => ({
      ...baseStyles,
      color: "oklch(var(--bc))",
    }),
    singleValue: (baseStyles, state) => ({
      ...baseStyles,
      color: "oklch(var(--bc))",
    }),
    multiValue: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: "oklch(var(--b2))",
    }),
    multiValueLabel: (baseStyles, state) => ({
      ...baseStyles,
      color: "oklch(var(--bc))",
    }),
    multiValueRemove: (baseStyles, state) => ({
      ...baseStyles,
      color: "oklch(var(--bc) / 0.5)",
      ":hover": {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        color: "oklch(var(--bc))",
      },
    }),
  };

  return (
    <div>
      <h3 className="mb-4 font-bold text-2xl">Filters</h3>
      <div className="form">
        <div className="my-4 text-base-content">
          <div className="flex justify-between mt-4">
            <div className="flex=col justify-between w-full mx-2">
              <p className="text-xs">
                {matches.length === 1 ? matches[0].teamA.Name : team} Players
              </p>
              <Select
                id="teamAPlayersSelect"
                name="teamAPlayersSelect"
                onChange={handleSelectTeamAPlayers}
                className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500text-sm"
                options={teamAPlayers}
                value={selectedTeamAPlayers}
                isMulti
                styles={customStyles}
                theme={theme => ({
                  ...theme,
                  colors: {
                    ...getSelectedTheme(theme),
                  }})}
              />
            </div>
            <div className="flex=col justify-between w-full mx-2">
              <p className="text-xs">
                {matches.length === 1 ? matches[0].teamB.Name : "Opponents"}{" "}
                Players
              </p>
              <Select
                id="teamBPlayersSelect"
                name="teamBPlayersSelect"
                onChange={handleSelectTeamBPlayers}
                className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500text-sm"
                options={teamBPlayers}
                value={selectedTeamBPlayers}
                isMulti
                styles={customStyles}
                theme={theme => ({
                  ...theme,
                  colors: {
                    ...getSelectedTheme(theme),
                  }})}
              />
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <div className="flex=col justify-between w-full mx-2">
              <p className="text-xs">Set</p>
              <Select
                id="gamesSelect"
                name="gamesSelect"
                onChange={handleSelectGames}
                className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500text-sm"
                options={games}
                value={selectedGames}
                isMulti
                styles={customStyles}
                theme={theme => ({
                  ...theme,
                  colors: {
                    ...getSelectedTheme(theme),
                  }})}
              />
            </div>

            <div className="flex=col justify-between w-full mx-2">
              <p className="text-xs">Rotation</p>
              <Select
                id="rotationsSelect"
                name="rotationsSelect"
                onChange={handleSelectRotations}
                className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500text-sm"
                options={rotations}
                value={selectedRotations}
                isMulti
                styles={customStyles}
                theme={theme => ({
                  ...theme,
                  colors: {
                    ...getSelectedTheme(theme),
                  }})}
              />
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <div className="flex=col justify-between w-full mx-2">
              <p className="text-xs">Event Type</p>
              <Select
                id="eventTypesSelect"
                name="eventTypesSelect"
                onChange={handleSelectEventTypes}
                className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500text-sm"
                options={eventTypes}
                value={selectedEventTypes}
                isMulti
                styles={customStyles}
                theme={theme => ({
                  ...theme,
                  colors: {
                    ...getSelectedTheme(theme),
                  }})}
              />
            </div>
            <div className="flex=col justify-between w-full mx-2">
              <p className="text-xs">Event Result</p>
              <Select
                id="eventResultsSelect"
                name="eventResultsSelect"
                onChange={handleSelectEventResults}
                className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500text-sm"
                options={eventResults}
                value={selectedEventResults}
                isMulti
                styles={customStyles}
                theme={theme => ({
                  ...theme,
                  colors: {
                    ...getSelectedTheme(theme),
                  }})}
              />
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <div className="flex=col justify-between w-full mx-2">
              <p className="text-xs">Attack Type</p>
              <Select
                id="attackTypesSelect"
                name="attackTypesSelect"
                onChange={handleSelectAttackTypes}
                className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500text-sm"
                options={attackTypes}
                value={selectedAttackTypes}
                isMulti
                styles={customStyles}
                theme={theme => ({
                  ...theme,
                  colors: {
                    ...getSelectedTheme(theme),
                  }})}
              />
            </div>
            <div className="flex=col justify-between w-full mx-2">
              <p className="text-xs">Hit Type</p>
              <Select
                id="hitTypesSelect"
                name="hitTypesSelect"
                onChange={handleSelectHitTypes}
                className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500text-sm"
                options={hitTypes}
                value={selectedHitTypes}
                isMulti
                styles={customStyles}
                theme={theme => ({
                  ...theme,
                  colors: {
                    ...getSelectedTheme(theme),
                  }})}
              />
            </div>
            <div className="flex=col justify-between w-full mx-2">
              <p className="text-xs">Block Type</p>
              <Select
                id="blockTypesSelect"
                name="blockTypesSelect"
                onChange={handleSelectBlockTypes}
                className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500text-sm"
                options={blockTypes}
                value={selectedBlockTypes}
                isMulti
                styles={customStyles}
                theme={theme => ({
                  ...theme,
                  colors: {
                    ...getSelectedTheme(theme),
                  }})}
              />
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <div className="flex=col justify-between w-full mx-2">
              <p className="text-xs">Attack Combo</p>
              <Select
                id="attackCombosSelect"
                name="attackCombosSelect"
                onChange={handleSelectAttackCombos}
                className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500text-sm"
                options={attackCombos}
                value={selectedAttackCombos}
                isMulti
                styles={customStyles}
                theme={theme => ({
                  ...theme,
                  colors: {
                    ...getSelectedTheme(theme),
                  }})}
              />
            </div>
            <div className="flex=col justify-between w-full mx-2">
              <p className="text-xs">Setter's Call</p>
              <Select
                id="setterCallsSelect"
                name="setterCallsSelect"
                onChange={handleSelectSetterCalls}
                className="mt-2 block w-full border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500text-sm"
                options={setterCalls}
                value={selectedSetterCalls}
                isMulti
                styles={customStyles}
                theme={theme => ({
                  ...theme,
                  colors: {
                    ...getSelectedTheme(theme),
                  }})}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <div className="modal-action">
            <label htmlFor="modal-filters" className="btn-in-form">
              Cancel
            </label>
          </div>
          <div className="modal-action">
            <button
              htmlFor="modal-filters"
              className="btn-in-form"
              onClick={() => doFilters()}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoFilters;
