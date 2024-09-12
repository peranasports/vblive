import axios from "axios";
import { myzip } from "../../components/utils/zip";
import { escapeHtml } from "../../components/utils/Utils";
const VBLIVE_API_URL = process.env.REACT_APP_VBLIVE_API_URL;

const vbliveapi = axios.create({
  baseURL: VBLIVE_API_URL,
});

export const getSessions = async (appName, serverName) => {
  const params = new URLSearchParams({
    appName: appName,
    serverName: serverName,
  });

  vbliveapi.defaults.withCredentials = true;

  const response = await vbliveapi.get(
    `Session/GetSessionInfoInServerForApp?${params}`
  );
  var sessionData = { sessions: response.data, appName: appName };
  return sessionData;
};

export const getSessionInfoForServer = async (serverName) => {
  const params = new URLSearchParams({
    serverName: serverName,
  });

  vbliveapi.defaults.withCredentials = true;

  const response = await vbliveapi.get(
    `Session/GetSessionInfoForServer?${params}`
  );
  var sessionData = { sessions: response.data };
  return sessionData;
};

export const getSession = async (sessionId) => {
  const params = new URLSearchParams({
    sessionId: sessionId,
  });

  vbliveapi.defaults.withCredentials = true;

  const response = await vbliveapi.get(`Session/GetSessionsById?${params}`);
  return response.data[0];
};

export const getLatestStats = async (sessionId, lastTime) => {
  const params = new URLSearchParams({
    sessionId: sessionId,
    lastTime: lastTime,
  });

  vbliveapi.defaults.withCredentials = true;

  const response = await vbliveapi.get(`Session/GetLatestStats?${params}`);
  return response.data;
};

export const storeSession = async (match, currentUser) => {
  const teamAName = escapeHtml(match.teamA.Name);
  const teamBName = escapeHtml(match.teamB.Name);
  const tournamentName = match.tournamentName
    ? match.tournamentName.length === 0
      ? "?"
      : escapeHtml(match.tournamentName)
    : "?";
  const desc = teamAName + " vs " + teamBName;
  const seconds = match.TrainingDate.getTime() / 1000;
  const voffset = match.videoOffset ? match.videoOffset : -1;
  const vstarttime = match.videoStartTimeSeconds
    ? match.videoStartTimeSeconds
    : -1;
  const vurl = match.videoOnlineUrl ? match.videoOnlineUrl : "?";
  var sc = "";
  for (var game of match.sets) {
    if (sc.length > 0) sc += ", ";
    sc += game.HomeScore + "-" + game.AwayScore;
  }
  const buffer = myzip(match.buffer);

  const VBLIVE_API_URL = process.env.REACT_APP_VBLIVE_API_URL;
  const qs = require("qs");
  let data = qs.stringify({
    appName: "VBLive",
    serverName: currentUser.email,
    scores: sc,
    videoOnlineUrl: vurl,
    teamA: teamAName,
    teamB: teamBName,
    sessionDateTimeInSeconds: seconds,
    tournament: tournamentName,
    videoStartTimeSeconds: vstarttime,
    videoOffset: voffset,
    sessionDateString: match.TrainingDate.toLocaleDateString(),
    description: desc,
    stats: buffer,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${VBLIVE_API_URL}/Session/StoreSession`,
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
      ret = 0;
    });
  return ret;
};

export const shareSession = async (match) => {
  const VBLIVE_API_URL = process.env.REACT_APP_VBLIVE_API_URL;
  const qs = require("qs");
  let data = qs.stringify({
    shareStatus: match.shareStatus,
    shareUsers: match.shareUsers.length > 0 ? match.shareUsers : "?",
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${VBLIVE_API_URL}/Session/ShareSession?matchId=${match.id}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };

  var ret = false;
  await axios
    .request(config)
    .then((response) => {
      ret = response.data;
    })
    .catch((error) => {
      ret = false;
    });
  return ret;
};

export const storePlaylist = async (playlist) => {
  const VBLIVE_API_URL = process.env.REACT_APP_VBLIVE_API_URL;
  const qs = require("qs");
  let data = qs.stringify({
    description: escapeHtml(playlist.description),
    comments: escapeHtml(playlist.comments),
    playlists: playlist.playlists,
    appName: playlist.appName,
    serverName: playlist.serverName,
    dateInSeconds: Number.parseInt(playlist.dateInSeconds),
    tags: escapeHtml(playlist.tags),
    shareStatus: playlist.shareStatus,
    shareUsers: playlist.shareUsers.length > 0 ? playlist.shareUsers : "?",
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${VBLIVE_API_URL}/Session/StorePlayList?plId=${playlist.id}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };

  var newplId = -1;
  await axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      newplId = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
  return newplId;
};

export const sharePlaylist = async (playlist) => {
  const VBLIVE_API_URL = process.env.REACT_APP_VBLIVE_API_URL;
  const qs = require("qs");
  let data = qs.stringify({
    shareStatus: playlist.shareStatus,
    shareUsers: playlist.shareUsers.length > 0 ? playlist.shareUsers : "?",
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${VBLIVE_API_URL}/Session/SharePlaylist?playlistId=${playlist.id}`,
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
};
