import axios from "axios";
import { decodeHtml } from "./Utils";

export async function fetchTranslation(language) {
  const qs = require("qs");
  let data = qs.stringify({
    language: language,
  });

  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url:
      process.env.REACT_APP_VBLIVE_API_URL +
      `/Session/GetTranslationByLanguage/${language}`,
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
}

export async function fetchAllTranslations() {
  const qs = require("qs");
  let data = qs.stringify({});

  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: process.env.REACT_APP_VBLIVE_API_URL + "/Session/GetAllTranslations",
    headers: {},
    data: data,
  };

  var translations = null;
  await axios
    .request(config)
    .then((response) => {
      //   console.log(JSON.stringify(response.data));
      translations = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
  return translations;
}

export async function fetchUserSettings(userEmail) {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url:
      process.env.REACT_APP_VBLIVE_API_URL +
      `/Session/GetSettingsByUserEmail/${userEmail}`,
    headers: {},
  };

  var settings = null;
  await axios
    .request(config)
    .then((response) => {
      // console.log(JSON.stringify(response.data));
      settings = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
  return settings;
}

export async function storeUserSettings(userEmail, settings) {
  const qs = require("qs");
  let data = qs.stringify({
    userEmail: userEmail,
    settings: JSON.stringify(settings),
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: process.env.REACT_APP_VBLIVE_API_URL + "/Session/StoreUserSettings",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };

  await axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
}

export async function fetchAllMyMatches(userEmail) {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: process.env.REACT_APP_VBLIVE_API_URL +
      `/Session/GetSessionInfoInServerForApp/${userEmail}/VBLive`,

    // url: process.env.REACT_APP_VBLIVE_API_URL.includes("vercel")
    //   ? process.env.REACT_APP_VBLIVE_API_URL +
    //     `/Session/GetSessionInfoInServerForApp/${userEmail}/VBLive`
    //   : process.env.REACT_APP_VBLIVE_API_URL +
    //     `/Session/GetSessionInfoInServerForApp?serverName=${userEmail}?appName=VBLive`,
    headers: {},
  };

  var matches = [];
  await axios
    .request(config)
    .then((response) => {
      matches = response.data;
      for (var match of matches) {
        match.teamA = decodeHtml(match.teamA);
        match.teamB = decodeHtml(match.teamB);
        match.description = decodeHtml(match.description);
        match.tournament = match.tournament ? decodeHtml(match.tournament) : "";
      }
    })
    .catch((error) => {
      console.log(error);
    });
  return matches;
}

export async function fetchAllSharedMatches(userEmail) {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: process.env.REACT_APP_VBLIVE_API_URL +
      `/Session/GetSharedSessionsForServer/${userEmail}/VBLive`,
    // url: process.env.REACT_APP_VBLIVE_API_URL.includes("vercel")
    //   ? process.env.REACT_APP_VBLIVE_API_URL +
    //     `/Session/GetSharedSessionsForServer/${userEmail}/VBLive`
    //   : process.env.REACT_APP_VBLIVE_API_URL +
    //     `/Session/GetSharedSessionsForServer?serverName=${userEmail}&appName=VBLive`,
    headers: {},
  };

  var matches = [];
  await axios
    .request(config)
    .then((response) => {
      // console.log(JSON.stringify(response.data));
      matches = response.data;
      for (var match of matches) {
        match.teamA = decodeHtml(match.teamA);
        match.teamB = decodeHtml(match.teamB);
        match.description = decodeHtml(match.description);
        match.tournament = match.tournament ? decodeHtml(match.tournament) : "";
      }
    })
    .catch((error) => {
      console.log(error);
    });
  return matches;
}

export async function fetchSessionById(sessionId) {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: process.env.REACT_APP_VBLIVE_API_URL +
      `/Session/GetSessionById/${sessionId}`,
    // url: process.env.REACT_APP_VBLIVE_API_URL.includes("vercel")
    //   ? process.env.REACT_APP_VBLIVE_API_URL +
    //     `/Session/GetSessionById/${sessionId}`
    //   : process.env.REACT_APP_VBLIVE_API_URL +
    //     `/Session/GetSessionsById?sessionId=${sessionId}`,
    headers: {},
  };

  var session = null;
  await axios
    .request(config)
    .then((response) => {
      session = response.data[0];
      session.teamA = decodeHtml(session.teamA);
      session.teamB = decodeHtml(session.teamB);
      session.description = decodeHtml(session.description);
      session.tournament = session.tournament
        ? decodeHtml(session.tournament)
        : "";
    })
    .catch((error) => {
      console.log(error);
    });
  return session;
}

export async function deleteMatch(match) {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: process.env.REACT_APP_VBLIVE_API_URL.includes("vercel")
      ? process.env.REACT_APP_VBLIVE_API_URL +
        `/Session/DeleteSession/${match.id}`
      : process.env.REACT_APP_VBLIVE_API_URL +
        `/Session/DeleteSession?sessionId=${match.id}`,
    headers: {},
  };

  var ret = false;
  await axios
    .request(config)
    .then((response) => {
      // console.log(JSON.stringify(response.data));
      ret = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return ret;
}

export async function storeTeam(team) {
  const qs = require("qs");
  let data = qs.stringify({
    name: team.name,
    sessionId: team.sessionId,
    players: team.players ? JSON.stringify(team.players) : "",
    lineup: team.lineup ? JSON.stringify(team.lineup) : "",
    isOppPassing: team.isOppPassing === true ? 1 : 0,
    isMBFollowingSetter: team.isMBFollowingSetter === true ? 1 : 0,
    logoURL: team.logoURL?? "",
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: process.env.REACT_APP_VBLIVE_API_URL + "/Session/StoreTeam",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };

  await axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
}

export async function fetchTeamById(teamId) {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: process.env.REACT_APP_VBLIVE_API_URL +
        `/Session/GetTeamById?id=${teamId}`,
    headers: {},
  };

  var team = null;
  await axios
    .request(config)
    .then((response) => {
      team = response.data[0];
    })
    .catch((error) => {
      console.log(error);
    });
  return team;
}

export async function fetchTeamByNameAndSessionId(name, sessionId) {  
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: process.env.REACT_APP_VBLIVE_API_URL + `/Session/GetTeamByNameAndSessionId/${name}/${sessionId}`,
    headers: { },
  };
  
  var team = null;
  await axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
    team = response.data[0];
    team.isMBFollowingSetter = team.isMBFollowingSetter === 1;
    team.isOppPassing = team.isOppPassing === 1;
  })
  .catch((error) => {
    console.log(error);
  });
      return team;
}
