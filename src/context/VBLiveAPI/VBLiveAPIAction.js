import axios from 'axios'
import { myzip } from '../../components/utils/zip'
const VBLIVE_API_URL = process.env.REACT_APP_VBLIVE_API_URL

const vbliveapi = axios.create({
  baseURL: VBLIVE_API_URL,
})

export const getSessions = async (appName, serverName) => {
  const params = new URLSearchParams({
      appName: appName,
      serverName: serverName,
  })

  vbliveapi.defaults.withCredentials = true

  const response = await vbliveapi.get(`Session/GetSessionInfoInServerForApp?${params}`)
  var sessionData = { sessions:response.data, appName: appName }
  return sessionData
}

export const getSessionInfoForServer = async (serverName) => {
  const params = new URLSearchParams({
      serverName: serverName,
  })

  vbliveapi.defaults.withCredentials = true

  const response = await vbliveapi.get(`Session/GetSessionInfoForServer?${params}`)
  var sessionData = { sessions:response.data }
  return sessionData
}

export const getSession = async (sessionId) => {
  const params = new URLSearchParams({
      sessionId: sessionId,
  })


  vbliveapi.defaults.withCredentials = true

  const response = await vbliveapi.get(`Session/GetSessionsById?${params}`)
  return response.data[0]
}

export const getLatestStats = async (sessionId, lastTime) => {
  const params = new URLSearchParams({
      sessionId: sessionId,
      lastTime: lastTime,
  })


  vbliveapi.defaults.withCredentials = true

  const response = await vbliveapi.get(`Session/GetLatestStats?${params}`)
  return response.data
}

export const storeSession = async (match, currentUser) => {
  const desc = match.teamA.Name + " vs " + match.teamB.Name;
  const voffset = match.videoOffset ? match.videoOffset : -1;
  const vstarttime = match.videoStartTimeSeconds ? match.videoStartTimeSeconds : -1;
  const vurl = match.videoOnlineUrl ? match.videoOnlineUrl : "";
  var sc = "";
  for (var game of match.sets) {
    if (sc.length > 0) sc += ", ";
    sc += game.HomeScore + "-" + game.AwayScore;
  }
  const buffer = myzip(match.buffer);
  const s = `VBLive|${
    currentUser.email
  }|${desc}|${match.TrainingDate.toLocaleDateString()}|${match.teamA.Name}|${
    match.teamB.Name
  }|${match.tournamentName}|${sc}|${vurl}|${voffset}|${vstarttime}`;
  const qs = require("qs");
  let data = JSON.stringify(buffer);
  const VBLIVE_API_URL = process.env.REACT_APP_VBLIVE_API_URL;
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${VBLIVE_API_URL}/Session/StoreSession?matchInfo=${s}`,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  var ret = false;
  await axios
    .request(config)
    .then((response) => {
      ret = response.data;
      // console.log(JSON.stringify(response.data));
      // toast.success("Uploaded match data successfully!");
    })
    .catch((error) => {
      ret = false;
      // toast.error("Error uploading match data");
      // console.log(error);
    });
    return ret;
}

export const shareSession = async (match, share) => {
  let data = JSON.stringify(share).replace(/"/g, '\'');
  const VBLIVE_API_URL = process.env.REACT_APP_VBLIVE_API_URL;
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${VBLIVE_API_URL}/Session/ShareSession?matchId=${match.id}`,
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  var ret = false;
  await axios
    .request(config)
    .then((response) => {
      ret = response.data;
      // console.log(JSON.stringify(response.data));
      // toast.success("Uploaded match data successfully!");
    })
    .catch((error) => {
      ret = false;
      // toast.error("Error uploading match data");
      // console.log(error);
    });
    return ret;
}
