import React, { useEffect, useLayoutEffect, useRef } from "react";
import SummaryChartHeader from "./SummaryChartHeader";
import SummaryStatsChart from "./SummaryStatsChart";
import {
  addStatsItem,
  calculateAllStats,
  createStatsItem,
} from "../utils/StatsItem";
import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useReactToPrint } from "react-to-print";
import Translation from "../layout/Translation";
import { summaryPhrases } from "../utils/SummaryPhrases";
import { fetchAllTranslations, fetchTranslation } from "../utils/dbutils";
import ColourSchemePicker from "../layout/ColourSchemePicker";
import { ColourSchemes } from "../utils/ColourSchemes";

function SummaryCharts({ match }) {
  const wref = useRef();
  const xref = useRef();
  const [windowWidth, setWindowWidth] = React.useState(0);
  const [windowHeight, setWindowHeight] = React.useState(0);
  const [teamAstats, setTeamAstats] = React.useState(null);
  const [teamBstats, setTeamBstats] = React.useState(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState("English");
  const [editLanguage, setEditLanguage] = React.useState("");
  const [editPhrases, setEditPhrases] = React.useState(summaryPhrases);
  const [allTranslations, setAllTranslations] = React.useState([]);
  const [allLanguages, setAllLanguages] = React.useState([]);
  const [selectedPhrases, setSelectedPhrases] = React.useState([]);
  const [colourScheme, setColourScheme] = React.useState(null);
  const [,forceUpdate] = React.useState(0);

  const marginTop = "2.5cm";
  const marginRight = "1.5cm";
  const marginBottom = "1.5cm";
  const marginLeft = "1.5cm";
  const getPageMargins = () => {
    return `@page { size: portrait; margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft} !important; }`;
  };

  const saveToPDF = useReactToPrint({
    content: () => xref.current,
    contentRef: xref,
    documentTitle: `Match Summary - ${match.teamA.Name} vs ${match.teamB.Name}`,
    // onAfterPrint: () => onCloseNewInvoice(),
    pageStyle: getPageMargins(),
  });

  const doSave = () => {
    saveToPDF();
  };

  const doEditLanguage = (idx) => {
    const lang = allLanguages[idx + 2];
    setEditLanguage(lang);
    const translation = allTranslations[idx];
    setEditPhrases(
      translation ? JSON.parse(translation.phrases) : summaryPhrases
    );
    doTranslation();
  };

  const doLanguageSelected = (idx) => {
    if (idx === 0) {
      setEditLanguage("");
      setSelectedLanguage("");
      setEditPhrases(summaryPhrases);
      doTranslation();
    } else {
      setSelectedLanguage(
        allLanguages
          .filter((lang, index) => index === idx)
          .map((lang) => lang)[0]
      );
      const translation = allTranslations
        .filter((lang, index) => index === idx - 2)
        .map((translation) => translation)[0];
      setSelectedPhrases(translation ? JSON.parse(translation.phrases) : []);
    }
  };

  const doTranslation = () => {
    document.getElementById("modal-translation").checked = true;
  };

  const doSaveTranslation = (ps) => {
    document.getElementById("modal-translation").checked = false;
    console.log(ps);
  };

  const doColourSchemeChange = (cs) => {
    document.getElementById("modal-colour-scheme").checked = false;
    localStorage.setItem("colourScheme", JSON.stringify(cs));
    setColourScheme(cs);
  };

  const doColourScheme = () => {
    document.getElementById("modal-colour-scheme").checked = true;
  };

  useLayoutEffect(() => {
    if (wref.current) {
      const ch = wref.current.offsetWidth;
      setWindowWidth(ch);
    }
    setWindowHeight(window.innerHeight - 280);
  }, []);

  useEffect(() => {
    function handleWindowResize() {
      if (wref.current) {
        const ch = wref.current.offsetWidth;
        setWindowWidth(ch);
      }
      setWindowHeight(window.innerHeight - 280);
    }

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  const doInit = async () => {
    var clsch = null;
    const cs = localStorage.getItem("colourScheme");
    if (cs && cs !== "null") {
      clsch = JSON.parse(cs);
    } else {
      clsch = ColourSchemes[0];
      localStorage.setItem(clsch);
    }
    setColourScheme(clsch);

    const trs = await fetchAllTranslations();
    setAllTranslations(trs);
    var langs = ["Add Language", "English"];
    for (var tr of trs) {
      langs.push(tr.language);
    }
    setAllLanguages(langs);
    const lang = langs[0];
    setSelectedLanguage(lang);

    var tastats = createStatsItem(null, 0);
    var tbstats = createStatsItem(null, 0);
    var tatps = 0;
    var tbtps = 0;
    for (var mset of match.sets) {
      tatps += mset.HomeScore;
      tbtps += mset.AwayScore;
      addStatsItem(mset.teamAStatsItems[0], tastats);
      addStatsItem(mset.teamBStatsItems[0], tbstats);
    }
    tastats.TotalPoints = tatps;
    tbstats.TotalPoints = tbtps;
    setTeamAstats(calculateAllStats(tastats));
    setTeamBstats(calculateAllStats(tbstats));
  };

  useEffect(() => {
    doInit();
  }, []);

  useEffect(() => {}, [
    windowWidth,
    selectedPhrases,
    editLanguage,
    editPhrases,
    colourScheme,
  ]);

  return (
    <>
      <div className="flex-col  max-w-2xl min-x-2xl">
        <div className="flex justify-end mb-2">
          <button className="btn-in-form ml-2" onClick={() => doColourScheme()}>
            Colours
          </button>
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn-in-form">
              Language
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
            >
              {allLanguages.map((lang, idx) => (
                <li key={idx} onClick={() => doLanguageSelected(idx)}>
                  <div className="flex justify-between">
                    <a>{lang}</a>
                    {idx > 1 ? (
                      <PencilSquareIcon
                        className="text-base-content size-5 cursor-pointer"
                        onClick={() => doEditLanguage(idx - 2)}
                      />
                    ) : (
                      <></>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <button className="btn-in-form ml-2" onClick={() => doSave()}>
            PDF
          </button>
        </div>
        <div
          className="flex-col max-w-2xl min-x-2xl bg-white overflow-hidden"
          ref={xref}
          style={{ height: "860px" }}
          //   style={{ height: `${windowHeight}px` }}
        >
          <div className="p-2 border-b border-gray-200" ref={wref}>
            <SummaryChartHeader match={match} />
          </div>
          <div
            className="overflow-clip overflow-y-auto"
            //   style={{ height: `${windowHeight}px` }}
          >
            <SummaryStatsChart
              match={match}
              teamAstats={teamAstats}
              teamBstats={teamBstats}
              width={windowWidth}
              phrases={selectedPhrases}
              colourScheme={colourScheme}
            />
          </div>
        </div>
      </div>

      <input type="checkbox" id="modal-translation" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box sm:w-8/12 w-full max-w-xl h-[80vh] mx-h-[600px]">
          <div className="flex justify-between mb-4">
            <h3 className="mb-4 font-bold"></h3>
            <div className="modal-action -mt-1">
              <label htmlFor="modal-translation">
                <XMarkIcon className="w-6 h-6 cursor-pointer" />
              </label>
            </div>
          </div>
          <div className="flex flex-col">
            <div>
              <Translation
                language={editLanguage}
                phrases={editPhrases}
                onSaveTranslation={(ps) => doSaveTranslation(ps)}
              />
            </div>
          </div>
        </div>
      </div>

      <input
        type="checkbox"
        id="modal-colour-scheme"
        className="modal-toggle"
      />
      <div className="modal">
        <div className="modal-box w-full max-w-xl h-[96vh]">
          <div className="flex justify-between mb-4">
            <h3 className="font-bold">Select colour scheme for charts</h3>
            <div className="modal-action -mt-1">
              <label htmlFor="modal-colour-scheme">
                <XMarkIcon className="w-6 h-6 cursor-pointer" />
              </label>
            </div>
          </div>
          <div className="flex flex-col">
            <ColourSchemePicker
              updated = {n => !n}
              onColourSchemeChange={(cs) => doColourSchemeChange(cs)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default SummaryCharts;
