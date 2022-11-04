import axios from 'axios'
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
