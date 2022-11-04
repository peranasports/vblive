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

  const url = 'sessionSummariesForAppInServer/' + appName + '/' + serverName
  console.log('Action appName, serverName, url', appName, serverName, url)

  const response = await Promise.all([        
      vbliveapi.get(url),
  ])
  var ss = response[0].data
  // console.log('ss', ss)
  return {sessions: ss, appName: appName}
}

export const getSession = async (sessionId) => {
  const params = new URLSearchParams({
      sessionId: sessionId,
  })


  vbliveapi.defaults.withCredentials = true

  const url = 'session/' + sessionId

  const response = await Promise.all([        
      vbliveapi.get(url),
  ])
  var ss = response[0].data
  // console.log('ss[0]', ss[0])
  return ss[0]
}

export const getLatestStats = async (sessionId, lastTime) => {
  const params = new URLSearchParams({
      sessionId: sessionId,
      lastTime: lastTime,
  })


  vbliveapi.defaults.withCredentials = true

  const url = 'sessionGetLatestStats/' + sessionId + "/" + lastTime;

  const response = await Promise.all([        
      vbliveapi.get(url),
  ])
  var ss = response[0].data
  return ss
}
