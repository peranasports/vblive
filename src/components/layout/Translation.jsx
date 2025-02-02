import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import axios from "axios";
import { fetchTranslation } from "../utils/dbutils";

function Translation({ language, phrases, onSaveTranslation }) {
  const [allItems, setAllItems] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const [colDefs, setColDefs] = useState([
    { field: "english" },
    { field: "translation", editable: true },
  ]);

  ModuleRegistry.registerModules([AllCommunityModule]);

  const doSave = () => {
    if (selectedLanguage === "") {
        alert("Please enter language");
        return;
    }
    storeTranslation(selectedLanguage, JSON.stringify(allItems));
    onSaveTranslation(allItems);
  };

  const storeTranslation = async (language, phrases) => {
    const qs = require("qs");
    let data = qs.stringify({
      language: language,
      phrases: phrases,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: process.env.REACT_APP_VBLIVE_API_URL + "/Session/StoreTranslation",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };

    var ret = 0;
    await axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        ret = response.data;
      })
      .catch((error) => {
        console.log(error);
      });
    return ret;
  };

  const doInit = async () => {
    setSelectedLanguage(language);
    var itms = null;
    if (language !== "") {
      const translation = await fetchTranslation(language);
      if (translation.length > 0) {
        itms = JSON.parse(translation[0].phrases);
      }
    }
    if (!itms) {
      itms = [];
      for (var s of phrases) {
        itms.push({ english: s, translation: "" });
      }
    }
    setAllItems(itms);
  };

  const onMutate = (e) => {
    setSelectedLanguage(e.target.value);
  };

  useEffect(() => {
    doInit();
  }, [phrases]);

  useEffect(() => {
  }, [selectedLanguage]);

  return (
    <>
      <div className="flex-col">
        <div className="my-2">
          <input
            id="language"
            type="text"
            value={selectedLanguage}
            placeholder="Language"
            className="input-generic"
            onChange={onMutate}
          />
        </div>
        <div style={{ height: 450 }}>
          {" "}
          <AgGridReact rowData={allItems} columnDefs={colDefs} />
        </div>
        <div className="flex justify-end mt-2">
          <button className="btn-in-form" onClick={() => doSave()}>
            Save
          </button>
        </div>
      </div>
    </>
  );
}

export default Translation;
