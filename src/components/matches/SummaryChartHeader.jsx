import React, { useEffect } from "react";
import TeamShield01 from "../assets/team-shield-01.png";
import TeamShield02 from "../assets/team-shield-02.png";
import TeamShield03 from "../assets/team-shield-03.png";
import TeamShield04 from "../assets/team-shield-04.png";
import { useState } from "react";
import LogoSelection from "../utils/LogoSelection";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios, { all } from "axios";

function SummaryChartHeader({ match }) {
  const [teamAlogo, setTeamAlogo] = useState(null);
  const [teamBlogo, setTeamBlogo] = useState(null);
  const [tournamentLogo, setTournamentLogo] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [matchScores, setMatchScores] = useState(null);
  const [setScores, setSetScores] = useState(null);
  const [,forceUpdate] = useState(0);

  const fetchLogo = async (name) => {
    const qs = require("qs");
    let data = qs.stringify({
      logoName: name,
    });

    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url:
        process.env.REACT_APP_VBLIVE_API_URL + `/Session/GetLogoByName/${name}`,
      headers: {},
    };

    var logo = null;
    await axios
      .request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        logo = response.data;
      })
      .catch((error) => {
        console.log(error);
      });
    return logo;
  };

  const storeLogo = async (name, url) => {
    const qs = require("qs");
    let data = qs.stringify({
      logoName: name,
      logoUrl: url,
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: process.env.REACT_APP_VBLIVE_API_URL + "/Session/StoreLogo",
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

  const getLogoByName = async (name) => {
    const logo = await fetchLogo(name);
    if (logo && logo.length > 0) {
      console.log(logo[0].logoUrl);
      //   return "http://deportegalicia.es/wp-content/uploads/2020/05/ARENAL-EMEVE-Bueno.jpg"; // logo[0].logoUrl;
      const logoPath =
        "http://deportegalicia.es/wp-content/uploads/2020/05/ARENAL-EMEVE-Bueno.jpg";
      return logoPath;
    } else {
      //   const randomNumber = Math.floor(Math.random() * 4) + 1;
      //   return require(`../assets/team-shield-0${randomNumber}.png`);
      const logoPath =
        "http://deportegalicia.es/wp-content/uploads/2020/05/ARENAL-EMEVE-Bueno.jpg";
      return logoPath;
    }
  };

  const getTeamALogo = async (name) => {
    if (teamAlogo) {
      return teamAlogo;
    }
    const logo = await fetchLogo(name);
    if (logo && logo.length > 0) {
      setTeamAlogo(logo[0].logoUrl);
    } else {
      const randomNumber = Math.floor(Math.random() * 4) + 1;
      setTeamAlogo(require(`../assets/team-shield-01.png`));
    }
  };

  const getTeamBLogo = async (name) => {
    if (teamBlogo) {
      return teamBlogo;
    }
    const logo = await fetchLogo(name);
    if (logo && logo.length > 0) {
      setTeamBlogo(logo[0].logoUrl);
    } else {
      const randomNumber = Math.floor(Math.random() * 4) + 1;
      setTeamBlogo(require(`../assets/team-shield-02.png`));
    }
  };

  const getTournamentLogo = async (tournamentName) => {
    if (tournamentLogo) {
      return tournamentLogo;
    }
    const logo = await fetchLogo(tournamentName);
    if (logo && logo.length > 0) {
      setTournamentLogo(logo[0].logoUrl);
    } else {
      const randomNumber = Math.floor(Math.random() * 4) + 1;
      setTournamentLogo(require(`../assets/team-shield-03.png`));
    }
  };

  const selectLogo = (name) => {
    setSelectedName(name);
    document.getElementById("modal-logo-select").checked = true;
  };

  const doImageURLChange = async (url, name) => {
    document.getElementById("modal-logo-select").checked = false;
    if (name === match.teamA.Name) {
        setTeamAlogo(url);
    } else if (name === match.teamB.Name) {
        setTeamBlogo(url);
    } else if (name === match.tournamentName) {
        setTournamentLogo(url);
    }
    forceUpdate((n) => !n);
    if (url) {
      const ret = await storeLogo(name, url);
    }
  };

  useEffect(() => {
    var teamAscore = 0;
    var teamBscore = 0;
    var ss = "";
    for (var mset of match.sets) {
        teamAscore += mset.HomeScore > mset.AwayScore ? 1 : 0;
        teamBscore += mset.HomeScore < mset.AwayScore ? 1 : 0;
        if (ss.length > 0) ss += ", ";
        ss += mset.HomeScore + "-" + mset.AwayScore;
    }
    setMatchScores(teamAscore + "-" + teamBscore);
    setSetScores(ss);
    getTeamALogo(match.teamA.Name);
    getTeamBLogo(match.teamB.Name);
    getTournamentLogo(match.tournamentName);
  }, [teamAlogo, teamBlogo, match]);

  return (
    <>
      <div className="flex">
        <div className="w-1/3 flex-col bg-white">
          <div className="flex h-32 mt-4 justify-center">
            <div className="tooltip" data-tip="Click to select team logo">
              <img
                className="h-32 cursor-pointer"
                src={teamAlogo}
                alt={match.teamA.Name}
                onClick={() => selectLogo(match.teamA.Name)}
              />
            </div>
          </div>
          <div className="text-center px-2 pb-2">
            <label className="font-medium text-sm">
              {match.teamA.Name.toUpperCase()}
            </label>
          </div>
        </div>
        <div className="w-1/3">
          <div className="flex h-20 mt-4 justify-center">
            <div className="tooltip" data-tip="Click to select tournament logo">
              <img
                className="h-20 cursor-pointer"
                src={tournamentLogo}
                alt="tournament logo"
                onClick={() => selectLogo(match.tournamentName)}
              />
            </div>
          </div>
          <div className="text-center px-2 mt-8">
            <label className="font-inter_black text-xl">
              {matchScores}
            </label>
          </div>
          <div className="text-center px-2 pb-2">
            <label className="font-medium text-xs">
              {setScores}
            </label>
          </div>
        </div>
        <div className="w-1/3">
          <div className="flex h-32 mt-4 justify-center">
            <div className="tooltip" data-tip="Click to select team logo">
              <img
                className="h-32 cursor-pointer"
                src={teamBlogo}
                alt={match.teamB.Name}
                onClick={() => selectLogo(match.teamB.Name)}
              />
            </div>
          </div>
          <div className="text-center px-2 pb-2">
            <label className="font-medium text-sm">
              {match.teamB.Name.toUpperCase()}
            </label>
          </div>
        </div>
      </div>

      <input type="checkbox" id="modal-logo-select" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box sm:w-7/12 w-full max-w-xl h-[30vh]">
          <div className="flex justify-between mb-4">
            <h3 className="mb-4 font-bold">Select Logo</h3>
            <div className="modal-action -mt-1">
              <label htmlFor="modal-logo-select">
                <XMarkIcon className="w-6 h-6 cursor-pointer" />
              </label>
            </div>
          </div>
          <div className="flex flex-col">
            <div>
              <LogoSelection
                imageURL=""
                name={selectedName}
                onImageURLChange={(url, team) => doImageURLChange(url, team)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SummaryChartHeader;
