import { useState, useEffect } from "react";
import MultiChoice from "../layout/MultiChoice";
import { allFilters } from "./AllFilters";

function AllFiltersPanel({
  allOptions,
  match,
  events,
  selectedTeam,
  handleFilterOptionChanged,
  appName,
}) {
  const [, forceUpdate] = useState(0);
  const [filteredOptions, setFilteredOptions] = useState(allOptions);
  const validvbstats = [
    "Sets",
    "Rotations",
    "Attackers",
    "Stages",
    "Display",
    "Results",
  ];

  const doOptionChanged = (options, item) => {
    handleFilterOptionChanged(allOptions);
  };

  const selectedOptions = (filter) => {
    if (filter.items === undefined) {
      return;
    }
    var count = 0;
    var s = "";
    for (var n = 0; n < filter.items.length; n++) {
      if (filter.items[n].selected) {
        if (s.length > 0) s += ", ";
        s += filter.items[n].name.toUpperCase();
        count++;
      }
    }
    if (count == filter.items.length) {
      return "ALL";
    } else if (count == 0) {
      return "NONE";
    }
    return s;
  };

  const validFilter = (filter) => {
    const validvbstats = [
      "Sets",
      "Rotations",
      "Attackers",
      "Stages",
      "Display",
      "Results",
    ];
    if (appName === "VBStats") {
      return validvbstats.includes(filter.title);
    }
    return true;
  };

  useEffect(() => {
    if (appName === "VBStats") {
      var opts = [];
      for (var opt of allOptions) {
        if (validvbstats.includes(opt.title)) {
          opts.push(opt);
        }
      }
      setFilteredOptions(opts);
    } else {
      setFilteredOptions(allOptions);
    }
  }, [allOptions]);

  return (
    <>
      {filteredOptions.map((filter) => (
        <div
          key={filter.name}
          tabIndex={0}
          className="collapse collapse-arrow rounded-sm"
        >
          <input type="checkbox" className="peer" />
          <div className="collapse-title pt-2 bg-base-200 text-sm font-medium  peer-checked:bg-base-100 peer-checked:text-base-700">
            {filter.title.toUpperCase()}
            <p className="text-xs font-normal">{selectedOptions(filter)}</p>
          </div>
          <div className="collapse-content peer-checked:bg-base-100 ">
            <MultiChoice
              filter={filter}
              handleOptionChanged={(filter, item) =>
                doOptionChanged(filter, item)
              }
            ></MultiChoice>
          </div>
        </div>
      ))}
      <div className="collapse-title"></div>
      <div className="collapse-content"></div>
    </>
  );
}

export default AllFiltersPanel;
