import React, { useEffect, useState } from "react";
import { ColourSchemes } from "../utils/ColourSchemes";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import ColourSchemePanel from "./ColourSchemePanel";
import { fetchUserSettings, storeUserSettings } from "../utils/dbutils";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { all } from "axios";

function ColourSchemePicker({ updated, onColourSchemeChange }) {
  const [colourScheme, setColourScheme] = useState(null);
  const [allColourSchemes, setAllColourSchemes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editColours, setEditColours] = useState([]);
  const [selectedColourScheme, setSelectedColourScheme] = useState(null);
  const [schemeName, setSchemeName] = useState("");
  const [userSettings, setUserSettings] = useState(null);
  const { firebaseUser, currentUser } = useAuthStatus();

  const doColourScheme = (th) => {
    document.querySelector("html").setAttribute("data-colourScheme", th);
    localStorage.setItem("colourScheme", JSON.stringify(th));
    setColourScheme(th);
    // toast.success("Please refresh page to activate new colour colourSchemes.");
    onColourSchemeChange(th);
  };

  const doEditColours = (cs) => {
    const newcs = { ...cs };
    newcs.name = cs.name + " - Copy";
    setSelectedColourScheme(newcs);
    setSchemeName(newcs.name);
    setEditColours(newcs.colours);
    setIsEditing(true);
  };

  const doSaveColours = async (saved) => {
    if (saved) {
      selectedColourScheme.colours = editColours;
      selectedColourScheme.name = schemeName;
      localStorage.setItem(
        "colourSchemes",
        JSON.stringify(selectedColourScheme)
      );
      onColourSchemeChange(selectedColourScheme);

      var sccs = userSettings.customColourSchemes;
      sccs.push(selectedColourScheme);
      const ret = await storeUserSettings(currentUser.email, userSettings);
      var acs = [...allColourSchemes];
      acs.push(selectedColourScheme);
      setAllColourSchemes(acs);
    }
    setIsEditing(false);
  };

  const doInit = async () => {
    if (!currentUser) {
      return;
    }
    const us = await fetchUserSettings(currentUser?.email);
    var usersettings = null;
    if (us?.length > 0) {
      usersettings = JSON.parse(us[0].settings);
    } else {
      usersettings = {
        customColourSchemes: [],
      };
      const ret = await storeUserSettings(currentUser?.email, usersettings);
    }
    setUserSettings(usersettings);

    var clsch = null;
    const cs = localStorage.getItem("colourScheme");
    if (cs && cs !== "null") {
      clsch = JSON.parse(cs);
    } else {
      clsch = ColourSchemes[0];
    }
    setColourScheme(clsch);
    localStorage.setItem("colourScheme", JSON.stringify(clsch));
    document.querySelector("html").setAttribute("data-colourScheme", clsch);

    var acs = [...ColourSchemes];
    for (var cu of usersettings.customColourSchemes) {
      acs.push(cu);
    }
    setAllColourSchemes(acs);
  };

  useEffect(() => {
    doInit();
  }, [updated]);

  // useEffect(() => {}, [editColours]);

  return (
    <>
      {isEditing === false ? (
        <div className="flex flex-col overflow-auto">
          <p className="p-2 text-sm">
            Current Colour Scheme: {colourScheme?.name}
          </p>
          <div className="flex overflow-auto">
            <div className="grid grid-cols-2 h-[70vh]">
              {allColourSchemes.map((th, i) => (
                <div className="col-span-1 h-[120px] p-2" key={i} id={th}>
                  <div className="flex-col">
                    <div className="flex justify-between py-2">
                      <label
                        className="text-sm"
                        onClick={() => doColourScheme(th)}
                      >
                        {th.name}
                      </label>
                      <DocumentDuplicateIcon
                        className="size-5 cursor-pointer"
                        onClick={() => doEditColours(th)}
                      />
                    </div>
                    <div
                      className="cursor-pointer"
                      onClick={() => doColourScheme(th)}
                    >
                      <ColourSchemePanel colourScheme={th} width={200} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-col">
            <input
              id="name"
              type="text"
              placeholder="Name..."
              className="input-generic my-2"
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)}
            />
            {editColours.map((col, i) => (
              <div className="flex justify-between py-1" key={i}>
                <label className="text-sm mt-1">Colour {i + 1}</label>
                <div className="flex gap-2">
                  <label className="text-sm mt-1">{col}</label>
                  <input
                    type="color"
                    value={col}
                    onChange={(e) => {
                      let newColours = [...editColours];
                      newColours[i] = e.target.value.toUpperCase();
                      setEditColours(newColours);
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-end mt-6">
              <button
                className="btn-in-form mr-2"
                onClick={() => doSaveColours(false)}
              >
                Cancel
              </button>
              <button
                className="btn-in-form"
                onClick={() => doSaveColours(true)}
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default ColourSchemePicker;
