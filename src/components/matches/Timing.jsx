import React, { useState, useEffect } from "react";

function Timing({ onClose }) {
  const [, forceUpdate] = useState(0);
  const [first, setFirst] = useState(true);
  const [leadTimes, setLeadTimes] = useState([0, 0, 3, 3, 3, 3]);
  const [durations, setDurations] = useState([8, 8, 8, 8, 8, 8]);
  const skilllabels = [
    "Serve",
    "Reception",
    "Set",
    "Attack",
    "Block",
    "Defence",
  ];

  const onMutate = (e) => {
    console.log(e.target.id, e.target.value);

    const tokens = e.target.id.split("_");
    if (tokens[0] === "leadTime") {
      const i = Number.parseInt(tokens[1]);
      var lts = leadTimes;
      lts[i] = e.target.value;
      setLeadTimes(lts);
    } else if (tokens[0] === "duration") {
      const i = Number.parseInt(tokens[1]);
      var ds = durations;
      ds[i] = e.target.value;
      setDurations(ds);
    }
    forceUpdate((n) => !n);
  };

  const doClose = (save) => {
    if (save) {
      var lts = "";
      for (var lt of leadTimes) {
        if (lts.length > 0) lts += ",";
        lts += lt;
      }
      var ds = "";
      for (var d of durations) {
        if (ds.length > 0) ds += ",";
        ds += d;
      }
      const vobj = {
        leadTimes: lts,
        durations: ds,
      };
      try {
        localStorage.setItem("vblive_timings", JSON.stringify(vobj));
      } catch (error) {
        console.log(error);
      }
    }
    onClose();
  };

  const makeInput = (label, i, val) => {
    const lbl = label + "_" + i;
    return (
      <input
        type="text"
        name={lbl}
        id={lbl}
        value={val}
        onChange={onMutate}
        className="input-generic"
      />
    );
  };

  useEffect(() => {
    try {
      if (first) {
        const obj = localStorage.getItem("vblive_timings");
        if (obj !== null) {
          const vobj = JSON.parse(obj);
          const lts = vobj.leadTimes.split(",");
          setLeadTimes(lts);
          const ds = vobj.durations.split(",");
          setDurations(ds);
        }
        setFirst(false);
      }
    } catch {}
  });

  useEffect(() => {}, [leadTimes, durations]);

  return (
    <>
      <div className="mt-2">
        <div className="flex flex-col">
          <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full align-middle md:px-6 lg:px-8">
              <div className="">
                <table className="table-generic">
                  <thead className="thead-generic">
                    <tr>
                      <th scope="col" className="table-header-column">
                        Skill
                      </th>
                      <th scope="col" className="table-header-column">
                        Lead Time
                      </th>
                      <th scope="col" className="table-header-column">
                        Duration
                      </th>
                      <th scope="col" className="table-header-column"></th>
                    </tr>
                  </thead>
                  <tbody className="tbody-generic">
                    {skilllabels.map((sk, i) => (
                      <tr
                        key={i}
                        // className={i % 2 ? "bg-base-100" : "bg-base-200"}
                      >
                        <td className="table-cell">{sk}</td>
                        <td className="table-cell">
                          {makeInput("leadTime", i, leadTimes[i])}
                        </td>
                        <td className="table-cell">
                          {makeInput("duration", i, durations[i])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button className="btn-in-form" onClick={() => doClose(false)}>
              Cancel
            </button>
            <button className="btn-in-form ml-4" onClick={() => doClose(true)}>
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Timing;
